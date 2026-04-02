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
