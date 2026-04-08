import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from('gmail_connections')
    .select('google_email, google_name, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Gmail status error:', error.message);
    return NextResponse.json({ error: 'Could not load Gmail status.' }, { status: 500 });
  }

  return NextResponse.json({
    connected: !!data,
    email: data?.google_email ?? null,
    name: data?.google_name ?? null,
    updated_at: data?.updated_at ?? null,
  });
}

export async function DELETE() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from('gmail_connections')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('Gmail disconnect error:', error.message);
    return NextResponse.json({ error: 'Could not disconnect Gmail.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
