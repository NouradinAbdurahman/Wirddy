"use client"

import React from "react"
import {
  IconBell,
  IconBook,
  IconBookmark,
  IconChartBar,
  IconCheck,
  IconCompass,
  IconLayoutDashboard,
  IconSpeakerphone,
  IconUsers,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function DashboardPreview() {
  const { language, t, formatNumber } = useI18n()

  const features = [
    {
      icon: IconCompass,
      title: t.dashFeatTodayTitle,
      desc: t.dashFeatTodayDesc,
    },
    {
      icon: IconBook,
      title: t.dashFeatContinueTitle,
      desc: t.dashFeatContinueDesc,
    },
    {
      icon: IconBookmark,
      title: t.dashFeatBookmarksTitle,
      desc: t.dashFeatBookmarksDesc,
    },
    {
      icon: IconChartBar,
      title: t.dashFeatProgressTitle,
      desc: t.dashFeatProgressDesc,
    },
    {
      icon: IconSpeakerphone,
      title: t.dashFeatAnnounceTitle,
      desc: t.dashFeatAnnounceDesc,
    },
  ]

  return (
    <section id="features" className="py-12 md:py-16">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/10 text-primary">
            {language === "ar" ? "لوحة التحكم الشخصية" : "Personal Dashboard"}
          </Badge>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t.dashboardShowcaseTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.dashboardShowcaseSubtitle}
          </p>
        </div>

        {/* Interactive Dashboard Mockup & Features */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left Column: Realistic Dashboard UI Visual */}
          <div className="lg:col-span-7">
            <Card className="overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-5 shadow-xl sm:p-6">
              {/* Mock Dashboard Top Greeting Bar */}
              <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
                    👋
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-foreground">
                      {language === "ar" ? "مرحباً بك، عبد الرحمن" : "Welcome, Abdurahman"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {language === "ar" ? "لديك ٣ ورد نشط هذا الأسبوع" : "You have 3 active assignments this week"}
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {language === "ar" ? "مكتمل ٧٠٪" : "70% Completed"}
                </Badge>
              </div>

              {/* Today's Reading Highlight Card */}
              <div className="mb-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <IconCompass className="h-4 w-4" />
                    <span>{language === "ar" ? "وردك لليوم" : "Today's Reading"}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {language === "ar" ? "الأسبوع الثاني" : "Week 2"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-foreground">
                      {language === "ar" ? "سورة البقرة (الآيات ٢٥٣ — ٢٨٦)" : "Surah Al-Baqarah (Ayahs 253 — 286)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "ar" ? "الجزء الثالث • صفحة ٤٢ إلى ٤٩" : "Juz 3 • Pages 42 to 49"}
                    </p>
                  </div>
                  <Button size="sm" className="h-8 gap-1 rounded-lg text-xs font-bold shadow-sm">
                    <IconBook className="h-3.5 w-3.5" />
                    <span>{language === "ar" ? "اقرأ الآن" : "Read Now"}</span>
                  </Button>
                </div>
              </div>

              {/* Active Groups & Bookmarks Mini-List */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Group Item */}
                <div className="rounded-xl border border-border/50 bg-muted/40 p-3">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-foreground">
                      {language === "ar" ? "ختمة الفجر الأسبوعية" : "Fajr Weekly Khatmah"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">٦ أعضاء</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-3/4 rounded-full bg-primary" />
                  </div>
                </div>

                {/* Bookmark Item */}
                <div className="rounded-xl border border-border/50 bg-muted/40 p-3">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-1">
                      <IconBookmark className="h-3 w-3 text-amber-500" />
                      <span className="text-xs font-bold text-foreground">
                        {language === "ar" ? "آية الكرسي (البقرة ٢٥٥)" : "Ayat Al-Kursi (2:255)"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {language === "ar" ? "آخر إشارة محفوظة" : "Latest saved bookmark"}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: 5 Key Benefits */}
          <div className="space-y-4 lg:col-span-5">
            {features.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-2xl border border-transparent p-3 transition-colors hover:border-border/50 hover:bg-muted/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
