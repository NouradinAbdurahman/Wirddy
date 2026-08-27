"use client"

import React from "react"
import {
  IconBellRinging,
  IconBook,
  IconCalendarEvent,
  IconLanguage,
  IconShare,
  IconUser,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function WhyWirddy() {
  const { language, t } = useI18n()

  const reasons = [
    {
      icon: IconCalendarEvent,
      title: t.why1Title,
      desc: t.why1Desc,
    },
    {
      icon: IconUser,
      title: t.why2Title,
      desc: t.why2Desc,
    },
    {
      icon: IconBook,
      title: t.why3Title,
      desc: t.why3Desc,
    },
    {
      icon: IconBellRinging,
      title: t.why4Title,
      desc: t.why4Desc,
    },
    {
      icon: IconShare,
      title: t.why5Title,
      desc: t.why5Desc,
    },
    {
      icon: IconLanguage,
      title: t.why6Title,
      desc: t.why6Desc,
    },
  ]

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t.whyChooseTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.whyChooseSubtitle}
          </p>
        </div>

        {/* 6 Concise Reason Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, idx) => {
            const Icon = r.icon
            return (
              <Card
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-foreground">
                    {r.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {r.desc}
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
