import { describe, expect, it } from "vitest"
import { generateQuranSchedule } from "../lib/scheduler/engine"
import { ScheduleInput } from "../lib/scheduler/types"
import {
  validateGeneratedSchedule,
  validateScheduleInput,
} from "../lib/scheduler/validator"
import { resolveJuzRange, resolveSurahToJuzRange } from "../lib/quran/resolver"

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

  it("rejects total != 30", () => {
    const input: ScheduleInput = {
      group: { name: "Family", weeksCount: 4 },
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
          weeklyAmount: 4,
        },
        {
          id: "2",
          name: "Ali",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 26,
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

describe("Scheduling Engine & Multi-Week Rotation Tests", () => {
  it("generates a valid schedule for 1 member reading 30 Juz", () => {
    const input: ScheduleInput = {
      group: { name: "Solo", weeksCount: 3 },
      members: [
        {
          id: "1",
          name: "Abdulrahman",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 30,
        },
      ],
    }
    const schedule = generateQuranSchedule(input)
    expect(schedule.weeks.length).toBe(3)
    for (const week of schedule.weeks) {
      expect(week.assignments.length).toBe(1)
      expect(week.assignments[0].startJuz).toBe(1)
      expect(week.assignments[0].endJuz).toBe(30)
    }
  })

  it("generates and rotates schedule for 6 members reading 5 Juz each across 5 weeks", () => {
    const input: ScheduleInput = {
      group: { name: "Friends Circle", weeksCount: 5 },
      members: [
        {
          id: "m1",
          name: "Member 1",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 5,
        },
        {
          id: "m2",
          name: "Member 2",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 5,
        },
        {
          id: "m3",
          name: "Member 3",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 5,
        },
        {
          id: "m4",
          name: "Member 4",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 5,
        },
        {
          id: "m5",
          name: "Member 5",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 5,
        },
        {
          id: "m6",
          name: "Member 6",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 5,
        },
      ],
    }

    const schedule = generateQuranSchedule(input)
    expect(schedule.weeks.length).toBe(5)

    // Verify self validation
    const validation = validateGeneratedSchedule(schedule, input)
    expect(validation.isValid).toBe(true)

    // Verify rotation: Member 1 gets different Juz across weeks
    const m1Assignments = schedule.weeks.map((w) =>
      w.assignments.find((a) => a.memberId === "m1")!
    )

    const m1StartJuzs = new Set(m1Assignments.map((a) => a.startJuz))
    expect(m1StartJuzs.size).toBe(5) // 5 distinct starts over 5 weeks!
  })

  it("respects restricted knowledge member (PRD Section 55 Example)", () => {
    // Abdulrahman (5), Ismail (2), Asia (2, Juz 26-30), + other members totaling 30
    const input: ScheduleInput = {
      group: { name: "Family Group", weeksCount: 4 },
      members: [
        {
          id: "m1",
          name: "Abdulrahman",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 5,
        },
        {
          id: "m2",
          name: "Ismail",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 2,
        },
        {
          id: "m3",
          name: "Asia",
          knowledgeType: "juz_range",
          startJuz: 26,
          endJuz: 30,
          weeklyAmount: 2,
        },
        {
          id: "m4",
          name: "Fatima",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 5,
        },
        {
          id: "m5",
          name: "Hassan",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 4,
        },
        {
          id: "m6",
          name: "Mariam",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 4,
        },
        {
          id: "m7",
          name: "Zaid",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 4,
        },
        {
          id: "m8",
          name: "Amina",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 4,
        },
      ],
    }

    const schedule = generateQuranSchedule(input)
    expect(schedule.weeks.length).toBe(4)

    // Verify Asia is NEVER assigned outside Juz 26..30 in ANY week
    for (const week of schedule.weeks) {
      const asiaAssignment = week.assignments.find((a) => a.memberId === "m3")!
      expect(asiaAssignment).toBeDefined()
      expect(asiaAssignment.startJuz).toBeGreaterThanOrEqual(26)
      expect(asiaAssignment.endJuz).toBeLessThanOrEqual(30)
      expect(asiaAssignment.endJuz - asiaAssignment.startJuz + 1).toBe(2)
    }
  })

  it("generates schedule for a 13-member group totaling 30 Juz", () => {
    // 5 + 2 + 2 + 2 + 2 + 2 + 3 + 2 + 2 + 3 + 2 + 2 + 1 = 30
    const amounts = [5, 2, 2, 2, 2, 2, 3, 2, 2, 3, 2, 2, 1]
    const input: ScheduleInput = {
      group: { name: "Large Mosque Circle", weeksCount: 4 },
      members: amounts.map((amount, idx) => ({
        id: `mem-${idx + 1}`,
        name: `Member ${idx + 1}`,
        knowledgeType: "entire",
        startJuz: 1,
        endJuz: 30,
        weeklyAmount: amount,
      })),
    }

    const schedule = generateQuranSchedule(input)
    expect(schedule.weeks.length).toBe(4)
    const validation = validateGeneratedSchedule(schedule, input)
    expect(validation.isValid).toBe(true)
  })
})
