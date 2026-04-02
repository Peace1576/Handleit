import { NextRequest, NextResponse } from 'next/server';
import { getPaddle } from '@/lib/paddle';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('paddle-signature') ?? '';
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET ?? '';

  // Verify Paddle webhook signature
  const paddle = getPaddle();
  let event;
  try {
    event = paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
  } catch (err) {
    console.error('Paddle webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const adminSupabase = createServiceRoleClient();

  try {
    const data = event.data as Record<string, unknown>;

    // ── transaction.completed ─────────────────────────────────────────────────
    // Fired when a checkout payment succeeds (both one-time and subscription first payment)
    if (event.eventType === 'transaction.completed') {
      const customData = (data.customData ?? {}) as Record<string, string>;
      const userId = customData.user_id;
      if (!userId) {
        console.error('Paddle webhook: no user_id in customData');
        return NextResponse.json({ received: true });
      }

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
      const usesRemaining = plan === 'basic' ? 50 : 999999;

      // Update profile: store Paddle customer ID + upgrade plan
      await adminSupabase
        .from('profiles')
        .update({
          plan,
          uses_remaining: usesRemaining,
          stripe_customer_id: customerId ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Track subscription for Basic + Pro plans
      if (plan !== 'lifetime' && subscriptionId) {
        await adminSupabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          plan,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' });
      }
    }

    // ── subscription.activated ───────────────────────────────────────────────
    if (event.eventType === 'subscription.activated') {
      const customData = (data.customData ?? {}) as Record<string, string>;
      const userId = customData.user_id;
      const subscriptionId = data.id as string;
      const currentBillingPeriod = data.currentBillingPeriod as { endsAt?: string } | undefined;

      if (userId && subscriptionId) {
        // Determine plan from price IDs on the subscription items
        const subItems = (data.items ?? []) as Array<{ price?: { id?: string } }>;
        const subPriceId = subItems[0]?.price?.id ?? '';
        const isBasic = subPriceId === (process.env.PADDLE_PRICE_BASIC_MONTHLY ?? '') ||
                        subPriceId === (process.env.PADDLE_PRICE_BASIC_ANNUAL  ?? '');
        const subPlan = isBasic ? 'basic' : 'pro';
        const subUses = isBasic ? 50 : 999999;

        await adminSupabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          status: 'active',
          plan: subPlan,
          current_period_end: currentBillingPeriod?.endsAt ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' });

        await adminSupabase
          .from('profiles')
          .update({ plan: subPlan, uses_remaining: subUses, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      }
    }

    // ── subscription.updated ─────────────────────────────────────────────────
    if (event.eventType === 'subscription.updated') {
      const subscriptionId = data.id as string;
      const status = data.status as string;
      const currentBillingPeriod = data.currentBillingPeriod as { endsAt?: string } | undefined;

      await adminSupabase
        .from('subscriptions')
        .update({
          status,
          current_period_end: currentBillingPeriod?.endsAt ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);
    }

    // ── subscription.canceled ────────────────────────────────────────────────
    if (event.eventType === 'subscription.canceled') {
      const subscriptionId = data.id as string;
      const customData = (data.customData ?? {}) as Record<string, string>;
      const userId = customData.user_id;

      // Update subscription record
      await adminSupabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscriptionId);

      // Revert user to free if we have their user_id
      if (userId) {
        await adminSupabase
          .from('profiles')
          .update({ plan: 'free', uses_remaining: 0, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      }
    }

  } catch (err) {
    console.error('Paddle webhook handler error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
