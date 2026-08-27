import { quranService } from "../quran/service"
import { locationToAyahRef, resolveJuzRange } from "../quran/resolver"
import {
  GeneratedSchedule,
  MemberAssignment,
  MemberConfig,
  RotationStyle,
  ScheduleInput,
  WeekSchedule,
} from "./types"
import { validateScheduleInput } from "./validator"

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
    if (currentPerm.length === n) {
      if (currentPosition === 31) {
        if (currentScore < bestScore) {
          bestScore = currentScore
          bestPermutation = [...currentPerm]
        }
      }
      return
    }

    if (currentScore >= bestScore) {
      return
    }

    for (const idx of candidateIndices) {
      if (used[idx]) continue

      const m = members[idx]
      const startJuz = currentPosition
      const endJuz = startJuz + m.member.weeklyAmount - 1

      if (endJuz > 30) continue

      // Map nominal position to actual Quran Juz position with startJuzOffset
      const actualStart = ((startJuz - 1 + startJuzOffset) % 30) + 1
      const actualEnd = ((endJuz - 1 + startJuzOffset) % 30) + 1

      // Check knowledge constraint
      // If the member's range is restricted, check compatibility
      if (m.member.knowledgeType !== "entire") {
        if (actualStart < m.member.startJuz || actualEnd > m.member.endJuz) {
          // If range wraps around or exceeds bounds, reject
          continue
        }
      }

      // Calculate repetition penalty with previous weeks
      let penalty = 0
      for (let prevWeek = 0; prevWeek < m.assignedHistory.length; prevWeek++) {
        const prev = m.assignedHistory[prevWeek]
        const overlap = calculateOverlap(
          actualStart,
          actualEnd,
          prev.start,
          prev.end
        )
        const recencyWeight = Math.pow(3, prevWeek)
        penalty += overlap * recencyWeight
      }

      used[idx] = true
      currentPerm.push(m)
      backtrack(endJuz + 1, currentPerm, currentScore + penalty)
      currentPerm.pop()
      used[idx] = false

      if (bestScore === 0) {
        return
      }
    }
  }

  backtrack(1, [], 0)
  return bestPermutation
}

/**
 * Pure scheduling engine that generates a multi-week rotating Quran schedule.
 */
export function generateQuranSchedule(input: ScheduleInput): GeneratedSchedule {
  const inputValidation = validateScheduleInput(input)
  if (!inputValidation.isValid) {
    const firstError = inputValidation.errors[0]
    throw new Error(firstError.messageEn || "Invalid schedule input")
  }

  const { group, members } = input
  const weeksCount = group.weeksCount
  const rotationStyle: RotationStyle = group.rotationStyle || "medium"
  const rangeType = group.rangeType || "full"
  const startJuzSetting = group.startJuz
    ? Math.max(1, Math.min(30, group.startJuz))
    : 1
  const startJuzOffset = startJuzSetting - 1
  const seed = hashStringToSeed(group.name + "_wirddy_" + weeksCount)

  // -------------------------------------------------------------
  // 1. CUSTOM QURAN RANGE SCHEDULER
  // -------------------------------------------------------------
  if (rangeType === "custom" && group.customRange) {
    const { startSurah, startAyah, endSurah, endAyah } = group.customRange
    const startLoc = quranService.getLocationFromSurahAyah(
      startSurah,
      startAyah
    )
    const endLoc = quranService.getLocationFromSurahAyah(endSurah, endAyah)

    const totalRangeAyahs =
      endLoc.globalAyahNumber - startLoc.globalAyahNumber + 1
    const totalWeeklyAmount = members.reduce(
      (sum, m) => sum + (m.weeklyAmount || 0),
      0
    )

    const memberStates: MemberState[] = members.map((m, i) => ({
      member: m,
      index: i,
      assignedHistory: [],
    }))

    const weeks: WeekSchedule[] = []

    for (let weekNum = 1; weekNum <= weeksCount; weekNum++) {
      // Rotate order of members
      const shiftedMembers = [...memberStates]
      if (rotationStyle === "random") {
        const rng = createSeededRandom(seed + weekNum * 7919)
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

        assignments.push({
          memberId: mState.member.id,
          memberName: mState.member.name,
          weeklyAmount: mState.member.weeklyAmount,
          startJuz: aStartLoc.juzNumber,
          endJuz: aEndLoc.juzNumber,
          startAyah: locationToAyahRef(aStartLoc),
          endAyah: locationToAyahRef(aEndLoc),
          startLocation: aStartLoc,
          endLocation: aEndLoc,
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
      })
    }

    return {
      id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      groupName: group.name,
      weeksCount,
      rotationStyle,
      rangeType,
      startJuz: startJuzSetting,
      customRange: group.customRange,
      weeks,
      members,
    }
  }

  // -------------------------------------------------------------
  // 2. FULL 30 JUZ QURAN SCHEDULER
  // -------------------------------------------------------------
  const memberStates: MemberState[] = members.map((m, i) => ({
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

      assignments.push({
        memberId: mState.member.id,
        memberName: mState.member.name,
        weeklyAmount: mState.member.weeklyAmount,
        startJuz,
        endJuz,
        startAyah: exactRange.startAyah,
        endAyah: exactRange.endAyah,
        startLocation: exactRange.startLocation,
        endLocation: exactRange.endLocation,
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
    })
  }

  return {
    id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    groupName: group.name,
    weeksCount,
    rotationStyle,
    rangeType,
    startJuz: startJuzSetting,
    customRange: group.customRange,
    weeks,
    members,
  }
}
