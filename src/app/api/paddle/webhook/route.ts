import { NextRequest, NextResponse } from 'next/server';
import { getPaddle, verifyCheckoutBinding, type PaddleCheckoutBinding } from '@/lib/paddle';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/ratelimit';
import { BASIC_PLAN_MONTHLY_USES, FREE_PLAN_USES, UNLIMITED_PLAN_USES } from '@/lib/plans';

function parseEventTime(occurredAt: string | undefined | null): number | null {
  if (!occurredAt) return null;
  const time = Date.parse(occurredAt);
  return Number.isNaN(time) ? null : time;
}

async function isStaleSubscriptionEvent(
  adminSupabase: ReturnType<typeof createServiceRoleClient>,
  subscriptionId: string,
  occurredAt: string | undefined | null,
): Promise<boolean> {
  const eventTime = parseEventTime(occurredAt);
  if (eventTime === null) return false;

  const { data } = await adminSupabase
    .from('subscriptions')
    .select('updated_at')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle();

  if (!data?.updated_at) return false;

  const storedTime = parseEventTime(data.updated_at);
  return storedTime !== null && storedTime > eventTime;
}

export async function POST(req: NextRequest) {
  // Rate limit webhooks — still need protection against flood attacks
  const rl = await rateLimit(req, 'webhook');
  if (!rl.success) return rl.response!;

  const rawBody = await req.text();
  const signature = req.headers.get('paddle-signature') ?? '';
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET ?? '';

  // Reject immediately if webhook secret is not configured — never process unsigned events
  if (!webhookSecret) {
    console.error('Paddle webhook: PADDLE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // Verify Paddle webhook signature
  const paddle = getPaddle();
  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
  } catch (err) {
    console.error('Paddle webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const adminSupabase = createServiceRoleClient();

  try {
    const data = event.data as unknown as Record<string, unknown>;
    const occurredAt = (event as { occurredAt?: string }).occurredAt ?? null;
    const eventUpdatedAt = occurredAt ?? new Date().toISOString();

    // ── transaction.completed ─────────────────────────────────────────────────
    // Fired when a checkout payment succeeds (both one-time and subscription first payment)
    if (event.eventType === 'transaction.completed') {
      const customData = (data.customData ?? {}) as Record<string, string>;
      const binding = customData as Partial<PaddleCheckoutBinding>;
      if (!verifyCheckoutBinding(binding)) {
        console.error('Paddle webhook: invalid checkout binding');
        return NextResponse.json({ received: true });
      }
      const userId = binding.user_id;

      const customerId = data.customerId as string | undefined;
      const subscriptionId = data.subscriptionId as string | undefined;
      const items = (data.items ?? []) as Array<{ price?: { id?: string } }>;
      const priceId = items[0]?.price?.id ?? '';

      const basicMonthly = process.env.PADDLE_PRICE_BASIC_MONTHLY ?? '';
      const basicAnnual  = process.env.PADDLE_PRICE_BASIC_ANNUAL  ?? '';
      const lifetime     = process.env.PADDLE_PRICE_LIFETIME      ?? '';

      let plan: 'basic' | 'pro' | 'lifetime' = 'pro';
      if (priceId === lifetime) plan = 'lifetime';
      else if (priceId === basicMonthly || priceId === basicAnnual) plan = 'basic';

      // Uses: basic = 50/month cap (reset by subscription renewal), pro/lifetime = unlimited
      const usesRemaining = plan === 'basic' ? BASIC_PLAN_MONTHLY_USES : UNLIMITED_PLAN_USES;

      if (plan !== 'lifetime' && subscriptionId && await isStaleSubscriptionEvent(adminSupabase, subscriptionId, occurredAt)) {
        return NextResponse.json({ received: true });
      }

      // Update profile: store Paddle customer ID + upgrade plan
      await adminSupabase
        .from('profiles')
        .update({
          plan,
          uses_remaining: usesRemaining,
          stripe_customer_id: customerId ?? null,
          updated_at: eventUpdatedAt,
        })
        .eq('user_id', userId);

      // Track subscription for Basic + Pro plans
      if (plan !== 'lifetime' && subscriptionId) {
        await adminSupabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          plan,
          updated_at: eventUpdatedAt,
        }, { onConflict: 'stripe_subscription_id' });
      }
    }

    // ── subscription.activated ───────────────────────────────────────────────
    if (event.eventType === 'subscription.activated') {
      const customData = (data.customData ?? {}) as Record<string, string>;
      const binding = customData as Partial<PaddleCheckoutBinding>;
      const subscriptionId = data.id as string;
      const currentBillingPeriod = data.currentBillingPeriod as { endsAt?: string } | undefined;

      if (await isStaleSubscriptionEvent(adminSupabase, subscriptionId, occurredAt)) {
        return NextResponse.json({ received: true });
      }

      if (verifyCheckoutBinding(binding) && subscriptionId) {
        const userId = binding.user_id;
        // Determine plan from price IDs on the subscription items
        const subItems = (data.items ?? []) as Array<{ price?: { id?: string } }>;
        const subPriceId = subItems[0]?.price?.id ?? '';
        const isBasic = subPriceId === (process.env.PADDLE_PRICE_BASIC_MONTHLY ?? '') ||
                        subPriceId === (process.env.PADDLE_PRICE_BASIC_ANNUAL  ?? '');
        const subPlan = isBasic ? 'basic' : 'pro';
        const subUses = isBasic ? BASIC_PLAN_MONTHLY_USES : UNLIMITED_PLAN_USES;

        await adminSupabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          plan: subPlan,
          current_period_end: currentBillingPeriod?.endsAt ?? null,
          updated_at: eventUpdatedAt,
        }, { onConflict: 'stripe_subscription_id' });

        await adminSupabase
          .from('profiles')
          .update({ plan: subPlan, uses_remaining: subUses, updated_at: eventUpdatedAt })
          .eq('user_id', userId);
      }
    }

    // ── subscription.updated ─────────────────────────────────────────────────
    if (event.eventType === 'subscription.updated') {
      // Paddle emits this both for normal edits and for end-of-term cancellation
      // scheduling. Access changes are applied on subscription.canceled.
      const subscriptionId = data.id as string;
      const status = data.status as string;
      const currentBillingPeriod = data.currentBillingPeriod as { endsAt?: string } | undefined;

      if (await isStaleSubscriptionEvent(adminSupabase, subscriptionId, occurredAt)) {
        return NextResponse.json({ received: true });
      }

      const { data: existingSubscription } = await adminSupabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle();

      const customData = (data.customData ?? {}) as Record<string, string>;
      const binding = customData as Partial<PaddleCheckoutBinding>;
      const userId = existingSubscription?.user_id ?? (verifyCheckoutBinding(binding) ? binding.user_id : null);

      if (userId) {
        await adminSupabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            status,
            current_period_end: currentBillingPeriod?.endsAt ?? null,
            updated_at: eventUpdatedAt,
          }, { onConflict: 'stripe_subscription_id' });
      } else {
        await adminSupabase
          .from('subscriptions')
          .update({
            status,
            current_period_end: currentBillingPeriod?.endsAt ?? null,
            updated_at: eventUpdatedAt,
          })
          .eq('stripe_subscription_id', subscriptionId);
      }

    }

    // ── subscription.canceled ────────────────────────────────────────────────
    if (event.eventType === 'subscription.canceled') {
      const subscriptionId = data.id as string;
      const currentBillingPeriod = data.currentBillingPeriod as { endsAt?: string } | undefined;

      if (await isStaleSubscriptionEvent(adminSupabase, subscriptionId, occurredAt)) {
        return NextResponse.json({ received: true });
      }

      // Update subscription record
      const { data: subscription } = await adminSupabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle();

      await adminSupabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          current_period_end: currentBillingPeriod?.endsAt ?? null,
          updated_at: eventUpdatedAt,
        })
        .eq('stripe_subscription_id', subscriptionId);

      if (subscription?.user_id) {
        await adminSupabase
          .from('profiles')
          .update({ plan: 'free', uses_remaining: FREE_PLAN_USES, updated_at: eventUpdatedAt })
          .eq('user_id', subscription.user_id);
      }
    }

  } catch (err) {
    console.error('Paddle webhook handler error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
