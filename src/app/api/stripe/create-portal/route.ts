import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminSupabase = createServiceRoleClient();
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return NextResponse.json({ url: session.url });
}
