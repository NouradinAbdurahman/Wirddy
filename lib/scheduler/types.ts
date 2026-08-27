import { AyahRef } from "../quran/resolver"
import { QuranLocation } from "../quran/types"

export type KnowledgeType = "entire" | "juz_range" | "surah_range"
export type RotationStyle = "large" | "medium" | "small" | "random"
export type RangeType = "full" | "custom"

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
  knowledgeType: KnowledgeType
  startJuz: number // 1-30
  endJuz: number // 1-30
  startSurah?: number // 1-114
  endSurah?: number // 1-114
  weeklyAmount: number // e.g. 1, 2, 3, 5
}

export interface GroupConfig {
  name: string
  weeksCount: number
  rotationStyle?: RotationStyle
  rangeType?: RangeType
  startJuz?: number // Custom starting point (1 to 30)
  customRange?: CustomQuranRange
}

export interface ScheduleInput {
  group: GroupConfig
  members: MemberConfig[]
}

export interface MemberAssignment {
  memberId: string
  memberName: string
  weeklyAmount: number
  startJuz: number
  endJuz: number
  startAyah: AyahRef
  endAyah: AyahRef
  startLocation?: QuranLocation
  endLocation?: QuranLocation
}

export interface WeekSchedule {
  weekNumber: number
  assignments: MemberAssignment[]
  totalJuz: number
}

export interface GeneratedSchedule {
  id: string
  createdAt: string
  groupName: string
  weeksCount: number
  rotationStyle?: RotationStyle
  rangeType?: RangeType
  startJuz?: number
  customRange?: CustomQuranRange
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
