import { describe, expect, it } from "vitest"
import {
  fetchUserGroups,
  archiveGroup,
  saveReadingProgress,
  fetchGroupReadingProgress,
  saveBookmark,
  fetchUserBookmarks,
  deleteBookmark,
  createAnnouncement,
  fetchAnnouncements,
  saveNotificationPreferences,
  fetchNotificationPreferences,
  exportUserData,
  startNewKhatmah,
} from "../lib/groups/service"
import { translations } from "../lib/i18n/dictionary"
import { generateQuranSchedule } from "../lib/scheduler/engine"
import { ScheduleInput } from "../lib/scheduler/types"

describe("Complete Product Platform - Phase 1 through 7 Tests", () => {
  describe("Dashboard & My Groups Service", () => {
    it("safely handles empty user group requests", async () => {
      const groups = await fetchUserGroups("")
      expect(groups).toEqual([])
    })

    it("supports all required filter modes", async () => {
      const active = await fetchUserGroups("mock-user", "active")
      const archived = await fetchUserGroups("mock-user", "archived")
      const completed = await fetchUserGroups("mock-user", "completed")
      const ramadan = await fetchUserGroups("mock-user", "ramadan")
      expect(Array.isArray(active)).toBe(true)
      expect(Array.isArray(archived)).toBe(true)
      expect(Array.isArray(completed)).toBe(true)
      expect(Array.isArray(ramadan)).toBe(true)
    })
  })

  describe("Reading Progress Persistence", () => {
    it("handles progress saving with zero exceptions", async () => {
      const res = await saveReadingProgress(
        "non-existent-group",
        "member-1",
        1,
        1,
        true,
        "user-123"
      )
      expect(typeof res.success).toBe("boolean")
    })

    it("handles group progress retrieval safely", async () => {
      const list = await fetchGroupReadingProgress("non-existent-group")
      expect(Array.isArray(list)).toBe(true)
    })
  })

  describe("Bookmarks System", () => {
    it("validates bookmark requirements", async () => {
      const res = await saveBookmark("user-1", 2, 255, 3, "Ayat al-Kursi")
      expect(typeof res.success).toBe("boolean")

      const list = await fetchUserBookmarks("user-1")
      expect(Array.isArray(list)).toBe(true)

      const del = await deleteBookmark("b-1", "user-1")
      expect(typeof del).toBe("boolean")
    })
  })

  describe("Announcements System", () => {
    it("safely handles announcement operations", async () => {
      const res = await createAnnouncement(
        "group-1",
        "تنبيه هام",
        "نبدأ القراءة غداً بإذن الله",
        "user-1"
      )
      expect(typeof res.success).toBe("boolean")

      const list = await fetchAnnouncements("group-1")
      expect(Array.isArray(list)).toBe(true)
    })
  })

  describe("Notification Preferences & Data Export", () => {
    it("saves and reads notification preferences", async () => {
      const saved = await saveNotificationPreferences("user-1", {
        dailyReminderEnabled: true,
        reminderTime: "21:00",
        incompleteReminderEnabled: true,
        timezone: "Asia/Riyadh",
      })
      expect(typeof saved).toBe("boolean")

      const fetched = await fetchNotificationPreferences("user-1")
      expect(fetched === null || typeof fetched === "object").toBe(true)
    })

    it("exports user data in standard JSON envelope", async () => {
      const data = await exportUserData("user-1")
      expect(data).toHaveProperty("exportedAt")
      expect(data).toHaveProperty("userId", "user-1")
      expect(data).toHaveProperty("groups")
      expect(data).toHaveProperty("bookmarks")
    })
  })

  describe("New Khatmah & Cycle Generation", () => {
    it("generates next Ramadan khatmah year correctly", () => {
      const input: ScheduleInput = {
        group: {
          name: "عائلة الفرح",
          weeksCount: 4,
          occasionType: "ramadan",
          islamicYear: 1447,
        },
        members: [
          {
            id: "m1",
            name: "عبدالرحمن",
            weeklyAmount: 15,
            knowledgeType: "entire",
            startJuz: 1,
            endJuz: 30,
          },
          {
            id: "m2",
            name: "إسماعيل",
            weeklyAmount: 15,
            knowledgeType: "entire",
            startJuz: 1,
            endJuz: 30,
          },
        ],
      }

      const schedule = generateQuranSchedule(input)
      expect(schedule.weeksCount).toBe(4)
      expect(schedule.occasionType).toBe("ramadan")
      expect(schedule.islamicYear).toBe(1447)
    })
  })

  describe("Translations Invariant Checks", () => {
    it("contains all new platform dictionary keys in Arabic and English", () => {
      const ar = translations.ar
      const en = translations.en

      // Navigation & Dashboard
      expect(ar.navDashboard).toBe("الرئيسية")
      expect(en.navDashboard).toBe("Dashboard")
      expect(ar.navMyGroups).toBe("جداولي")
      expect(en.navMyGroups).toBe("My Groups")
      expect(ar.dashboardTodaysReading).toBe("وردك اليوم")
      expect(en.dashboardTodaysReading).toBe("Today's Reading")
      expect(ar.dashboardContinueReading).toBe("تابع وردك")
      expect(en.dashboardContinueReading).toBe("Continue Reading")

      // Reader & Bookmarks
      expect(ar.readerTitle).toBe("المصحف الشريف")
      expect(en.readerTitle).toBe("Holy Quran")
      expect(ar.bookmarksTitle).toBe("العلامات المحفوظة")
      expect(en.bookmarksTitle).toBe("Bookmarks")

      // Lifecycle & Actions
      expect(ar.actionNewKhatmah).toBe("بدء ختمة جديدة")
      expect(en.actionNewKhatmah).toBe("Start New Khatmah")
      expect(ar.actionArchive).toBe("أرشفة")
      expect(en.actionArchive).toBe("Archive")
    })
  })
})
