"use client"

import React from "react"
import {
  IconArrowLeft,
  IconArrowRight,
  IconBook,
  IconCalendarEvent,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface HeroProps {
  onCreateGroup: () => void
  onHowItWorks: () => void
}

export function Hero({ onCreateGroup, onHowItWorks }: HeroProps) {
  const { language, dir, t, formatNumber } = useI18n()
  const ArrowIcon = dir === "rtl" ? IconArrowLeft : IconArrowRight

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto max-w-5xl px-4 text-center sm:px-6">
        {/* Main Heading */}
        <h1
          className={`text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl ${
            language === "ar" ? "leading-[1.4]" : "leading-[1.15]"
          }`}
        >
          <span className="block text-primary">{t.appName}</span>
          <span
            className={`block text-2xl font-semibold text-muted-foreground sm:text-3xl md:text-4xl ${
              language === "ar" ? "mt-3 leading-relaxed sm:mt-4" : "mt-2"
            }`}
          >
            {t.tagline}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t.heroSubtitle}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          <Button
            size="lg"
            onClick={onCreateGroup}
            className="h-12 w-full gap-2 rounded-xl px-7 text-base font-semibold shadow-md transition-all hover:shadow-lg sm:w-auto"
          >
            <span>{t.ctaCreateGroup}</span>
            <ArrowIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onHowItWorks}
            className="h-12 w-full rounded-xl border-border/80 px-6 text-base font-medium transition-colors hover:bg-muted/70 sm:w-auto"
          >
            {t.ctaHowItWorks}
          </Button>
        </div>

        {/* Hero Interactive Mini-Schedule Card Preview */}
        <div className="mx-auto mt-12 max-w-3xl">
          <Card className="gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-0 py-0 text-start shadow-xl backdrop-blur-md">
            {/* Header flush with the top edge with distinct background and generous padding */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/60 px-6 py-5 sm:px-8 sm:py-6 dark:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                  {language === "ar"
                    ? "نموذج جدول دوري — الأسبوع الأول"
                    : "Sample Rotating Schedule — Week 1"}
                </span>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 sm:text-sm dark:text-emerald-400"
              >
                {language === "ar"
                  ? "٣٠ جزءًا • ختمة أسبوعية"
                  : "30 Juz • 1 Complete Quran"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3.5 p-4 sm:grid-cols-3 sm:p-6">
              {/* Sample Card 1 */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm transition-all hover:border-primary/30 dark:bg-card/70">
                <div className="mb-2.5 flex items-start justify-between gap-2 border-b border-border/40 pb-2.5">
                  <span
                    suppressHydrationWarning
                    className="text-sm font-extrabold break-words text-foreground"
                  >
                    {language === "ar" ? "طارق" : "Tariq"}
                  </span>
                  <span
                    suppressHydrationWarning
                    className="shrink-0 rounded-md border border-border/50 bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground dark:bg-muted/40"
                  >
                    {language === "ar"
                      ? "٥ أجزاء"
                      : `${formatNumber(5)} ${t.juzUnit}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col space-y-0.5">
                    <span
                      suppressHydrationWarning
                      className="text-[9px] font-extrabold tracking-wider text-primary uppercase"
                    >
                      {t.startLabel}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="text-[11px] font-bold text-muted-foreground"
                    >
                      {t.juzLabel} {formatNumber(1)}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="pt-0.5 text-xs font-extrabold break-words text-foreground"
                    >
                      {language === "ar" ? "الفاتحة ١" : "Al-Fatihah 1"}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-0.5">
                    <span
                      suppressHydrationWarning
                      className="text-[9px] font-extrabold tracking-wider text-primary uppercase"
                    >
                      {t.endLabel}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="text-[11px] font-bold text-muted-foreground"
                    >
                      {t.juzLabel} {formatNumber(5)}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="pt-0.5 text-xs font-extrabold break-words text-foreground"
                    >
                      {language === "ar" ? "النساء ١٤٧" : "An-Nisa 147"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Card 2 */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm transition-all hover:border-primary/30 dark:bg-card/70">
                <div className="mb-2.5 flex items-start justify-between gap-2 border-b border-border/40 pb-2.5">
                  <span
                    suppressHydrationWarning
                    className="text-sm font-extrabold break-words text-foreground"
                  >
                    {language === "ar" ? "زينب" : "Zainab"}
                  </span>
                  <span
                    suppressHydrationWarning
                    className="shrink-0 rounded-md border border-border/50 bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground dark:bg-muted/40"
                  >
                    {language === "ar"
                      ? "جزآن"
                      : `${formatNumber(2)} ${t.juzUnit}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col space-y-0.5">
                    <span
                      suppressHydrationWarning
                      className="text-[9px] font-extrabold tracking-wider text-primary uppercase"
                    >
                      {t.startLabel}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="text-[11px] font-bold text-muted-foreground"
                    >
                      {t.juzLabel} {formatNumber(6)}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="pt-0.5 text-xs font-extrabold break-words text-foreground"
                    >
                      {language === "ar" ? "النساء ١٤٨" : "An-Nisa 148"}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-0.5">
                    <span
                      suppressHydrationWarning
                      className="text-[9px] font-extrabold tracking-wider text-primary uppercase"
                    >
                      {t.endLabel}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="text-[11px] font-bold text-muted-foreground"
                    >
                      {t.juzLabel} {formatNumber(7)}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="pt-0.5 text-xs font-extrabold break-words text-foreground"
                    >
                      {language === "ar" ? "الأنعام ١١٠" : "Al-An'am 110"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Card 3 */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm transition-all hover:border-primary/30 dark:bg-card/70">
                <div className="mb-2.5 flex items-start justify-between gap-2 border-b border-border/40 pb-2.5">
                  <span
                    suppressHydrationWarning
                    className="text-sm font-extrabold break-words text-foreground"
                  >
                    {language === "ar" ? "يوسف" : "Yousef"}
                  </span>
                  <span
                    suppressHydrationWarning
                    className="shrink-0 rounded-md border border-border/50 bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground dark:bg-muted/40"
                  >
                    {language === "ar"
                      ? "جزآن"
                      : `${formatNumber(2)} ${t.juzUnit}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col space-y-0.5">
                    <span
                      suppressHydrationWarning
                      className="text-[9px] font-extrabold tracking-wider text-primary uppercase"
                    >
                      {t.startLabel}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="text-[11px] font-bold text-muted-foreground"
                    >
                      {t.juzLabel} {formatNumber(26)}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="pt-0.5 text-xs font-extrabold break-words text-foreground"
                    >
                      {language === "ar" ? "الأحقاف ١" : "Al-Ahqaf 1"}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-0.5">
                    <span
                      suppressHydrationWarning
                      className="text-[9px] font-extrabold tracking-wider text-primary uppercase"
                    >
                      {t.endLabel}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="text-[11px] font-bold text-muted-foreground"
                    >
                      {t.juzLabel} {formatNumber(27)}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="pt-0.5 text-xs font-extrabold break-words text-foreground"
                    >
                      {language === "ar" ? "الحديد ٢٩" : "Al-Hadid 29"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
