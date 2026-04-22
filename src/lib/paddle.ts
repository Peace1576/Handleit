import { createHmac, timingSafeEqual } from 'crypto';
import { Paddle } from '@paddle/paddle-node-sdk';

let _paddle: Paddle | null = null;

export function getPaddle(): Paddle {
  if (!_paddle) {
    if (!process.env.PADDLE_API_KEY) throw new Error('PADDLE_API_KEY is not set');
    _paddle = new Paddle(process.env.PADDLE_API_KEY);
  }
  return _paddle;
}

export const PADDLE_PRICE_IDS = {
  basic_monthly: process.env.PADDLE_PRICE_BASIC_MONTHLY ?? '',
  basic_annual:  process.env.PADDLE_PRICE_BASIC_ANNUAL  ?? '',
  pro_monthly:   process.env.PADDLE_PRICE_PRO_MONTHLY   ?? '',
  pro_annual:    process.env.PADDLE_PRICE_PRO_ANNUAL    ?? '',
  lifetime:      process.env.PADDLE_PRICE_LIFETIME      ?? '',
} as const;

export type PaddlePlan = keyof typeof PADDLE_PRICE_IDS;

export type PaddleCheckoutBinding = {
  purchase_id: string;
  sig: string;
  user_id: string;
};

function getCheckoutBindingSecret(): string {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('PADDLE_WEBHOOK_SECRET is not set');
  }
  return secret;
}

function buildCheckoutSignature(userId: string, purchaseId: string): string {
  return createHmac('sha256', getCheckoutBindingSecret())
    .update(`${userId}:${purchaseId}`)
    .digest('hex');
}

export function createCheckoutBinding(userId: string, purchaseId: string): PaddleCheckoutBinding {
  return {
    user_id: userId,
    purchase_id: purchaseId,
    sig: buildCheckoutSignature(userId, purchaseId),
  };
}

export function verifyCheckoutBinding(binding: Partial<PaddleCheckoutBinding> | null | undefined): binding is PaddleCheckoutBinding {
  if (!binding?.user_id || !binding.purchase_id || !binding.sig) {
    return false;
  }

  const expected = buildCheckoutSignature(binding.user_id, binding.purchase_id);
  const provided = binding.sig;

  if (provided.length !== expected.length) {
    return false;
  }

  try {
    return timingSafeEqual(Buffer.from(provided, 'utf8'), Buffer.from(expected, 'utf8'));
  } catch {
    return false;
  }
}
