import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

interface MemoryEntry {
  count: number;
  resetAt: number;
}

type LimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

type SharedLimitResult = {
  success: boolean;
  remaining: number;
  reset_at: string;
  retry_after_seconds: number;
  hits: number;
};

const memStore = new Map<string, MemoryEntry>();
let hasLoggedRateLimitFallback = false;

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number,
): LimitResult {
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

export type RateLimitTier =
  | 'ai'
  | 'auth'
  | 'api'
  | 'webhook';

const TIERS: Record<RateLimitTier, { limit: number; windowMs: number }> = {
  ai: { limit: 20, windowMs: 60_000 },
  auth: { limit: 10, windowMs: 60_000 },
  api: { limit: 60, windowMs: 60_000 },
  webhook: { limit: 100, windowMs: 60_000 },
};

async function sharedLimit(
  identifier: string,
  tier: RateLimitTier,
  limit: number,
  windowMs: number,
): Promise<SharedLimitResult | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }

  try {
    const adminSupabase = createServiceRoleClient();
    const { data, error } = await adminSupabase.rpc('consume_rate_limit', {
      p_bucket: tier,
      p_identifier: identifier,
      p_limit: limit,
      p_window_ms: windowMs,
    });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    if (
      !row ||
      typeof row.success !== 'boolean' ||
      typeof row.remaining !== 'number' ||
      typeof row.reset_at !== 'string' ||
      typeof row.retry_after_seconds !== 'number' ||
      typeof row.hits !== 'number'
    ) {
      throw new Error('Invalid rate limit response');
    }

    return {
      success: row.success,
      remaining: row.remaining,
      reset_at: row.reset_at,
      retry_after_seconds: row.retry_after_seconds,
      hits: row.hits,
    };
  } catch (error) {
    if (!hasLoggedRateLimitFallback) {
      console.warn('Falling back to in-memory rate limiting:', error instanceof Error ? error.message : String(error));
      hasLoggedRateLimitFallback = true;
    }
    return null;
  }
}

export async function rateLimit(
  req: NextRequest,
  tier: RateLimitTier = 'api',
  identifier?: string,
): Promise<{ success: boolean; response?: NextResponse }> {
  const { limit, windowMs } = TIERS[tier];

  const derivedIdentifier =
    identifier?.trim() ||
    req.headers.get('cf-connecting-ip')?.trim() ||
    req.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'anonymous';

  const sharedKey = `rl:${tier}:${derivedIdentifier}`;
  const sharedResult = await sharedLimit(sharedKey, tier, limit, windowMs);
  let memoryResult: LimitResult | null = null;
  if (!sharedResult) {
    memoryResult = memoryLimit(sharedKey, limit, windowMs);
  }
  const result = sharedResult ?? memoryResult!;

  if (!result.success) {
    const retryAfter = sharedResult
      ? sharedResult.retry_after_seconds
      : Math.ceil((memoryResult!.reset - Date.now()) / 1000);
    const resetAt = sharedResult
      ? Math.ceil(new Date(sharedResult.reset_at).getTime() / 1000)
      : Math.ceil(memoryResult!.reset / 1000);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Too many requests. Please slow down and try again shortly.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(resetAt),
          },
        },
      ),
    };
  }

  return { success: true };
}
