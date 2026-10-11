import { beforeEach, describe, expect, it, vi } from "vitest"
import { FakeSupabase } from "./helpers/fake-supabase"

const state = vi.hoisted(() => ({ db: null as unknown }))

vi.mock("../lib/supabase/server", () => ({
  getSupabaseServerClient: () => state.db,
  createSupabaseServerClient: async () => null,
  isSupabaseServerConfigured: () => true,
}))

import {
  advanceRecurringGroupIfDue,
  deleteUserAccount,
  fetchGroupProgressSummary,
  fetchUserTodaysReading,
  getGroupByPublicId,
  getMemberLinkStatus,
  getMemberScheduleByPublicId,
  linkMemberAccount,
  processRecurringCycle,
  saveReadingProgress,
  saveScheduleGroup,
  updateGroupAndRegenerate,
} from "../lib/groups/service"
import { generateQuranSchedule } from "../lib/scheduler/engine"
import { MemberConfig, ScheduleInput } from "../lib/scheduler/types"

const OWNER = "11111111-1111-4111-8111-111111111111"
const ALICE = "22222222-2222-4222-8222-222222222222"
const BOB = "33333333-3333-4333-8333-333333333333"

let db: FakeSupabase

function member(id: string, name: string, weeklyAmount: number): MemberConfig {
  return { id, name, knowledgeType: "entire", startJuz: 1, endJuz: 30, weeklyAmount }
}

function familyInput(overrides: Partial<ScheduleInput["group"]> = {}): ScheduleInput {
  return {
    group: { name: "Family", weeksCount: 3, dailyDivisionEnabled: true, ...overrides },
    members: [member("a", "Ahmed", 10), member("b", "Ahmed", 10), member("c", "Fatima", 10)],
  }
}

async function saveFamily(owner: string | null = OWNER, overrides = {}) {
  const input = familyInput(overrides)
  const saved = await saveScheduleGroup(input, generateQuranSchedule(input), "en", owner)
  const loaded = await getGroupByPublicId(saved.publicId)
  return { saved, loaded: loaded!, input }
}

beforeEach(() => {
  db = new FakeSupabase()
  state.db = db
})

describe("member account linking", () => {
  it("reports an unlinked slot", async () => {
    const { saved, loaded } = await saveFamily()
    const status = await getMemberLinkStatus(saved.publicId, loaded.membersConfig[0].publicId!, ALICE)
    expect(status).not.toBeNull()
    expect(status?.isLinked).toBe(false)
    expect(status?.isLinkedToCurrentUser).toBe(false)
    expect(status?.isOwner).toBe(false)
  })

  it("links a slot by its public ID (not a uuid) and reports it", async () => {
    const { saved, loaded } = await saveFamily()
    const memberPublicId = loaded.membersConfig[0].publicId!
    expect(memberPublicId).toMatch(/^m_/)

    expect(await linkMemberAccount(saved.publicId, memberPublicId, ALICE)).toEqual({ success: true })
    const status = await getMemberLinkStatus(saved.publicId, memberPublicId, ALICE)
    expect(status?.isLinked).toBe(true)
    expect(status?.isLinkedToCurrentUser).toBe(true)
  })

  it("never lets another account take over a linked slot", async () => {
    const { saved, loaded } = await saveFamily()
    const memberPublicId = loaded.membersConfig[0].publicId!
    await linkMemberAccount(saved.publicId, memberPublicId, ALICE)

    const result = await linkMemberAccount(saved.publicId, memberPublicId, BOB)
    expect(result).toEqual({ success: false, reason: "already_linked" })
    const row = db.table("group_members").find((r) => r.public_id === memberPublicId)
    expect(row?.linked_user_id).toBe(ALICE)

    const bobView = await getMemberLinkStatus(saved.publicId, memberPublicId, BOB)
    expect(bobView?.isLinked).toBe(true)
    expect(bobView?.linkedUserId).toBeNull()
  })

  it("allows one slot per account in a group", async () => {
    const { saved, loaded } = await saveFamily()
    await linkMemberAccount(saved.publicId, loaded.membersConfig[0].publicId!, ALICE)
    const second = await linkMemberAccount(saved.publicId, loaded.membersConfig[1].publicId!, ALICE)
    expect(second).toEqual({ success: false, reason: "already_member" })
  })

  it("treats a crafted member ID as plain text", async () => {
    const { saved } = await saveFamily()
    const result = await linkMemberAccount(saved.publicId, "x,name.neq.zzz", ALICE)
    expect(result).toEqual({ success: false, reason: "not_found" })
    expect(db.table("group_members").every((r) => r.linked_user_id === null)).toBe(true)
  })
})

describe("saving schedules", () => {
  it("keeps two members with the same name apart", async () => {
    const { loaded } = await saveFamily()
    const [ahmed1, ahmed2] = loaded.membersConfig
    expect(ahmed1.name).toBe(ahmed2.name)
    expect(ahmed1.id).not.toBe(ahmed2.id)
    for (const week of loaded.schedule.weeks) {
      const ids = week.assignments.map((a) => a.memberId)
      expect(new Set(ids).size).toBe(3)
      expect(ids).toContain(ahmed1.id)
      expect(ids).toContain(ahmed2.id)
    }
  })

  it("ignores assignments sent by a modified client", async () => {
    const input = familyInput()
    const tampered = generateQuranSchedule(input)
    for (const week of tampered.weeks) {
      for (const a of week.assignments) {
        a.startJuz = 1
        a.endJuz = 1
        a.startAyah = { ...a.startAyah, surahNumber: 1, ayahNumber: 1 }
      }
    }
    const saved = await saveScheduleGroup(input, tampered, "en", OWNER)
    const loaded = await getGroupByPublicId(saved.publicId)
    for (const week of loaded!.schedule.weeks) {
      const starts = week.assignments.map((a) => a.startJuz).sort((x, y) => x - y)
      expect(starts).toEqual([1, 11, 21])
    }
  })

  it("does not expose account IDs to people holding the link", async () => {
    const { saved, loaded } = await saveFamily()
    await linkMemberAccount(saved.publicId, loaded.membersConfig[0].publicId!, ALICE)
    const reloaded = await getGroupByPublicId(saved.publicId)
    const json = JSON.stringify(reloaded)
    expect(json).not.toContain(ALICE)
    expect(json).not.toContain(OWNER)
    expect(reloaded!.membersConfig[0].isLinked).toBe(true)
  })

  it("rebuilds week date ranges when loading a dated plan", async () => {
    const { loaded } = await saveFamily(OWNER, { usesDates: true, startDate: "2026-11-07" })
    expect(loaded.schedule.weeks[0].dateRange?.startDate).toBe("2026-11-07")
    expect(loaded.schedule.weeks[1].dateRange?.startDate).toBe("2026-11-14")
  })
})

describe("editing a saved group", () => {
  it("keeps member links, public IDs and reading progress", async () => {
    const { saved, loaded, input } = await saveFamily()
    const fatima = loaded.membersConfig[2]
    await linkMemberAccount(saved.publicId, fatima.publicId!, ALICE)
    await saveReadingProgress(saved.publicId, fatima.publicId!, 1, 1, true, ALICE)

    const edited: ScheduleInput = {
      group: { ...input.group, weeksCount: 4 },
      members: loaded.membersConfig.map((m) => ({ ...m })),
    }
    const updated = await updateGroupAndRegenerate(saved.publicId, saved.editToken, edited, "en")

    expect(updated.schedule.weeks).toHaveLength(4)
    expect(updated.membersConfig.map((m) => m.publicId)).toEqual(
      loaded.membersConfig.map((m) => m.publicId)
    )
    const row = db.table("group_members").find((r) => r.public_id === fatima.publicId)
    expect(row?.linked_user_id).toBe(ALICE)
    expect(db.table("reading_progress")).toHaveLength(1)
    expect(db.table("schedule_plans").filter((p) => p.is_active)).toHaveLength(1)
  })

  it("rejects a public ID that belongs to another group", async () => {
    const first = await saveFamily()
    const second = await saveFamily()
    const stolenId = first.loaded.membersConfig[0].publicId!
    const edited: ScheduleInput = {
      group: second.input.group,
      members: second.loaded.membersConfig.map((m, i) => (i === 0 ? { ...m, publicId: stolenId } : m)),
    }
    const updated = await updateGroupAndRegenerate(
      second.saved.publicId,
      second.saved.editToken,
      edited,
      "en"
    )
    expect(updated.membersConfig.map((m) => m.publicId)).not.toContain(stolenId)
  })
})

describe("reading progress", () => {
  it("rejects week and day numbers outside the plan", async () => {
    const { saved, loaded } = await saveFamily()
    const pid = loaded.membersConfig[0].publicId!
    for (const [week, day] of [
      [0, 1],
      [4, 1],
      [1, 0],
      [1, 8],
      [1.5, 1],
    ]) {
      const res = await saveReadingProgress(saved.publicId, pid, week, day, true, null)
      expect(res).toEqual({ success: false, reason: "invalid" })
    }
    expect(db.table("reading_progress")).toHaveLength(0)
  })

  it("lets the link holder update an unlinked slot", async () => {
    const { saved, loaded } = await saveFamily()
    const res = await saveReadingProgress(saved.publicId, loaded.membersConfig[0].publicId!, 1, 2, true, null)
    expect(res.success).toBe(true)
  })

  it("only lets the linked account or the owner update a linked slot", async () => {
    const { saved, loaded } = await saveFamily()
    const pid = loaded.membersConfig[0].publicId!
    await linkMemberAccount(saved.publicId, pid, ALICE)

    expect(await saveReadingProgress(saved.publicId, pid, 1, 1, true, null)).toEqual({
      success: false,
      reason: "forbidden",
    })
    expect(await saveReadingProgress(saved.publicId, pid, 1, 1, true, BOB)).toEqual({
      success: false,
      reason: "forbidden",
    })
    expect((await saveReadingProgress(saved.publicId, pid, 1, 1, true, ALICE)).success).toBe(true)
    expect((await saveReadingProgress(saved.publicId, pid, 1, 2, true, OWNER)).success).toBe(true)
  })
})

describe("group progress summary", () => {
  it("reflects linked members for the owner", async () => {
    const { saved, loaded } = await saveFamily()
    await linkMemberAccount(saved.publicId, loaded.membersConfig[0].publicId!, ALICE)
    const summary = await fetchGroupProgressSummary(saved.publicId, OWNER)
    expect(summary?.members).toHaveLength(3)
    expect(summary?.members[0].isLinked).toBe(true)
    expect(summary?.members[1].isLinked).toBe(false)
  })

  it("is hidden from anonymous visitors and other accounts", async () => {
    const { saved } = await saveFamily()
    expect(await fetchGroupProgressSummary(saved.publicId, null)).toBeNull()
    expect(await fetchGroupProgressSummary(saved.publicId, BOB)).toBeNull()
  })
})

describe("member page and today's reading", () => {
  it("shows only the member's own assignments", async () => {
    const { saved, loaded } = await saveFamily()
    const target = loaded.membersConfig[1]
    const page = await getMemberScheduleByPublicId(saved.publicId, target.publicId!)
    expect(page?.weeks).toHaveLength(3)
    for (const w of page!.weeks) expect(w.assignment.memberId).toBe(target.id)
  })

  it("gives an owner who is not a member no reading", async () => {
    await saveFamily()
    expect(await fetchUserTodaysReading(OWNER)).toBeNull()
  })
})

describe("account deletion", () => {
  it("removes personal data, releases slots and deletes the login", async () => {
    const { saved, loaded } = await saveFamily(BOB)
    const pid = loaded.membersConfig[0].publicId!
    await linkMemberAccount(saved.publicId, pid, ALICE)
    await saveReadingProgress(saved.publicId, pid, 1, 1, true, ALICE)
    db.table("push_subscriptions").push({ id: crypto.randomUUID(), user_id: ALICE, endpoint: "e" })
    db.table("bookmarks").push({ id: crypto.randomUUID(), user_id: ALICE })
    await saveFamily(ALICE)

    expect(await deleteUserAccount(ALICE)).toBe(true)
    expect(db.deletedAuthUsers).toEqual([ALICE])
    expect(db.table("groups").some((g) => g.owner_user_id === ALICE)).toBe(false)
    expect(db.table("groups").some((g) => g.owner_user_id === BOB)).toBe(true)
    expect(db.table("push_subscriptions")).toHaveLength(0)
    expect(db.table("bookmarks")).toHaveLength(0)
    expect(db.table("group_members").some((m) => m.linked_user_id === ALICE)).toBe(false)
    expect(db.table("reading_progress").some((p) => p.user_id === ALICE)).toBe(false)
    expect(db.table("reading_progress")).toHaveLength(1)
  })

  it("reports failure when a step fails", async () => {
    db.auth.admin.deleteUser = async () => ({ data: {}, error: { message: "boom" } as never })
    expect(await deleteUserAccount(ALICE)).toBe(false)
  })
})

describe("recurring cycles", () => {
  async function saveRecurring(owner: string | null) {
    const input = familyInput({
      usesDates: true,
      startDate: "2026-11-07",
      recurrence: { frequency: "weekly", autoAdvance: true },
    })
    return saveScheduleGroup(input, null, "en", owner)
  }

  it("stores the recurrence setting and when the next cycle is due", async () => {
    const saved = await saveRecurring(OWNER)
    const row = db.table("groups").find((g) => g.public_id === saved.publicId)!
    expect(row.recurrence).toEqual({ frequency: "weekly", autoAdvance: true })
    // 3 weeks from 2026-11-07 is 2026-11-28; due the day before.
    expect(row.next_cycle_due_at).toBe("2026-11-27T00:00:00.000Z")
  })

  it("does not auto-renew groups without an owner account", async () => {
    const saved = await saveRecurring(null)
    const row = db.table("groups").find((g) => g.public_id === saved.publicId)!
    expect(row.recurrence.autoAdvance).toBe(false)
    expect(await advanceRecurringGroupIfDue(saved.publicId, new Date("2027-01-01"))).toBe(false)
  })

  it("waits until the cycle is due, then creates exactly one next cycle", async () => {
    const saved = await saveRecurring(OWNER)
    const loaded = await getGroupByPublicId(saved.publicId)
    await linkMemberAccount(saved.publicId, loaded!.membersConfig[0].publicId!, ALICE)

    expect(await advanceRecurringGroupIfDue(saved.publicId, new Date("2026-11-20"))).toBe(false)
    expect(db.table("groups")).toHaveLength(1)

    expect(await advanceRecurringGroupIfDue(saved.publicId, new Date("2026-11-27T01:00:00Z"))).toBe(true)
    expect(await advanceRecurringGroupIfDue(saved.publicId, new Date("2026-11-28"))).toBe(false)
    expect(db.table("groups")).toHaveLength(2)

    const parent = db.table("groups").find((g) => g.public_id === saved.publicId)!
    const child = db.table("groups").find((g) => g.public_id !== saved.publicId)!
    expect(child.recurring_source_group_id).toBe(parent.id)
    expect(child.cycle_index).toBe(2)
    expect(child.start_date).toBe("2026-11-28")
    expect(child.recurrence.autoAdvance).toBe(true)
    expect(parent.recurrence.autoAdvance).toBe(false)

    const childMembers = db.table("group_members").filter((m) => m.group_id === child.id)
    expect(childMembers.find((m) => m.public_id === loaded!.membersConfig[0].publicId)?.linked_user_id).toBe(
      ALICE
    )
  })

  it("returns the existing cycle when started twice by hand", async () => {
    const saved = await saveRecurring(OWNER)
    const first = await processRecurringCycle(saved.publicId, OWNER, undefined, "en")
    const second = await processRecurringCycle(saved.publicId, OWNER, undefined, "en")
    expect(second.publicId).toBe(first.publicId)
    expect(db.table("groups")).toHaveLength(2)
  })
})
