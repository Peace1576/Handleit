import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import { createGmailDraft, decryptRefreshToken, refreshAccessToken } from '@/lib/gmail';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let to: string | null = null;
  let subject = '';
  let body = '';
  try {
    const payload = await req.json() as { to?: string | null; subject?: string; body?: string };
    to = payload.to?.trim() || null;
    subject = String(payload.subject ?? '').trim();
    body = String(payload.body ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (to && !EMAIL_REGEX.test(to)) {
    return NextResponse.json({ error: 'Recipient email looks invalid.' }, { status: 400 });
  }
  if (!subject) {
    return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
  }
  if (!body) {
    return NextResponse.json({ error: 'Letter body is required.' }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { data: connection, error } = await admin
    .from('gmail_connections')
    .select('encrypted_refresh_token')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Gmail draft lookup error:', error.message);
    return NextResponse.json({ error: 'Could not load Gmail connection.' }, { status: 500 });
  }
  if (!connection) {
    return NextResponse.json({ error: 'Connect Gmail first.' }, { status: 409 });
  }

  try {
    const refreshToken = decryptRefreshToken(connection.encrypted_refresh_token);
    const tokens = await refreshAccessToken(refreshToken);
    if (!tokens.access_token) {
      return NextResponse.json({ error: 'Could not refresh Gmail access.' }, { status: 502 });
    }

    const draft = await createGmailDraft(tokens.access_token, { to, subject, body });
    return NextResponse.json({ ok: true, draft_id: draft.id });
  } catch (draftError) {
    console.error('Gmail draft create error:', draftError instanceof Error ? draftError.message : String(draftError));
    return NextResponse.json({ error: 'Could not create Gmail draft.' }, { status: 502 });
  }
}
