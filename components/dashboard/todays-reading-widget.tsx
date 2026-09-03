"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  IconBook,
  IconCheck,
  IconClock,
  IconSparkles,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QuranReader } from "@/components/reader/quran-reader"
import { saveReadingProgressAction } from "@/lib/groups/actions"

export interface TodaysReadingData {
  groupPublicId: string
  groupName: string
  memberPublicId: string
  memberName: string
  weekNumber: number
  dayNumber: number
  surahNumber: number
  surahNameAr: string
  surahNameEn: string
  startAyah: number
  endAyah: number
  endSurahNumber?: number
  endSurahNameAr?: string
  endSurahNameEn?: string
  juzNumber: number
  isCompleted?: boolean
  dateFormatted?: string
}

interface TodaysReadingWidgetProps {
  reading: TodaysReadingData | null
  onProgressUpdated?: () => void
}

export function TodaysReadingWidget({
  reading,
  onProgressUpdated,
}: TodaysReadingWidgetProps) {
  const { language, t } = useI18n()
  const [isCompleted, setIsCompleted] = useState(!!reading?.isCompleted)
  const [isReaderOpen, setIsReaderOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!reading) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/60 p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconBook className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-extrabold text-foreground">
          {t.dashboardTodaysReading}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t.dashboardNoTodaysReading}
        </p>
      </div>
    )
  }

  const handleToggleComplete = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    const nextState = !isCompleted
    setIsCompleted(nextState)

    try {
      await saveReadingProgressAction(
        reading.groupPublicId,
        reading.memberPublicId,
        reading.weekNumber,
        reading.dayNumber,
        nextState
      )
      if (onProgressUpdated) onProgressUpdated()
    } catch (err) {
      console.error("Failed to update reading progress:", err)
      setIsCompleted(!nextState)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-[11px] font-bold text-primary"
            >
              <IconSparkles className="me-1 h-3.5 w-3.5" />
              {t.dashboardTodaysReading}
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground">
              {reading.groupName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <IconClock className="h-3.5 w-3.5" />
            <span>
              {language === "ar"
                ? `الأسبوع ${reading.weekNumber} • اليوم ${reading.dayNumber}`
                : `Week ${reading.weekNumber} • Day ${reading.dayNumber}`}
            </span>
          </div>
        </div>

        {/* Quran Location Card */}
        <div className="mt-4 flex flex-col justify-between gap-4 rounded-xl border border-border/80 bg-background/80 p-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-quran text-lg font-bold text-foreground sm:text-xl">
                {language === "ar"
                  ? `سورة ${reading.surahNameAr}`
                  : `Surah ${reading.surahNameEn}`}
              </h4>
              <Badge variant="secondary" className="text-[10px] font-bold">
                {language === "ar"
                  ? `الجزء ${reading.juzNumber}`
                  : `Juz ${reading.juzNumber}`}
              </Badge>
            </div>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {language === "ar"
                ? `الآيات ${reading.startAyah} إلى ${reading.endAyah}`
                : `Ayahs ${reading.startAyah} to ${reading.endAyah}`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <Button
              size="sm"
              onClick={() => setIsReaderOpen(true)}
              className="h-9 flex-1 sm:flex-initial gap-1.5 rounded-xl bg-primary px-4 text-xs font-extrabold text-primary-foreground hover:bg-primary/90"
            >
              <IconBook className="h-4 w-4" />
              <span>{t.dashboardReadNow}</span>
            </Button>

            <Button
              variant={isCompleted ? "default" : "outline"}
              size="sm"
              onClick={handleToggleComplete}
              disabled={isSubmitting}
              className={`h-9 flex-1 sm:flex-initial gap-1.5 rounded-xl text-xs font-bold transition-all ${
                isCompleted
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600"
                  : "border-border/80 hover:bg-muted"
              }`}
            >
              <IconCheck className="h-4 w-4" />
              <span>
                {isCompleted ? t.dashboardCompleted : t.dashboardMarkComplete}
              </span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Embedded Quran Reader Modal */}
      {isReaderOpen && (
        <QuranReader
          isModal={true}
          isOpen={isReaderOpen}
          onClose={() => setIsReaderOpen(false)}
          initialSurahNumber={reading.surahNumber}
          initialAyahNumber={reading.startAyah}
          endSurahNumber={reading.endSurahNumber || reading.surahNumber}
          endAyahNumber={reading.endAyah}
          assignmentTitle={`${reading.groupName} - ${language === "ar" ? `الأسبوع ${reading.weekNumber}` : `Week ${reading.weekNumber}`}`}
          onCompleteAssignment={() => {
            setIsCompleted(true)
            saveReadingProgressAction(
              reading.groupPublicId,
              reading.memberPublicId,
              reading.weekNumber,
              reading.dayNumber,
              true
            )
          }}
        />
      )}
    </>
  )
}
