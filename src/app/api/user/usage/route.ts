import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/ratelimit';

export async function GET(req: NextRequest) {
  const rl = await rateLimit(req, 'api');
  if (!rl.success) return rl.response!;
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceRoleClient();

  // Upsert profile — creates it with defaults if the DB trigger didn't fire
  await admin.from('profiles').upsert(
    { user_id: user.id },
    { onConflict: 'user_id', ignoreDuplicates: true }
  );

  const { data: profile, error } = await admin
    .from('profiles')
    .select('plan, uses_remaining, display_name')
    .eq('user_id', user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }

  return NextResponse.json({
    plan: profile.plan,
    uses_remaining: profile.uses_remaining,
    display_name: profile.display_name,
  });
}
