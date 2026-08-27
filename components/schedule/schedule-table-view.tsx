"use client"

import React from "react"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n/context"
import { MemberAssignment, WeekSchedule } from "@/lib/scheduler/types"
import { Card } from "@/components/ui/card"

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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-start text-sm">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-border/60 bg-muted/50 text-[11px] font-extrabold tracking-wider text-muted-foreground uppercase dark:bg-muted/25">
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
                          <span className="text-sm leading-tight font-extrabold break-words text-foreground sm:text-base">
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
                          <span className="text-sm leading-tight font-extrabold break-words text-foreground">
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
                          <span className="text-sm leading-tight font-extrabold break-words text-foreground">
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
