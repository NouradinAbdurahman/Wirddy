"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconLayoutDashboard,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface HeroProps {
  onCreateGroup: () => void
  onHowItWorks: () => void
}

export function Hero({ onCreateGroup, onHowItWorks }: HeroProps) {
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
    <section className="relative overflow-hidden pt-4 pb-10 sm:pt-8 sm:pb-14 md:pt-12 md:pb-16">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/5" />

      <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Main Headline */}
        <h1
          className={`text-3xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl ${
            language === "ar" ? "leading-[1.35]" : "leading-[1.12]"
          }`}
        >
          <span className="block text-primary">{t.appName}</span>
          <span
            className={`block text-xl font-bold text-muted-foreground sm:text-2xl md:text-3xl ${
              language === "ar" ? "mt-3 leading-relaxed sm:mt-4" : "mt-2.5"
            }`}
          >
            {t.tagline}
          </span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t.heroSubtitle}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          {isAuthenticated ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full gap-2 rounded-xl px-8 text-base font-extrabold shadow-md transition-all hover:shadow-lg sm:w-auto"
              >
                <IconLayoutDashboard className="h-5 w-5" />
                <span>{t.heroCtaDashboard}</span>
                <ArrowIcon className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full gap-2 rounded-xl px-8 text-base font-extrabold shadow-md transition-all hover:shadow-lg sm:w-auto"
              >
                <span>{t.heroCtaAccount}</span>
                <ArrowIcon className="h-4 w-4" />
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={onCreateGroup}
            className="h-12 w-full rounded-xl border-border/80 px-6 text-base font-bold transition-colors hover:bg-muted/70 sm:w-auto"
          >
            {t.heroCtaGuest}
          </Button>
        </div>

        {/* Key Platform Highlights */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <IconCheck className="h-3.5 w-3.5" />
            </div>
            <span>
              {language === "ar"
                ? "جدولة دورية ذكية وتلقائية"
                : "Smart rotating schedules"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <IconCheck className="h-3.5 w-3.5" />
            </div>
            <span>
              {language === "ar"
                ? "متابعة الورد اليومي والمصحف"
                : "Daily reading tracking & reader"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <IconCheck className="h-3.5 w-3.5" />
            </div>
            <span>
              {language === "ar"
                ? "تصدير عالي الدقة (PNG / PDF)"
                : "High-resolution export (PNG / PDF)"}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
