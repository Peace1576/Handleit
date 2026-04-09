import { createServerClient } from '@/lib/supabase/server';
import { buildGoogleConnectUrl, buildGoogleRedirectUri, createOAuthState, getStateCookieName } from '@/lib/gmail';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function safeRedirectPath(next: string | null): string {
  const fallback = '/tools/complaint-letter';
  if (!next) return fallback;
  if (!next.startsWith('/') || next.startsWith('//')) return fallback;
  return next.startsWith('/tools') || next.startsWith('/settings') ? next : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirectedFrom', '/tools/complaint-letter');
      return NextResponse.redirect(loginUrl);
    }

    const state = createOAuthState();
    const next = safeRedirectPath(req.nextUrl.searchParams.get('next'));
    const redirectUri = buildGoogleRedirectUri(req.nextUrl.origin);
    const res = NextResponse.redirect(buildGoogleConnectUrl(state, req.nextUrl.origin));

    res.cookies.set({
      name: getStateCookieName(),
      value: JSON.stringify({ state, next, redirectUri, userId: user.id }),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10,
    });

    return res;
  } catch (error) {
    console.error('Gmail connect error:', error instanceof Error ? error.message : String(error));
    const fallback = new URL('/tools/complaint-letter', req.url);
    fallback.searchParams.set('gmail_error', 'gmail_connect_config');
    return NextResponse.redirect(fallback);
  }
}
