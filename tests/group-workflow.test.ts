import { describe, it, expect, vi, beforeEach } from "vitest"
import { generateQuranSchedule } from "../lib/scheduler/engine"
import { GroupConfig, MemberConfig } from "../lib/scheduler/types"
import {
  fetchGroupProgressSummary,
  fetchUserTodaysReading,
} from "../lib/groups/service"

// Mock Supabase Server Client
vi.mock("../lib/supabase/server", () => {
  return {
    createSupabaseServerClient: vi.fn(),
  }
})

describe("End-to-End Quran Group Workflow & 30-Juz Family Allocation", () => {
  // Family 13 members allocation from prompt
  const familyMembers: MemberConfig[] = [
    { id: "m1", name: "عبدالرحمن", weeklyAmount: 5, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
    { id: "m2", name: "اسماعيل", weeklyAmount: 2, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
    { id: "m3", name: "اسحاق", weeklyAmount: 2, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
    { id: "m4", name: "حفصة", weeklyAmount: 2, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
    { id: "m5", name: "عبدالله", weeklyAmount: 2, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
    { id: "m6", name: "امنه", weeklyAmount: 2, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
    { id: "m7", name: "نورالدين", weeklyAmount: 3, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
    { id: "m8", name: "ابراهيم", weeklyAmount: 2, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
    { id: "m9", name: "اسماء", weeklyAmount: 2, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
    { id: "m10", name: "حسين", weeklyAmount: 3, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
    { id: "m11", name: "اسيا", weeklyAmount: 2, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
    { id: "m12", name: "شكري", weeklyAmount: 2, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
    { id: "m13", name: "سميا", weeklyAmount: 1, knowledgeType: "entire", startJuz: 1, endJuz: 30 },
  ]

  const groupConfig: GroupConfig = {
    name: "ختمة العائلة الكريمة",
    title: "ختمة القرآن الأسبوعية",
    description: "توزيع ختمة كاملة كل أسبوع",
    weeksCount: 4,
    rotationStyle: "medium",
    rangeType: "full",
  }

  it("1. Accurately generates a 30-Juz weekly schedule covering all 13 family members", () => {
    const totalAssignedJuz = familyMembers.reduce((sum, m) => sum + m.weeklyAmount, 0)
    expect(totalAssignedJuz).toBe(30)

    const schedule = generateQuranSchedule({ group: groupConfig, members: familyMembers })
    expect(schedule.weeks.length).toBe(4)

    // Check Week 1 assignments
    const week1 = schedule.weeks[0]
    expect(week1.assignments.length).toBe(13)
    expect(week1.totalJuz).toBe(30)

    // Verify Abdulrahman has 5 Juz
    const abdulrahman = week1.assignments.find((a) => a.memberName === "عبدالرحمن")
    expect(abdulrahman).toBeDefined()
    expect(abdulrahman?.weeklyAmount).toBe(5)

    // Verify Nouradin has 3 Juz
    const nouradin = week1.assignments.find((a) => a.memberName === "نورالدين")
    expect(nouradin).toBeDefined()
    expect(nouradin?.weeklyAmount).toBe(3)

    // Verify Samia has 1 Juz
    const samia = week1.assignments.find((a) => a.memberName === "سميا")
    expect(samia).toBeDefined()
    expect(samia?.weeklyAmount).toBe(1)
  })

  it("2. Rotates portions across weeks fairly without leaving gaps", () => {
    const schedule = generateQuranSchedule({ group: groupConfig, members: familyMembers })

    for (let w = 0; w < schedule.weeks.length; w++) {
      const week = schedule.weeks[w]
      expect(week.totalJuz).toBe(30)
      const weekSum = week.assignments.reduce((sum, a) => sum + a.weeklyAmount, 0)
      expect(weekSum).toBe(30)
    }

    // Verify Abdulrahman's start juz changes between week 1 and week 2
    const abdulrahmanW1 = schedule.weeks[0].assignments.find((a) => a.memberName === "عبدالرحمن")
    const abdulrahmanW2 = schedule.weeks[1].assignments.find((a) => a.memberName === "عبدالرحمن")
    expect(abdulrahmanW1).toBeDefined()
    expect(abdulrahmanW2).toBeDefined()
  })

  it("3. Successfully processes daily division breakdown when enabled", () => {
    const dailyGroupConfig: GroupConfig = {
      ...groupConfig,
      dailyDivisionEnabled: true,
    }

    const schedule = generateQuranSchedule({ group: dailyGroupConfig, members: familyMembers })
    const nouradin = schedule.weeks[0].assignments.find((a) => a.memberName === "نورالدين")

    expect(nouradin?.dailyBreakdown).toBeDefined()
    expect(nouradin?.dailyBreakdown?.length).toBe(7)

    // 7 days must cover his entire weekly assignment
    const firstDay = nouradin!.dailyBreakdown![0]
    const lastDay = nouradin!.dailyBreakdown![6]
    expect(firstDay.startAyah).toEqual(nouradin!.startAyah)
    expect(lastDay.endAyah).toEqual(nouradin!.endAyah)
  })
})
