import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import {
  encryptRefreshToken,
  exchangeCodeForTokens,
  fetchGoogleProfile,
  getStateCookieName,
} from '@/lib/gmail';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type StatePayload = {
  state: string;
  next: string;
  redirectUri: string;
  userId: string;
};

function errorRedirect(req: NextRequest, next: string, message: string) {
  const url = new URL(next, req.url);
  url.searchParams.set('gmail_error', message);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const rawCookie = req.cookies.get(getStateCookieName())?.value;

  if (!code || !state || !rawCookie) {
    return errorRedirect(req, '/tools/complaint-letter', 'gmail_connect_failed');
  }

  let payload: StatePayload | null = null;
  try {
    payload = JSON.parse(rawCookie) as StatePayload;
  } catch {
    return errorRedirect(req, '/tools/complaint-letter', 'gmail_connect_failed');
  }

  if (!payload || payload.state !== state) {
    return errorRedirect(req, '/tools/complaint-letter', 'gmail_connect_failed');
  }

  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== payload.userId) {
    return errorRedirect(req, '/login', 'gmail_connect_failed');
  }

  try {
    const tokens = await exchangeCodeForTokens(code, payload.redirectUri);
    if (!tokens.refresh_token || !tokens.access_token) {
      return errorRedirect(req, payload.next, 'gmail_missing_refresh_token');
    }

    const profile = await fetchGoogleProfile(tokens.access_token);
    const admin = createServiceRoleClient();
    await admin.from('gmail_connections').upsert({
      user_id: payload.userId,
      google_email: profile.email,
      google_name: profile.name,
      encrypted_refresh_token: encryptRefreshToken(tokens.refresh_token),
      scopes: tokens.scope ?? null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

    const redirectTarget = new URL(payload.next, req.url);

    const res = NextResponse.redirect(redirectTarget);
    res.cookies.set({
      name: getStateCookieName(),
      value: '',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
    return res;
  } catch (error) {
    console.error('Gmail callback error:', error instanceof Error ? error.message : String(error));
    return errorRedirect(req, payload.next, 'gmail_connect_failed');
  }
}
