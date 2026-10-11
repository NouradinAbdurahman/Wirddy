import { SupabaseClient } from "@supabase/supabase-js"
import { GeneratedSchedule, ScheduleInput } from "../scheduler/types"

/**
 * Shared database mechanics for saving schedule plans and looking up members.
 * Callers own authorization and business rules; these helpers only read and
 * write rows and report what happened.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = SupabaseClient<any>

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value)
}

export interface MemberRow {
  id: string
  public_id: string | null
  name: string
  linked_user_id: string | null
  sort_order: number
}

/**
 * Finds a member of a group by its public ID. Older links may carry the
 * member's row ID instead, so a UUID is also tried as the row ID. Each value
 * is matched with `eq`, never interpolated into a filter string, so it cannot
 * change the query.
 */
export async function findGroupMember(
  db: Db,
  groupId: string,
  memberRef: string
): Promise<MemberRow | null> {
  const ref = memberRef.trim()
  if (!ref) return null

  const byPublicId = await db
    .from("group_members")
    .select("id, public_id, name, linked_user_id, sort_order")
    .eq("group_id", groupId)
    .eq("public_id", ref)
    .limit(1)
  if (byPublicId.data && byPublicId.data.length > 0) {
    return byPublicId.data[0] as MemberRow
  }

  if (!isUuid(ref)) return null

  const byId = await db
    .from("group_members")
    .select("id, public_id, name, linked_user_id, sort_order")
    .eq("group_id", groupId)
    .eq("id", ref)
    .limit(1)
  return byId.data && byId.data.length > 0 ? (byId.data[0] as MemberRow) : null
}

export interface PlanSettings {
  rotationStyle: string
  rangeType: string
  startJuz: number
  customRange?: ScheduleInput["group"]["customRange"]
  title: string | null
  description: string | null
  startDate: string | null
  usesDates: boolean
  occasionType: string
  islamicYear: number | null
  dailyDivisionEnabled: boolean
}

export function planSettingsFromInput(input: ScheduleInput, schedule: GeneratedSchedule): PlanSettings {
  const g = input.group
  return {
    rotationStyle: g.rotationStyle || "medium",
    rangeType: g.rangeType || "full",
    startJuz: g.startJuz || 1,
    customRange: g.rangeType === "custom" ? g.customRange : undefined,
    title: g.title?.trim() || null,
    description: g.description?.trim() || null,
    startDate: g.startDate || schedule.startDate || null,
    usesDates: !!g.usesDates || !!schedule.usesDates,
    occasionType: g.occasionType || schedule.occasionType || "normal",
    islamicYear: g.islamicYear || schedule.islamicYear || null,
    dailyDivisionEnabled: !!g.dailyDivisionEnabled,
  }
}

/** Column values shared by `groups` and `schedule_plans` rows. */
export function settingsColumns(s: PlanSettings) {
  return {
    rotation_style: s.rotationStyle,
    range_type: s.rangeType,
    start_juz: s.startJuz,
    range_start_surah: s.customRange?.startSurah ?? null,
    range_start_ayah: s.customRange?.startAyah ?? null,
    range_end_surah: s.customRange?.endSurah ?? null,
    range_end_ayah: s.customRange?.endAyah ?? null,
    title: s.title,
    description: s.description,
    start_date: s.startDate,
    uses_dates: s.usesDates,
    occasion_type: s.occasionType,
    islamic_year: s.islamicYear,
    daily_division_enabled: s.dailyDivisionEnabled,
  }
}

/**
 * Inserts a plan version with all its weeks and assignments. Assignments are
 * matched to member rows by member public ID, which is unique within a group.
 * Weeks and assignments are written in two batched inserts.
 */
export async function insertPlanWithAssignments(
  db: Db,
  params: {
    groupId: string
    versionNumber: number
    weeksCount: number
    settings: PlanSettings
    schedule: GeneratedSchedule
    memberRowIdByPublicId: Map<string, string>
  }
): Promise<{ ok: true; planId: string } | { ok: false; step: string; error: unknown }> {
  const { groupId, versionNumber, weeksCount, settings, schedule, memberRowIdByPublicId } = params

  const plan = await db
    .from("schedule_plans")
    .insert({
      group_id: groupId,
      version_number: versionNumber,
      weeks_count: weeksCount,
      total_juz_per_week: 30,
      scheduler_version: "2.0",
      is_active: true,
      ...settingsColumns(settings),
    })
    .select("id")
    .single()
  if (plan.error || !plan.data) return { ok: false, step: "plan", error: plan.error }
  const planId = (plan.data as { id: string }).id

  const weeks = await db
    .from("schedule_weeks")
    .insert(
      schedule.weeks.map((w) => ({
        schedule_plan_id: planId,
        week_number: w.weekNumber,
        total_juz: 30,
      }))
    )
    .select("id, week_number")
  if (weeks.error || !weeks.data) return { ok: false, step: "weeks", error: weeks.error }

  const weekIdByNumber = new Map<number, string>()
  for (const w of weeks.data as Array<{ id: string; week_number: number }>) {
    weekIdByNumber.set(w.week_number, w.id)
  }

  const rows = []
  for (const week of schedule.weeks) {
    const weekId = weekIdByNumber.get(week.weekNumber)
    for (const [i, a] of week.assignments.entries()) {
      const memberId = a.memberPublicId ? memberRowIdByPublicId.get(a.memberPublicId) : undefined
      if (!weekId || !memberId) {
        return { ok: false, step: "assignments", error: `No member row for ${a.memberPublicId}` }
      }
      rows.push({
        schedule_week_id: weekId,
        member_id: memberId,
        member_name: a.memberName,
        weekly_amount: a.weeklyAmount,
        start_juz: a.startJuz,
        end_juz: a.endJuz,
        start_surah: a.startAyah.surahNumber,
        start_surah_name_ar: a.startAyah.surahNameAr,
        start_surah_name_en: a.startAyah.surahNameEn,
        start_ayah: a.startAyah.ayahNumber,
        end_surah: a.endAyah.surahNumber,
        end_surah_name_ar: a.endAyah.surahNameAr,
        end_surah_name_en: a.endAyah.surahNameEn,
        end_ayah: a.endAyah.ayahNumber,
        start_global_ayah: a.startAyah.globalAyahNumber ?? null,
        end_global_ayah: a.endAyah.globalAyahNumber ?? null,
        daily_breakdown: a.dailyBreakdown ?? null,
        sort_order: i,
      })
    }
  }

  const inserted = await db.from("schedule_assignments").insert(rows)
  if (inserted.error) return { ok: false, step: "assignments", error: inserted.error }

  return { ok: true, planId }
}
