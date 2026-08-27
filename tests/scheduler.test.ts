import { describe, expect, it } from "vitest"
import { generateQuranSchedule } from "../lib/scheduler/engine"
import { ScheduleInput } from "../lib/scheduler/types"
import {
  validateGeneratedSchedule,
  validateScheduleInput,
} from "../lib/scheduler/validator"
import {
  resolveCustomQuranRange,
  resolveJuzRange,
  resolveSurahToJuzRange,
} from "../lib/quran/resolver"

describe("Quran Resolver Tests", () => {
  it("resolves Juz 1 correctly", () => {
    const range = resolveJuzRange(1, 1)
    expect(range.startJuz).toBe(1)
    expect(range.endJuz).toBe(1)
    expect(range.startAyah.surahNameEn).toBe("Al-Faatiha")
    expect(range.startAyah.ayahNumber).toBe(1)
    expect(range.endAyah.surahNameEn).toBe("Al-Baqara")
    expect(range.endAyah.ayahNumber).toBe(141)
  })

  it("resolves Juz 1 to Juz 5 correctly (PRD example)", () => {
    const range = resolveJuzRange(1, 5)
    expect(range.startAyah.surahNameEn).toBe("Al-Faatiha")
    expect(range.startAyah.ayahNumber).toBe(1)
    expect(range.endAyah.surahNameEn).toBe("An-Nisaa")
    expect(range.endAyah.ayahNumber).toBe(147)
  })

  it("resolves Juz 30 correctly", () => {
    const range = resolveJuzRange(30, 30)
    expect(range.startAyah.surahNameEn).toBe("An-Naba")
    expect(range.startAyah.ayahNumber).toBe(1)
    expect(range.endAyah.surahNameEn).toBe("An-Naas")
    expect(range.endAyah.ayahNumber).toBe(6)
  })

  it("resolves Surah range Al-Ahqaf (46) to An-Nas (114)", () => {
    const juzRange = resolveSurahToJuzRange(46, 114)
    expect(juzRange.startJuz).toBe(26)
    expect(juzRange.endJuz).toBe(30)
  })

  it("resolves custom Quran location range correctly", () => {
    const custom = resolveCustomQuranRange(2, 1, 4, 147)
    expect(custom.startAyah.surahNumber).toBe(2)
    expect(custom.startAyah.ayahNumber).toBe(1)
    expect(custom.endAyah.surahNumber).toBe(4)
    expect(custom.endAyah.ayahNumber).toBe(147)
    expect(custom.totalAyahs).toBeGreaterThan(0)
  })
})

describe("Scheduler Input Validation Tests", () => {
  it("rejects empty group name", () => {
    const input: ScheduleInput = {
      group: { name: "", weeksCount: 4 },
      members: [
        {
          id: "1",
          name: "Ali",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 30,
        },
      ],
    }
    const result = validateScheduleInput(input)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.code === "EMPTY_GROUP_NAME")).toBe(true)
  })

  it("rejects total != 30 in full Quran mode", () => {
    const input: ScheduleInput = {
      group: { name: "Family", weeksCount: 4, rangeType: "full" },
      members: [
        {
          id: "1",
          name: "Ali",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 10,
        },
        {
          id: "2",
          name: "Omar",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 15,
        },
      ],
    }
    const result = validateScheduleInput(input)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.code === "TOTAL_NOT_30")).toBe(true)
  })

  it("rejects member weekly amount exceeding known range", () => {
    const input: ScheduleInput = {
      group: { name: "Quran Circle", weeksCount: 4 },
      members: [
        {
          id: "1",
          name: "Asia",
          knowledgeType: "juz_range",
          startJuz: 29,
          endJuz: 30,
          weeklyAmount: 5,
        },
        {
          id: "2",
          name: "Fatima",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 25,
        },
      ],
    }
    const result = validateScheduleInput(input)
    expect(result.isValid).toBe(false)
    expect(
      result.errors.some((e) => e.code === "AMOUNT_EXCEEDS_KNOWLEDGE")
    ).toBe(true)
  })
})

describe("Scheduler Engine & Rotation Modes", () => {
  const baseMembers = [
    {
      id: "m1",
      name: "Tariq",
      knowledgeType: "entire" as const,
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 10,
    },
    {
      id: "m2",
      name: "Zainab",
      knowledgeType: "entire" as const,
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 10,
    },
    {
      id: "m3",
      name: "Bilal",
      knowledgeType: "entire" as const,
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 10,
    },
  ]

  it("generates schedule with default medium rotation", () => {
    const input: ScheduleInput = {
      group: { name: "Family Study", weeksCount: 3, rotationStyle: "medium" },
      members: baseMembers,
    }
    const schedule = generateQuranSchedule(input)
    expect(schedule.weeks.length).toBe(3)
    schedule.weeks.forEach((week) => {
      expect(week.assignments.length).toBe(3)
      const total = week.assignments.reduce((sum, a) => sum + a.weeklyAmount, 0)
      expect(total).toBe(30)
    })
  })

  it("generates schedule with large rotation style", () => {
    const input: ScheduleInput = {
      group: { name: "Family Study", weeksCount: 4, rotationStyle: "large" },
      members: baseMembers,
    }
    const schedule = generateQuranSchedule(input)
    expect(schedule.weeks.length).toBe(4)
    const validation = validateGeneratedSchedule(schedule, input)
    expect(validation.isValid).toBe(true)
  })

  it("generates schedule with small rotation style", () => {
    const input: ScheduleInput = {
      group: { name: "Family Study", weeksCount: 4, rotationStyle: "small" },
      members: baseMembers,
    }
    const schedule = generateQuranSchedule(input)
    expect(schedule.weeks.length).toBe(4)
    const validation = validateGeneratedSchedule(schedule, input)
    expect(validation.isValid).toBe(true)
  })

  it("generates deterministic schedule with random rotation style", () => {
    const input: ScheduleInput = {
      group: { name: "Halaqah Group", weeksCount: 4, rotationStyle: "random" },
      members: baseMembers,
    }
    const schedule1 = generateQuranSchedule(input)
    const schedule2 = generateQuranSchedule(input)
    expect(schedule1.weeks.length).toBe(4)
    expect(schedule1.weeks[0].assignments[0].memberId).toBe(
      schedule2.weeks[0].assignments[0].memberId
    )
  })

  it("generates schedule starting at custom starting point (Juz 15)", () => {
    const input: ScheduleInput = {
      group: { name: "Mid Quran Group", weeksCount: 3, startJuz: 15 },
      members: baseMembers,
    }
    const schedule = generateQuranSchedule(input)
    expect(schedule.weeks.length).toBe(3)
    const week1 = schedule.weeks[0]
    expect(week1.assignments[0].startJuz).toBe(15)
  })

  it("generates schedule for custom Quran range", () => {
    const input: ScheduleInput = {
      group: {
        name: "Surah Al-Baqarah Study",
        weeksCount: 2,
        rangeType: "custom",
        customRange: {
          startSurah: 2,
          startAyah: 1,
          endSurah: 2,
          endAyah: 286,
        },
      },
      members: [
        {
          id: "m1",
          name: "Ali",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 5,
        },
        {
          id: "m2",
          name: "Sara",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 5,
        },
      ],
    }
    const schedule = generateQuranSchedule(input)
    expect(schedule.weeks.length).toBe(2)
    const w1 = schedule.weeks[0]
    expect(w1.assignments[0].startAyah.surahNumber).toBe(2)
    expect(w1.assignments[0].startAyah.ayahNumber).toBe(1)
    expect(w1.assignments[1].endAyah.surahNumber).toBe(2)
    expect(w1.assignments[1].endAyah.ayahNumber).toBe(286)
  })
})
