import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import { getPaddle } from '@/lib/paddle';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = await rateLimit(req, 'api', user.id);
  if (!rl.success) return rl.response!;

  const adminSupabase = createServiceRoleClient();
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  const customerId = profile?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
  }

  const { data: subscriptions } = await adminSupabase
    .from('subscriptions')
    .select('stripe_subscription_id, status')
    .eq('user_id', user.id)
    .in('status', ['active', 'past_due', 'paused', 'trialing'])
    .order('updated_at', { ascending: false });

  const subscriptionIds = (subscriptions ?? [])
    .map(subscription => subscription.stripe_subscription_id)
    .filter((subscriptionId): subscriptionId is string => Boolean(subscriptionId));

  try {
    const session = await getPaddle().customerPortalSessions.create(customerId, subscriptionIds);
    return NextResponse.json({ url: session.urls.general.overview });
  } catch (error) {
    console.error('Paddle customer portal session error:', error);
    return NextResponse.json({ error: 'Could not open billing portal' }, { status: 502 });
  }
}
