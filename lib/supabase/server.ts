import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { Database } from "./types"

let serviceRoleClient: SupabaseClient<Database> | null = null

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
 * Returns a server-only Supabase admin client with service-role privileges.
 * Used for atomic transactional group saves and rate limiting.
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

  if (!serviceRoleClient) {
    serviceRoleClient = createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return serviceRoleClient
}

/**
 * Creates an SSR-compatible Supabase Server Client bound to the request/response cookie store.
 * Handles reading and writing authentication cookies for Next.js Server Components, Server Actions,
 * and Route Handlers.
 */
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url.includes("your-project-id")) {
    return null
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware or route handler manages cookies.
        }
      },
    },
  })
}
