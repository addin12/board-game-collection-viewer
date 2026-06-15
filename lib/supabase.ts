import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Returns a Supabase client when env config is present, otherwise null. When
 * null, the sessions layer falls back to an in-memory store so the app still
 * runs (and is testable) without any cloud setup.
 *
 * The anon key is safe to expose to the browser by design; access is governed
 * by Supabase Row Level Security policies.
 */
let cached: SupabaseClient | null | undefined

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Newer Supabase projects issue a publishable key (sb_publishable_…); older
  // ones use the anon JWT. Both are browser-safe and both work with createClient.
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  cached = url && key ? createClient(url, key) : null
  return cached
}
