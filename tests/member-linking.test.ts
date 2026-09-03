import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  fetchGroupProgressSummary,
  getMemberLinkStatus,
  linkMemberAccount,
  fetchUserTodaysReading,
} from "../lib/groups/service"
import { getSupabaseServerClient } from "../lib/supabase/server"

// Mock Supabase Server Client
vi.mock("../lib/supabase/server", () => {
  return {
    getSupabaseServerClient: vi.fn(),
    createSupabaseServerClient: vi.fn(),
    isSupabaseServerConfigured: vi.fn(() => true),
  }
})

describe("Member Account Linking & Group Progress Privacy", () => {
  const mockGroupId = "grp-uuid-1"
  const mockGroupPublicId = "test-group-123"
  const mockOwnerId = "owner-uuid-456"
  const mockMemberId = "mem-uuid-1"
  const mockMemberPublicId = "mem_pub_1"
  const mockOtherUserId = "other-user-uuid-789"

  let mockDbMembers: any[]
  let mockProgressRows: any[]

  beforeEach(() => {
    mockDbMembers = [
      {
        id: mockMemberId,
        public_id: mockMemberPublicId,
        name: "عبدالرحمن ادم",
        linked_user_id: null,
        weekly_amount: 2,
        knowledge_type: "entire",
        start_juz: 1,
        end_juz: 30,
        sort_order: 0,
      },
      {
        id: "mem-uuid-2",
        public_id: "mem_pub_2",
        name: "زينب",
        linked_user_id: "user-zainab-123",
        weekly_amount: 1,
        knowledge_type: "entire",
        start_juz: 1,
        end_juz: 30,
        sort_order: 1,
      },
    ]

    mockProgressRows = []

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "groups") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((col: string, val: any) => ({
                single: vi.fn(() => {
                  if (val === mockGroupPublicId) {
                    return Promise.resolve({
                      data: {
                        id: mockGroupId,
                        public_id: mockGroupPublicId,
                        name: "ختمة القرآن الكريم",
                        owner_user_id: mockOwnerId,
                        expires_at: new Date(Date.now() + 86400000).toISOString(),
                        language: "ar",
                        direction: "rtl",
                        rotation_style: "medium",
                        range_type: "full",
                        start_juz: 1,
                        uses_dates: false,
                        start_date: null,
                        daily_division_enabled: true,
                        occasion_type: "normal",
                        islamic_year: null,
                      },
                      error: null,
                    })
                  }
                  return Promise.resolve({ data: null, error: "Not found" })
                }),
              })),
            })),
          }
        }

        if (table === "group_members") {
          return {
            select: vi.fn((cols: string) => ({
              eq: vi.fn((col: string, val: any) => {
                const promise = Promise.resolve({ data: mockDbMembers, error: null })
                return Object.assign(promise, {
                  order: vi.fn(() => Promise.resolve({ data: mockDbMembers, error: null })),
                  or: vi.fn((orExpr: string) => {
                    const m = mockDbMembers.find(
                      (item) =>
                        orExpr.includes(item.public_id) || orExpr.includes(item.id)
                    )
                    return Promise.resolve({ data: m ? [m] : [], error: null })
                  }),
                })
              }),
            })),
            update: vi.fn((payload: any) => ({
              eq: vi.fn((col: string, val: any) => ({
                or: vi.fn((orExpr: string) => ({
                  select: vi.fn(() => {
                    const m = mockDbMembers.find(
                      (item) =>
                        orExpr.includes(item.public_id) || orExpr.includes(item.id)
                    )
                    if (m) {
                      m.linked_user_id = payload.linked_user_id
                      return Promise.resolve({ data: [m], error: null })
                    }
                    return Promise.resolve({ data: [], error: null })
                  }),
                })),
              })),
            })),
          }
        }

        if (table === "reading_progress") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: mockProgressRows, error: null })),
              })),
            })),
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  is: vi.fn(() => Promise.resolve({ error: null })),
                })),
              })),
            })),
          }
        }

        if (table === "schedule_plans") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn(() => ({
                      single: vi.fn(() =>
                        Promise.resolve({
                          data: {
                            id: "plan-1",
                            weeks_count: 4,
                            version_number: 1,
                            is_active: true,
                            rotation_style: "medium",
                            range_type: "full",
                            start_juz: 1,
                            uses_dates: false,
                            start_date: null,
                            daily_division_enabled: true,
                          },
                          error: null,
                        })
                      ),
                    })),
                  })),
                })),
                order: vi.fn(() =>
                  Promise.resolve({
                    data: [
                      {
                        id: "plan-1",
                        weeks_count: 4,
                        version_number: 1,
                        is_active: true,
                        rotation_style: "medium",
                        range_type: "full",
                        start_juz: 1,
                        uses_dates: false,
                        start_date: null,
                        daily_division_enabled: true,
                      },
                    ],
                    error: null,
                  })
                ),
              })),
            })),
          }
        }

        if (table === "schedule_weeks") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() =>
                  Promise.resolve({
                    data: [
                      {
                        id: "week-1",
                        week_number: 1,
                        total_juz: 30,
                      },
                    ],
                    error: null,
                  })
                ),
              })),
            })),
          }
        }

        if (table === "schedule_assignments") {
          return {
            select: vi.fn(() => ({
              in: vi.fn(() => ({
                order: vi.fn(() =>
                  Promise.resolve({
                    data: [
                      {
                        id: "assign-1",
                        schedule_week_id: "week-1",
                        member_id: mockMemberId,
                        member_public_id: mockMemberPublicId,
                        member_name: "عبدالرحمن ادم",
                        weekly_amount: 2,
                        start_juz: 1,
                        end_juz: 2,
                        start_surah: 1,
                        start_surah_name_ar: "الفاتحة",
                        start_surah_name_en: "Al-Fatihah",
                        start_ayah: 1,
                        end_surah: 2,
                        end_surah_name_ar: "البقرة",
                        end_surah_name_en: "Al-Baqarah",
                        end_ayah: 252,
                        start_global_ayah: 1,
                        end_global_ayah: 259,
                        daily_breakdown: [],
                        sort_order: 0,
                      },
                    ],
                    error: null,
                  })
                ),
              })),
              eq: vi.fn(() => ({
                order: vi.fn(() =>
                  Promise.resolve({
                    data: [
                      {
                        id: "assign-1",
                        schedule_week_id: "week-1",
                        member_id: mockMemberId,
                        member_public_id: mockMemberPublicId,
                        member_name: "عبدالرحمن ادم",
                        weekly_amount: 2,
                        start_juz: 1,
                        end_juz: 2,
                        start_surah: 1,
                        start_surah_name_ar: "الفاتحة",
                        start_surah_name_en: "Al-Fatihah",
                        start_ayah: 1,
                        end_surah: 2,
                        end_surah_name_ar: "البقرة",
                        end_surah_name_en: "Al-Baqarah",
                        end_ayah: 252,
                        start_global_ayah: 1,
                        end_global_ayah: 259,
                        daily_breakdown: [],
                        sort_order: 0,
                      },
                    ],
                    error: null,
                  })
                ),
              })),
            })),
          }
        }

        return {}
      }),
    }

    vi.mocked(getSupabaseServerClient).mockReturnValue(mockSupabase as any)
  })

  it("1. Reports member as unlinked when linked_user_id is null", async () => {
    const status = await getMemberLinkStatus(
      mockGroupPublicId,
      mockMemberPublicId,
      mockOtherUserId
    )
    expect(status).toBeDefined()
    expect(status?.isLinked).toBe(false)
    expect(status?.isLinkedToCurrentUser).toBe(false)
    expect(status?.isOwner).toBe(false)
  })

  it("2. Successfully links member slot to user account", async () => {
    const success = await linkMemberAccount(
      mockGroupPublicId,
      mockMemberPublicId,
      mockOtherUserId
    )
    expect(success).toBe(true)

    // Verify status is now linked to this user
    const status = await getMemberLinkStatus(
      mockGroupPublicId,
      mockMemberPublicId,
      mockOtherUserId
    )
    expect(status?.isLinked).toBe(true)
    expect(status?.isLinkedToCurrentUser).toBe(true)
    expect(status?.linkedUserId).toBe(mockOtherUserId)
  })

  it("3. Group Progress Summary reflects linked member status (isLinked: true)", async () => {
    // Link member 1 to mockOtherUserId
    await linkMemberAccount(
      mockGroupPublicId,
      mockMemberPublicId,
      mockOtherUserId
    )

    const summary = await fetchGroupProgressSummary(
      mockGroupPublicId,
      mockOwnerId // requesting as owner
    )
    expect(summary).toBeDefined()
    expect(summary?.members.length).toBe(2)

    const abdulrahman = summary?.members.find(
      (m) => m.memberName === "عبدالرحمن ادم"
    )
    expect(abdulrahman?.isLinked).toBe(true)
    expect(abdulrahman?.linkedUserId).toBe(mockOtherUserId)

    const zainab = summary?.members.find((m) => m.memberName === "زينب")
    expect(zainab?.isLinked).toBe(true)
  })

  it("4. Group Progress Summary is strictly blocked for non-owners", async () => {
    // Non-owner requesting summary
    const unauthorizedSummary = await fetchGroupProgressSummary(
      mockGroupPublicId,
      "unauthorized-random-user"
    )
    expect(unauthorizedSummary).toBeNull()

    // Owner requesting summary succeeds
    const ownerSummary = await fetchGroupProgressSummary(
      mockGroupPublicId,
      mockOwnerId
    )
    expect(ownerSummary).toBeDefined()
    expect(ownerSummary?.groupPublicId).toBe(mockGroupPublicId)
  })
})
