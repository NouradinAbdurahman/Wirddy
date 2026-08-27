"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconArrowRight,
  IconBook,
  IconBookmark,
  IconCalendarEvent,
  IconCheck,
  IconCompass,
  IconDeviceMobile,
  IconLayoutDashboard,
  IconPlayerPlay,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface HeroProps {
  onCreateGroup: () => void
  onHowItWorks: () => void
}

export function Hero({ onCreateGroup, onHowItWorks }: HeroProps) {
  const { language, dir, t, formatNumber } = useI18n()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<"schedule" | "today" | "reader">("schedule")
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
    <section className="relative overflow-hidden pt-6 pb-14 md:pt-12 md:pb-20">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />

      <div className="container mx-auto max-w-5xl px-4 text-center sm:px-6">
        {/* Eyebrow Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-sm">
          <IconSparkles className="h-3.5 w-3.5" />
          <span>{t.heroEyebrow}</span>
        </div>

        {/* Main Headline */}
        <h1
          className={`text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl ${
            language === "ar" ? "leading-[1.35]" : "leading-[1.15]"
          }`}
        >
          <span className="block text-foreground">{t.heroHeadline}</span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t.heroSubtitle}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          {isAuthenticated ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full gap-2 rounded-xl px-8 text-base font-semibold shadow-md transition-all hover:shadow-lg sm:w-auto"
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
                className="h-12 w-full gap-2 rounded-xl px-8 text-base font-semibold shadow-md transition-all hover:shadow-lg sm:w-auto"
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
            className="h-12 w-full rounded-xl border-border/80 px-6 text-base font-medium transition-colors hover:bg-muted/70 sm:w-auto"
          >
            {t.heroCtaGuest}
          </Button>
        </div>

        {/* Trust/Product Highlights Line */}
        <div className="mt-5 text-xs font-semibold tracking-wide text-muted-foreground/90">
          {t.heroTrustLine}
        </div>

        {/* Hero Interactive Multi-Feature Showcase Preview */}
        <div className="mx-auto mt-12 max-w-3xl">
          {/* Preview Navigation Tabs */}
          <div className="mb-3 flex items-center justify-center gap-1.5 p-1">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "schedule"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconCalendarEvent className="h-3.5 w-3.5" />
              <span>{language === "ar" ? "جدول التدوير" : "Rotating Schedule"}</span>
            </button>
            <button
              onClick={() => setActiveTab("today")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "today"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconCompass className="h-3.5 w-3.5" />
              <span>{language === "ar" ? "ورد اليوم" : "Today's Reading"}</span>
            </button>
            <button
              onClick={() => setActiveTab("reader")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "reader"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconBook className="h-3.5 w-3.5" />
              <span>{language === "ar" ? "المصحف الإلكتروني" : "Quran Reader"}</span>
            </button>
          </div>

          <Card className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-0 text-start shadow-2xl backdrop-blur-md">
            {/* Tab 1: Rotating Schedule Sample */}
            {activeTab === "schedule" && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/60 px-6 py-4.5 sm:px-8 dark:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-emerald-500" />
                    <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                      {language === "ar"
                        ? "ختمة العائلة المباركة — الأسبوع الأول"
                        : "Family Quran Reading — Week 1"}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                  >
                    {language === "ar"
                      ? "٣٠ جزءًا • ختمة أسبوعية"
                      : "30 Juz • 1 Complete Quran"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3.5 p-4 sm:grid-cols-3 sm:p-6">
                  {/* Card 1 */}
                  <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm transition-all hover:border-primary/30">
                    <div className="mb-2.5 flex items-start justify-between gap-2 border-b border-border/40 pb-2">
                      <span className="text-sm font-extrabold text-foreground">
                        {language === "ar" ? "طارق" : "Tariq"}
                      </span>
                      <span className="shrink-0 rounded-md border border-border/50 bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {language === "ar" ? "٥ أجزاء" : "5 Juz"}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>{language === "ar" ? "البداية:" : "Start:"}</span>
                        <span className="font-semibold text-foreground">الفاتحة ١</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === "ar" ? "النهاية:" : "End:"}</span>
                        <span className="font-semibold text-foreground">النساء ١٤٧</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm transition-all hover:border-primary/30">
                    <div className="mb-2.5 flex items-start justify-between gap-2 border-b border-border/40 pb-2">
                      <span className="text-sm font-extrabold text-foreground">
                        {language === "ar" ? "سارة" : "Sarah"}
                      </span>
                      <span className="shrink-0 rounded-md border border-border/50 bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {language === "ar" ? "١٠ أجزاء" : "10 Juz"}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>{language === "ar" ? "البداية:" : "Start:"}</span>
                        <span className="font-semibold text-foreground">النساء ١٤٨</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === "ar" ? "النهاية:" : "End:"}</span>
                        <span className="font-semibold text-foreground">الحجر ٩٩</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm transition-all hover:border-primary/30">
                    <div className="mb-2.5 flex items-start justify-between gap-2 border-b border-border/40 pb-2">
                      <span className="text-sm font-extrabold text-foreground">
                        {language === "ar" ? "عبد الله" : "Abdullah"}
                      </span>
                      <span className="shrink-0 rounded-md border border-border/50 bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {language === "ar" ? "١٥ جزءًا" : "15 Juz"}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>{language === "ar" ? "البداية:" : "Start:"}</span>
                        <span className="font-semibold text-foreground">الإسراء ١</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === "ar" ? "النهاية:" : "End:"}</span>
                        <span className="font-semibold text-foreground">الناس ٦</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Today's Reading Card Sample */}
            {activeTab === "today" && (
              <div className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                        {language === "ar" ? "ورد اليوم" : "Today's Reading"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {language === "ar" ? "الأسبوع الأول • اليوم ٣" : "Week 1 • Day 3"}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-foreground">
                      {language === "ar" ? "سورة آل عمران (الآيات ٩٣ — ٢٠٠)" : "Surah Ali 'Imran (Ayahs 93 — 200)"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {language === "ar" ? "الجزء الرابع • صفحة ٦٩ إلى ٧٦" : "Juz 4 • Pages 69 to 76"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" className="gap-1.5 rounded-xl text-xs font-bold">
                      <IconBook className="h-4 w-4" />
                      <span>{language === "ar" ? "اقرأ في المصحف" : "Read in Quran"}</span>
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 rounded-xl border-emerald-500/40 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <IconCheck className="h-4 w-4" />
                      <span>{language === "ar" ? "تمت القراءة" : "Mark Done"}</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Quran Reader Snippet */}
            {activeTab === "reader" && (
              <div className="p-6 text-center">
                <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-3 text-xs text-muted-foreground">
                  <span className="font-bold text-primary">سورة الفاتحة — آية ١ إلى ٧</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold">مصحف المدينة</span>
                </div>
                <div className="my-4 font-serif text-xl leading-loose tracking-wide text-foreground sm:text-2xl" dir="rtl">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ﴿١﴾ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ ﴿٢﴾ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ﴿٣﴾ مَـٰلِكِ يَوْمِ ٱلدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ ﴿٦﴾ صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ ﴿٧﴾
                </div>
                <div className="flex items-center justify-center gap-2 pt-2 text-xs font-semibold text-muted-foreground">
                  <IconBookmark className="h-4 w-4 text-amber-500" />
                  <span>{language === "ar" ? "محفوظ في إشاراتك المرجعية" : "Saved in your Bookmarks"}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
