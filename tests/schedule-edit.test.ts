import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  buildStandaloneWeekExportHtml,
  buildMemberPersonalScheduleHtml,
} from "../lib/export/render-week"
import { ExportWeek } from "../lib/export/types"
import { ExportAssets } from "../lib/export/assets"
import { MemberConfig, GeneratedSchedule } from "../lib/scheduler/types"
import { generateQuranSchedule } from "../lib/scheduler/engine"
import {
  checkGroupAuthorization,
  validateEditAccess,
} from "../lib/groups/service"
import { generateEditToken, hashEditToken } from "../lib/groups/crypto"

// Mock Supabase Server Client
vi.mock("../lib/supabase/server", () => ({
  getSupabaseServerClient: vi.fn(),
}))

import { getSupabaseServerClient } from "../lib/supabase/server"

import { normalizeWeekSchedule } from "../lib/export/data"

describe("Schedule Editing & Rectangular PNG Export", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("Export PNG Outer Edges (Rectangular, No Rounded Corners/Borders)", () => {
    const mockAssets: ExportAssets = {
      wirddyLogoBlack: "data:image/svg+xml;base64,mock",
      wirddyLogoWhite: "data:image/svg+xml;base64,mock",
      logoBlack: "data:image/svg+xml;base64,mock",
      logoWhite: "data:image/svg+xml;base64,mock",
      qrCode: "data:image/png;base64,mock",
    }

    it("renders standalone week export HTML with border-radius: 0 and border: none on the outer container", () => {
      const scheduleInput = {
        group: { name: "عائلة النور", weeksCount: 4 },
        members: [
          {
            id: "m1",
            name: "أحمد",
            knowledgeType: "entire" as const,
            startJuz: 1,
            endJuz: 30,
            weeklyAmount: 15,
          },
          {
            id: "m2",
            name: "عمر",
            knowledgeType: "entire" as const,
            startJuz: 1,
            endJuz: 30,
            weeklyAmount: 15,
          },
        ],
      }
      const schedule = generateQuranSchedule(scheduleInput)
      const exportWeek = normalizeWeekSchedule(
        schedule.weeks[0],
        schedule.weeksCount,
        schedule.groupName,
        "ar",
        "dark",
        "cards"
      )

      const html = buildStandaloneWeekExportHtml(
        exportWeek,
        mockAssets,
        "dark",
        "cards"
      )

      // The outer container must NOT have rounded corners or border
      expect(html).toContain("border: none; border-radius: 0;")
      expect(html).not.toMatch(/width:\s*880px[^>]*border-radius:\s*24px/)
      expect(html).not.toMatch(/width:\s*880px[^>]*border:\s*1px solid/)
    })

    it("renders member personal schedule HTML with border-radius: 0 and border: none on the outer container", () => {
      const sampleInput = {
        group: { name: "عائلة النور", weeksCount: 4 },
        members: [
          {
            id: "m1",
            name: "أحمد",
            knowledgeType: "entire" as const,
            startJuz: 1,
            endJuz: 30,
            weeklyAmount: 15,
          },
          {
            id: "m2",
            name: "عمر",
            knowledgeType: "entire" as const,
            startJuz: 1,
            endJuz: 30,
            weeklyAmount: 15,
          },
        ],
      }
      const schedule = generateQuranSchedule(sampleInput)
      const member = sampleInput.members[0]

      const html = buildMemberPersonalScheduleHtml(
        member,
        schedule,
        mockAssets,
        "dark",
        true
      )

      expect(html).toContain("border: none; border-radius: 0;")
      expect(html).not.toMatch(/width:\s*880px[^>]*border-radius:\s*24px/)
      expect(html).not.toMatch(/width:\s*880px[^>]*border:\s*1px solid/)
    })
  })

  describe("Schedule Edit Authorization (Owner and Secret Token)", () => {
    const rawToken = generateEditToken()
    const tokenHash = hashEditToken(rawToken)
    const mockGroup = {
      id: "group-123",
      public_id: "PUB1234567890",
      owner_user_id: "user-owner-abc",
      edit_token_hash: tokenHash,
      name: "حلقة الفرقان",
    }

    it("authorizes authenticated group owner even without an edit token", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockGroup,
                error: null,
              }),
            }),
          }),
        }),
      }
      vi.mocked(getSupabaseServerClient).mockReturnValue(mockSupabase as any)

      // Owner accessing with their userId and NO rawEditToken
      const result = await checkGroupAuthorization(
        "PUB1234567890",
        undefined,
        "user-owner-abc"
      )

      expect(result.authorized).toBe(true)
      expect(result.group).toBeDefined()
      expect(result.group.id).toBe("group-123")
    })

    it("authorizes user with valid secret edit token even if unauthenticated", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockGroup,
                error: null,
              }),
            }),
          }),
        }),
      }
      vi.mocked(getSupabaseServerClient).mockReturnValue(mockSupabase as any)

      // Visitor accessing with correct rawEditToken and no userId
      const result = await checkGroupAuthorization(
        "PUB1234567890",
        rawToken,
        undefined
      )

      expect(result.authorized).toBe(true)
      expect(result.group).toBeDefined()
    })

    it("rejects unauthorized user with invalid token and non-owner ID", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockGroup,
                error: null,
              }),
            }),
          }),
        }),
      }
      vi.mocked(getSupabaseServerClient).mockReturnValue(mockSupabase as any)

      // Different user with bad token
      const result = await checkGroupAuthorization(
        "PUB1234567890",
        "invalid-token",
        "user-stranger-xyz"
      )

      expect(result.authorized).toBe(false)
    })

    it("validateEditAccess returns boolean reflecting checkGroupAuthorization", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockGroup,
                error: null,
              }),
            }),
          }),
        }),
      }
      vi.mocked(getSupabaseServerClient).mockReturnValue(mockSupabase as any)

      const canEdit = await validateEditAccess(
        "PUB1234567890",
        undefined,
        "user-owner-abc"
      )
      expect(canEdit).toBe(true)

      const cannotEdit = await validateEditAccess(
        "PUB1234567890",
        undefined,
        "wrong-user"
      )
      expect(cannotEdit).toBe(false)
    })
  })
})
