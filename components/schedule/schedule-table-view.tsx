"use client"

import React from "react"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n/context"
import { MemberAssignment, WeekSchedule } from "@/lib/scheduler/types"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ScheduleTableViewProps {
  week: WeekSchedule
}

export function ScheduleTableView({ week }: ScheduleTableViewProps) {
  const { language, t, formatNumber } = useI18n()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-0 text-start shadow-sm backdrop-blur-md dark:bg-card/70">
        {/* Mobile View: Stacked Member Assignment Cards */}
        <div className="divide-y divide-border/50 sm:hidden">
          {week.assignments.map((assignment: MemberAssignment, idx: number) => {
            const startSurah =
              language === "ar"
                ? `سورة ${assignment.startAyah.surahNameAr}`
                : assignment.startAyah.surahNameEn
            const endSurah =
              language === "ar"
                ? `سورة ${assignment.endAyah.surahNameAr}`
                : assignment.endAyah.surahNameEn

            return (
              <div key={`m-${assignment.memberId}-${idx}`} className="p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/40 bg-muted/40 p-0.5">
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
                    <span className="truncate text-xs font-extrabold text-foreground">
                      {assignment.memberName}
                    </span>
                  </div>

                  <span className="inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground shrink-0">
                    {formatNumber(assignment.weeklyAmount)} {language === "ar" ? "أجزاء" : "Juz"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-background/60 p-2.5 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-primary">
                      {t.tableHeaderStart}
                    </span>
                    <p className={cn("truncate font-bold text-foreground text-xs", language === "ar" && "font-quran text-sm")}>
                      {startSurah}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t.juzLabel} {formatNumber(assignment.startJuz)} • {t.ayahLabel} {formatNumber(assignment.startAyah.ayahNumber)}
                    </p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-primary">
                      {t.tableHeaderEnd}
                    </span>
                    <p className={cn("truncate font-bold text-foreground text-xs", language === "ar" && "font-quran text-sm")}>
                      {endSurah}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t.juzLabel} {formatNumber(assignment.endJuz)} • {t.ayahLabel} {formatNumber(assignment.endAyah.ayahNumber)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop / Tablet View: Full Data Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse text-start text-sm">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-border/60 bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase dark:bg-muted/25">
                <th className="w-[28%] min-w-[140px] px-4 py-3 text-start sm:px-5">
                  {t.tableHeaderMember}
                </th>
                <th className="w-[12%] min-w-[70px] px-3 py-3 text-center">
                  {t.tableHeaderAmount}
                </th>
                <th className="w-[30%] min-w-[160px] px-4 py-3 text-start sm:px-5">
                  <span className="text-primary">{t.tableHeaderStart}</span>
                </th>
                <th className="w-[30%] min-w-[160px] px-4 py-3 text-start sm:px-5">
                  <span className="text-primary">{t.tableHeaderEnd}</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border/40">
              {week.assignments.map(
                (assignment: MemberAssignment, idx: number) => {
                  const startSurah =
                    language === "ar"
                      ? `سورة ${assignment.startAyah.surahNameAr}`
                      : assignment.startAyah.surahNameEn
                  const endSurah =
                    language === "ar"
                      ? `سورة ${assignment.endAyah.surahNameAr}`
                      : assignment.endAyah.surahNameEn

                  return (
                    <tr
                      key={`${assignment.memberId}-${idx}`}
                      className="group transition-colors hover:bg-muted/30"
                    >
                      {/* Member Name */}
                      <td className="px-4 py-3.5 align-middle sm:px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/40 bg-muted/40 p-1 dark:bg-muted/20">
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
                          <span className="text-sm leading-tight font-bold break-words text-foreground sm:text-base">
                            {assignment.memberName}
                          </span>
                        </div>
                      </td>

                      {/* Reading Amount */}
                      <td className="px-3 py-3.5 text-center align-middle">
                        <span className="inline-flex items-center justify-center rounded-md border border-border/50 bg-muted/60 px-2 py-0.5 text-xs font-bold text-muted-foreground dark:bg-muted/40">
                          {formatNumber(assignment.weeklyAmount)}
                        </span>
                      </td>

                      {/* Start Location */}
                      <td className="px-4 py-3.5 align-middle sm:px-5">
                        <div className="flex flex-col space-y-0.5">
                          <span className="text-[11px] font-bold text-muted-foreground">
                            {t.juzLabel} {formatNumber(assignment.startJuz)}
                          </span>
                          <span className={cn("text-sm leading-tight font-bold break-words text-foreground", language === "ar" && "font-quran text-base")}>
                            {startSurah}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t.ayahLabel}{" "}
                            {formatNumber(assignment.startAyah.ayahNumber)}
                          </span>
                        </div>
                      </td>

                      {/* End Location */}
                      <td className="px-4 py-3.5 align-middle sm:px-5">
                        <div className="flex flex-col space-y-0.5">
                          <span className="text-[11px] font-bold text-muted-foreground">
                            {t.juzLabel} {formatNumber(assignment.endJuz)}
                          </span>
                          <span className={cn("text-sm leading-tight font-bold break-words text-foreground", language === "ar" && "font-quran text-base")}>
                            {endSurah}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t.ayahLabel}{" "}
                            {formatNumber(assignment.endAyah.ayahNumber)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                }
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  )
}
