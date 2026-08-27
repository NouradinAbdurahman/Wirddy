"use client"

import React from "react"
import {
  IconAdjustmentsHorizontal,
  IconBook,
  IconBookmark,
  IconMapPin,
  IconPlayerPlay,
  IconSearch,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function QuranReaderPreview() {
  const { language, t } = useI18n()

  const features = [
    {
      icon: IconBook,
      title: t.readerFeatTextTitle,
      desc: t.readerFeatTextDesc,
    },
    {
      icon: IconSearch,
      title: t.readerFeatSearchTitle,
      desc: t.readerFeatSearchDesc,
    },
    {
      icon: IconMapPin,
      title: t.readerFeatBoundsTitle,
      desc: t.readerFeatBoundsDesc,
    },
    {
      icon: IconBookmark,
      title: t.readerFeatBookmarksTitle,
      desc: t.readerFeatBookmarksDesc,
    },
    {
      icon: IconPlayerPlay,
      title: t.readerFeatResumeTitle,
      desc: t.readerFeatResumeDesc,
    },
  ]

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {language === "ar" ? "المصحف الإلكتروني والقارئ المدمج" : "Integrated Quran Reader"}
          </Badge>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t.readerShowcaseTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.readerShowcaseSubtitle}
          </p>
        </div>

        {/* Reader Visual & Feature Highlights */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left Feature Points */}
          <div className="space-y-4 lg:col-span-5">
            {features.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-2xl border border-transparent p-3 transition-colors hover:border-border/50 hover:bg-muted/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
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

          {/* Right Column: Authentic Quran Reader Visual Mockup */}
          <div className="lg:col-span-7">
            <Card className="overflow-hidden rounded-3xl border border-border/70 bg-card/95 p-6 shadow-2xl">
              {/* Header Navigation in Reader */}
              <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-foreground">سورة الكهف</span>
                  <Badge variant="outline" className="text-[10px]">الجزء ١٥</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-semibold">
                    <IconSearch className="h-3 w-3" />
                    <span>بحث في المصحف</span>
                  </span>
                  <IconAdjustmentsHorizontal className="h-4 w-4" />
                </div>
              </div>

              {/* Exact Reading Boundary Pill */}
              <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <IconMapPin className="h-3.5 w-3.5" />
                <span>بداية وردك المحدد: الكهف آية ١ إلى ٣١</span>
              </div>

              {/* Quran Authentic Uthmani Verses */}
              <div
                dir="rtl"
                className="my-6 space-y-4 rounded-2xl bg-amber-500/5 p-5 text-center font-serif text-lg leading-[2.3] text-foreground sm:text-xl dark:bg-muted/20"
              >
                <p className="text-primary">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                <p>
                  ٱلْحَمْدُ لِلَّهِ ٱلَّذِىٓ أَنزَلَ عَلَىٰ عَبْدِهِ ٱلْكِتَـٰبَ وَلَمْ يَجْعَل لَّهُۥ عِوَجَا ۜ ﴿١﴾ قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا مِّن لَّدُنْهُ وَيُبَشِّرَ ٱلْمُؤْمِنِينَ ٱلَّذِينَ يَعْمَلُونَ ٱلصَّـٰلِحَـٰتِ أَنَّ لَهُمْ أَجْرًا حَسَنًا ﴿٢﴾ مَّـٰكِثِينَ فِيهِ أَبَدًا ﴿٣﴾
                </p>
              </div>

              {/* Bottom Quick Controls in Mockup */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold">صفحة ٢٩٣</span>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <IconBookmark className="h-3.5 w-3.5 fill-current" />
                  <span className="text-[11px] font-bold">تم وضع إشارة مرجعية</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
