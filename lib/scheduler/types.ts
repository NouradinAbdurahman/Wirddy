import { AyahRef } from "../quran/resolver"
import { QuranLocation } from "../quran/types"
import { WeekDateRange } from "../dates/calendar"

export type KnowledgeType = "entire" | "juz_range" | "surah_range"
export type RotationStyle = "large" | "medium" | "small" | "random"
export type RangeType = "full" | "custom"
export type OccasionType = "normal" | "ramadan"

export interface CustomQuranRange {
  startSurah: number
  startAyah: number
  endSurah: number
  endAyah: number
  startJuz?: number
  endJuz?: number
}

export interface MemberConfig {
  id: string
  name: string
  publicId?: string // Non-sensitive unguessable public identifier for personal views
  knowledgeType: KnowledgeType
  startJuz: number // 1-30
  endJuz: number // 1-30
  startSurah?: number // 1-114
  endSurah?: number // 1-114
  weeklyAmount: number // e.g. 1, 2, 3, 5
}

export interface GroupConfig {
  name: string
  title?: string
  description?: string
  weeksCount: number
  rotationStyle?: RotationStyle
  rangeType?: RangeType
  startJuz?: number // Custom starting point (1 to 30)
  customRange?: CustomQuranRange
  startDate?: string // ISO 'YYYY-MM-DD'
  usesDates?: boolean
  occasionType?: OccasionType
  islamicYear?: number
  dailyDivisionEnabled?: boolean
}

export interface ScheduleInput {
  group: GroupConfig
  members: MemberConfig[]
}

export interface DailyPortion {
  dayIndex: number // 1 to 7
  globalDayIndex: number // 1 to (weeksCount * 7)
  dateStr?: string // ISO 'YYYY-MM-DD'
  formattedDateAr?: string // e.g. "١ سبتمبر"
  formattedDateEn?: string // e.g. "Sep 1"
  dayNameAr?: string // e.g. "السبت"
  dayNameEn?: string // e.g. "Saturday"
  ramadanDay?: number // e.g. 1 to 30
  ramadanDayLabelAr?: string // e.g. "رمضان ١"
  ramadanDayLabelEn?: string // e.g. "Ramadan 1"
  startAyah: AyahRef
  endAyah: AyahRef
  startLocation?: QuranLocation
  endLocation?: QuranLocation
  totalAyahs: number
}

export interface MemberAssignment {
  memberId: string
  memberName: string
  memberPublicId?: string
  weeklyAmount: number
  startJuz: number
  endJuz: number
  startAyah: AyahRef
  endAyah: AyahRef
  startLocation?: QuranLocation
  endLocation?: QuranLocation
  dailyBreakdown?: DailyPortion[]
}

export interface WeekSchedule {
  weekNumber: number
  assignments: MemberAssignment[]
  totalJuz: number
  dateRange?: WeekDateRange
}

export interface GeneratedSchedule {
  id: string
  createdAt: string
  groupName: string
  title?: string
  description?: string
  weeksCount: number
  rotationStyle?: RotationStyle
  rangeType?: RangeType
  startJuz?: number
  customRange?: CustomQuranRange
  startDate?: string
  usesDates?: boolean
  occasionType?: OccasionType
  islamicYear?: number
  dailyDivisionEnabled?: boolean
  weekDateRanges?: WeekDateRange[]
  weeks: WeekSchedule[]
  members: MemberConfig[]
}

export interface SchedulerValidationError {
  code: string
  messageAr: string
  messageEn: string
  field?: string
}

export interface SchedulerValidationResult {
  isValid: boolean
  errors: SchedulerValidationError[]
}
