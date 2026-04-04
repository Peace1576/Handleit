/**
 * Rate limiting for HandleIt API routes.
 * Pure in-memory implementation — no Redis required.
 * Works per serverless instance on Vercel (sufficient for a growing site).
 */

import { NextRequest, NextResponse } from 'next/server';

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, MemoryEntry>();

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const entry = memStore.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    memStore.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, reset: resetAt };
  }

  entry.count++;
  if (entry.count > limit) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }
  return { success: true, remaining: limit - entry.count, reset: entry.resetAt };
}

// ─── Rate limit tiers ─────────────────────────────────────────────────────────

export type RateLimitTier =
  | 'ai'        // AI generation  — 20 req / 60 s per IP
  | 'auth'      // Login / signup — 10 req / 60 s per IP
  | 'api'       // General API   — 60 req / 60 s per IP
  | 'webhook';  // Webhooks      — 100 req / 60 s (Paddle sends bursts)

const TIERS: Record<RateLimitTier, { limit: number; windowMs: number }> = {
  ai:      { limit: 20,  windowMs: 60_000 },
  auth:    { limit: 10,  windowMs: 60_000 },
  api:     { limit: 60,  windowMs: 60_000 },
  webhook: { limit: 100, windowMs: 60_000 },
};

// ─── Main export ──────────────────────────────────────────────────────────────

export async function rateLimit(
  req: NextRequest,
  tier: RateLimitTier = 'api',
  identifier?: string,
): Promise<{ success: boolean; response?: NextResponse }> {
  const { limit, windowMs } = TIERS[tier];

  const ip =
    identifier ??
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous';

  const key = `rl:${tier}:${ip}`;
  const result = memoryLimit(key, limit, windowMs);

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Too many requests. Please slow down and try again shortly.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
          },
        },
      ),
    };
  }

  return { success: true };
}
