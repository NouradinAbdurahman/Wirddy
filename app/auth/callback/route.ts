import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { sanitizeRedirectUrl } from "@/lib/auth/redirect"
import { Database } from "@/lib/supabase/types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  const rawNext = requestUrl.searchParams.get("next")
  const safeNext = sanitizeRedirectUrl(rawNext)

  const origin = requestUrl.origin
  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocalEnv = process.env.NODE_ENV === "development"
  const redirectOrigin =
    isLocalEnv || !forwardedHost ? origin : `https://${forwardedHost}`

  // If Google OAuth returned an error (e.g. user cancelled), redirect back to /login with error query
  if (error) {
    const loginUrl = new URL("/login", redirectOrigin)
    loginUrl.searchParams.set("error", errorDescription || error)
    if (rawNext) {
      loginUrl.searchParams.set("next", safeNext)
    }
    return NextResponse.redirect(loginUrl)
  }

  // Create redirect response so cookies can be directly attached
  const response = NextResponse.redirect(new URL(safeNext, redirectOrigin))

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
        const supabase = createServerClient<Database>(
          supabaseUrl,
          supabaseAnonKey,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll()
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                  request.cookies.set(name, value)
                  response.cookies.set(name, value, options)
                })
              },
            },
          }
        )

        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error("Supabase OAuth code exchange error:", exchangeError)
          const loginUrl = new URL("/login", redirectOrigin)
          loginUrl.searchParams.set("error", "auth_exchange_failed")
          return NextResponse.redirect(loginUrl)
        }

        // Safe diagnostic logging in development
        if (process.env.NODE_ENV === "development") {
          console.log("[Supabase Auth Callback]", {
            hasCode: Boolean(code),
            hasSession: Boolean(data?.session),
            hasUser: Boolean(data?.user),
            userId: data?.user?.id,
          })
        }
      } catch (err) {
        console.error("Unexpected error in auth callback route:", err)
        const loginUrl = new URL("/login", redirectOrigin)
        loginUrl.searchParams.set("error", "unexpected_auth_error")
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  return response
}
