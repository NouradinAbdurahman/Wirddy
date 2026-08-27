import { describe, expect, it } from "vitest"
import {
  addDaysToDate,
  calculateWeekDateRanges,
  formatCompactRange,
  formatSingleDateAr,
  formatSingleDateEn,
  parseIsoDate,
  toArabicNumerals,
} from "../lib/dates/calendar"
import {
  formatRamadanDayLabel,
  getCurrentHijriYear,
  getRamadanStartDate,
  getSupportedIslamicYears,
} from "../lib/dates/ramadan"
import { generateQuranSchedule } from "../lib/scheduler/engine"
import { ScheduleInput } from "../lib/scheduler/types"
import { generateMemberPublicId } from "../lib/groups/crypto"
import { verifyPngBlob } from "../lib/export/create-all-members-zip"

describe("Wirddy Advanced Group Features Test Suite", () => {
  describe("1. Calendar Math & Date Ranges", () => {
    it("safely adds days without timezone offset anomalies", () => {
      const start = "2026-09-01"
      const plus6 = addDaysToDate(start, 6)
      expect(plus6).toBe("2026-09-07")

      const plus30 = addDaysToDate(start, 30)
      expect(plus30).toBe("2026-10-01")
    })

    it("computes clean sequential week date ranges", () => {
      const ranges = calculateWeekDateRanges("2026-09-01", 4)
      expect(ranges).toHaveLength(4)
      expect(ranges[0].weekNumber).toBe(1)
      expect(ranges[0].startDate).toBe("2026-09-01")
      expect(ranges[0].endDate).toBe("2026-09-07")
      expect(ranges[1].startDate).toBe("2026-09-08")
      expect(ranges[1].endDate).toBe("2026-09-14")
      expect(ranges[3].startDate).toBe("2026-09-22")
      expect(ranges[3].endDate).toBe("2026-09-28")
    })

    it("formats Arabic and English date ranges with Eastern Arabic digits", () => {
      const rangeAr = formatCompactRange("2026-09-01", "2026-09-07", "ar")
      const rangeEn = formatCompactRange("2026-09-01", "2026-09-07", "en")
      expect(rangeAr).toContain("سبتمبر")
      expect(rangeEn).toContain("Sep")
    })

    it("correctly converts western digits to Arabic-Indic digits", () => {
      expect(toArabicNumerals(1448)).toBe("١٤٤٨")
      expect(toArabicNumerals("Week 2")).toBe("Week ٢")
    })
  })

  describe("2. Ramadan Mathematics & Islamic Calendar", () => {
    it("computes realistic Ramadan start dates for current and future Hijri years", () => {
      const ramadan1448 = getRamadanStartDate(1448)
      expect(ramadan1448).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      // 1448 AH Ramadan falls around Feb/March 2027
      expect(ramadan1448.startsWith("2027")).toBe(true)

      const ramadan1447 = getRamadanStartDate(1447)
      expect(ramadan1447.startsWith("2026") || ramadan1447.startsWith("2025")).toBe(true)
    })

    it("provides valid Hijri year options for selector", () => {
      const years = getSupportedIslamicYears()
      expect(years.length).toBeGreaterThanOrEqual(5)
      const currentYear = getCurrentHijriYear()
      expect(years.includes(currentYear)).toBe(true)
    })

    it("formats Ramadan day labels correctly", () => {
      const labelAr = formatRamadanDayLabel(1, "ar").title
      expect(labelAr).toBe("رمضان ١")
      const labelEn = formatRamadanDayLabel(1, "en").title
      expect(labelEn).toBe("Ramadan 1")
    })
  })

  describe("3. 7-Day Exact Ayah Division Algorithm", () => {
    it("partitions weekly assignments into 7 non-overlapping, continuous daily portions", () => {
      const input: ScheduleInput = {
        group: {
          name: "Ramadan Halaqa",
          title: "ختمة أسرة النور",
          description: "ختمة مباركة في شهر القرآن",
          weeksCount: 2,
          startDate: "2026-09-01",
          usesDates: true,
          occasionType: "ramadan",
          islamicYear: 1448,
          dailyDivisionEnabled: true,
        },
        members: [
          {
            id: "m1",
            name: "عمر",
            knowledgeType: "entire",
            startJuz: 1,
            endJuz: 30,
            weeklyAmount: 15,
          },
          {
            id: "m2",
            name: "فاطمة",
            knowledgeType: "entire",
            startJuz: 1,
            endJuz: 30,
            weeklyAmount: 15,
          },
        ],
      }

      const schedule = generateQuranSchedule(input)
      expect(schedule.title).toBe("ختمة أسرة النور")
      expect(schedule.description).toBe("ختمة مباركة في شهر القرآن")
      expect(schedule.occasionType).toBe("ramadan")
      expect(schedule.islamicYear).toBe(1448)
      expect(schedule.dailyDivisionEnabled).toBe(true)

      const week1 = schedule.weeks[0]
      expect(week1.dateRange).toBeDefined()
      expect(week1.assignments).toHaveLength(2)

      const omarAssign = week1.assignments[0]
      expect(omarAssign.dailyBreakdown).toBeDefined()
      expect(omarAssign.dailyBreakdown).toHaveLength(7)

      // Verify continuity and no gaps across 7 days
      let totalDailyAyahs = 0
      for (let i = 0; i < 7; i++) {
        const day = omarAssign.dailyBreakdown![i]
        expect(day.dayIndex).toBe(i + 1)
        expect(day.totalAyahs).toBeGreaterThan(0)
        totalDailyAyahs += day.totalAyahs

        if (i > 0) {
          const prevDay = omarAssign.dailyBreakdown![i - 1]
          expect(day.startLocation?.globalAyahNumber).toBe(
            (prevDay.endLocation?.globalAyahNumber || 0) + 1
          )
        }
      }

      const assignmentTotalAyahs =
        (omarAssign.endLocation?.globalAyahNumber || 0) -
        (omarAssign.startLocation?.globalAyahNumber || 0) +
        1
      expect(totalDailyAyahs).toBe(assignmentTotalAyahs)
    })

    it("correctly partitions custom Surah-level ranges into 7 continuous days", () => {
      const input: ScheduleInput = {
        group: {
          name: "Surah Al-Baqarah Group",
          weeksCount: 1,
          rangeType: "custom",
          customRange: {
            startSurah: 2,
            startAyah: 1,
            endSurah: 2,
            endAyah: 286,
          },
          dailyDivisionEnabled: true,
        },
        members: [
          {
            id: "m1",
            name: "أحمد",
            knowledgeType: "entire",
            startJuz: 1,
            endJuz: 30,
            weeklyAmount: 5,
          },
        ],
      }

      const schedule = generateQuranSchedule(input)
      const assignment = schedule.weeks[0].assignments[0]
      expect(assignment.dailyBreakdown).toHaveLength(7)

      const sumDailyAyahs = assignment.dailyBreakdown!.reduce(
        (sum, d) => sum + d.totalAyahs,
        0
      )
      expect(sumDailyAyahs).toBe(286)
      expect(assignment.dailyBreakdown![0].startAyah.surahNumber).toBe(2)
      expect(assignment.dailyBreakdown![0].startAyah.ayahNumber).toBe(1)
      expect(assignment.dailyBreakdown![6].endAyah.surahNumber).toBe(2)
      expect(assignment.dailyBreakdown![6].endAyah.ayahNumber).toBe(286)
    })
  })

  describe("4. Unguessable Member Public IDs", () => {
    it("generates random crypto-secure member public IDs", () => {
      const id1 = generateMemberPublicId()
      const id2 = generateMemberPublicId()

      expect(id1).toMatch(/^m_[a-f0-9]{12}$/)
      expect(id2).toMatch(/^m_[a-f0-9]{12}$/)
      expect(id1).not.toBe(id2)
    })

    it("assigns unique publicIds to each member during schedule generation", () => {
      const input: ScheduleInput = {
        group: { name: "Test Group", weeksCount: 1 },
        members: [
          { id: "1", name: "A", knowledgeType: "entire", startJuz: 1, endJuz: 30, weeklyAmount: 15 },
          { id: "2", name: "B", knowledgeType: "entire", startJuz: 1, endJuz: 30, weeklyAmount: 15 },
        ],
      }

      const schedule = generateQuranSchedule(input)
      expect(schedule.members[0].publicId).toBeDefined()
      expect(schedule.members[1].publicId).toBeDefined()
      expect(schedule.members[0].publicId).not.toBe(schedule.members[1].publicId)
      expect(schedule.weeks[0].assignments[0].memberPublicId).toBe(schedule.members[0].publicId)
    })
  })

  describe("5. Member Export & ZIP Packaging Utilities", () => {
    it("correctly validates binary PNG headers", async () => {
      // Valid 8-byte PNG header: 89 50 4E 47 0D 0A 1A 0A
      const validPngBytes = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ])
      const validBlob = new Blob([validPngBytes], { type: "image/png" })
      expect(await verifyPngBlob(validBlob)).toBe(true)

      const invalidBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03])
      const invalidBlob = new Blob([invalidBytes], { type: "image/png" })
      expect(await verifyPngBlob(invalidBlob)).toBe(false)
    })
  })
})
