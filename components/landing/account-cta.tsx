"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconArrowRight,
  IconBookmark,
  IconDeviceMobile,
  IconLayoutDashboard,
  IconSparkles,
  IconUserCheck,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function AccountCta() {
  const { language, dir, t } = useI18n()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const ArrowIcon = dir === "rtl" ? IconArrowLeft : IconArrowRight

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <Card className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-background p-8 shadow-xl backdrop-blur-md sm:p-10">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
                <IconUserCheck className="h-4 w-4" />
                <span>
                  {language === "ar"
                    ? "حسابك الشخصي الموحد"
                    : "Single Account Experience"}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {t.accountBannerTitle}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t.accountBannerDesc}
              </p>
            </div>

            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row lg:col-span-4 lg:flex-col">
              {isAuthenticated ? (
                <Link href="/dashboard" className="w-full">
                  <Button
                    size="lg"
                    className="h-12 w-full gap-2 rounded-xl text-sm font-bold shadow-md"
                  >
                    <IconLayoutDashboard className="h-4 w-4" />
                    <span>{t.heroCtaDashboard}</span>
                    <ArrowIcon className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="w-full">
                    <Button
                      size="lg"
                      className="h-12 w-full gap-2 rounded-xl text-sm font-bold shadow-md"
                    >
                      <span>{t.accountBannerCta}</span>
                      <ArrowIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link
                    href="/login"
                    className="text-center text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t.accountBannerSignIn}
                  </Link>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
