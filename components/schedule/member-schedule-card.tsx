"use client"

import React from "react"
import { motion } from "motion/react"
import {
  IconArrowLeft,
  IconArrowRight,
  IconBook,
  IconCircleCheck,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { MemberAssignment } from "@/lib/scheduler/types"
import { Card, CardContent } from "@/components/ui/card"

interface MemberScheduleCardProps {
  assignment: MemberAssignment
  index: number
  onCardClick?: () => void
}

export function MemberScheduleCard({
  assignment,
  index,
  onCardClick,
}: MemberScheduleCardProps) {
  const { language, dir, t, formatNumber } = useI18n()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: Math.min(0.2, index * 0.03),
        ease: "easeOut",
      }}
      className="w-full"
    >
      <Card
        onClick={onCardClick}
        className={`overflow-hidden rounded-2xl border border-border/60 bg-card/90 text-start shadow-sm backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-md dark:bg-card/70 ${
          onCardClick ? "cursor-pointer" : ""
        }`}
      >
        <CardContent className="space-y-3.5 p-4 sm:p-5">
          {/* Card Top: Strong Member Name & Subdued Amount */}
          <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted/40 p-1 dark:bg-muted/20">
                <img
                  src="/logo-black.png"
                  alt="Wirddy"
                  className="block h-full w-full object-contain dark:hidden"
                  suppressHydrationWarning
                />
                <img
                  src="/logo-white.png"
                  alt="Wirddy"
                  className="hidden h-full w-full object-contain dark:block"
                  suppressHydrationWarning
                />
              </div>
              <h4 className="text-base font-extrabold tracking-tight break-words text-foreground sm:text-lg">
                {assignment.memberName}
              </h4>
            </div>

            <div className="inline-flex shrink-0 items-center rounded-md border border-border/50 bg-muted/60 px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground dark:bg-muted/40">
              {formatNumber(assignment.weeklyAmount)} {t.juzUnit}
            </div>
          </div>

          {/* Symmetrical Paired Start & End Quran References */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* START SECTION */}
            <div className="flex flex-col space-y-0.5">
              <span className="text-[10px] font-extrabold tracking-wider text-primary uppercase">
                {t.startLabel}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {t.juzLabel} {formatNumber(assignment.startJuz)}
              </span>
              <span className="pt-0.5 text-sm font-extrabold break-words text-foreground">
                {language === "ar"
                  ? `سورة ${assignment.startAyah.surahNameAr}`
                  : `${assignment.startAyah.surahNameEn}`}
              </span>
              <span className="text-xs text-muted-foreground">
                {t.ayahLabel} {formatNumber(assignment.startAyah.ayahNumber)}
              </span>
            </div>

            {/* END SECTION */}
            <div className="flex flex-col space-y-0.5">
              <span className="text-[10px] font-extrabold tracking-wider text-primary uppercase">
                {t.endLabel}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {t.juzLabel} {formatNumber(assignment.endJuz)}
              </span>
              <span className="pt-0.5 text-sm font-extrabold break-words text-foreground">
                {language === "ar"
                  ? `سورة ${assignment.endAyah.surahNameAr}`
                  : `${assignment.endAyah.surahNameEn}`}
              </span>
              <span className="text-xs text-muted-foreground">
                {t.ayahLabel} {formatNumber(assignment.endAyah.ayahNumber)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
