import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

/**
 * Server-only Supabase client using the service role key, which bypasses RLS.
 * Never import this from a client component.
 *
 * The environment is read here rather than at module load so that `next build`
 * succeeds without credentials. The failure surfaces on the first submission
 * instead, where lib/waitlist.ts turns it into the generic error message.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    )
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return cached
}
