"use client"

import React from "react"
import { motion, AnimatePresence } from "motion/react"
import { useI18n } from "@/lib/i18n/context"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface TotalIndicatorProps {
  currentTotal: number
}

export function TotalIndicator({ currentTotal }: TotalIndicatorProps) {
  const { language, t, formatNumber } = useI18n()
  const isExact = currentTotal === 30
  const isLess = currentTotal < 30
  const isMore = currentTotal > 30

  const percentage = Math.min(100, Math.round((currentTotal / 30) * 100))

  return (
    <div className="w-full">
      <Card
        className={`rounded-2xl border p-4 shadow-sm transition-all duration-300 sm:p-5 ${
          isExact
            ? "border-emerald-500/30 bg-emerald-500/10 shadow-emerald-500/5 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:shadow-emerald-900/10"
            : isMore
              ? "border-rose-500/30 bg-rose-500/10 shadow-rose-500/5 dark:border-rose-500/40 dark:bg-rose-950/40 dark:shadow-rose-900/10"
              : "border-teal-500/25 bg-teal-500/10 shadow-teal-500/5 dark:border-teal-500/30 dark:bg-teal-950/30 dark:shadow-teal-900/10"
        }`}
      >
        <div className="flex flex-col justify-between gap-3 text-start sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-colors ${
                isExact
                  ? "bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/30 dark:text-emerald-400"
                  : isMore
                    ? "bg-rose-500/20 text-rose-600 dark:bg-rose-500/30 dark:text-rose-400"
                    : "bg-teal-500/20 text-teal-600 dark:bg-teal-500/30 dark:text-teal-400"
              }`}
            >
              <img
                src="/logo-black.png"
                alt="Wirddy"
                className="block h-7 w-7 object-contain dark:hidden"
                suppressHydrationWarning
              />
              <img
                src="/logo-white.png"
                alt="Wirddy"
                className="hidden h-7 w-7 object-contain dark:block"
                suppressHydrationWarning
              />
            </div>

            <div>
              <div
                className={`text-[11px] font-bold tracking-wider uppercase ${
                  isExact
                    ? "text-emerald-800/80 dark:text-emerald-300/80"
                    : isMore
                      ? "text-rose-800/80 dark:text-rose-300/80"
                      : "text-teal-800/80 dark:text-teal-300/80"
                }`}
              >
                {t.totalLabel}
              </div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span
                  className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${
                    isExact
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isMore
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-teal-700 dark:text-teal-300"
                  }`}
                >
                  {formatNumber(currentTotal)}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  / {formatNumber(30)} {t.juzUnit}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Status Feedback */}
          <div className="sm:text-end">
            <AnimatePresence mode="wait">
              {isExact && (
                <motion.div
                  key="exact"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-bold text-emerald-700 sm:text-sm dark:text-emerald-300"
                >
                  {t.totalSuccess}
                </motion.div>
              )}

              {isLess && (
                <motion.div
                  key="less"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-teal-800/90 sm:text-sm dark:text-teal-200/90"
                >
                  {language === "ar"
                    ? `مجموع القراءة هو ${formatNumber(currentTotal)} جزءًا. يتبقى ${formatNumber(30 - currentTotal)} جزءًا ليكتمل الورد.`
                    : `Current total is ${currentTotal} Juz. Add ${30 - currentTotal} more Juz to reach 30.`}
                </motion.div>
              )}

              {isMore && (
                <motion.div
                  key="more"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-rose-700 sm:text-sm dark:text-rose-300"
                >
                  {language === "ar"
                    ? `مجموع القراءة هو ${formatNumber(currentTotal)} جزءًا. يتجاوز الـ ٣٠ بمقدار ${formatNumber(currentTotal - 30)} جزءًا.`
                    : `Current total is ${currentTotal} Juz. Exceeds 30 by ${currentTotal - 30} Juz.`}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <Progress
            value={percentage}
            className={`h-2.5 rounded-full ${
              isExact
                ? "bg-emerald-500/20 dark:bg-emerald-950/60 [&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-400"
                : isMore
                  ? "bg-rose-500/20 dark:bg-rose-950/60 [&>div]:bg-rose-500 dark:[&>div]:bg-rose-400"
                  : "bg-teal-500/20 dark:bg-teal-950/60 [&>div]:bg-teal-500 dark:[&>div]:bg-teal-400"
            }`}
          />
        </div>
      </Card>
    </div>
  )
}
