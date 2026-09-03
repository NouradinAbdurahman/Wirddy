"use client"

import React, { useEffect, useState } from "react"
import QRCode from "qrcode"
import { useI18n } from "@/lib/i18n/context"
import { GeneratedSchedule, MemberAssignment } from "@/lib/scheduler/types"
import { ExportViewMode } from "@/lib/export"
import { cn } from "@/lib/utils"

interface PrintableScheduleProps {
  schedule: GeneratedSchedule
  activeWeekNum: number
  viewMode?: ExportViewMode
  printMode?: "all" | "current"
}

export function PrintableSchedule({
  schedule,
  activeWeekNum,
  viewMode = "cards",
  printMode = "all",
}: PrintableScheduleProps) {
  const { language, dir, t, formatNumber } = useI18n()
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  const isArabic = language === "ar"
  const weeksToPrint =
    printMode === "current"
      ? schedule.weeks.filter((w) => w.weekNumber === activeWeekNum)
      : schedule.weeks

  const qrTarget =
    typeof window !== "undefined" &&
    window.location?.pathname?.startsWith("/g/")
      ? `${window.location.origin}${window.location.pathname}`
      : "https://wirddy.vercel.app"

  useEffect(() => {
    QRCode.toDataURL(qrTarget, {
      margin: 1,
      width: 180,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("Error generating print QR:", err))
  }, [qrTarget])

  const dateStr = new Date().toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div
      dir={dir}
      className="hidden print:mx-auto print:block print:w-full print:max-w-4xl print:bg-white print:p-6 print:text-slate-900 print:antialiased"
    >
      {/* Cover / Header Section */}
      <div className="mb-6 rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-6 print:border-slate-300 print:bg-slate-50">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <img
                src="/logo-black.png"
                alt="Wirddy"
                className="h-9 w-9 object-contain"
              />
              <span className="inline-block rounded-md border border-teal-600/30 bg-teal-50 px-2.5 py-0.5 text-xs font-bold tracking-wider text-teal-800 uppercase">
                {isArabic ? "خطة ختم القرآن الكريم" : "Quran Completion Plan"}
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {schedule.groupName}
            </h1>

            <p className="text-xs font-medium text-slate-500">
              {isArabic ? "تاريخ الطباعة:" : "Printed on:"} {dateStr}
            </p>
          </div>

          {/* Stats & QR Code */}
          <div className="flex shrink-0 items-center gap-5">
            <div className="flex flex-col items-end gap-1.5 text-right">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">
                <span>{isArabic ? "٣٠ جزءًا أسبوعيًا" : "30 Juz / Week"}</span>
              </div>
              <div className="text-xs font-bold text-slate-700">
                {formatNumber(schedule.members.length)}{" "}
                {isArabic ? "أعضاء" : "Members"} •{" "}
                {formatNumber(schedule.weeksCount)}{" "}
                {isArabic ? "أسابيع" : "Weeks"}
              </div>
            </div>

            {qrCodeUrl && (
              <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="h-16 w-16 object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Sections */}
      <div className="space-y-8">
        {weeksToPrint.map((week, weekIdx) => (
          <div
            key={week.weekNumber}
            className={`print-avoid-break space-y-3.5 ${
              weekIdx > 0 && weekIdx % 2 === 0 ? "print-page-break" : ""
            }`}
          >
            {/* Week Header Banner */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">
                  {formatNumber(week.weekNumber)}
                </span>
                <h2 className="text-base font-extrabold text-slate-900">
                  {isArabic
                    ? `الأسبوع ${formatNumber(week.weekNumber)} من ${formatNumber(schedule.weeksCount)}`
                    : `Week ${week.weekNumber} of ${schedule.weeksCount}`}
                </h2>
              </div>

              <div className="text-xs font-extrabold text-emerald-800">
                {isArabic
                  ? "الختمة كاملة (٣٠ جزءًا)"
                  : "Full Completion (30 Juz)"}
              </div>
            </div>

            {/* Assignments: Cards or Table */}
            {viewMode === "table" ? (
              <div className="overflow-hidden rounded-xl border border-slate-300">
                <table className="w-full border-collapse text-start text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                      <th className="px-3 py-2.5 text-start">
                        {t.tableHeaderMember}
                      </th>
                      <th className="px-3 py-2.5 text-center">
                        {t.tableHeaderAmount}
                      </th>
                      <th className="px-3 py-2.5 text-start text-teal-800">
                        {t.tableHeaderStart}
                      </th>
                      <th className="px-3 py-2.5 text-start text-teal-800">
                        {t.tableHeaderEnd}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {week.assignments.map(
                      (assignment: MemberAssignment, aIdx: number) => {
                        const startSurah = isArabic
                          ? `سورة ${assignment.startAyah.surahNameAr}`
                          : assignment.startAyah.surahNameEn
                        const endSurah = isArabic
                          ? `سورة ${assignment.endAyah.surahNameAr}`
                          : assignment.endAyah.surahNameEn

                        return (
                          <tr
                            key={aIdx}
                            className={
                              aIdx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                            }
                          >
                            <td className="px-3 py-2.5 font-bold text-slate-900">
                              {assignment.memberName}
                            </td>
                            <td className="px-3 py-2.5 text-center font-extrabold text-teal-800">
                              {formatNumber(assignment.weeklyAmount)}{" "}
                              {t.juzUnit}
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={cn("font-bold text-slate-900", isArabic && "font-quran text-sm")}>
                                {startSurah}{" "}
                                {formatNumber(assignment.startAyah.ayahNumber)}
                              </span>
                              <span className="ms-1.5 text-[11px] font-semibold text-slate-500">
                                ({t.juzLabel}{" "}
                                {formatNumber(assignment.startJuz)})
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={cn("font-bold text-slate-900", isArabic && "font-quran text-sm")}>
                                {endSurah}{" "}
                                {formatNumber(assignment.endAyah.ayahNumber)}
                              </span>
                              <span className="ms-1.5 text-[11px] font-semibold text-slate-500">
                                ({t.juzLabel} {formatNumber(assignment.endJuz)})
                              </span>
                            </td>
                          </tr>
                        )
                      }
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {week.assignments.map(
                  (assignment: MemberAssignment, aIdx: number) => {
                    const startSurah = isArabic
                      ? `سورة ${assignment.startAyah.surahNameAr}`
                      : assignment.startAyah.surahNameEn
                    const endSurah = isArabic
                      ? `سورة ${assignment.endAyah.surahNameAr}`
                      : assignment.endAyah.surahNameEn

                    return (
                      <div
                        key={aIdx}
                        className="print-avoid-break flex flex-col justify-between rounded-xl border-2 border-slate-200 bg-white p-3.5 shadow-2xs"
                      >
                        <div className="mb-2.5 flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-sm font-black text-slate-900">
                            {assignment.memberName}
                          </span>
                          <span className="rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-black text-teal-900">
                            {formatNumber(assignment.weeklyAmount)} {t.juzUnit}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="space-y-0.5">
                            <div className="text-[9px] font-bold text-teal-700 uppercase">
                              {t.startLabel}
                            </div>
                            <div className="text-[11px] font-bold text-slate-500">
                              {t.juzLabel} {formatNumber(assignment.startJuz)}
                            </div>
                            <div className={cn("text-xs font-bold text-slate-900", isArabic && "font-quran text-sm")}>
                              {startSurah}{" "}
                              {formatNumber(assignment.startAyah.ayahNumber)}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <div className="text-[9px] font-bold text-teal-700 uppercase">
                              {t.endLabel}
                            </div>
                            <div className="text-[11px] font-bold text-slate-500">
                              {t.juzLabel} {formatNumber(assignment.endJuz)}
                            </div>
                            <div className={cn("text-xs font-bold text-slate-900", isArabic && "font-quran text-sm")}>
                              {endSurah}{" "}
                              {formatNumber(assignment.endAyah.ayahNumber)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Attribution */}
      <div className="mt-8 border-t-2 border-slate-200 pt-4 text-center text-xs font-medium text-slate-500">
        <p>
          {isArabic
            ? "تم إنشاء هذا الجدول وتنسيقه عبر تطبيق وِردي — تنظيم قراءة القرآن في مجموعات"
            : "Generated & formatted with Wirddy — Group Quran Reading Planner"}
          {" • "}
          <span className="font-bold text-slate-700">wirddy.vercel.app</span>
        </p>
      </div>
    </div>
  )
}
