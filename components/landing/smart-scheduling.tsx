"use client"

import React from "react"
import {
  IconAdjustments,
  IconBrain,
  IconCalendarEvent,
  IconClock,
  IconHistory,
  IconMoonStars,
  IconRefresh,
  IconSparkles,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SmartScheduling() {
  const { language, t } = useI18n()

  const cards = [
    {
      icon: IconRefresh,
      title: t.smartFeatRotationTitle,
      desc: t.smartFeatRotationDesc,
    },
    {
      icon: IconBrain,
      title: t.smartFeatKnowledgeTitle,
      desc: t.smartFeatKnowledgeDesc,
    },
    {
      icon: IconAdjustments,
      title: t.smartFeatAmountsTitle,
      desc: t.smartFeatAmountsDesc,
    },
    {
      icon: IconSparkles,
      title: t.smartFeatCustomTitle,
      desc: t.smartFeatCustomDesc,
    },
    {
      icon: IconMoonStars,
      title: t.smartFeatRamadanTitle,
      desc: t.smartFeatRamadanDesc,
    },
    {
      icon: IconClock,
      title: t.smartFeatDailyTitle,
      desc: t.smartFeatDailyDesc,
    },
    {
      icon: IconCalendarEvent,
      title: t.smartFeatRecurringTitle,
      desc: t.smartFeatRecurringDesc,
    },
    {
      icon: IconHistory,
      title: t.smartFeatHistoryTitle,
      desc: t.smartFeatHistoryDesc,
    },
  ]

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t.smartScheduleTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.smartScheduleSubtitle}
          </p>
        </div>

        {/* 8 Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, idx) => {
            const Icon = c.icon
            return (
              <Card
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-extrabold text-foreground">
                    {c.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
