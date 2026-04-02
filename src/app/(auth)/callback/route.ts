import { createServerClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/** Only allow redirects to internal paths — never to external domains */
function safeRedirectPath(next: string | null): string {
  const fallback = '/dashboard';
  if (!next) return fallback;
  try {
    // Must start with / and not contain // (protocol-relative URLs like //evil.com)
    if (!next.startsWith('/') || next.startsWith('//')) return fallback;
    // Only allow known internal prefixes
    const ALLOWED_PREFIXES = ['/dashboard', '/tools', '/history', '/settings', '/pricing'];
    const isAllowed = ALLOWED_PREFIXES.some(p => next === p || next.startsWith(p + '/') || next.startsWith(p + '?'));
    return isAllowed ? next : fallback;
  } catch {
    return fallback;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  // Validate next — prevents open redirect to external sites
  const next = safeRedirectPath(searchParams.get('next'));

  if (code) {
    const supabase = createServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure profile exists — self-healing in case DB trigger wasn't set up
      const admin = createServiceRoleClient();
      await admin.from('profiles').upsert(
        {
          user_id: data.user.id,
          display_name: data.user.user_metadata?.name ?? null,
          marketing_consent: data.user.user_metadata?.marketing_consent ?? false,
        },
        { onConflict: 'user_id', ignoreDuplicates: true }
      );

      return NextResponse.redirect(new URL(next, req.url));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));
}
