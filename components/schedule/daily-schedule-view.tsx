"use client"

import React from "react"
import { IconCheck, IconClock, IconSparkles } from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { DailyPortion, MemberAssignment } from "@/lib/scheduler/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toArabicNumerals } from "@/lib/dates/calendar"

interface DailyScheduleViewProps {
  assignments: MemberAssignment[]
  weekNumber: number
  occasionType?: "normal" | "ramadan"
}

export function DailyScheduleView({
  assignments,
  weekNumber,
  occasionType,
}: DailyScheduleViewProps) {
  const { language, t } = useI18n()

  return (
    <div className="space-y-6">
      {assignments.map((assignment, aIdx) => {
        const breakdown = assignment.dailyBreakdown || []
        return (
          <Card
            key={assignment.memberId || aIdx}
            className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"
          >
            {/* Member Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-muted/40 p-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                  {assignment.memberName.slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    {assignment.memberName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar"
                      ? `${toArabicNumerals(assignment.weeklyAmount)} أجزاء أسبوعيًا`
                      : `${assignment.weeklyAmount} Juz / week`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-semibold">
                  {language === "ar"
                    ? `الأسبوع ${toArabicNumerals(weekNumber)}`
                    : `Week ${weekNumber}`}
                </Badge>
                {occasionType === "ramadan" && (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    {t.ramadanBadge}
                  </Badge>
                )}
              </div>
            </div>

            {/* Daily portions grid */}
            {breakdown.length > 0 ? (
              <div className="grid grid-cols-1 divide-y divide-border/40 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:divide-border/40 sm:rtl:divide-x-reverse lg:grid-cols-7 lg:divide-y-0">
                {breakdown.map((portion, pIdx) => {
                  const surahStart =
                    language === "ar"
                      ? portion.startAyah.surahNameAr
                      : portion.startAyah.surahNameEn
                  const surahEnd =
                    language === "ar"
                      ? portion.endAyah.surahNameAr
                      : portion.endAyah.surahNameEn

                  const isSameSurah =
                    portion.startAyah.surahNumber ===
                    portion.endAyah.surahNumber

                  const portionRangeText = isSameSurah
                    ? `${surahStart} (${language === "ar" ? toArabicNumerals(portion.startAyah.ayahNumber) : portion.startAyah.ayahNumber} - ${language === "ar" ? toArabicNumerals(portion.endAyah.ayahNumber) : portion.endAyah.ayahNumber})`
                    : `${surahStart} (${language === "ar" ? toArabicNumerals(portion.startAyah.ayahNumber) : portion.startAyah.ayahNumber}) ← ${surahEnd} (${language === "ar" ? toArabicNumerals(portion.endAyah.ayahNumber) : portion.endAyah.ayahNumber})`

                  return (
                    <div
                      key={pIdx}
                      className="group relative flex flex-col justify-between p-3.5 transition-colors hover:bg-muted/30"
                    >
                      {/* Day Label & Date */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-primary">
                          {language === "ar"
                            ? portion.dayNameAr
                            : portion.dayNameEn}
                        </span>

                        {(portion.formattedDateAr || portion.dateStr) && (
                          <span className="text-[10px] text-muted-foreground">
                            {language === "ar"
                              ? portion.formattedDateAr
                              : portion.formattedDateEn || portion.dateStr?.slice(5)}
                          </span>
                        )}
                      </div>

                      {/* Portion Text */}
                      <div className="my-2 space-y-1 text-start">
                        <p className="text-xs leading-relaxed font-semibold text-foreground">
                          {portionRangeText}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span>
                            {language === "ar"
                              ? `الجزء ${toArabicNumerals(portion.startAyah.juzNumber)}`
                              : `Juz ${portion.startAyah.juzNumber}`}
                          </span>
                          <span>•</span>
                          <span>
                            {language === "ar"
                              ? `${toArabicNumerals(portion.totalAyahs)} آية`
                              : `${portion.totalAyahs} Ayahs`}
                          </span>
                        </div>
                      </div>

                      {/* Bottom indicator */}
                      <div className="mt-1 flex items-center justify-between border-t border-border/30 pt-1.5 text-[10px] text-muted-foreground">
                        <span>
                          {language === "ar"
                            ? `اليوم ${toArabicNumerals(portion.dayIndex)}`
                            : `Day ${portion.dayIndex}`}
                        </span>
                        {portion.ramadanDay && (
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {language === "ar"
                              ? portion.ramadanDayLabelAr || `رمضان ${toArabicNumerals(portion.ramadanDay)}`
                              : portion.ramadanDayLabelEn || `Ramadan ${portion.ramadanDay}`}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                {language === "ar"
                  ? "التقسيم اليومي غير مفعل لهذا الجدول."
                  : "Daily division is not enabled for this schedule."}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
