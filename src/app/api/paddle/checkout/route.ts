import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createCheckoutBinding } from '@/lib/paddle';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.id || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = await rateLimit(req, 'api', user.id);
  if (!rl.success) return rl.response!;

  const purchaseId = randomUUID();

  return NextResponse.json({
    customerEmail: user.email,
    customData: createCheckoutBinding(user.id, purchaseId),
    purchaseId,
  });
}
