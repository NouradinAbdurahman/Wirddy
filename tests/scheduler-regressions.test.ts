import { describe, expect, it } from "vitest"
import { generateQuranSchedule, SchedulerError } from "../lib/scheduler/engine"
import { validateScheduleInput } from "../lib/scheduler/validator"
import { MemberConfig, ScheduleInput } from "../lib/scheduler/types"
import { quranService } from "../lib/quran/service"
import { resolveSurahToKnownJuzRange } from "../lib/quran/resolver"

function member(
  id: string,
  weeklyAmount: number,
  startJuz = 1,
  endJuz = 30,
  extra: Partial<MemberConfig> = {}
): MemberConfig {
  return {
    id,
    name: id,
    knowledgeType: startJuz === 1 && endJuz === 30 ? "entire" : "juz_range",
    startJuz,
    endJuz,
    weeklyAmount,
    ...extra,
  }
}

/** Expands an assignment's Juz span, following the 30 -> 1 wrap. */
function juzList(startJuz: number, endJuz: number): number[] {
  const out: number[] = []
  let j = startJuz
  for (;;) {
    out.push(j)
    if (j === endJuz) break
    j = (j % 30) + 1
  }
  return out
}

function globalOf(ref: { surahNumber: number; ayahNumber: number }) {
  return quranService.getGlobalAyahNumber(ref.surahNumber, ref.ayahNumber)
}

describe("knowledge bounds in full Quran mode", () => {
  it("never assigns a wrapped range (28 -> 2) to a member who knows only Juz 1-15", () => {
    const input: ScheduleInput = {
      group: { name: "Wrap", weeksCount: 6, startJuz: 28 },
      members: [member("A", 5, 1, 15), member("B", 13), member("C", 12)],
    }
    const schedule = generateQuranSchedule(input)
    for (const week of schedule.weeks) {
      const a = week.assignments.find((x) => x.memberId === "A")!
      for (const j of juzList(a.startJuz, a.endJuz)) {
        expect(j).toBeGreaterThanOrEqual(1)
        expect(j).toBeLessThanOrEqual(15)
      }
    }
  })

  it("enforces surah_range knowledge (Juz 'Amma only)", () => {
    const input: ScheduleInput = {
      group: { name: "Kids", weeksCount: 4 },
      members: [
        member("Kid", 1, 1, 30, {
          knowledgeType: "surah_range",
          startSurah: 78,
          endSurah: 114,
        }),
        member("Adult", 29),
      ],
    }
    const schedule = generateQuranSchedule(input)
    for (const week of schedule.weeks) {
      const kid = week.assignments.find((x) => x.memberId === "Kid")!
      expect(kid.startJuz).toBe(30)
      expect(kid.endJuz).toBe(30)
    }
  })

  it("maps known surahs only to Juz that are fully covered", () => {
    // Surahs 18-20: Juz 15 starts at Al-Isra (17:1), so only Juz 16 is fully known.
    expect(resolveSurahToKnownJuzRange(18, 20)).toEqual({
      startJuz: 16,
      endJuz: 16,
    })
    expect(resolveSurahToKnownJuzRange(78, 114)).toEqual({
      startJuz: 30,
      endJuz: 30,
    })
    expect(resolveSurahToKnownJuzRange(18, 18)).toBeNull()
  })

  it("rejects a surah_range member whose surahs do not cover a whole Juz", () => {
    const result = validateScheduleInput({
      group: { name: "G", weeksCount: 1 },
      members: [
        member("A", 1, 1, 30, {
          knowledgeType: "surah_range",
          startSurah: 18,
          endSurah: 18,
        }),
        member("B", 29),
      ],
    })
    expect(result.isValid).toBe(false)
  })

  it("fails fast with a bilingual error when no valid split exists", () => {
    const input: ScheduleInput = {
      group: { name: "Impossible", weeksCount: 1 },
      members: Array.from({ length: 10 }, (_, i) => member(`M${i}`, 3, 1, 15)),
    }
    let caught: unknown
    const started = Date.now()
    try {
      generateQuranSchedule(input)
    } catch (e) {
      caught = e
    }
    expect(Date.now() - started).toBeLessThan(2000)
    expect(caught).toBeInstanceOf(SchedulerError)
    expect((caught as SchedulerError).messageAr).toMatch(/[؀-ۿ]/)
    expect((caught as SchedulerError).messageEn.length).toBeGreaterThan(0)
  })

  it("fails fast when every Juz is covered but no split works", () => {
    // A and B both know only Juz 1-10, so they cannot both fit.
    const members = [
      member("A", 10, 1, 10),
      member("B", 10, 1, 10),
      member("C", 10),
    ]
    expect(validateScheduleInput({ group: { name: "G", weeksCount: 1 }, members }).isValid).toBe(true)
    let caught: unknown
    try {
      generateQuranSchedule({ group: { name: "G", weeksCount: 1 }, members })
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(SchedulerError)
    expect((caught as SchedulerError).code).toBe("NO_VALID_SPLIT")
  })
})

describe("generation speed", () => {
  it("handles 15 members with mixed knowledge on random rotation quickly", () => {
    const members = Array.from({ length: 15 }, (_, i) =>
      member(`M${i}`, 2, 1, i < 7 ? 16 : 30)
    )
    for (const rotationStyle of ["random", "medium", "large", "small"] as const) {
      const started = Date.now()
      const schedule = generateQuranSchedule({
        group: { name: "Big", weeksCount: 12, rotationStyle },
        members,
      })
      expect(Date.now() - started).toBeLessThan(3000)
      for (const week of schedule.weeks) {
        expect(week.assignments.reduce((s, a) => s + a.weeklyAmount, 0)).toBe(30)
        for (const a of week.assignments) {
          const m = members.find((x) => x.id === a.memberId)!
          for (const j of juzList(a.startJuz, a.endJuz)) {
            expect(j).toBeGreaterThanOrEqual(m.startJuz)
            expect(j).toBeLessThanOrEqual(m.endJuz)
          }
        }
      }
    }
  })

  it("generates 52 weeks for 30 one-Juz members quickly", () => {
    const started = Date.now()
    generateQuranSchedule({
      group: { name: "Masjid", weeksCount: 52, rotationStyle: "random" },
      members: Array.from({ length: 30 }, (_, i) => member(`M${i}`, 1)),
    })
    expect(Date.now() - started).toBeLessThan(3000)
  })

  it("rotates every member through new Juz before repeating", () => {
    const schedule = generateQuranSchedule({
      group: { name: "Trio", weeksCount: 3 },
      members: [member("A", 10), member("B", 10), member("C", 10)],
    })
    for (const id of ["A", "B", "C"]) {
      const starts = schedule.weeks.map(
        (w) => w.assignments.find((a) => a.memberId === id)!.startJuz
      )
      expect(new Set(starts).size).toBe(3)
    }
  })
})

describe("custom Quran range mode", () => {
  const range = (
    startSurah: number,
    startAyah: number,
    endSurah: number,
    endAyah: number
  ) => ({ startSurah, startAyah, endSurah, endAyah })

  it("rejects a backwards range", () => {
    const result = validateScheduleInput({
      group: {
        name: "G",
        weeksCount: 1,
        rangeType: "custom",
        customRange: range(5, 1, 2, 10),
      },
      members: [member("A", 1)],
    })
    expect(result.isValid).toBe(false)
  })

  it("rejects an ayah number past the end of the surah", () => {
    const result = validateScheduleInput({
      group: {
        name: "G",
        weeksCount: 1,
        rangeType: "custom",
        customRange: range(2, 1, 2, 999),
      },
      members: [member("A", 1)],
    })
    expect(result.isValid).toBe(false)
  })

  it("rejects a range smaller than one ayah per member", () => {
    const result = validateScheduleInput({
      group: {
        name: "G",
        weeksCount: 1,
        rangeType: "custom",
        customRange: range(1, 1, 1, 3),
      },
      members: [member("A", 1), member("B", 1), member("C", 1), member("D", 1)],
    })
    expect(result.isValid).toBe(false)
  })

  it("rejects daily division when a member would get fewer than 7 ayahs", () => {
    const result = validateScheduleInput({
      group: {
        name: "G",
        weeksCount: 1,
        rangeType: "custom",
        dailyDivisionEnabled: true,
        customRange: range(1, 1, 1, 7),
      },
      members: [member("A", 1), member("B", 1)],
    })
    expect(result.isValid).toBe(false)
  })

  it("splits the range with no gaps, overlaps, or reversed portions", () => {
    const customRange = range(2, 1, 2, 286)
    const schedule = generateQuranSchedule({
      group: {
        name: "Baqarah",
        weeksCount: 4,
        rangeType: "custom",
        dailyDivisionEnabled: true,
        customRange,
      },
      members: [member("A", 3), member("B", 2), member("C", 1)],
    })
    const first = quranService.getGlobalAyahNumber(2, 1)
    const last = quranService.getGlobalAyahNumber(2, 286)
    for (const week of schedule.weeks) {
      let cursor = first
      for (const a of week.assignments) {
        const s = globalOf(a.startAyah)
        const e = globalOf(a.endAyah)
        expect(s).toBe(cursor)
        expect(e).toBeGreaterThanOrEqual(s)
        let dayCursor = s
        for (const d of a.dailyBreakdown!) {
          expect(d.totalAyahs).toBeGreaterThan(0)
          expect(globalOf(d.startAyah)).toBe(dayCursor)
          dayCursor = globalOf(d.endAyah) + 1
        }
        expect(dayCursor).toBe(e + 1)
        cursor = e + 1
      }
      expect(cursor).toBe(last + 1)
    }
  })

  it("keeps each member inside their known Juz", () => {
    // Range covers Juz 29 and 30. The child knows only Juz 30.
    const schedule = generateQuranSchedule({
      group: {
        name: "Mulk to Nas",
        weeksCount: 4,
        rangeType: "custom",
        customRange: range(67, 1, 114, 6),
      },
      members: [member("Child", 1, 30, 30), member("Parent", 1)],
    })
    const juz30Start = quranService.getGlobalAyahNumber(78, 1)
    for (const week of schedule.weeks) {
      const child = week.assignments.find((a) => a.memberId === "Child")!
      expect(globalOf(child.startAyah)).toBeGreaterThanOrEqual(juz30Start)
    }
  })

  it("gives every member a public ID", () => {
    const schedule = generateQuranSchedule({
      group: {
        name: "G",
        weeksCount: 1,
        rangeType: "custom",
        customRange: range(2, 1, 2, 286),
      },
      members: [member("A", 1), member("B", 1)],
    })
    for (const m of schedule.members) {
      expect(m.publicId).toMatch(/^m_/)
    }
    for (const a of schedule.weeks[0].assignments) {
      expect(a.memberPublicId).toMatch(/^m_/)
    }
  })
})

describe("Ramadan length", () => {
  it("warns when a Ramadan plan runs past 30 days", () => {
    const result = validateScheduleInput({
      group: {
        name: "R",
        weeksCount: 5,
        occasionType: "ramadan",
        islamicYear: 1448,
      },
      members: [member("A", 30)],
    })
    expect(result.isValid).toBe(true)
    expect(result.warnings?.some((w) => w.code === "RAMADAN_EXCEEDS_MONTH")).toBe(
      true
    )
  })
})
