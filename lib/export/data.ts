import {
  GeneratedSchedule,
  MemberAssignment,
  WeekSchedule,
} from "@/lib/scheduler/types"
import {
  ExportBrandingOptions,
  ExportDirection,
  ExportLanguage,
  ExportMember,
  ExportSchedule,
  ExportTheme,
  ExportViewMode,
  ExportWeek,
} from "./types"

export function normalizeMemberAssignment(
  assignment: MemberAssignment,
  language: ExportLanguage
): ExportMember {
  return {
    name: assignment.memberName,
    amountInJuz: assignment.weeklyAmount,
    start: {
      juzNumber: assignment.startJuz,
      surahNumber: assignment.startAyah.surahNumber,
      surahNameArabic: assignment.startAyah.surahNameAr,
      surahNameEnglish: assignment.startAyah.surahNameEn,
      ayahNumber: assignment.startAyah.ayahNumber,
    },
    end: {
      juzNumber: assignment.endJuz,
      surahNumber: assignment.endAyah.surahNumber,
      surahNameArabic: assignment.endAyah.surahNameAr,
      surahNameEnglish: assignment.endAyah.surahNameEn,
      ayahNumber: assignment.endAyah.ayahNumber,
    },
  }
}

export function normalizeWeekSchedule(
  week: WeekSchedule,
  totalWeeks: number,
  groupName: string,
  language: ExportLanguage,
  theme: ExportTheme = "dark",
  view: ExportViewMode = "cards",
  branding?: ExportBrandingOptions
): ExportWeek {
  const direction: ExportDirection = language === "ar" ? "rtl" : "ltr"

  return {
    weekNumber: week.weekNumber,
    totalWeeks,
    groupName,
    language,
    direction,
    theme,
    view,
    branding,
    members: week.assignments.map((assignment) =>
      normalizeMemberAssignment(assignment, language)
    ),
  }
}

export function normalizeScheduleToExport(
  schedule: GeneratedSchedule,
  language: ExportLanguage,
  theme: ExportTheme = "dark",
  view: ExportViewMode = "cards",
  branding?: ExportBrandingOptions
): ExportSchedule {
  const direction: ExportDirection = language === "ar" ? "rtl" : "ltr"

  return {
    groupName: schedule.groupName,
    totalWeeks: schedule.weeksCount,
    language,
    direction,
    theme,
    view,
    branding,
    weeks: schedule.weeks.map((week) =>
      normalizeWeekSchedule(
        week,
        schedule.weeksCount,
        schedule.groupName,
        language,
        theme,
        view,
        branding
      )
    ),
  }
}
