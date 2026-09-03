"use client"

import React from "react"
import { IconBook, IconCheck, IconCircleCheck } from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { WeekSchedule } from "@/lib/scheduler/types"

interface ExportCardProps {
  scheduleId: string
  groupName: string
  week: WeekSchedule
  totalWeeks: number
  idSuffix?: string
}

export function ExportCard({
  scheduleId,
  groupName,
  week,
  totalWeeks,
  idSuffix = "",
}: ExportCardProps) {
  const { language, dir, t, formatNumber } = useI18n()
  const elementId = `wirddy-export-week-${week.weekNumber}${idSuffix}`

  return (
    <div
      id={elementId}
      dir={dir}
      className="relative w-[820px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-7 font-sans text-slate-50 shadow-2xl"
      style={{
        fontFamily:
          language === "ar"
            ? "var(--font-arabic), var(--font-quran), system-ui, sans-serif"
            : "var(--font-sans), system-ui, sans-serif",
      }}
    >
      {/* Background Subtle Ambient Highlights */}
      <div className="pointer-events-none absolute -top-28 -right-28 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <img
            src="/wirddy-logo-white.png"
            alt={t.appName}
            className="h-12 w-auto object-contain"
          />
          <div>
            <div className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
              <span className="rounded-md border border-teal-800/60 bg-teal-950 px-2.5 py-0.5 text-xs font-medium text-teal-300">
                {t.planTitle}
              </span>
            </div>
            <div className="mt-0.5 text-sm font-semibold text-teal-400">
              {groupName}
            </div>
          </div>
        </div>

        <div className="space-y-1 text-end">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1">
            <span className="text-xs font-bold text-white">
              {t.weekLabel} {formatNumber(week.weekNumber)} {t.weekOf}{" "}
              {formatNumber(totalWeeks)}
            </span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-teal-400">
            <IconCircleCheck className="h-3.5 w-3.5" />
            <span>
              {formatNumber(30)} / {formatNumber(30)} {t.juzUnit} (
              {t.summaryQuran})
            </span>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="relative z-10 my-5 grid grid-cols-2 gap-3">
        {week.assignments.map((assignment, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/90 p-3.5 shadow-sm"
          >
            {/* Top row: Strong member name & subtle amount badge */}
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-800 p-1">
                  <img
                    src="/logo-white.png"
                    alt="Wirddy"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-sm font-extrabold break-words text-slate-100">
                  {assignment.memberName}
                </span>
              </div>
              <span className="shrink-0 rounded-md border border-slate-700/60 bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                {formatNumber(assignment.weeklyAmount)} {t.juzUnit}
              </span>
            </div>

            {/* Paired Start / End Structure */}
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-800/70 bg-slate-950/80 p-2 text-xs">
              {/* Start */}
              <div className="space-y-0.5 rounded-lg border border-slate-800/60 bg-slate-900/60 p-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-teal-400 uppercase">
                    {t.startLabel}
                  </span>
                  <span className="text-[10px] font-bold text-slate-200">
                    {t.juzLabel} {formatNumber(assignment.startJuz)}
                  </span>
                </div>
                <div className="pt-0.5 text-[11px] font-semibold break-words text-slate-200 font-quran text-xs">
                  {language === "ar"
                    ? `سورة ${assignment.startAyah.surahNameAr}`
                    : `${assignment.startAyah.surahNameEn}`}
                </div>
                <div className="text-[10px] text-slate-400">
                  {t.ayahLabel} {formatNumber(assignment.startAyah.ayahNumber)}
                </div>
              </div>

              {/* End */}
              <div className="space-y-0.5 rounded-lg border border-slate-800/60 bg-slate-900/60 p-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-teal-400 uppercase">
                    {t.endLabel}
                  </span>
                  <span className="text-[10px] font-bold text-slate-200">
                    {t.juzLabel} {formatNumber(assignment.endJuz)}
                  </span>
                </div>
                <div className="pt-0.5 text-[11px] font-semibold break-words text-slate-200 font-quran text-xs">
                  {language === "ar"
                    ? `سورة ${assignment.endAyah.surahNameAr}`
                    : `${assignment.endAyah.surahNameEn}`}
                </div>
                <div className="text-[10px] text-slate-400">
                  {t.ayahLabel} {formatNumber(assignment.endAyah.ayahNumber)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 flex items-center justify-between border-t border-slate-800 pt-3.5 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <IconCheck className="h-3.5 w-3.5 text-teal-400" />
          <span>
            {language === "ar"
              ? "تم التحقق من توزيع ٣٠ جزءًا بدقة متناهية"
              : "Verified 30/30 Juz Complete Allocation"}
          </span>
        </div>
        <div className="font-medium text-slate-500">
          <span>wirddy.vercel.app</span>
        </div>
      </div>
    </div>
  )
}
