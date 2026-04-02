/**
 * Rate limiting for HandleIt API routes.
 *
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * are set (production). Falls back to a simple in-process memory store for
 * local dev so nothing breaks without Redis configured.
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── In-memory fallback (local dev / no Redis) ────────────────────────────────

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memStore = new Map<string, MemoryEntry>();

function memoryLimit(key: string, limit: number, windowMs: number): { success: boolean; remaining: number; reset: number } {
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

// ─── Rate limit configs ───────────────────────────────────────────────────────

export type RateLimitTier =
  | 'ai'        // AI generation — 20 req / 60s per IP
  | 'auth'      // Login / signup — 10 req / 60s per IP
  | 'api'       // General API — 60 req / 60s per IP
  | 'webhook';  // Webhooks — 100 req / 60s (Paddle sends bursts)

const TIERS: Record<RateLimitTier, { limit: number; windowMs: number }> = {
  ai:      { limit: 20,  windowMs: 60_000 },
  auth:    { limit: 10,  windowMs: 60_000 },
  api:     { limit: 60,  windowMs: 60_000 },
  webhook: { limit: 100, windowMs: 60_000 },
};

// ─── Main rate limit function ─────────────────────────────────────────────────

export async function rateLimit(
  req: NextRequest,
  tier: RateLimitTier = 'api',
  identifier?: string, // override IP — e.g. use user_id for authenticated routes
): Promise<{ success: boolean; response?: NextResponse }> {
  const { limit, windowMs } = TIERS[tier];

  // Derive identifier: prefer explicit, then CF-Connecting-IP, then x-forwarded-for, then fallback
  const ip =
    identifier ??
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous';

  const key = `rl:${tier}:${ip}`;

  let result: { success: boolean; remaining: number; reset: number };

  // Use Upstash Redis if configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const { Redis } = await import('@upstash/redis');

      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      const rl = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs / 1000} s`),
        prefix: 'handleit',
      });

      const upstashResult = await rl.limit(key);
      result = {
        success: upstashResult.success,
        remaining: upstashResult.remaining,
        reset: upstashResult.reset,
      };
    } catch {
      // Redis unavailable — fall back to memory
      result = memoryLimit(key, limit, windowMs);
    }
  } else {
    result = memoryLimit(key, limit, windowMs);
  }

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
