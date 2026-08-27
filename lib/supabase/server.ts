import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { Database } from "./types"

let serverClient: SupabaseClient<Database> | null = null

/**
 * Checks whether Supabase is configured for server operations.
 */
export function isSupabaseServerConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return Boolean(
    url &&
    key &&
    url.trim().length > 0 &&
    key.trim().length > 0 &&
    !url.includes("your-project-id")
  )
}

/**
 * Returns a server-only Supabase client.
 * Uses SUPABASE_SERVICE_ROLE_KEY if available for atomic transactional inserts/updates,
 * or falls back to anon key.
 *
 * NOTE: This function must NEVER be imported or called in client components.
 */
export function getSupabaseServerClient(): SupabaseClient<Database> | null {
  if (!isSupabaseServerConfigured()) {
    return null
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!

  if (!serverClient) {
    serverClient = createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return serverClient
}
