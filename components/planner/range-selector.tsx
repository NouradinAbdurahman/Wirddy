"use client"

import React, { useMemo } from "react"
import { motion } from "motion/react"
import {
  IconBook,
  IconBookmarks,
  IconCompass,
  IconInfoCircle,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { CustomQuranRange, RangeType } from "@/lib/scheduler/types"
import { quranService } from "@/lib/quran/service"
import { resolveCustomQuranRange } from "@/lib/quran/resolver"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RangeSelectorProps {
  rangeType: RangeType
  onRangeTypeChange: (type: RangeType) => void
  startJuz: number
  onStartJuzChange: (juz: number) => void
  customRange: CustomQuranRange
  onCustomRangeChange: (range: CustomQuranRange) => void
}

export function RangeSelector({
  rangeType,
  onRangeTypeChange,
  startJuz,
  onStartJuzChange,
  customRange,
  onCustomRangeChange,
}: RangeSelectorProps) {
  const { language, t, formatNumber } = useI18n()
  const surahs = useMemo(() => quranService.getAllSurahs(), [])

  // Calculate info about selected custom range
  const customRangeInfo = useMemo(() => {
    try {
      if (rangeType !== "custom") return null
      return resolveCustomQuranRange(
        customRange.startSurah,
        customRange.startAyah,
        customRange.endSurah,
        customRange.endAyah
      )
    } catch {
      return null
    }
  }, [rangeType, customRange])

  const startSurahObj = useMemo(
    () => quranService.getSurah(customRange.startSurah),
    [customRange.startSurah]
  )
  const endSurahObj = useMemo(
    () => quranService.getSurah(customRange.endSurah),
    [customRange.endSurah]
  )

  return (
    <div className="space-y-4 text-start">
      <div>
        <label className="text-sm font-bold text-foreground">
          {t.quranRangeTitle}
        </label>
        <p className="text-xs text-muted-foreground">
          {rangeType === "full" ? t.quranRangeFullDesc : t.quranRangeCustomDesc}
        </p>
      </div>

      {/* Range Type Switcher (Full Quran vs Custom Range) */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onRangeTypeChange("full")}
          className={`relative flex items-center gap-3 rounded-2xl border p-3.5 text-start transition-all ${
            rangeType === "full"
              ? "border-primary bg-primary/5 shadow-xs dark:bg-primary/10"
              : "border-border/60 bg-card/60 hover:border-border hover:bg-card dark:bg-card/40"
          }`}
        >
          {rangeType === "full" && (
            <motion.div
              layoutId="activeRangeType"
              className="absolute inset-0 rounded-2xl border-2 border-primary"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <IconBook className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground sm:text-sm">
              {t.quranRangeFull}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t.quranRangeFullDesc}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onRangeTypeChange("custom")}
          className={`relative flex items-center gap-3 rounded-2xl border p-3.5 text-start transition-all ${
            rangeType === "custom"
              ? "border-primary bg-primary/5 shadow-xs dark:bg-primary/10"
              : "border-border/60 bg-card/60 hover:border-border hover:bg-card dark:bg-card/40"
          }`}
        >
          {rangeType === "custom" && (
            <motion.div
              layoutId="activeRangeType"
              className="absolute inset-0 rounded-2xl border-2 border-primary"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <IconBookmarks className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground sm:text-sm">
              {t.quranRangeCustom}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t.quranRangeCustomDesc}
            </p>
          </div>
        </button>
      </div>

      {/* Starting Point (When Full Quran is selected) */}
      {rangeType === "full" && (
        <Card className="rounded-2xl border border-border/50 bg-card/40 p-4 backdrop-blur-xs">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground sm:text-sm">
                <IconCompass className="h-4 w-4 text-primary" />
                <span>{t.startingPointTitle}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t.startingPointDesc}
              </p>
            </div>

            <div className="w-full sm:w-44">
              <Select
                value={String(startJuz)}
                onValueChange={(val) => onStartJuzChange(Number(val))}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs font-semibold">
                  <SelectValue placeholder={t.startJuzLabel} />
                </SelectTrigger>
                <SelectContent className="max-h-56 rounded-2xl">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => (
                    <SelectItem
                      key={juzNum}
                      value={String(juzNum)}
                      className="text-xs"
                    >
                      {language === "ar"
                        ? `الجزء ${formatNumber(juzNum)}`
                        : `Juz ${formatNumber(juzNum)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Custom Range Selectors (When Custom Range is selected) */}
      {rangeType === "custom" && (
        <Card className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Start Surah & Ayah */}
            <div className="space-y-2 rounded-xl border border-border/40 bg-background/50 p-3.5">
              <span className="text-xs font-bold text-primary">
                {t.rangeFrom}
              </span>
              <div className="space-y-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">
                    {t.surahLabel}
                  </Label>
                  <Select
                    value={String(customRange.startSurah)}
                    onValueChange={(val) =>
                      onCustomRangeChange({
                        ...customRange,
                        startSurah: Number(val),
                        startAyah: 1,
                      })
                    }
                  >
                    <SelectTrigger className="mt-1 h-8.5 rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 rounded-2xl">
                      {surahs.map((s) => (
                        <SelectItem
                          key={s.number}
                          value={String(s.number)}
                          className="text-xs"
                        >
                          {formatNumber(s.number)}.{" "}
                          {language === "ar" ? s.nameAr : s.transliteration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground">
                    {t.ayahLabel} (1 -{" "}
                    {formatNumber(startSurahObj?.totalAyahs || 1)})
                  </Label>
                  <Select
                    value={String(customRange.startAyah)}
                    onValueChange={(val) =>
                      onCustomRangeChange({
                        ...customRange,
                        startAyah: Number(val),
                      })
                    }
                  >
                    <SelectTrigger className="mt-1 h-8.5 rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-56 rounded-2xl">
                      {Array.from(
                        {
                          length: Math.min(startSurahObj?.totalAyahs || 1, 286),
                        },
                        (_, i) => i + 1
                      ).map((aNum) => (
                        <SelectItem
                          key={aNum}
                          value={String(aNum)}
                          className="text-xs"
                        >
                          {t.ayahLabel} {formatNumber(aNum)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* End Surah & Ayah */}
            <div className="space-y-2 rounded-xl border border-border/40 bg-background/50 p-3.5">
              <span className="text-xs font-bold text-primary">
                {t.rangeTo}
              </span>
              <div className="space-y-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">
                    {t.surahLabel}
                  </Label>
                  <Select
                    value={String(customRange.endSurah)}
                    onValueChange={(val) => {
                      const newEndSurah = Number(val)
                      const sObj = quranService.getSurah(newEndSurah)
                      onCustomRangeChange({
                        ...customRange,
                        endSurah: newEndSurah,
                        endAyah: sObj?.totalAyahs || 1,
                      })
                    }}
                  >
                    <SelectTrigger className="mt-1 h-8.5 rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 rounded-2xl">
                      {surahs.map((s) => (
                        <SelectItem
                          key={s.number}
                          value={String(s.number)}
                          className="text-xs"
                        >
                          {formatNumber(s.number)}.{" "}
                          {language === "ar" ? s.nameAr : s.transliteration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground">
                    {t.ayahLabel} (1 -{" "}
                    {formatNumber(endSurahObj?.totalAyahs || 1)})
                  </Label>
                  <Select
                    value={String(customRange.endAyah)}
                    onValueChange={(val) =>
                      onCustomRangeChange({
                        ...customRange,
                        endAyah: Number(val),
                      })
                    }
                  >
                    <SelectTrigger className="mt-1 h-8.5 rounded-xl text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-56 rounded-2xl">
                      {Array.from(
                        { length: Math.min(endSurahObj?.totalAyahs || 1, 286) },
                        (_, i) => i + 1
                      ).map((aNum) => (
                        <SelectItem
                          key={aNum}
                          value={String(aNum)}
                          className="text-xs"
                        >
                          {t.ayahLabel} {formatNumber(aNum)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Range Summary Badge */}
          {customRangeInfo && (
            <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary">
              <IconInfoCircle className="h-4 w-4 shrink-0" />
              <span>
                {t.rangeSummary}:{" "}
                {formatNumber(customRangeInfo.totalAyahs || 0)}{" "}
                {language === "ar" ? "آية" : "Ayahs"} (
                {formatNumber(customRangeInfo.totalJuz)}{" "}
                {language === "ar" ? "أجزاء تقريباً" : "Juz approximately"})
              </span>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
