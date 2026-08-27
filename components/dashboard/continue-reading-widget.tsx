"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  IconArrowRight,
  IconArrowLeft,
  IconBookmark,
  IconCompass,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QuranReader } from "@/components/reader/quran-reader"

export interface ContinueReadingData {
  surahNumber: number
  surahNameAr: string
  surahNameEn: string
  ayahNumber: number
  juzNumber: number
  note?: string | null
  updatedAt?: string
}

interface ContinueReadingWidgetProps {
  data: ContinueReadingData | null
}

export function ContinueReadingWidget({ data }: ContinueReadingWidgetProps) {
  const { language, dir, t } = useI18n()
  const [isReaderOpen, setIsReaderOpen] = useState(false)

  if (!data) return null

  const ArrowIcon = dir === "rtl" ? IconArrowLeft : IconArrowRight

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/80 bg-card/60 p-5 shadow-sm transition-colors hover:border-primary/40"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconBookmark className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                {t.dashboardContinueReading}
              </span>
              <h4 className="font-serif text-base font-bold text-foreground">
                {language === "ar"
                  ? `سورة ${data.surahNameAr} • الآية ${data.ayahNumber}`
                  : `Surah ${data.surahNameEn} • Ayah ${data.ayahNumber}`}
              </h4>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsReaderOpen(true)}
            className="h-8 gap-1 rounded-xl text-xs font-bold transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <span>{t.readerOpenReader}</span>
            <ArrowIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>

      {isReaderOpen && (
        <QuranReader
          isModal={true}
          isOpen={isReaderOpen}
          onClose={() => setIsReaderOpen(false)}
          initialSurahNumber={data.surahNumber}
          initialAyahNumber={data.ayahNumber}
        />
      )}
    </>
  )
}
