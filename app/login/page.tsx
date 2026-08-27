"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import {
  IconArrowLeft,
  IconArrowRight,
  IconAlertCircle,
  IconLoader2,
  IconShieldCheck,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client"
import { sanitizeRedirectUrl } from "@/lib/auth/redirect"

/**
 * Official Google "G" Vector Icon with authentic multi-color branding
 */
function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

function LoginForm() {
  const { language, dir, t } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const rawNext = searchParams.get("next")
  const rawError = searchParams.get("error")
  const safeNext = sanitizeRedirectUrl(rawNext)

  // Check for error parameters in URL upon mount
  useEffect(() => {
    if (rawError) {
      if (
        rawError.toLowerCase().includes("cancel") ||
        rawError.toLowerCase().includes("closed")
      ) {
        setErrorMessage(t.authCancelled)
      } else {
        setErrorMessage(t.authFailedGeneric)
      }
    }
  }, [rawError, t])

  // Check if user is already logged in upon mount
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace(safeNext)
      }
    })
  }, [router, safeNext])

  const handleGoogleSignIn = async () => {
    if (isLoading) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      if (!isSupabaseConfigured()) {
        throw new Error("Supabase is not configured in this environment.")
      }

      const supabase = getSupabaseBrowserClient()
      if (!supabase) {
        throw new Error("Could not initialize Supabase authentication client.")
      }

      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      })

      if (error) {
        throw error
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err)
      setIsLoading(false)
      setErrorMessage(
        err?.message && !err.message.includes("Supabase")
          ? err.message
          : t.authFailedGeneric
      )
    }
  }

  const BackIcon = dir === "rtl" ? IconArrowRight : IconArrowLeft

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto w-full max-w-md space-y-6"
      >
        {/* Back to Home Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <BackIcon className="h-4 w-4" />
            <span>{t.authBackToHome}</span>
          </Link>
        </div>

        {/* Auth Card */}
        <Card className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-6 text-center shadow-lg backdrop-blur-xl sm:p-8 dark:bg-card/70">
          <div className="pointer-events-none absolute end-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

          <CardContent className="relative z-10 space-y-6 p-0">
            {/* Wirddy Logo Header */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <Link
                href="/"
                className="inline-block transition-transform active:scale-95"
              >
                <img
                  src="/wirddy-logo-black.png"
                  alt={t.appName}
                  className="block h-10 w-auto object-contain dark:hidden"
                  suppressHydrationWarning
                />
                <img
                  src="/wirddy-logo-white.png"
                  alt={t.appName}
                  className="hidden h-10 w-auto object-contain dark:block"
                  suppressHydrationWarning
                />
              </Link>

              <div className="space-y-1.5 text-center">
                <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                  {t.authLoginTitle}
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {t.authLoginSubtitle}
                </p>
              </div>
            </div>

            {/* Error Alert Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-start text-xs font-semibold text-destructive"
              >
                <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1 space-y-1">
                  <p>{errorMessage}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null)
                      handleGoogleSignIn()
                    }}
                    className="cursor-pointer text-[11px] font-bold underline hover:opacity-80"
                  >
                    {t.authTryAgain}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Google Authentication Button */}
            <div className="space-y-3 pt-2">
              <Button
                type="button"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="relative flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-border/80 bg-background text-sm font-bold text-foreground shadow-xs transition-all hover:border-primary/50 hover:bg-muted/60 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-muted/40 dark:hover:bg-muted/70"
              >
                {isLoading ? (
                  <>
                    <IconLoader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>{t.authConnectingGoogle}</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="h-5 w-5 shrink-0" />
                    <span>{t.authContinueWithGoogle}</span>
                  </>
                )}
              </Button>

              {/* Trust / Security Note */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <IconShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t.authSecureGoogle}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
