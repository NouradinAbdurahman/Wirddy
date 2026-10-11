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
import { addDaysToDate, calculateDailyDates, calculateWeekDateRanges } from "../dates/calendar"
import { formatRamadanDayLabel, getRamadanStartDate } from "../dates/ramadan"
import { QuranLocation } from "../quran/types"
import { generateMemberPublicId } from "../groups/crypto"
import { getKnownAyahInterval, TOTAL_AYAHS } from "./knowledge"

/**
 * Error thrown when a schedule cannot be generated. Carries both languages so
 * the UI can show the message in the reader's language.
 */
export class SchedulerError extends Error {
  readonly code: string
  readonly messageAr: string
  readonly messageEn: string

  constructor(code: string, messageEn: string, messageAr: string) {
    super(messageEn)
    this.name = "SchedulerError"
    this.code = code
    this.messageEn = messageEn
    this.messageAr = messageAr
  }
}

/** Search nodes spent improving a week's rotation once a valid split exists. */
const OPTIMIZE_NODE_BUDGET = 2000
/** Hard ceiling on search nodes per week, so generation always finishes. */
const HARD_NODE_LIMIT = 400000

interface HistoryEntry {
  start: number
  end: number
  week: number
}

interface SolverMember {
  member: MemberConfig
  /** Units this member reads each week. */
  size: number
  /** knownPrefix[p] = number of known units in [0, p). */
  knownPrefix: Int32Array
  /** Members with the same type are interchangeable for feasibility. */
  typeId: number
  history: HistoryEntry[]
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
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Member order used to break ties between equally good assignments. This is
 * what makes the rotation styles differ when history does not decide.
 */
function rotationOrder(
  n: number,
  weekIndex: number,
  rotationStyle: RotationStyle,
  seed: number
): number[] {
  const order = Array.from({ length: n }, (_, i) => i)
  if (rotationStyle === "random") {
    const rng = createSeededRandom(seed + weekIndex * 1013)
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    return order
  }
  const offset =
    rotationStyle === "large"
      ? (weekIndex * Math.max(1, Math.floor(n / 2))) % n
      : rotationStyle === "small"
        ? Math.floor(weekIndex / 2) % n
        : weekIndex % n
  return order.map((i) => (i + offset) % n)
}

/**
 * Builds a prefix sum of repetition cost per unit for one member. Repeating a
 * recent portion costs more than repeating an old one, so members cycle
 * through the whole range before reading the same part again.
 */
function buildCostPrefix(m: SolverMember, totalUnits: number, weekIndex: number): Float64Array {
  const diff = new Float64Array(totalUnits + 1)
  for (const h of m.history) {
    const weight = 1 / (weekIndex - h.week)
    diff[h.start] += weight
    diff[h.end + 1] -= weight
  }
  const prefix = new Float64Array(totalUnits + 1)
  let running = 0
  for (let u = 0; u < totalUnits; u++) {
    running += diff[u]
    prefix[u + 1] = prefix[u] + running
  }
  return prefix
}

function isBlockKnown(m: SolverMember, start: number): boolean {
  return m.knownPrefix[start + m.size] - m.knownPrefix[start] === m.size
}

/**
 * Orders members into consecutive blocks that cover units 0..totalUnits-1,
 * with every block inside its member's known range. Returns member indices
 * in reading order, or null when no valid order exists.
 *
 * The search is depth-first, trying the cheapest candidate first. Dead ends
 * are remembered by the multiset of remaining member types, which keeps the
 * hunt for a first valid order small even for 30 members. After a valid
 * order is found, a fixed node budget is spent looking for a cheaper one.
 */
function solveWeek(
  members: SolverMember[],
  totalUnits: number,
  order: number[],
  weekIndex: number
): number[] | null {
  const n = members.length
  const typeCount = members.reduce((mx, m) => Math.max(mx, m.typeId + 1), 0)
  const remainingByType = new Array<number>(typeCount).fill(0)
  for (const m of members) remainingByType[m.typeId]++

  const used = new Array<boolean>(n).fill(false)
  const perm: number[] = []
  const deadEnds = new Set<string>()
  let best: number[] | null = null
  let bestCost = Infinity
  let nodes = 0
  const costPrefix = members.map((m) => buildCostPrefix(m, totalUnits, weekIndex))

  // Result codes: 1 = reached a full split, 0 = proven impossible, -1 = cut short.
  function dfs(position: number, cost: number): number {
    if (position === totalUnits) {
      if (cost < bestCost) {
        bestCost = cost
        best = perm.slice()
      }
      return 1
    }

    const key = remainingByType.join(",")
    if (deadEnds.has(key)) return 0

    nodes++
    if (best && nodes > OPTIMIZE_NODE_BUDGET) return -1
    if (nodes > HARD_NODE_LIMIT) return -1

    const candidates: Array<{ idx: number; inc: number; rank: number }> = []
    const feasibleType = new Map<number, boolean>()
    for (let r = 0; r < n; r++) {
      const idx = order[r]
      if (used[idx]) continue
      const m = members[idx]
      if (position + m.size > totalUnits) continue
      let ok = feasibleType.get(m.typeId)
      if (ok === undefined) {
        ok = isBlockKnown(m, position)
        feasibleType.set(m.typeId, ok)
      }
      if (!ok) continue
      const inc = costPrefix[idx][position + m.size] - costPrefix[idx][position]
      candidates.push({ idx, inc, rank: r })
    }

    if (candidates.length === 0) {
      deadEnds.add(key)
      return 0
    }

    candidates.sort((a, b) => a.inc - b.inc || a.rank - b.rank)

    let found = false
    let cut = false
    for (const c of candidates) {
      if (cost + c.inc >= bestCost) {
        cut = true
        continue
      }
      const m = members[c.idx]
      used[c.idx] = true
      perm.push(c.idx)
      remainingByType[m.typeId]--
      const result = dfs(position + m.size, cost + c.inc)
      remainingByType[m.typeId]++
      perm.pop()
      used[c.idx] = false

      if (result === 1) found = true
      else if (result === -1) cut = true

      if (bestCost === 0) return 1
      if (best && nodes > OPTIMIZE_NODE_BUDGET) return found ? 1 : -1
      if (nodes > HARD_NODE_LIMIT) return found ? 1 : -1
    }

    if (!found && !cut) deadEnds.add(key)
    return found ? 1 : cut ? -1 : 0
  }

  dfs(0, 0)
  return best
}

/**
 * Splits `totalUnits` across members in proportion to their weekly amount,
 * giving each member at least `minUnits`. Uses largest remainders so the
 * sizes always add up exactly.
 */
function allocateUnits(weights: number[], totalUnits: number, minUnits: number): number[] {
  const n = weights.length
  const sizes = new Array<number>(n).fill(minUnits)
  const spare = totalUnits - minUnits * n
  const totalWeight = weights.reduce((s, w) => s + w, 0)
  const exact = weights.map((w) => (w / totalWeight) * spare)
  let given = 0
  exact.forEach((x, i) => {
    sizes[i] += Math.floor(x)
    given += Math.floor(x)
  })
  const byRemainder = exact
    .map((x, i) => ({ i, r: x - Math.floor(x) }))
    .sort((a, b) => b.r - a.r || a.i - b.i)
  for (let k = 0; k < spare - given; k++) sizes[byRemainder[k % n].i]++
  return sizes
}

/**
 * Splits a member's weekly portion into 7 daily portions with no gaps or
 * overlaps. The portion may wrap from An-Nas back to Al-Fatiha.
 */
function buildDailyBreakdown(
  startGlobal: number,
  totalAyahs: number,
  weekNumber: number,
  startDateStr?: string,
  occasionType?: "normal" | "ramadan"
): DailyPortion[] {
  const portions: DailyPortion[] = []
  const days = Math.min(7, totalAyahs)
  const base = Math.floor(totalAyahs / days)
  const remainder = totalAyahs % days

  const weekStartIso = startDateStr ? addDaysToDate(startDateStr, (weekNumber - 1) * 7) : undefined
  const dailyDates = weekStartIso ? calculateDailyDates(weekStartIso) : []

  let offset = 0
  for (let d = 1; d <= days; d++) {
    const count = base + (d <= remainder ? 1 : 0)
    const dayStart = ((startGlobal - 1 + offset) % TOTAL_AYAHS) + 1
    const dayEnd = ((startGlobal - 1 + offset + count - 1) % TOTAL_AYAHS) + 1
    offset += count

    const dayStartLoc = quranService.getLocationFromGlobalAyah(dayStart)
    const dayEndLoc = quranService.getLocationFromGlobalAyah(dayEnd)
    const globalDayIndex = (weekNumber - 1) * 7 + d
    const dateInfo = dailyDates[d - 1]

    portions.push({
      dayIndex: d,
      globalDayIndex,
      dateStr: dateInfo?.dateStr,
      formattedDateAr: dateInfo?.formattedAr,
      formattedDateEn: dateInfo?.formattedEn,
      dayNameAr: dateInfo?.dayNameAr,
      dayNameEn: dateInfo?.dayNameEn,
      ...(occasionType === "ramadan"
        ? {
            ramadanDay: globalDayIndex,
            ramadanDayLabelAr: formatRamadanDayLabel(globalDayIndex, "ar").title,
            ramadanDayLabelEn: formatRamadanDayLabel(globalDayIndex, "en").title,
          }
        : {}),
      startAyah: locationToAyahRef(dayStartLoc),
      endAyah: locationToAyahRef(dayEndLoc),
      startLocation: dayStartLoc,
      endLocation: dayEndLoc,
      totalAyahs: count,
    })
  }

  return portions
}

function noSplitError(weekNumber: number): SchedulerError {
  return new SchedulerError(
    "NO_VALID_SPLIT",
    `Unable to split week ${weekNumber} so that every member reads only what they know. Widen some members' known ranges or change their weekly amounts.`,
    `تعذر تقسيم الأسبوع ${weekNumber} بحيث يقرأ كل عضو ما يحفظه فقط. وسّع نطاق الحفظ لبعض الأعضاء أو غيّر مقدار قراءتهم الأسبوعي.`
  )
}

/**
 * Generates a Quran reading schedule.
 *
 * Full mode splits all 30 Juz each week, starting at `startJuz` and wrapping
 * from Juz 30 to Juz 1. Custom mode splits the chosen ayah range in
 * proportion to each member's weekly amount. In both modes every member
 * reads only inside their known range, and rotation avoids repeating the
 * portions a member read in recent weeks.
 */
export function generateQuranSchedule(input: ScheduleInput): GeneratedSchedule {
  const validation = validateScheduleInput(input)
  if (!validation.isValid) {
    const first = validation.errors[0]
    const err = new SchedulerError(
      first?.code || "INVALID_INPUT",
      `Invalid schedule input: ${validation.errors.map((e) => e.messageEn).join(", ")}`,
      validation.errors.map((e) => e.messageAr).join("، ")
    )
    throw err
  }

  const { group, members } = input
  const normalizedMembers: MemberConfig[] = members.map((m) => ({
    ...m,
    publicId: m.publicId || generateMemberPublicId(`${group.name}_${m.id || m.name}`),
  }))

  const weeksCount = Math.max(1, Math.min(52, group.weeksCount || 1))
  const rotationStyle: RotationStyle = group.rotationStyle || "medium"
  const rangeType = group.rangeType === "custom" && group.customRange ? "custom" : "full"
  const startJuzSetting = group.startJuz || 1
  const startJuzOffset = (startJuzSetting - 1) % 30
  const dailyDivisionEnabled = !!group.dailyDivisionEnabled
  const occasionType = group.occasionType || "normal"
  const islamicYear = group.islamicYear

  let effectiveStartDate = group.startDate
  if (occasionType === "ramadan" && !effectiveStartDate) {
    effectiveStartDate = getRamadanStartDate(islamicYear || 1448)
  }
  const usesDates = !!group.usesDates || occasionType === "ramadan"
  const weekDateRanges =
    usesDates && effectiveStartDate
      ? calculateWeekDateRanges(effectiveStartDate, weeksCount)
      : undefined

  const seed = hashStringToSeed(group.name + normalizedMembers.map((m) => m.name).join("-"))

  // Describe the reading line as units. Full mode: 30 Juz in reading order
  // from the starting Juz. Custom mode: the ayahs of the chosen range.
  let totalUnits: number
  let unitAyahSpan: (unit: number) => { start: number; end: number }
  let sizes: number[]
  let rangeStartGlobal = 1

  if (rangeType === "custom") {
    const cr = group.customRange!
    rangeStartGlobal = quranService.getGlobalAyahNumber(cr.startSurah, cr.startAyah)
    const rangeEndGlobal = quranService.getGlobalAyahNumber(cr.endSurah, cr.endAyah)
    totalUnits = rangeEndGlobal - rangeStartGlobal + 1
    unitAyahSpan = (u) => ({ start: rangeStartGlobal + u, end: rangeStartGlobal + u })
    sizes = allocateUnits(
      normalizedMembers.map((m) => m.weeklyAmount),
      totalUnits,
      dailyDivisionEnabled ? 7 : 1
    )
  } else {
    totalUnits = 30
    unitAyahSpan = (u) => {
      const b = quranService.getJuzBoundary(((u + startJuzOffset) % 30) + 1)
      return { start: b.start.globalAyahNumber, end: b.end.globalAyahNumber }
    }
    sizes = normalizedMembers.map((m) => m.weeklyAmount)
  }

  const typeIds = new Map<string, number>()
  const solverMembers: SolverMember[] = normalizedMembers.map((m, i) => {
    const known = getKnownAyahInterval(m)
    const knownPrefix = new Int32Array(totalUnits + 1)
    for (let u = 0; u < totalUnits; u++) {
      const span = unitAyahSpan(u)
      const ok = span.start >= known.start && span.end <= known.end
      knownPrefix[u + 1] = knownPrefix[u] + (ok ? 1 : 0)
    }
    const typeKey = `${sizes[i]}:${known.start}:${known.end}`
    if (!typeIds.has(typeKey)) typeIds.set(typeKey, typeIds.size)
    return {
      member: m,
      size: sizes[i],
      knownPrefix,
      typeId: typeIds.get(typeKey)!,
      history: [],
    }
  })

  const weeks: WeekSchedule[] = []

  for (let weekNum = 1; weekNum <= weeksCount; weekNum++) {
    const weekIndex = weekNum - 1
    const order = rotationOrder(solverMembers.length, weekIndex, rotationStyle, seed)
    const sequence = solveWeek(solverMembers, totalUnits, order, weekIndex)
    if (!sequence) throw noSplitError(weekNum)

    const assignments: MemberAssignment[] = []
    let position = 0

    for (const idx of sequence) {
      const sm = solverMembers[idx]
      const m = sm.member
      const blockStart = position
      const blockEnd = position + sm.size - 1
      position += sm.size
      sm.history.push({ start: blockStart, end: blockEnd, week: weekIndex })

      let startLoc: QuranLocation
      let endLoc: QuranLocation
      let startJuz: number
      let endJuz: number

      if (rangeType === "custom") {
        startLoc = quranService.getLocationFromGlobalAyah(rangeStartGlobal + blockStart)
        endLoc = quranService.getLocationFromGlobalAyah(rangeStartGlobal + blockEnd)
        startJuz = startLoc.juzNumber
        endJuz = endLoc.juzNumber
      } else {
        startJuz = ((blockStart + startJuzOffset) % 30) + 1
        endJuz = ((blockEnd + startJuzOffset) % 30) + 1
        if (endJuz >= startJuz) {
          const r = resolveJuzRange(startJuz, endJuz)
          startLoc = r.startLocation
          endLoc = r.endLocation
        } else {
          startLoc = resolveJuzRange(startJuz, 30).startLocation
          endLoc = resolveJuzRange(1, endJuz).endLocation
        }
      }

      const startGlobal = startLoc.globalAyahNumber
      const endGlobal = endLoc.globalAyahNumber
      const portionAyahs =
        endGlobal >= startGlobal
          ? endGlobal - startGlobal + 1
          : TOTAL_AYAHS - startGlobal + 1 + endGlobal

      assignments.push({
        memberId: m.id,
        memberName: m.name,
        memberPublicId: m.publicId,
        weeklyAmount: m.weeklyAmount,
        startJuz,
        endJuz,
        startAyah: locationToAyahRef(startLoc),
        endAyah: locationToAyahRef(endLoc),
        startLocation: startLoc,
        endLocation: endLoc,
        dailyBreakdown: dailyDivisionEnabled
          ? buildDailyBreakdown(
              startGlobal,
              portionAyahs,
              weekNum,
              effectiveStartDate,
              occasionType
            )
          : undefined,
      })
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
