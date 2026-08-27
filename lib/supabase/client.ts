import { createBrowserClient } from "@supabase/ssr"
import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from "./types"

let browserClient: SupabaseClient<Database> | null = null

/**
 * Checks whether Supabase environment variables are properly configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
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
 * Returns a browser-safe Supabase client initialized with @supabase/ssr.
 * Automatically synchronizes session state and cookies with document.cookie.
 * Returns null if Supabase is not configured.
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (typeof window === "undefined") {
    // In SSR, return client if configured
    if (!isSupabaseConfigured()) return null
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!
    return createBrowserClient<Database>(url, key)
  }

  if (browserClient) return browserClient

  if (!isSupabaseConfigured()) {
    return null
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!

  browserClient = createBrowserClient<Database>(url, key)

  return browserClient
}
