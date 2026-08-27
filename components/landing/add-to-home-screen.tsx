"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  IconBellRinging,
  IconBrandAndroid,
  IconBrandApple,
  IconBrandChrome,
  IconCheck,
  IconCompass,
  IconDeviceMobile,
  IconDotsVertical,
  IconShare,
  IconSquarePlus,
  IconWifiOff,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Platform = "iphone" | "android"

export function AddToHomeScreen() {
  const { language, t } = useI18n()
  const [platform, setPlatform] = useState<Platform>("iphone")

  const benefits = [
    {
      icon: IconDeviceMobile,
      title: t.pwaFeatHomeTitle,
      desc: t.pwaFeatHomeDesc,
    },
    {
      icon: IconWifiOff,
      title: t.pwaFeatOfflineTitle,
      desc: t.pwaFeatOfflineDesc,
    },
    {
      icon: IconBellRinging,
      title: t.pwaFeatPushTitle,
      desc: t.pwaFeatPushDesc,
    },
  ]

  const iphoneSteps = [
    {
      step: language === "ar" ? "١" : "1",
      icon: IconCompass,
      text: t.pwaIphoneStep1,
    },
    {
      step: language === "ar" ? "٢" : "2",
      icon: IconShare,
      text: t.pwaIphoneStep2,
    },
    {
      step: language === "ar" ? "٣" : "3",
      icon: IconSquarePlus,
      text: t.pwaIphoneStep3,
    },
    {
      step: language === "ar" ? "٤" : "4",
      icon: IconCheck,
      text: t.pwaIphoneStep4,
    },
  ]

  const androidSteps = [
    {
      step: language === "ar" ? "١" : "1",
      icon: IconBrandChrome,
      text: t.pwaAndroidStep1,
    },
    {
      step: language === "ar" ? "٢" : "2",
      icon: IconDotsVertical,
      text: t.pwaAndroidStep2,
    },
    {
      step: language === "ar" ? "٣" : "3",
      icon: IconSquarePlus,
      text: t.pwaAndroidStep3,
    },
    {
      step: language === "ar" ? "٤" : "4",
      icon: IconCheck,
      text: t.pwaAndroidStep4,
    },
  ]

  const currentSteps = platform === "iphone" ? iphoneSteps : androidSteps
  const currentTitle =
    platform === "iphone" ? t.pwaIphoneTitle : t.pwaAndroidTitle
  const currentNote = platform === "iphone" ? t.pwaIphoneNote : t.pwaAndroidNote

  return (
    <section id="install" className="overflow-hidden py-14 md:py-20">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t.pwaSectionTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.pwaSectionDesc}
          </p>
        </div>

        {/* 3 Key Benefits Top Cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {benefits.map((b, idx) => {
            const Icon = b.icon
            return (
              <Card
                key={idx}
                className="flex items-start gap-3.5 rounded-2xl border border-border/60 bg-card/80 p-4.5 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">
                    {b.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {b.desc}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Main Platform Grid */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Platform Switcher & Step Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="space-y-6 lg:col-span-7"
          >
            {/* Platform Selector Buttons */}
            <div className="mx-auto flex max-w-xs items-center gap-2 rounded-2xl border border-border/50 bg-muted/60 p-1.5 lg:mx-0 dark:bg-muted/30">
              <button
                type="button"
                onClick={() => setPlatform("iphone")}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  platform === "iphone"
                    ? "border border-border/60 bg-card font-semibold text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={platform === "iphone"}
              >
                <IconBrandApple className="h-4 w-4" />
                <span>{t.pwaIphoneTab}</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform("android")}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  platform === "android"
                    ? "border border-border/60 bg-card font-semibold text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={platform === "android"}
              >
                <IconBrandAndroid className="h-4 w-4" />
                <span>{t.pwaAndroidTab}</span>
              </button>
            </div>

            {/* Platform Instruction Card */}
            <Card className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-sm sm:p-7">
              <CardContent className="space-y-6 p-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {platform === "iphone" ? (
                      <IconBrandApple className="h-5 w-5" />
                    ) : (
                      <IconBrandAndroid className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {currentTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {platform === "iphone" ? "Safari" : "Chrome"}
                    </p>
                  </div>
                </div>

                {/* Steps List */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={platform}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3.5"
                  >
                    {currentSteps.map((stepItem, idx) => {
                      const Icon = stepItem.icon
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-3.5 rounded-2xl border border-border/30 bg-muted/40 p-3 transition-colors hover:border-primary/20 dark:bg-muted/15"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background text-xs font-bold text-primary shadow-2xs">
                            {stepItem.step}
                          </div>
                          <div className="flex flex-1 items-center justify-between gap-2 pt-0.5">
                            <span className="text-sm leading-relaxed text-foreground">
                              {stepItem.text}
                            </span>
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                          </div>
                        </div>
                      )
                    })}
                  </motion.div>
                </AnimatePresence>

                {/* Summary / Confirmation Note */}
                <div className="flex items-center gap-2.5 border-t border-border/40 pt-3 text-xs text-muted-foreground sm:text-sm">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span>{currentNote}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Visual GIF Demonstration Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex justify-center lg:col-span-5"
          >
            <div className="relative w-full max-w-[310px] sm:max-w-[340px]">
              <div className="absolute -inset-2 -z-10 rounded-[56px] bg-gradient-to-b from-primary/20 via-primary/10 to-transparent blur-2xl" />
              <div className="relative rounded-[48px] border-[5px] border-neutral-300 bg-neutral-900 p-2 shadow-2xl ring-1 ring-black/10 sm:rounded-[52px] sm:border-[6px] dark:border-neutral-700/80 dark:ring-white/10">
                <div className="relative overflow-hidden rounded-[38px] bg-black sm:rounded-[42px]">
                  <img
                    src="/add-to-home-screen.gif"
                    alt={t.pwaGifAlt}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
