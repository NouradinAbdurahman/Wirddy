"use client"

import React from "react"
import { motion } from "motion/react"
import {
  IconArrowAutofitHeight,
  IconBrain,
  IconDeviceMobile,
  IconFileSpreadsheet,
  IconLanguage,
  IconMapPin,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent } from "@/components/ui/card"

export function Features() {
  const { t } = useI18n()

  const features = [
    { icon: IconBrain, title: t.feature1Title, desc: t.feature1Desc },
    {
      icon: IconArrowAutofitHeight,
      title: t.feature2Title,
      desc: t.feature2Desc,
    },
    { icon: IconMapPin, title: t.feature3Title, desc: t.feature3Desc },
    { icon: IconFileSpreadsheet, title: t.feature4Title, desc: t.feature4Desc },
    { icon: IconDeviceMobile, title: t.feature5Title, desc: t.feature5Desc },
    { icon: IconLanguage, title: t.feature6Title, desc: t.feature6Desc },
  ]

  return (
    <section className="py-14 md:py-18">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2
            suppressHydrationWarning
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {t.featuresTitle}
          </h2>
          <p
            suppressHydrationWarning
            className="mt-3 text-sm text-muted-foreground sm:text-base"
          >
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
              >
                <Card className="h-full rounded-2xl border border-border/40 bg-card/60 p-5 text-start transition-all hover:border-primary/30">
                  <CardContent className="space-y-3 p-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" stroke={1.75} />
                    </div>
                    <h3
                      suppressHydrationWarning
                      className="text-base font-bold text-foreground"
                    >
                      {feature.title}
                    </h3>
                    <p
                      suppressHydrationWarning
                      className="text-xs leading-relaxed text-muted-foreground sm:text-sm"
                    >
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
