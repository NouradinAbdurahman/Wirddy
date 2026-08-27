"use client"

import React from "react"
import {
  IconBook,
  IconCalendarEvent,
  IconChecklist,
  IconUsers,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Card } from "@/components/ui/card"

export function HowItWorks() {
  const { language, t, formatNumber } = useI18n()

  const steps = [
    {
      number: 1,
      icon: IconUsers,
      title: t.step1Title,
      desc: t.step1Desc,
    },
    {
      number: 2,
      icon: IconCalendarEvent,
      title: t.step2Title,
      desc: t.step2Desc,
    },
    {
      number: 3,
      icon: IconBook,
      title: t.step3Title,
      desc: t.step3Desc,
    },
    {
      number: 4,
      icon: IconChecklist,
      title: t.step4Title,
      desc: t.step4Desc,
    },
  ]

  return (
    <section id="how-it-works" className="py-12 md:py-16">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t.howItWorksTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.howItWorksSubtitle}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <Card
                key={step.number}
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                {/* Step Number Badge */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-muted-foreground/30">
                    {formatNumber(step.number)}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {step.desc}
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
