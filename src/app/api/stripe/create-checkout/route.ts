import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_IDS } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase/server';
import type { StripePlan } from '@/types';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan }: { plan: StripePlan } = await req.json();
  const priceId = PRICE_IDS[plan];
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const isLifetime = plan === 'lifetime';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: isLifetime ? 'payment' : 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email,
    metadata: {
      user_id: user.id,
      plan: isLifetime ? 'lifetime' : 'pro',
    },
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url:  `${appUrl}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
