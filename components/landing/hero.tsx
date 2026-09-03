"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconLayoutDashboard,
  IconSparkles,
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
    <section className="relative flex min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden py-10 sm:py-16 md:py-20">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[550px] w-[850px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/5" />

      <div className="container mx-auto my-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Top Badge */}
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-extrabold text-primary shadow-xs">
          <IconSparkles className="h-3.5 w-3.5" />
          <span>
            {language === "ar"
              ? "المنصة الذكية لتنظيم الختمات القرآنية"
              : "Smart Platform for Quran Reading Schedules"}
          </span>
        </div>

        {/* Main Headline */}
        <h1
          className={`text-3xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl ${
            language === "ar" ? "leading-[1.35]" : "leading-[1.12]"
          }`}
        >
          <span className="block text-primary">{t.appName}</span>
          <span
            className={`block text-xl font-bold text-muted-foreground sm:text-3xl md:text-4xl ${
              language === "ar" ? "mt-3 leading-relaxed sm:mt-4" : "mt-3"
            }`}
          >
            {t.tagline}
          </span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
          {t.heroSubtitle}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {isAuthenticated ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-13 w-full gap-2 rounded-2xl px-9 text-base font-extrabold shadow-md transition-all hover:shadow-lg sm:w-auto"
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
                className="h-13 w-full gap-2 rounded-2xl px-9 text-base font-extrabold shadow-md transition-all hover:shadow-lg sm:w-auto"
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
            className="h-13 w-full rounded-2xl border-border/80 px-8 text-base font-bold transition-colors hover:bg-muted/70 sm:w-auto"
          >
            {t.heroCtaGuest}
          </Button>
        </div>

        {/* Key Platform Highlights */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-muted-foreground">
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
