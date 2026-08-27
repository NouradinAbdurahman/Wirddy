"use client"

import React from "react"
import {
  IconCalendar,
  IconCalendarEvent,
  IconCalendarTime,
  IconMoon,
  IconNotes,
  IconNumber123,
  IconSparkles,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { OccasionType } from "@/lib/scheduler/types"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  formatSingleDateAr,
  formatSingleDateEn,
  toArabicNumerals,
} from "@/lib/dates/calendar"
import {
  getCurrentHijriYear,
  getRamadanStartDate,
  getSupportedIslamicYears,
} from "@/lib/dates/ramadan"

interface AdvancedOptionsProps {
  title: string
  onTitleChange: (title: string) => void
  description: string
  onDescriptionChange: (desc: string) => void
  usesDates: boolean
  onUsesDatesChange: (usesDates: boolean) => void
  startDate: string
  onStartDateChange: (date: string) => void
  occasionType: OccasionType
  onOccasionTypeChange: (occasion: OccasionType) => void
  islamicYear: number
  onIslamicYearChange: (year: number) => void
  dailyDivisionEnabled: boolean
  onDailyDivisionEnabledChange: (enabled: boolean) => void
}

export function AdvancedOptions({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  usesDates,
  onUsesDatesChange,
  startDate,
  onStartDateChange,
  occasionType,
  onOccasionTypeChange,
  islamicYear,
  onIslamicYearChange,
  dailyDivisionEnabled,
  onDailyDivisionEnabledChange,
}: AdvancedOptionsProps) {
  const { language, t } = useI18n()
  const supportedYears = getSupportedIslamicYears()
  const currentHijri = getCurrentHijriYear()

  // Handle Ramadan occasion switch
  const handleOccasionChange = (occ: OccasionType) => {
    onOccasionTypeChange(occ)
    if (occ === "ramadan") {
      onUsesDatesChange(true)
      const year = islamicYear || currentHijri
      onIslamicYearChange(year)
      const ramadanStart = getRamadanStartDate(year)
      if (ramadanStart) {
        onStartDateChange(ramadanStart)
      }
    }
  }

  // Handle Islamic year change
  const handleYearChange = (year: number) => {
    onIslamicYearChange(year)
    if (occasionType === "ramadan") {
      const ramadanStart = getRamadanStartDate(year)
      if (ramadanStart) {
        onStartDateChange(ramadanStart)
      }
    }
  }

  const formattedDatePreview = startDate
    ? language === "ar"
      ? formatSingleDateAr(startDate)
      : formatSingleDateEn(startDate)
    : ""

  return (
    <div className="space-y-4">
      {/* 1. Schedule Title & Description */}
      <Card className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconNotes className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground sm:text-base">
              {t.groupTitleLabel}
            </h3>
            <p className="text-xs text-muted-foreground">
              {language === "ar"
                ? "تخصيص عنوان أو إهداء مميز يظهر أعلى الجدول وفي جميع ملفات التصدير"
                : "Customize a schedule title and description displayed in headers and exports"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 text-start">
            <Label htmlFor="sched-title" className="text-xs font-semibold text-foreground">
              {t.groupTitleLabel}
            </Label>
            <Input
              id="sched-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={t.groupTitlePlaceholder}
              maxLength={200}
              className="h-10 rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5 text-start">
            <Label htmlFor="sched-desc" className="text-xs font-semibold text-foreground">
              {t.groupDescLabel}
            </Label>
            <Input
              id="sched-desc"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder={t.groupDescPlaceholder}
              maxLength={500}
              className="h-10 rounded-xl text-sm"
            />
          </div>
        </div>
      </Card>

      {/* 2. Occasion & Ramadan Mode */}
      <Card className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <IconMoon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground sm:text-base">
                {t.occasionTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                {language === "ar"
                  ? "تفعيل ختمة رمضان لحساب التقويم الهجري تلقائيًا وتسمية أيام الشهر الفضيل"
                  : "Enable Ramadan mode with automated Umm al-Qura calendar dates and day labels"}
              </p>
            </div>
          </div>
        </div>

        {/* Occasion Switcher */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1">
          <button
            type="button"
            onClick={() => handleOccasionChange("normal")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              occasionType === "normal"
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <IconCalendar className="h-3.5 w-3.5" />
            <span>{t.occasionNormal}</span>
          </button>

          <button
            type="button"
            onClick={() => handleOccasionChange("ramadan")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              occasionType === "ramadan"
                ? "bg-amber-500 text-white shadow-sm ring-1 ring-amber-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <IconMoon className="h-3.5 w-3.5" />
            <span>{t.occasionRamadan}</span>
          </button>
        </div>

        {/* Ramadan Year Selector */}
        {occasionType === "ramadan" && (
          <div className="animate-in fade-in-50 slide-in-from-top-1 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-start">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Label htmlFor="islamic-year" className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  {t.islamicYearLabel}
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {language === "ar"
                    ? "اختر السنة الهجرية لحساب موعد أول يوم من رمضان"
                    : "Select Islamic year to compute Ramadan 1 start date"}
                </p>
              </div>

              <select
                id="islamic-year"
                value={islamicYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                className="h-9 rounded-lg border border-amber-500/40 bg-card px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {supportedYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {language === "ar"
                      ? `${toArabicNumerals(yr)} هـ`
                      : `${yr} AH`}
                  </option>
                ))}
              </select>
            </div>

            {startDate && (
              <div className="mt-2.5 flex items-center gap-2 text-[11px] font-medium text-amber-800 dark:text-amber-200">
                <IconSparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span>
                  {language === "ar"
                    ? `تبدأ ختمة رمضان يوم: ${formattedDatePreview}`
                    : `Ramadan plan starts on: ${formattedDatePreview}`}
                </span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 3. Schedule Start Dates (For Regular Plans) */}
      {occasionType === "normal" && (
        <Card className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <IconCalendarEvent className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground sm:text-base">
                  {t.scheduleDatesTitle}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === "ar"
                    ? "إضافة تواريخ ميلادية حقيقية لكل أسبوع لمتابعة الخطة بدقة"
                    : "Add calendar dates for each week to track the schedule accurately"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => onUsesDatesChange(false)}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                !usesDates
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t.noDateOption}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onUsesDatesChange(true)
                if (!startDate) {
                  const today = new Date().toISOString().split("T")[0]
                  onStartDateChange(today)
                }
              }}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                usesDates
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconCalendar className="h-3.5 w-3.5" />
              <span>{t.setDateOption}</span>
            </button>
          </div>

          {usesDates && (
            <div className="animate-in fade-in-50 slide-in-from-top-1 space-y-2 pt-1 text-start">
              <Label htmlFor="start-date-input" className="text-xs font-semibold text-foreground">
                {t.startDatePickerLabel}
              </Label>
              <Input
                id="start-date-input"
                type="date"
                value={startDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="h-10 rounded-xl text-sm font-medium"
              />
              {startDate && (
                <p className="text-xs font-medium text-primary">
                  {language === "ar"
                    ? `بداية الأسبوع الأول: ${formattedDatePreview}`
                    : `Week 1 Starts: ${formattedDatePreview}`}
                </p>
              )}
            </div>
          )}
        </Card>
      )}

      {/* 4. Daily Division (7 Days) */}
      <Card className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <IconNumber123 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground sm:text-base">
                {t.dailyDivisionTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t.dailyDivisionDesc}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1">
          <button
            type="button"
            onClick={() => onDailyDivisionEnabledChange(false)}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              !dailyDivisionEnabled
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{t.noDailyDivision}</span>
          </button>

          <button
            type="button"
            onClick={() => onDailyDivisionEnabledChange(true)}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              dailyDivisionEnabled
                ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <IconCalendarTime className="h-3.5 w-3.5" />
            <span>{t.withDailyDivision}</span>
          </button>
        </div>
      </Card>
    </div>
  )
}
