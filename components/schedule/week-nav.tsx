"use client"

import React, { useRef, useEffect } from "react"
import { motion } from "motion/react"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"

interface WeekNavProps {
  weeksCount: number
  activeWeek: number
  onSelectWeek: (week: number) => void
  align?: "start" | "center"
}

export function WeekNav({
  weeksCount,
  activeWeek,
  onSelectWeek,
  align = "start",
}: WeekNavProps) {
  const { dir, t, formatNumber } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const activeBtnRef = useRef<HTMLButtonElement>(null)

  const PrevIcon = dir === "rtl" ? IconChevronRight : IconChevronLeft
  const NextIcon = dir === "rtl" ? IconChevronLeft : IconChevronRight

  useEffect(() => {
    if (activeBtnRef.current && containerRef.current && weeksCount > 6) {
      activeBtnRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [activeWeek, weeksCount])

  const handlePrev = () => {
    if (activeWeek > 1) {
      onSelectWeek(activeWeek - 1)
    }
  }

  const handleNext = () => {
    if (activeWeek < weeksCount) {
      onSelectWeek(activeWeek + 1)
    }
  }

  const justifyClass = align === "center" ? "justify-center" : "justify-start"

  return (
    <div className="w-full min-w-0 py-1">
      {weeksCount <= 6 ? (
        /* Compact layout for 1-6 weeks */
        <div className={`flex w-full min-w-0 items-center ${justifyClass}`}>
          <div className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-border/50 bg-muted/50 p-1">
            {Array.from({ length: weeksCount }, (_, i) => i + 1).map(
              (weekNum) => {
                const isActive = activeWeek === weekNum
                return (
                  <button
                    key={weekNum}
                    type="button"
                    onClick={() => onSelectWeek(weekNum)}
                    className={`relative shrink-0 cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                      isActive
                        ? "font-bold text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeWeekPill"
                        className="absolute inset-0 rounded-xl bg-primary shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 35,
                        }}
                      />
                    )}
                    <span className="relative z-10">
                      {t.weekLabel} {formatNumber(weekNum)}
                    </span>
                  </button>
                )
              }
            )}
          </div>
        </div>
      ) : (
        /* Scalable scrollable layout with Prev/Next controls for large week counts */
        <div className="flex w-full min-w-0 items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={activeWeek === 1}
            className="h-8 w-8 shrink-0 rounded-xl border-border/60 hover:bg-muted"
            aria-label="Previous week"
          >
            <PrevIcon className="h-4 w-4" />
          </Button>

          <div
            ref={containerRef}
            className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scroll-smooth rounded-2xl border border-border/50 bg-muted/50 p-1"
          >
            {Array.from({ length: weeksCount }, (_, i) => i + 1).map(
              (weekNum) => {
                const isActive = activeWeek === weekNum
                return (
                  <button
                    key={weekNum}
                    ref={isActive ? activeBtnRef : null}
                    type="button"
                    onClick={() => onSelectWeek(weekNum)}
                    className={`relative shrink-0 cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "font-bold text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeWeekPill"
                        className="absolute inset-0 rounded-xl bg-primary shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 35,
                        }}
                      />
                    )}
                    <span className="relative z-10">
                      {t.weekLabel} {formatNumber(weekNum)}
                    </span>
                  </button>
                )
              }
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={activeWeek === weeksCount}
            className="h-8 w-8 shrink-0 rounded-xl border-border/60 hover:bg-muted"
            aria-label="Next week"
          >
            <NextIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
