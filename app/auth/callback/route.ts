import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sanitizeRedirectUrl } from "@/lib/auth/redirect"
import { Database } from "@/lib/supabase/types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  const rawNext = requestUrl.searchParams.get("next")
  const safeNext = sanitizeRedirectUrl(rawNext)

  // If Google OAuth returned an error (e.g. user cancelled), redirect back to /login with error query
  if (error) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("error", errorDescription || error)
    if (rawNext) {
      loginUrl.searchParams.set("next", safeNext)
    }
    return NextResponse.redirect(loginUrl)
  }

  // If code is present, exchange it for a session if Supabase is configured
  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (
      supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("your-project-id")
    ) {
      try {
        const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        })
        await supabase.auth.exchangeCodeForSession(code)
      } catch (err) {
        console.error("Supabase OAuth code exchange error:", err)
      }
    }
  }

  // Redirect user to their intended destination (defaults to '/')
  const responseRedirectUrl = new URL(safeNext, request.url)
  return NextResponse.redirect(responseRedirectUrl)
}
