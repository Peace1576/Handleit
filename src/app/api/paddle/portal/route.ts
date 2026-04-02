import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  void req;

  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminSupabase = createServiceRoleClient();
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  const customerId = profile?.stripe_customer_id;

  // Paddle customer portal: https://customer.paddle.com/
  // If we have a Paddle customer ID, link directly; otherwise return the generic portal
  const portalUrl = customerId
    ? `https://customer.paddle.com/customers/${customerId}`
    : 'https://customer.paddle.com/';

  return NextResponse.json({ url: portalUrl });
}
