import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  generateEditToken,
  generatePublicId,
  hashEditToken,
  verifyEditToken,
} from "../lib/groups/crypto"
import { checkRateLimit, resetRateLimitStore } from "../lib/groups/rate-limit"
import {
  saveScheduleAction,
  getPublicScheduleAction,
} from "../lib/groups/actions"
import { ScheduleInput } from "../lib/scheduler/types"
import { generateQuranSchedule } from "../lib/scheduler/engine"

describe("Wirddy No-Login Supabase Integration", () => {
  beforeEach(() => {
    resetRateLimitStore()
    vi.restoreAllMocks()
  })

  describe("Cryptographic Tokens & Security", () => {
    it("generates unguessable public IDs with base62 characters", () => {
      const id1 = generatePublicId(14)
      const id2 = generatePublicId(14)

      expect(id1).toHaveLength(14)
      expect(id2).toHaveLength(14)
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^[0-9A-Za-z]{14}$/)
    })

    it("generates 256-bit secret edit tokens and hashes them correctly", () => {
      const editToken = generateEditToken()
      expect(editToken).toHaveLength(64)
      expect(editToken).toMatch(/^[0-9a-f]{64}$/)

      const hash1 = hashEditToken(editToken)
      const hash2 = hashEditToken(editToken)
      expect(hash1).toHaveLength(64)
      expect(hash1).toBe(hash2)
    })

    it("verifies edit token successfully against stored SHA-256 hash", () => {
      const editToken = generateEditToken()
      const hash = hashEditToken(editToken)

      expect(verifyEditToken(editToken, hash)).toBe(true)
      expect(verifyEditToken("wrong-token", hash)).toBe(false)
      expect(verifyEditToken("", hash)).toBe(false)
    })
  })

  describe("Sliding Window Rate Limiter", () => {
    it("allows requests under the specified threshold", () => {
      const id = "test-user-ip-1"
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(id, 5, 60000)
        expect(result.allowed).toBe(true)
      }
    })

    it("blocks requests that exceed the rate limit", () => {
      const id = "test-user-ip-2"
      for (let i = 0; i < 3; i++) {
        checkRateLimit(id, 3, 60000)
      }
      const blocked = checkRateLimit(id, 3, 60000)
      expect(blocked.allowed).toBe(false)
      expect(blocked.remaining).toBe(0)
    })
  })

  describe("Server Action Input Validation & Abuse Controls", () => {
    const validScheduleInput: ScheduleInput = {
      group: {
        name: "حلقة الفرقان",
        weeksCount: 4,
      },
      members: [
        {
          id: "m1",
          name: "أحمد",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 15,
        },
        {
          id: "m2",
          name: "عمر",
          knowledgeType: "entire",
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 15,
        },
      ],
    }

    it("rejects oversized group names (> 100 chars)", async () => {
      const invalidInput: ScheduleInput = {
        ...validScheduleInput,
        group: {
          name: "A".repeat(105),
          weeksCount: 4,
        },
      }
      const schedule = generateQuranSchedule(validScheduleInput)
      const res = await saveScheduleAction(invalidInput, schedule, "ar")

      expect(res.success).toBe(false)
      expect(res.error).toContain("اسم المجموعة طويل جداً")
    })

    it("rejects schedules with invalid total Juz (!= 30)", async () => {
      const invalidInput: ScheduleInput = {
        group: { name: "مجموعة غير صالحة", weeksCount: 4 },
        members: [
          {
            id: "m1",
            name: "أحمد",
            knowledgeType: "entire",
            startJuz: 1,
            endJuz: 30,
            weeklyAmount: 10,
          },
        ],
      }
      const schedule = generateQuranSchedule(validScheduleInput)
      const res = await saveScheduleAction(invalidInput, schedule, "ar")

      expect(res.success).toBe(false)
    })

    it("handles unconfigured/offline Supabase gracefully without crashing", async () => {
      const schedule = generateQuranSchedule(validScheduleInput)
      const res = await saveScheduleAction(validScheduleInput, schedule, "en")

      // Should return structured failure with user-friendly error
      expect(res.success).toBe(false)
      expect(typeof res.error).toBe("string")
    })
  })
})
