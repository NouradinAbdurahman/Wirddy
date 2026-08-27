"use client"

import React from "react"
import {
  IconBellRinging,
  IconChecklist,
  IconClock,
  IconDeviceMobileMessage,
  IconRefreshDot,
  IconWifiOff,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StayOnTrack() {
  const { language, t } = useI18n()

  const items = [
    {
      icon: IconChecklist,
      title: t.trackFeatProgressTitle,
      desc: t.trackFeatProgressDesc,
    },
    {
      icon: IconClock,
      title: t.trackFeatDailyTitle,
      desc: t.trackFeatDailyDesc,
    },
    {
      icon: IconBellRinging,
      title: t.trackFeatIncompleteTitle,
      desc: t.trackFeatIncompleteDesc,
    },
    {
      icon: IconDeviceMobileMessage,
      title: t.trackFeatPushTitle,
      desc: t.trackFeatPushDesc,
    },
    {
      icon: IconRefreshDot,
      title: t.trackFeatRealtimeTitle,
      desc: t.trackFeatRealtimeDesc,
    },
    {
      icon: IconWifiOff,
      title: t.trackFeatOfflineTitle,
      desc: t.trackFeatOfflineDesc,
    },
  ]

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t.stayOnTrackTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.stayOnTrackSubtitle}
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const Icon = item.icon
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
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.desc}
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
