import { createBrowserClient } from '@supabase/ssr';

/**
 * KEY FORMAT NOTE
 * ───────────────
 * @supabase/supabase-js ≥ 2.100.x and @supabase/ssr ≥ 0.10.x both support
 * the new `sb_publishable_…` key format (Supabase dashboard → Settings → API →
 * "Publishable (anon) key").  The SDK passes the key verbatim as the `apikey`
 * header — no JWT parsing is done on the anon key.
 *
 * If you are seeing "Invalid API key" errors from Supabase, go to:
 *   https://supabase.com/dashboard/project/_/settings/api
 * and copy the value labelled **"anon / public"** (it may start with
 * `sb_publishable_` on newer projects, or `eyJ…` on older ones).
 * Paste it into .env.local as NEXT_PUBLIC_SUPABASE_ANON_KEY and restart
 * the dev server.
 */

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    '[Supabase] Missing environment variables.\n' +
    'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local.\n' +
    'Get them from: https://supabase.com/dashboard/project/_/settings/api'
  );
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
