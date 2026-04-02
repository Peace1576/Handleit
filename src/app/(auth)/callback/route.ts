import { createServerClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

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
