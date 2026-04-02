import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  // Raw body required for signature verification
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan   = session.metadata?.plan; // 'pro' or 'lifetime'

        if (!userId || !plan) break;

        // Store stripe_customer_id on profile
        if (session.customer) {
          await supabase.from('profiles')
            .update({ stripe_customer_id: session.customer as string })
            .eq('user_id', userId);
        }

        if (plan === 'lifetime') {
          await supabase.from('profiles')
            .update({ plan: 'lifetime', uses_remaining: 999999, updated_at: new Date().toISOString() })
            .eq('user_id', userId);

          await supabase.from('subscriptions').insert({
            user_id: userId,
            status: 'active',
            plan: 'lifetime',
          });
          break;
        }

        // Pro subscription
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: session.subscription as string,
          status: 'active',
          plan: 'pro',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' });

        await supabase.from('profiles')
          .update({ plan: 'pro', uses_remaining: 999999, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const isActive = sub.status === 'active';

        const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
        await supabase.from('subscriptions')
          .update({
            status: sub.status,
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);

        if (!isActive) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', sub.id)
            .single();

          if (subscription) {
            await supabase.from('profiles')
              .update({ plan: 'free', uses_remaining: 0, updated_at: new Date().toISOString() })
              .eq('user_id', subscription.user_id);
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
