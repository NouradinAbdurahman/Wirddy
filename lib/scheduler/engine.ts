import { quranService } from "../quran/service"
import { locationToAyahRef, resolveJuzRange } from "../quran/resolver"
import {
  DailyPortion,
  GeneratedSchedule,
  MemberAssignment,
  MemberConfig,
  RotationStyle,
  ScheduleInput,
  WeekSchedule,
} from "./types"
import { validateScheduleInput } from "./validator"
import {
  addDaysToDate,
  calculateDailyDates,
  calculateWeekDateRanges,
  parseIsoDate,
} from "../dates/calendar"
import { formatRamadanDayLabel, getRamadanStartDate } from "../dates/ramadan"
import { QuranLocation } from "../quran/types"
import { generateMemberPublicId } from "../groups/crypto"

interface MemberState {
  member: MemberConfig
  index: number
  assignedHistory: Array<{ start: number; end: number }>
}

/**
 * Deterministic pseudo-random number generator (Mulberry32) for reproducible "random" rotation.
 */
function createSeededRandom(seed: number) {
  let state = seed | 0
  return function () {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Creates a numeric seed from a string.
 */
function hashStringToSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Calculates overlap between two closed intervals [a, b] and [c, d].
 */
function calculateOverlap(a: number, b: number, c: number, d: number): number {
  const overlap = Math.min(b, d) - Math.max(a, c) + 1
  return Math.max(0, overlap)
}

/**
 * Finds a valid member permutation that satisfies knowledge restrictions and rotation goals.
 */
function solveWeekPermutation(
  members: MemberState[],
  weekIndex: number,
  rotationStyle: RotationStyle,
  seed: number,
  startJuzOffset: number = 0
): MemberState[] | null {
  const n = members.length
  const used = new Array(n).fill(false)
  let bestPermutation: MemberState[] | null = null
  let bestScore = Infinity

  // Determine candidate search order based on rotation style
  let candidateIndices: number[] = []

  if (rotationStyle === "random") {
    const rng = createSeededRandom(seed + weekIndex * 1013)
    candidateIndices = Array.from({ length: n }, (_, i) => i)
    // Fisher-Yates shuffle with seeded RNG
    for (let i = candidateIndices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[candidateIndices[i], candidateIndices[j]] = [
        candidateIndices[j],
        candidateIndices[i],
      ]
    }
  } else if (rotationStyle === "large") {
    // Large jump: shift by half the member list plus week offset
    const stride = Math.max(1, Math.floor(n / 2))
    const offset = (weekIndex * stride) % n
    candidateIndices = Array.from({ length: n }, (_, i) => (i + offset) % n)
  } else if (rotationStyle === "small") {
    // Small shift: minimal progressive movement
    const offset = Math.floor(weekIndex / 2) % n
    candidateIndices = Array.from({ length: n }, (_, i) => (i + offset) % n)
  } else {
    // Medium (default): standard cyclic shift
    const offset = weekIndex % n
    candidateIndices = Array.from({ length: n }, (_, i) => (i + offset) % n)
  }

  function backtrack(
    currentPosition: number,
    currentPerm: MemberState[],
    currentScore: number
  ) {
    if (currentPosition === n) {
      if (currentScore < bestScore) {
        bestScore = currentScore
        bestPermutation = [...currentPerm]
      }
      return
    }

    if (currentScore >= bestScore) return

    // Calculate Juz range that this position will read
    let startNominal = 1
    for (let i = 0; i < currentPosition; i++) {
      startNominal += currentPerm[i].member.weeklyAmount
    }

    for (let i = 0; i < n; i++) {
      const candidateIdx = candidateIndices[i]
      if (used[candidateIdx]) continue

      const mState = members[candidateIdx]
      const endNominal = startNominal + mState.member.weeklyAmount - 1

      // Apply starting Juz offset
      const startJuz = ((startNominal - 1 + startJuzOffset) % 30) + 1
      const endJuz = ((endNominal - 1 + startJuzOffset) % 30) + 1

      // Check knowledge boundary constraint
      const k = mState.member
      let isKnowledgeSatisfied = true

      if (k.knowledgeType === "juz_range") {
        if (endJuz >= startJuz) {
          if (startJuz < k.startJuz || endJuz > k.endJuz) {
            isKnowledgeSatisfied = false
          }
        } else {
          // Wrapped range across 30 -> 1
          if (
            (startJuz < k.startJuz && startJuz > k.endJuz) ||
            (endJuz < k.startJuz && endJuz > k.endJuz)
          ) {
            isKnowledgeSatisfied = false
          }
        }
      }

      if (!isKnowledgeSatisfied) continue

      // Calculate repetition score against member history
      let repetitionCost = 0
      for (const past of mState.assignedHistory) {
        if (endJuz >= startJuz && past.end >= past.start) {
          const overlap = calculateOverlap(
            startJuz,
            endJuz,
            past.start,
            past.end
          )
          repetitionCost += overlap * 10
        }
      }

      used[candidateIdx] = true
      currentPerm.push(mState)

      backtrack(
        currentPosition + 1,
        currentPerm,
        currentScore + repetitionCost
      )

      currentPerm.pop()
      used[candidateIdx] = false

      if (bestScore === 0) return
    }
  }

  backtrack(0, [], 0)
  return bestPermutation
}

/**
 * Mathematically partitions an assignment's exact Ayah range across 7 days.
 * Guarantees:
 * - Day 1 starts at the exact weekly start Ayah.
 * - Day 7 ends at the exact weekly end Ayah.
 * - 0 gaps, 0 overlaps.
 * - Every single Ayah in the weekly range belongs to exactly one daily portion.
 */
function buildDailyBreakdown(
  startLoc: QuranLocation,
  endLoc: QuranLocation,
  weekNumber: number,
  startDateStr?: string,
  occasionType?: "normal" | "ramadan"
): DailyPortion[] {
  const portions: DailyPortion[] = []
  const startGlobal = startLoc.globalAyahNumber
  const endGlobal = endLoc.globalAyahNumber

  // Calculate total Ayahs (handling standard vs wrapped Quran ranges)
  const isWrapped = endGlobal < startGlobal
  const totalAyahs = isWrapped
    ? 6236 - startGlobal + 1 + endGlobal
    : endGlobal - startGlobal + 1

  const baseAyahsPerDay = Math.floor(totalAyahs / 7)
  const remainder = totalAyahs % 7

  let currentGlobal = startGlobal
  const weekStartIso = startDateStr
    ? addDaysToDate(startDateStr, (weekNumber - 1) * 7)
    : undefined

  const dailyDates = weekStartIso ? calculateDailyDates(weekStartIso) : []

  for (let d = 1; d <= 7; d++) {
    const dayCount = baseAyahsPerDay + (d <= remainder ? 1 : 0)
    const dayStartGlobal = currentGlobal
    let dayEndGlobal: number

    if (!isWrapped) {
      dayEndGlobal = Math.min(endGlobal, dayStartGlobal + dayCount - 1)
      currentGlobal = dayEndGlobal + 1
    } else {
      if (dayStartGlobal + dayCount - 1 <= 6236) {
        dayEndGlobal = dayStartGlobal + dayCount - 1
        currentGlobal = (dayEndGlobal % 6236) + 1
      } else {
        dayEndGlobal = dayStartGlobal + dayCount - 1 - 6236
        currentGlobal = dayEndGlobal + 1
      }
    }

    const dayStartLoc = quranService.getLocationFromGlobalAyah(dayStartGlobal)
    const dayEndLoc = quranService.getLocationFromGlobalAyah(dayEndGlobal)

    const globalDayIndex = (weekNumber - 1) * 7 + d
    const dateInfo = dailyDates[d - 1]

    let ramadanDay: number | undefined
    let ramadanDayLabelAr: string | undefined
    let ramadanDayLabelEn: string | undefined

    if (occasionType === "ramadan") {
      ramadanDay = globalDayIndex
      ramadanDayLabelAr = formatRamadanDayLabel(globalDayIndex, "ar").title
      ramadanDayLabelEn = formatRamadanDayLabel(globalDayIndex, "en").title
    }

    portions.push({
      dayIndex: d,
      globalDayIndex,
      dateStr: dateInfo?.dateStr,
      formattedDateAr: dateInfo?.formattedAr,
      formattedDateEn: dateInfo?.formattedEn,
      dayNameAr: dateInfo?.dayNameAr,
      dayNameEn: dateInfo?.dayNameEn,
      ramadanDay,
      ramadanDayLabelAr,
      ramadanDayLabelEn,
      startAyah: locationToAyahRef(dayStartLoc),
      endAyah: locationToAyahRef(dayEndLoc),
      startLocation: dayStartLoc,
      endLocation: dayEndLoc,
      totalAyahs: dayCount,
    })
  }

  return portions
}

/**
 * Generates an optimal Quran reading schedule with full support for:
 * - Schedule Dates & Multi-week range calculations
 * - Ramadan Occasion Mode
 * - Mathematical Ayah-Exact Daily Division (7 days)
 * - Custom Quran Ranges
 * - Starting Juz Wrapping
 * - Multi-member rotation algorithms
 */
export function generateQuranSchedule(input: ScheduleInput): GeneratedSchedule {
  const validation = validateScheduleInput(input)
  if (!validation.isValid) {
    throw new Error(
      `Invalid schedule input: ${validation.errors.map((e) => e.messageEn).join(", ")}`
    )
  }

  const { group, members } = input
  const normalizedMembers: MemberConfig[] = members.map((m) => ({
    ...m,
    publicId:
      m.publicId ||
      generateMemberPublicId(`${group.name}_${m.id || m.name}`),
  }))

  const weeksCount = Math.max(1, Math.min(52, group.weeksCount || 1))
  const rotationStyle: RotationStyle = group.rotationStyle || "medium"
  const rangeType = group.rangeType || "full"
  const startJuzSetting = group.startJuz || 1
  const startJuzOffset = (startJuzSetting - 1) % 30
  const dailyDivisionEnabled = !!group.dailyDivisionEnabled
  const occasionType = group.occasionType || "normal"
  const islamicYear = group.islamicYear

  // Resolve effective start date
  let effectiveStartDate = group.startDate
  if (occasionType === "ramadan" && !effectiveStartDate) {
    const year = islamicYear || 1448
    effectiveStartDate = getRamadanStartDate(year)
  }

  const usesDates = !!group.usesDates || occasionType === "ramadan"

  // Precompute week date ranges if dates are enabled
  const weekDateRanges =
    usesDates && effectiveStartDate
      ? calculateWeekDateRanges(effectiveStartDate, weeksCount)
      : undefined

  const seed = hashStringToSeed(group.name + normalizedMembers.map((m) => m.name).join("-"))

  // -------------------------------------------------------------
  // 1. CUSTOM QURAN RANGE SCHEDULER
  // -------------------------------------------------------------
  if (rangeType === "custom" && group.customRange) {
    const cRange = group.customRange
    const startGlobal = quranService.getGlobalAyahNumber(
      cRange.startSurah,
      cRange.startAyah
    )
    const endGlobal = quranService.getGlobalAyahNumber(
      cRange.endSurah,
      cRange.endAyah
    )

    const startLoc = quranService.getLocationFromGlobalAyah(startGlobal)
    const endLoc = quranService.getLocationFromGlobalAyah(endGlobal)
    const totalRangeAyahs = endGlobal - startGlobal + 1
    const totalWeeklyAmount = normalizedMembers.reduce((s, m) => s + m.weeklyAmount, 0)

    const memberStates: MemberState[] = normalizedMembers.map((m, i) => ({
      member: m,
      index: i,
      assignedHistory: [],
    }))

    const weeks: WeekSchedule[] = []

    for (let weekNum = 1; weekNum <= weeksCount; weekNum++) {
      let shiftedMembers = [...memberStates]
      if (rotationStyle === "random") {
        const rng = createSeededRandom(seed + weekNum * 1013)
        for (let i = shiftedMembers.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1))
          ;[shiftedMembers[i], shiftedMembers[j]] = [
            shiftedMembers[j],
            shiftedMembers[i],
          ]
        }
      } else {
        const shift =
          rotationStyle === "large"
            ? (weekNum - 1) * Math.max(1, Math.floor(members.length / 2))
            : rotationStyle === "small"
              ? Math.floor((weekNum - 1) / 2)
              : weekNum - 1
        const offset = shift % members.length
        for (let i = 0; i < offset; i++) {
          const first = shiftedMembers.shift()
          if (first) shiftedMembers.push(first)
        }
      }

      const assignments: MemberAssignment[] = []
      let currentGlobalAyah = startLoc.globalAyahNumber

      for (let i = 0; i < shiftedMembers.length; i++) {
        const mState = shiftedMembers[i]
        const proportion = mState.member.weeklyAmount / totalWeeklyAmount
        const memberAyahCount =
          i === shiftedMembers.length - 1
            ? endLoc.globalAyahNumber - currentGlobalAyah + 1
            : Math.max(1, Math.round(proportion * totalRangeAyahs))

        const assignStartGlobal = currentGlobalAyah
        const assignEndGlobal = Math.min(
          endLoc.globalAyahNumber,
          assignStartGlobal + memberAyahCount - 1
        )

        const aStartLoc =
          quranService.getLocationFromGlobalAyah(assignStartGlobal)
        const aEndLoc = quranService.getLocationFromGlobalAyah(assignEndGlobal)

        const dailyBreakdown = dailyDivisionEnabled
          ? buildDailyBreakdown(
              aStartLoc,
              aEndLoc,
              weekNum,
              effectiveStartDate,
              occasionType
            )
          : undefined

        assignments.push({
          memberId: mState.member.id,
          memberName: mState.member.name,
          memberPublicId: mState.member.publicId,
          weeklyAmount: mState.member.weeklyAmount,
          startJuz: aStartLoc.juzNumber,
          endJuz: aEndLoc.juzNumber,
          startAyah: locationToAyahRef(aStartLoc),
          endAyah: locationToAyahRef(aEndLoc),
          startLocation: aStartLoc,
          endLocation: aEndLoc,
          dailyBreakdown,
        })

        mState.assignedHistory.push({
          start: aStartLoc.juzNumber,
          end: aEndLoc.juzNumber,
        })

        currentGlobalAyah = assignEndGlobal + 1
      }

      weeks.push({
        weekNumber: weekNum,
        totalJuz: 30,
        assignments,
        dateRange: weekDateRanges ? weekDateRanges[weekNum - 1] : undefined,
      })
    }

    return {
      id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      groupName: group.name,
      title: group.title,
      description: group.description,
      weeksCount,
      rotationStyle,
      rangeType,
      startJuz: startJuzSetting,
      customRange: group.customRange,
      startDate: effectiveStartDate,
      usesDates,
      occasionType,
      islamicYear,
      dailyDivisionEnabled,
      weekDateRanges,
      weeks,
      members,
    }
  }

  // -------------------------------------------------------------
  // 2. FULL 30 JUZ QURAN SCHEDULER
  // -------------------------------------------------------------
  const memberStates: MemberState[] = normalizedMembers.map((m, i) => ({
    member: m,
    index: i,
    assignedHistory: [],
  }))

  const weeks: WeekSchedule[] = []

  for (let weekNum = 1; weekNum <= weeksCount; weekNum++) {
    const permutation = solveWeekPermutation(
      memberStates,
      weekNum - 1,
      rotationStyle,
      seed,
      startJuzOffset
    )

    if (!permutation) {
      throw new Error(
        `Unable to generate a valid partition for Week ${weekNum} respecting knowledge constraints. Please adjust member ranges or amounts.`
      )
    }

    let currentNominalJuz = 1
    const assignments: MemberAssignment[] = []

    for (const mState of permutation) {
      const nominalStart = currentNominalJuz
      const nominalEnd = nominalStart + mState.member.weeklyAmount - 1

      // Apply startJuz offset
      const startJuz = ((nominalStart - 1 + startJuzOffset) % 30) + 1
      const endJuz = ((nominalEnd - 1 + startJuzOffset) % 30) + 1

      // If endJuz >= startJuz, standard continuous range
      // If endJuz < startJuz (wrapped around 30 -> 1), resolve combined exact range
      let exactRange
      if (endJuz >= startJuz) {
        exactRange = resolveJuzRange(startJuz, endJuz)
      } else {
        // Wrapped range: e.g. startJuz=28, endJuz=2 (5 Juz: 28, 29, 30, 1, 2)
        const part1 = resolveJuzRange(startJuz, 30)
        const part2 = resolveJuzRange(1, endJuz)
        exactRange = {
          startJuz,
          endJuz,
          startAyah: part1.startAyah,
          endAyah: part2.endAyah,
          startLocation: part1.startLocation,
          endLocation: part2.endLocation,
          totalJuz: mState.member.weeklyAmount,
        }
      }

      const dailyBreakdown = dailyDivisionEnabled
        ? buildDailyBreakdown(
            exactRange.startLocation,
            exactRange.endLocation,
            weekNum,
            effectiveStartDate,
            occasionType
          )
        : undefined

      assignments.push({
        memberId: mState.member.id,
        memberName: mState.member.name,
        memberPublicId: mState.member.publicId,
        weeklyAmount: mState.member.weeklyAmount,
        startJuz,
        endJuz,
        startAyah: exactRange.startAyah,
        endAyah: exactRange.endAyah,
        startLocation: exactRange.startLocation,
        endLocation: exactRange.endLocation,
        dailyBreakdown,
      })

      mState.assignedHistory.push({
        start: startJuz,
        end: endJuz,
      })

      currentNominalJuz = nominalEnd + 1
    }

    weeks.push({
      weekNumber: weekNum,
      totalJuz: 30,
      assignments,
      dateRange: weekDateRanges ? weekDateRanges[weekNum - 1] : undefined,
    })
  }

  return {
    id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    groupName: group.name,
    title: group.title,
    description: group.description,
    weeksCount,
    rotationStyle,
    rangeType,
    startJuz: startJuzSetting,
    customRange: group.customRange,
    startDate: effectiveStartDate,
    usesDates,
    occasionType,
    islamicYear,
    dailyDivisionEnabled,
    weekDateRanges,
    weeks,
    members: normalizedMembers,
  }
}
