import Stripe from 'stripe';

// Lazy-initialize so build doesn't fail when env vars aren't set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// Keep named export for backwards compat with existing route files
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PRICE_IDS: Record<string, string> = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
  pro_annual:  process.env.STRIPE_PRICE_PRO_ANNUAL ?? '',
  lifetime:    process.env.STRIPE_PRICE_LIFETIME ?? '',
};
