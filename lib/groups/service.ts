import { getSupabaseServerClient } from "../supabase/server"
import { Database, Json } from "../supabase/types"
import {
  CustomQuranRange,
  DailyPortion,
  GeneratedSchedule,
  MemberAssignment,
  MemberConfig,
  OccasionType,
  RangeType,
  RecurrenceConfig,
  RotationStyle,
  ScheduleInput,
  WeekSchedule,
} from "../scheduler/types"
import { generateQuranSchedule, SchedulerError } from "../scheduler/engine"
import { validateScheduleInput } from "../scheduler/validator"
import {
  generateEditToken,
  generateMemberPublicId,
  generatePublicId,
  hashEditToken,
  verifyEditToken,
} from "./crypto"
import { addDaysToDate, calculateWeekDateRanges, WeekDateRange } from "../dates/calendar"
import { getCurrentHijriYear, getRamadanStartDate } from "../dates/ramadan"
import {
  findGroupMember,
  insertPlanWithAssignments,
  planSettingsFromInput,
  settingsColumns,
} from "./persistence"

export interface SavedGroupResult {
  publicId: string
  editToken: string
  groupName: string
  expiresAt: string
}

export interface LoadedPublicGroup {
  publicId: string
  groupName: string
  title?: string
  description?: string
  language: "ar" | "en"
  direction: "rtl" | "ltr"
  expiresAt: string
  isExpired: boolean
  schedule: GeneratedSchedule
  membersConfig: MemberConfig[]
  versionNumber: number
  rotationStyle?: RotationStyle
  rangeType?: RangeType
  startJuz?: number
  customRange?: CustomQuranRange
  startDate?: string
  usesDates?: boolean
  occasionType?: OccasionType
  islamicYear?: number
  dailyDivisionEnabled?: boolean
  recurrence?: RecurrenceConfig
  ownerUserId?: string | null
}

export interface LoadedPublicMemberSchedule {
  groupPublicId: string
  groupName: string
  title?: string
  description?: string
  language: "ar" | "en"
  direction: "rtl" | "ltr"
  expiresAt: string
  isExpired: boolean
  member: MemberConfig
  memberPublicId: string
  totalWeeks: number
  weeks: Array<{
    weekNumber: number
    assignment: MemberAssignment
    dateRange?: WeekDateRange
  }>
  scheduleSettings: {
    usesDates?: boolean
    startDate?: string
    occasionType?: OccasionType
    islamicYear?: number
    dailyDivisionEnabled?: boolean
    rotationStyle?: RotationStyle
    rangeType?: RangeType
    customRange?: CustomQuranRange
  }
}

function localizedError(lang: "ar" | "en", ar: string, en: string): Error {
  return new Error(lang === "ar" ? ar : en)
}

/**
 * Validates input and generates its schedule, turning scheduler failures into
 * errors in the requested language.
 */
function generateValidatedSchedule(
  input: ScheduleInput,
  lang: "ar" | "en"
): GeneratedSchedule {
  const validation = validateScheduleInput(input)
  if (!validation.isValid) {
    const first = validation.errors[0]
    throw localizedError(
      lang,
      first?.messageAr || "بيانات الخطة غير صالحة.",
      first?.messageEn || "Invalid schedule configuration."
    )
  }
  try {
    return generateQuranSchedule(input)
  } catch (err) {
    if (err instanceof SchedulerError) {
      throw localizedError(lang, err.messageAr, err.messageEn)
    }
    throw err
  }
}

/**
 * Keeps only the member fields a client may set, trimmed, with a unique
 * internal ID per position. Public IDs and account links are assigned by the
 * server.
 */
function sanitizeMembers(members: MemberConfig[]): MemberConfig[] {
  return members.map((m, i) => ({
    id: `member-${i + 1}`,
    name: String(m.name || "").trim(),
    knowledgeType: m.knowledgeType,
    startJuz: m.startJuz,
    endJuz: m.endJuz,
    startSurah: m.knowledgeType === "surah_range" ? m.startSurah : undefined,
    endSurah: m.knowledgeType === "surah_range" ? m.endSurah : undefined,
    weeklyAmount: m.weeklyAmount,
  }))
}

/**
 * Stored recurrence for a group. Automatic renewal needs an owner account,
 * because a cycle created by the server gets a new edit link that only the
 * owner's account can reach.
 */
function storedRecurrence(
  recurrence: RecurrenceConfig | undefined,
  ownerUserId: string | null | undefined
): RecurrenceConfig | null {
  if (!recurrence || recurrence.frequency === "none") return null
  return {
    frequency: recurrence.frequency,
    autoAdvance: Boolean(ownerUserId) && recurrence.autoAdvance !== false,
  }
}

type GroupRow = Database["public"]["Tables"]["groups"]["Row"]

/** Reads a stored recurrence value, ignoring anything malformed. */
function parseRecurrence(value: Json | null | undefined): RecurrenceConfig | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const frequency = value.frequency
  if (frequency !== "weekly" && frequency !== "monthly" && frequency !== "ramadan") return null
  return { frequency, autoAdvance: value.autoAdvance === true }
}

function recurrenceJson(r: RecurrenceConfig | null): Json {
  return r ? { frequency: r.frequency, autoAdvance: Boolean(r.autoAdvance) } : null
}

/**
 * Returns the ISO date the next cycle of a recurring group starts on.
 */
export function computeNextCycleStart(params: {
  frequency: RecurrenceConfig["frequency"]
  startDate: string | null | undefined
  weeksCount: number
  createdAt: string | null | undefined
  islamicYear: number | null | undefined
}): string | null {
  const { frequency, weeksCount, islamicYear } = params
  if (frequency === "none") return null
  if (frequency === "ramadan") {
    const year = islamicYear ? islamicYear + 1 : getCurrentHijriYear() + 1
    return getRamadanStartDate(year)
  }
  const base = params.startDate || (params.createdAt || new Date().toISOString()).slice(0, 10)
  if (frequency === "weekly") return addDaysToDate(base, weeksCount * 7)
  const d = new Date(`${base}T00:00:00Z`)
  d.setUTCMonth(d.getUTCMonth() + 1)
  return d.toISOString().slice(0, 10)
}

/** A cycle is due one day before it starts, so members can see it in advance. */
function cycleDueAt(nextStart: string | null): string | null {
  if (!nextStart) return null
  return `${addDaysToDate(nextStart, -1)}T00:00:00.000Z`
}

interface CreateGroupOptions {
  /** Account links to copy onto members, keyed by member internal ID. */
  linkedUserIds?: Map<string, string>
  recurringSourceGroupId?: string
  cycleIndex?: number
}

/**
 * Creates a group, its members and its first plan version from trusted,
 * already sanitized input. Removes the group again if any step fails.
 */
async function createGroupWithSchedule(
  input: ScheduleInput,
  lang: "ar" | "en",
  ownerUserId: string | null | undefined,
  options: CreateGroupOptions = {}
): Promise<SavedGroupResult> {
  const schedule = generateValidatedSchedule(input, lang)

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    throw localizedError(
      lang,
      "خدمة الحفظ غير متوفرة حالياً.",
      "Online saving service is currently unavailable."
    )
  }

  const publicId = generatePublicId(14)
  const editToken = generateEditToken()
  const settings = planSettingsFromInput(input, schedule)
  const recurrence = storedRecurrence(input.group.recurrence, ownerUserId)
  const nextStart = recurrence
    ? computeNextCycleStart({
        frequency: recurrence.frequency,
        startDate: settings.startDate,
        weeksCount: schedule.weeksCount,
        createdAt: null,
        islamicYear: settings.islamicYear,
      })
    : null

  const { data: groupData, error: groupError } = (await supabase.from("groups")
    .insert({
      public_id: publicId,
      edit_token_hash: hashEditToken(editToken),
      owner_user_id: ownerUserId || null,
      status: "active",
      is_archived: false,
      name: input.group.name.trim(),
      language: lang,
      direction: lang === "ar" ? "rtl" : "ltr",
      scheduler_version: "2.0",
      recurrence: recurrenceJson(recurrence),
      next_cycle_due_at: recurrence?.autoAdvance ? cycleDueAt(nextStart) : null,
      recurring_source_group_id: options.recurringSourceGroupId || null,
      cycle_index: options.cycleIndex || 1,
      ...settingsColumns(settings),
    })
    .select("id, expires_at")
    .single()) as { data: { id: string; expires_at: string } | null; error: unknown }

  if (groupError || !groupData) {
    console.error("Error creating group:", groupError)
    throw localizedError(lang, "تعذر حفظ المجموعة على الخادم.", "Failed to save group to server.")
  }

  const groupId = groupData.id
  const fail = async (ar: string, en: string, detail: unknown) => {
    console.error(en, detail)
    await supabase.from("groups").delete().eq("id", groupId)
    return localizedError(lang, ar, en)
  }

  const { data: insertedMembers, error: membersError } = (await (
    supabase.from("group_members")
  )
    .insert(
      schedule.members.map((m, idx) => ({
        group_id: groupId,
        name: m.name.trim(),
        public_id: m.publicId,
        knowledge_type: m.knowledgeType,
        start_juz: m.startJuz,
        end_juz: m.endJuz,
        start_surah: m.startSurah || null,
        end_surah: m.endSurah || null,
        weekly_amount: m.weeklyAmount,
        sort_order: idx,
        linked_user_id: options.linkedUserIds?.get(m.id) || null,
      }))
    )
    .select("id, public_id")) as {
    data: Array<{ id: string; public_id: string }> | null
    error: unknown
  }

  if (membersError || !insertedMembers) {
    throw await fail("تعذر حفظ بيانات الأعضاء.", "Failed to save group members.", membersError)
  }

  const plan = await insertPlanWithAssignments(supabase, {
    groupId,
    versionNumber: 1,
    weeksCount: schedule.weeksCount,
    settings,
    schedule,
    memberRowIdByPublicId: new Map(insertedMembers.map((m) => [m.public_id, m.id])),
  })
  if (!plan.ok) {
    throw await fail("تعذر حفظ خطة الجدول.", `Failed to save schedule ${plan.step}.`, plan.error)
  }

  await createScheduleHistorySnapshot(
    groupId,
    "create_group",
    lang === "ar" ? "تم إنشاء الجدول" : "Schedule created",
    { input: { ...input, members: schedule.members } },
    ownerUserId || undefined
  )

  return {
    publicId,
    editToken,
    groupName: input.group.name,
    expiresAt: groupData.expires_at,
  }
}

/**
 * Saves a new group. The schedule sent by the browser is ignored: the server
 * regenerates it from the validated input, so a modified client cannot store
 * assignments that break the rules. Members get fresh random public IDs.
 */
export async function saveScheduleGroup(
  input: ScheduleInput,
  _clientSchedule: GeneratedSchedule | null,
  lang: "ar" | "en" = "ar",
  ownerUserId?: string | null
): Promise<SavedGroupResult> {
  const members = sanitizeMembers(input.members).map((m) => ({
    ...m,
    publicId: generateMemberPublicId(),
  }))
  return createGroupWithSchedule({ group: input.group, members }, lang, ownerUserId)
}

/**
 * Retrieves a saved group and full schedule snapshot by its public ID.
 */
export async function getGroupByPublicId(
  publicId: string
): Promise<LoadedPublicGroup | null> {
  if (!publicId || typeof publicId !== "string") {
    return null
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return null
  }

  // 1. Fetch group
  const { data: group, error: groupError } = (await supabase
    .from("groups")
    .select(
      "id, public_id, name, title, description, language, direction, expires_at, rotation_style, range_type, start_juz, range_start_surah, range_start_ayah, range_end_surah, range_end_ayah, start_date, uses_dates, occasion_type, islamic_year, daily_division_enabled, owner_user_id, recurrence"
    )
    .eq("public_id", publicId.trim())
    .single()) as {
    data: {
      id: string
      public_id: string
      name: string
      title: string | null
      description: string | null
      language: "ar" | "en"
      direction: "rtl" | "ltr"
      expires_at: string
      rotation_style: RotationStyle
      range_type: RangeType
      start_juz: number
      range_start_surah: number | null
      range_start_ayah: number | null
      range_end_surah: number | null
      range_end_ayah: number | null
      start_date: string | null
      uses_dates: boolean
      occasion_type: OccasionType
      islamic_year: number | null
      daily_division_enabled: boolean
      owner_user_id: string | null
      recurrence: Json | null
    } | null
    error: unknown
  }

  if (groupError || !group) {
    return null
  }

  const isExpired = new Date(group.expires_at).getTime() < Date.now()
  if (isExpired) {
    return {
      publicId: group.public_id,
      groupName: group.name,
      title: group.title || undefined,
      description: group.description || undefined,
      language: group.language,
      direction: group.direction,
      expiresAt: group.expires_at,
      isExpired: true,
      schedule: {
        id: group.id,
        createdAt: new Date().toISOString(),
        groupName: group.name,
        weeksCount: 0,
        weeks: [],
        members: [],
      },
      membersConfig: [],
      versionNumber: 1,
    }
  }

  // 2. Fetch members
  const { data: members, error: membersError } = (await supabase
    .from("group_members")
    .select(
      "id, public_id, name, knowledge_type, start_juz, end_juz, start_surah, end_surah, weekly_amount, sort_order, linked_user_id"
    )
    .eq("group_id", group.id)
    .order("sort_order", { ascending: true })) as {
    data: Array<{
      id: string
      public_id: string | null
      name: string
      knowledge_type: "entire" | "juz_range" | "surah_range"
      start_juz: number
      end_juz: number
      start_surah: number | null
      end_surah: number | null
      weekly_amount: number
      sort_order: number
      linked_user_id: string | null
    }> | null
    error: unknown
  }

  if (membersError || !members) {
    return null
  }

  const membersConfig: MemberConfig[] = members.map((m) => ({
    id: m.id,
    publicId: m.public_id || undefined,
    name: m.name,
    knowledgeType: m.knowledge_type,
    startJuz: m.start_juz,
    endJuz: m.end_juz,
    startSurah: m.start_surah || undefined,
    endSurah: m.end_surah || undefined,
    weeklyAmount: m.weekly_amount,
    isLinked: Boolean(m.linked_user_id),
  }))

  const memberPublicIdMap = new Map<string, string>()
  members.forEach((m) => {
    if (m.public_id) {
      memberPublicIdMap.set(m.id, m.public_id)
    }
  })

  // 3. Fetch active plan
  const { data: plan, error: planError } = (await supabase
    .from("schedule_plans")
    .select(
      "id, version_number, weeks_count, scheduler_version, rotation_style, range_type, start_juz, range_start_surah, range_start_ayah, range_end_surah, range_end_ayah, title, description, start_date, uses_dates, occasion_type, islamic_year, daily_division_enabled"
    )
    .eq("group_id", group.id)
    .eq("is_active", true)
    .order("version_number", { ascending: false })
    .limit(1)
    .single()) as {
    data: {
      id: string
      version_number: number
      weeks_count: number
      scheduler_version: string
      rotation_style: RotationStyle
      range_type: RangeType
      start_juz: number
      range_start_surah: number | null
      range_start_ayah: number | null
      range_end_surah: number | null
      range_end_ayah: number | null
      title: string | null
      description: string | null
      start_date: string | null
      uses_dates: boolean
      occasion_type: OccasionType
      islamic_year: number | null
      daily_division_enabled: boolean
    } | null
    error: unknown
  }

  if (planError || !plan) {
    return null
  }

  // 4. Fetch weeks
  const { data: weeks, error: weeksError } = (await supabase
    .from("schedule_weeks")
    .select("id, week_number, total_juz")
    .eq("schedule_plan_id", plan.id)
    .order("week_number", { ascending: true })) as {
    data: Array<{
      id: string
      week_number: number
      total_juz: number
    }> | null
    error: unknown
  }

  if (weeksError || !weeks) {
    return null
  }

  // 5. Fetch assignments for all weeks
  const weekIds = weeks.map((w) => w.id)
  const { data: assignments, error: assignError } = (await supabase
    .from("schedule_assignments")
    .select(
      "id, schedule_week_id, member_id, member_name, weekly_amount, start_juz, end_juz, start_surah, start_surah_name_ar, start_surah_name_en, start_ayah, end_surah, end_surah_name_ar, end_surah_name_en, end_ayah, start_global_ayah, end_global_ayah, daily_breakdown, sort_order"
    )
    .in("schedule_week_id", weekIds)
    .order("sort_order", { ascending: true })) as {
    data: Array<{
      id: string
      schedule_week_id: string
      member_id: string
      member_name: string
      weekly_amount: number
      start_juz: number
      end_juz: number
      start_surah: number
      start_surah_name_ar: string
      start_surah_name_en: string
      start_ayah: number
      end_surah: number
      end_surah_name_ar: string
      end_surah_name_en: string
      end_ayah: number
      start_global_ayah: number | null
      end_global_ayah: number | null
      daily_breakdown: DailyPortion[] | null
      sort_order: number
    }> | null
    error: unknown
  }

  if (assignError || !assignments) {
    return null
  }

  const customRange: CustomQuranRange | undefined =
    plan.range_type === "custom" &&
    plan.range_start_surah &&
    plan.range_start_ayah &&
    plan.range_end_surah &&
    plan.range_end_ayah
      ? {
          startSurah: plan.range_start_surah,
          startAyah: plan.range_start_ayah,
          endSurah: plan.range_end_surah,
          endAyah: plan.range_end_ayah,
        }
      : undefined

  // Reassemble WeekSchedule objects
  const assignmentMap = new Map<string, MemberAssignment[]>()
  assignments.forEach((a) => {
    const list = assignmentMap.get(a.schedule_week_id) || []
    list.push({
      memberId: a.member_id,
      memberName: a.member_name,
      memberPublicId: memberPublicIdMap.get(a.member_id),
      weeklyAmount: a.weekly_amount,
      startJuz: a.start_juz,
      endJuz: a.end_juz,
      startAyah: {
        surahNumber: a.start_surah,
        surahNameAr: a.start_surah_name_ar,
        surahNameEn: a.start_surah_name_en,
        ayahNumber: a.start_ayah,
        juzNumber: a.start_juz,
        globalAyahNumber: a.start_global_ayah || undefined,
      },
      endAyah: {
        surahNumber: a.end_surah,
        surahNameAr: a.end_surah_name_ar,
        surahNameEn: a.end_surah_name_en,
        ayahNumber: a.end_ayah,
        juzNumber: a.end_juz,
        globalAyahNumber: a.end_global_ayah || undefined,
      },
      dailyBreakdown: a.daily_breakdown || undefined,
    })
    assignmentMap.set(a.schedule_week_id, list)
  })

  const planStartDate = plan.start_date || group.start_date || undefined
  const planUsesDates =
    (plan.uses_dates ?? group.uses_dates ?? false) ||
    (plan.occasion_type || group.occasion_type) === "ramadan"
  const weekDateRanges =
    planUsesDates && planStartDate
      ? calculateWeekDateRanges(planStartDate, plan.weeks_count)
      : undefined

  const builtWeeks: WeekSchedule[] = weeks.map((w) => ({
    weekNumber: w.week_number,
    totalJuz: w.total_juz,
    assignments: assignmentMap.get(w.id) || [],
    dateRange: weekDateRanges?.[w.week_number - 1],
  }))

  const effectiveTitle = plan.title || group.title || undefined
  const effectiveDescription =
    plan.description || group.description || undefined
  const effectiveStartDate = plan.start_date || group.start_date || undefined
  const effectiveUsesDates = plan.uses_dates ?? group.uses_dates ?? false
  const effectiveOccasion =
    plan.occasion_type || group.occasion_type || "normal"
  const effectiveIslamicYear =
    plan.islamic_year || group.islamic_year || undefined
  const effectiveDaily =
    plan.daily_division_enabled ?? group.daily_division_enabled ?? false

  const schedule: GeneratedSchedule = {
    id: group.id,
    createdAt: group.expires_at,
    groupName: group.name,
    title: effectiveTitle,
    description: effectiveDescription,
    weeksCount: plan.weeks_count,
    rotationStyle: plan.rotation_style,
    rangeType: plan.range_type,
    startJuz: plan.start_juz,
    customRange,
    startDate: effectiveStartDate,
    usesDates: effectiveUsesDates,
    occasionType: effectiveOccasion,
    islamicYear: effectiveIslamicYear,
    dailyDivisionEnabled: effectiveDaily,
    weekDateRanges,
    weeks: builtWeeks,
    members: membersConfig,
  }

  return {
    publicId: group.public_id,
    groupName: group.name,
    title: effectiveTitle,
    description: effectiveDescription,
    language: group.language,
    direction: group.direction,
    expiresAt: group.expires_at,
    isExpired: false,
    schedule,
    membersConfig,
    versionNumber: plan.version_number,
    rotationStyle: plan.rotation_style,
    rangeType: plan.range_type,
    startJuz: plan.start_juz,
    customRange,
    startDate: effectiveStartDate,
    usesDates: effectiveUsesDates,
    occasionType: effectiveOccasion,
    islamicYear: effectiveIslamicYear,
    dailyDivisionEnabled: effectiveDaily,
    recurrence: parseRecurrence(group.recurrence) || undefined,
  }
}

/**
 * Retrieves a single member's public schedule without exposing edit credentials.
 */
export async function getMemberScheduleByPublicId(
  groupPublicId: string,
  memberPublicId: string
): Promise<LoadedPublicMemberSchedule | null> {
  const group = await getGroupByPublicId(groupPublicId)
  if (!group || group.isExpired) {
    return null
  }

  const member = group.membersConfig.find(
    (m) => m.publicId === memberPublicId || m.id === memberPublicId
  )

  if (!member) {
    return null
  }

  // Filter assignments across all weeks for this specific member
  const memberWeeks = group.schedule.weeks.flatMap((week) => {
    const assignment = week.assignments.find((a) => a.memberId === member.id)
    return assignment
      ? [{ weekNumber: week.weekNumber, assignment, dateRange: week.dateRange }]
      : []
  })

  return {
    groupPublicId: group.publicId,
    groupName: group.groupName,
    title: group.title,
    description: group.description,
    language: group.language,
    direction: group.direction,
    expiresAt: group.expiresAt,
    isExpired: false,
    member,
    memberPublicId: member.publicId || memberPublicId,
    totalWeeks: group.schedule.weeksCount,
    weeks: memberWeeks,
    scheduleSettings: {
      usesDates: group.usesDates,
      startDate: group.startDate,
      occasionType: group.occasionType,
      islamicYear: group.islamicYear,
      dailyDivisionEnabled: group.dailyDivisionEnabled,
      rotationStyle: group.rotationStyle,
      rangeType: group.rangeType,
      customRange: group.customRange,
    },
  }
}

/**
 * Validates edit access for a group using the raw secret edit token or authenticated owner.
 */
export async function validateEditAccess(
  publicId: string,
  rawEditToken?: string,
  userId?: string
): Promise<boolean> {
  const { authorized } = await checkGroupAuthorization(
    publicId,
    rawEditToken,
    userId
  )
  return authorized
}

/**
 * Updates a group's settings and members and saves a new plan version.
 *
 * Members are matched to existing rows by public ID and updated in place, so
 * their personal links, linked accounts and reading progress survive the
 * edit. New members get fresh public IDs; members missing from the input are
 * removed.
 */
export async function updateGroupAndRegenerate(
  publicId: string,
  rawEditToken: string,
  input: ScheduleInput,
  lang: "ar" | "en" = "ar",
  userId?: string
): Promise<LoadedPublicGroup> {
  const authCheck = await checkGroupAuthorization(publicId, rawEditToken, userId)
  if (!authCheck.authorized || !authCheck.group) {
    throw localizedError(
      lang,
      "رمز التعديل غير صحيح أو غير مصرح لك بالتعديل.",
      "Invalid edit token or unauthorized access."
    )
  }
  const group = authCheck.group as { id: string; owner_user_id: string | null; created_at?: string }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    throw localizedError(lang, "الخدمة غير متوفرة حالياً.", "Online service is currently unavailable.")
  }

  const { data: existingRows } = (await supabase
    .from("group_members")
    .select("id, public_id")
    .eq("group_id", group.id)) as { data: Array<{ id: string; public_id: string | null }> | null }
  const rows = existingRows || []
  const rowById = new Map(rows.map((r) => [r.id, r]))
  const rowByPublicId = new Map(rows.filter((r) => r.public_id).map((r) => [r.public_id!, r]))

  // Match each member to its existing row: by public ID, or by row ID for
  // members saved before public IDs existed. A row matches at most one
  // member, and IDs from other groups never match. Matched rows keep their
  // links and progress; members without a match become new rows.
  const usedRowIds = new Set<string>()
  const matchedRowIds: Array<string | undefined> = []
  const members = sanitizeMembers(input.members).map((m, i) => {
    const source = input.members[i]
    let row = source?.publicId ? rowByPublicId.get(source.publicId) : undefined
    if (!row && source?.id) row = rowById.get(source.id)
    if (row && usedRowIds.has(row.id)) row = undefined
    if (row) usedRowIds.add(row.id)
    matchedRowIds[i] = row?.id
    return { ...m, publicId: row?.public_id || generateMemberPublicId() }
  })
  const normalizedInput: ScheduleInput = { group: input.group, members }
  const schedule = generateValidatedSchedule(normalizedInput, lang)
  const settings = planSettingsFromInput(normalizedInput, schedule)
  const recurrence = storedRecurrence(input.group.recurrence, group.owner_user_id)
  const nextStart = recurrence
    ? computeNextCycleStart({
        frequency: recurrence.frequency,
        startDate: settings.startDate,
        weeksCount: schedule.weeksCount,
        createdAt: group.created_at,
        islamicYear: settings.islamicYear,
      })
    : null

  const groupUpdate = await supabase.from("groups")
    .update({
      name: input.group.name.trim(),
      language: lang,
      direction: lang === "ar" ? "rtl" : "ltr",
      recurrence: recurrenceJson(recurrence),
      next_cycle_due_at: recurrence?.autoAdvance ? cycleDueAt(nextStart) : null,
      updated_at: new Date().toISOString(),
      ...settingsColumns(settings),
    })
    .eq("id", group.id)
  if (groupUpdate.error) {
    console.error("Error updating group:", groupUpdate.error)
    throw localizedError(lang, "تعذر تحديث المجموعة.", "Failed to update group.")
  }

  // Sync members: update kept rows, insert new ones, remove dropped ones.
  const memberRowIdByPublicId = new Map<string, string>()
  const newRows: Database["public"]["Tables"]["group_members"]["Insert"][] = []
  for (const [idx, m] of members.entries()) {
    const columns = {
      name: m.name,
      knowledge_type: m.knowledgeType,
      start_juz: m.startJuz,
      end_juz: m.endJuz,
      start_surah: m.startSurah || null,
      end_surah: m.endSurah || null,
      weekly_amount: m.weeklyAmount,
      sort_order: idx,
    }
    const rowId = matchedRowIds[idx]
    if (rowId) {
      // Older rows get their public ID saved here.
      const columnsWithId = { ...columns, public_id: m.publicId }
      const res = await supabase.from("group_members").update(columnsWithId).eq("id", rowId)
      if (res.error) throw localizedError(lang, "تعذر تحديث الأعضاء.", "Failed to update group members.")
      memberRowIdByPublicId.set(m.publicId, rowId)
    } else {
      newRows.push({ group_id: group.id, public_id: m.publicId, ...columns })
    }
  }

  if (newRows.length > 0) {
    const { data: inserted, error } = (await supabase.from("group_members")
      .insert(newRows)
      .select("id, public_id")) as { data: Array<{ id: string; public_id: string }> | null; error: unknown }
    if (error || !inserted) {
      console.error("Error inserting members:", error)
      throw localizedError(lang, "تعذر تحديث الأعضاء.", "Failed to update group members.")
    }
    for (const r of inserted) memberRowIdByPublicId.set(r.public_id, r.id)
  }

  const removedIds = rows.filter((r) => !usedRowIds.has(r.id)).map((r) => r.id)
  if (removedIds.length > 0) {
    await supabase.from("group_members").delete().in("id", removedIds)
  }

  const { data: latestPlan } = (await supabase
    .from("schedule_plans")
    .select("version_number")
    .eq("group_id", group.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: { version_number: number } | null }

  const plan = await insertPlanWithAssignments(supabase, {
    groupId: group.id,
    versionNumber: (latestPlan?.version_number || 0) + 1,
    weeksCount: schedule.weeksCount,
    settings,
    schedule,
    memberRowIdByPublicId,
  })
  if (!plan.ok) {
    console.error(`Error saving plan ${plan.step}:`, plan.error)
    throw localizedError(lang, "تعذر حفظ النسخة الجديدة من الجدول.", "Failed to create new plan version.")
  }

  // Only switch the old versions off once the new one is fully written.
  await supabase.from("schedule_plans")
    .update({ is_active: false })
    .eq("group_id", group.id)
    .neq("id", plan.planId)

  await createScheduleHistorySnapshot(
    group.id,
    "update_schedule",
    lang === "ar" ? "تم تعديل خطة الجدول" : "Schedule plan updated",
    { input: normalizedInput },
    userId
  )

  const loaded = await getGroupByPublicId(publicId)
  if (!loaded) throw new Error("Failed to load regenerated group.")
  return loaded
}

/**
 * Duplicates an existing saved schedule into a brand-new independent group.
 */
export async function duplicateGroupSchedule(
  sourcePublicId: string,
  lang: "ar" | "en" = "ar",
  ownerUserId?: string | null
): Promise<SavedGroupResult> {
  const existing = await getGroupByPublicId(sourcePublicId)
  if (!existing) {
    throw new Error(
      lang === "ar"
        ? "الجدول الأصلي غير موجود."
        : "Original schedule not found."
    )
  }

  const duplicateName =
    lang === "ar"
      ? `${existing.groupName} (نسخة)`
      : `${existing.groupName} (Copy)`

  // Fresh members with new unguessable public IDs
  const freshMembers: MemberConfig[] = existing.membersConfig.map((m) => ({
    ...m,
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    publicId: generateMemberPublicId(),
  }))

  const input: ScheduleInput = {
    group: {
      name: duplicateName,
      title: existing.title,
      description: existing.description,
      weeksCount: existing.schedule.weeksCount,
      rotationStyle: existing.rotationStyle,
      rangeType: existing.rangeType,
      startJuz: existing.startJuz,
      customRange: existing.customRange,
      startDate: existing.startDate,
      usesDates: existing.usesDates,
      occasionType: existing.occasionType,
      islamicYear: existing.islamicYear,
      dailyDivisionEnabled: existing.dailyDivisionEnabled,
    },
    members: freshMembers,
  }

  return saveScheduleGroup(input, null, lang, ownerUserId)
}

/**
 * Starts a new Khatmah cycle from an existing schedule, incrementing Islamic year if in Ramadan mode.
 */
export async function startNewKhatmah(
  sourcePublicId: string,
  lang: "ar" | "en" = "ar",
  ownerUserId?: string | null
): Promise<SavedGroupResult> {
  const existing = await getGroupByPublicId(sourcePublicId)
  if (!existing) {
    throw new Error(
      lang === "ar"
        ? "الجدول الأصلي غير موجود."
        : "Original schedule not found."
    )
  }

  const nextIslamicYear = existing.islamicYear ? existing.islamicYear + 1 : null
  const newTitle =
    existing.occasionType === "ramadan" && nextIslamicYear
      ? lang === "ar"
        ? `رمضان ${nextIslamicYear} هـ`
        : `Ramadan ${nextIslamicYear} AH`
      : existing.title

  // Fresh members with new unguessable public IDs, keeping capacities & knowledge
  const freshMembers: MemberConfig[] = existing.membersConfig.map((m) => ({
    ...m,
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    publicId: generateMemberPublicId(),
  }))

  const input: ScheduleInput = {
    group: {
      name: existing.groupName,
      title: newTitle,
      description: existing.description,
      weeksCount: existing.schedule.weeksCount,
      rotationStyle: existing.rotationStyle,
      rangeType: existing.rangeType,
      startJuz: existing.startJuz,
      customRange: existing.customRange,
      // A dated plan restarts today; Ramadan plans use next Ramadan's first day.
      startDate:
        existing.usesDates && existing.occasionType !== "ramadan"
          ? new Date().toISOString().slice(0, 10)
          : undefined,
      usesDates: existing.usesDates,
      occasionType: existing.occasionType,
      islamicYear: nextIslamicYear || undefined,
      dailyDivisionEnabled: existing.dailyDivisionEnabled,
    },
    members: freshMembers,
  }

  return saveScheduleGroup(input, null, lang, ownerUserId)
}

/**
 * Authorizes modification request via edit token OR authenticated group owner.
 */
export async function checkGroupAuthorization(
  publicId: string,
  rawEditToken?: string,
  userId?: string
): Promise<{ authorized: boolean; group?: GroupRow }> {
  if (!publicId) return { authorized: false }

  const supabase = getSupabaseServerClient()
  if (!supabase) return { authorized: false }

  const { data: group, error } = await supabase
    .from("groups")
    .select("*")
    .eq("public_id", publicId.trim())
    .single()

  if (error || !group) return { authorized: false }

  // 1. Authenticated owner authorization
  if (userId && group.owner_user_id === userId) {
    return { authorized: true, group }
  }

  // 2. Secret edit token authorization
  if (rawEditToken && verifyEditToken(rawEditToken, group.edit_token_hash)) {
    return { authorized: true, group }
  }

  return { authorized: false, group }
}

/**
 * Deletes a group and all cascading child records (Authorized by Owner or Edit Token).
 */
export async function deleteGroup(
  publicId: string,
  rawEditToken?: string,
  userId?: string
): Promise<boolean> {
  const { authorized } = await checkGroupAuthorization(
    publicId,
    rawEditToken,
    userId
  )
  if (!authorized) {
    return false
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("public_id", publicId.trim())

  return !error
}

/**
 * Archives or unarchives a group (Authorized by Owner or Edit Token).
 */
export async function archiveGroup(
  publicId: string,
  isArchived: boolean = true,
  rawEditToken?: string,
  userId?: string
): Promise<boolean> {
  const { authorized, group } = await checkGroupAuthorization(
    publicId,
    rawEditToken,
    userId
  )
  if (!authorized || !group) {
    return false
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  const { error } = await supabase.from("groups")
    .update({
      is_archived: isArchived,
      status: isArchived ? "archived" : "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", group.id)

  return !error
}

export interface UserGroupSummary {
  publicId: string
  groupName: string
  title: string | null
  description: string | null
  membersCount: number
  weeksCount: number
  startDate: string | null
  currentWeek: number
  progressPercentage: number
  status: "active" | "draft" | "completed" | "archived"
  isArchived: boolean
  occasionType: string
  islamicYear: number | null
  dailyDivisionEnabled: boolean
  updatedAt: string
  createdAt: string
  isOwner: boolean
  userRole: "owner" | "member"
  memberPublicId?: string
  memberName?: string
  recurrence?: RecurrenceConfig | null
}

type GroupFilter = "all" | "active" | "draft" | "completed" | "archived" | "ramadan"

interface GroupSummaryRow {
  id: string
  public_id: string
  name: string
  title: string | null
  description: string | null
  status: string | null
  is_archived: boolean | null
  occasion_type: string | null
  islamic_year: number | null
  daily_division_enabled: boolean | null
  recurrence: Json | null
  start_date: string | null
  uses_dates: boolean | null
  created_at: string
  updated_at: string
  group_members: Array<{ id: string; name: string; public_id: string | null; linked_user_id: string | null }> | null
  schedule_plans: Array<{
    id: string
    weeks_count: number
    is_active: boolean
    start_date: string | null
    uses_dates: boolean | null
  }> | null
}

const GROUP_SUMMARY_COLUMNS = `
  id, public_id, name, title, description, status, is_archived, occasion_type,
  islamic_year, daily_division_enabled, recurrence, start_date, uses_dates,
  created_at, updated_at,
  group_members (id, name, public_id, linked_user_id),
  schedule_plans (id, weeks_count, is_active, start_date, uses_dates)
`

function matchesGroupFilter(g: GroupSummaryRow, filter: GroupFilter): boolean {
  if (filter === "active") return !g.is_archived && (g.status || "active") === "active"
  if (filter === "archived") return Boolean(g.is_archived)
  if (filter === "completed") return g.status === "completed"
  if (filter === "draft") return g.status === "draft"
  if (filter === "ramadan") return g.occasion_type === "ramadan"
  return true
}

/**
 * Fetches all groups owned by or linked to a user, with each group's current
 * week and overall completion.
 */
export async function fetchUserGroups(
  userId: string,
  filter: GroupFilter = "all"
): Promise<UserGroupSummary[]> {
  if (!userId) return []

  const supabase = getSupabaseServerClient()
  if (!supabase) return []

  const [owned, linked] = await Promise.all([
    supabase
      .from("groups")
      .select(GROUP_SUMMARY_COLUMNS)
      .eq("owner_user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("group_members")
      .select(`id, name, public_id, groups (${GROUP_SUMMARY_COLUMNS})`)
      .eq("linked_user_id", userId),
  ])

  if (owned.error) console.error("fetchUserGroups owned error:", owned.error)
  if (linked.error) console.error("fetchUserGroups member error:", linked.error)

  const entries: Array<{
    g: GroupSummaryRow
    isOwner: boolean
    member?: { public_id: string | null; name: string }
  }> = []
  const seen = new Set<string>()

  for (const g of (owned.data || []) as unknown as GroupSummaryRow[]) {
    seen.add(g.public_id)
    const own = g.group_members?.find((m) => m.linked_user_id === userId)
    entries.push({ g, isOwner: true, member: own })
  }
  for (const lm of (linked.data || []) as unknown as Array<{
    public_id: string | null
    name: string
    groups: GroupSummaryRow | null
  }>) {
    if (!lm.groups || seen.has(lm.groups.public_id)) continue
    seen.add(lm.groups.public_id)
    entries.push({ g: lm.groups, isOwner: false, member: lm })
  }

  const visible = entries.filter((e) => matchesGroupFilter(e.g, filter))

  // One query for completion counts across all listed groups.
  const completedByGroup = new Map<string, number>()
  if (visible.length > 0) {
    const { data: done } = await supabase
      .from("reading_progress")
      .select("group_id")
      .in(
        "group_id",
        visible.map((e) => e.g.id)
      )
      .eq("is_completed", true)
    for (const row of done || []) {
      completedByGroup.set(row.group_id, (completedByGroup.get(row.group_id) || 0) + 1)
    }
  }

  return visible
    .map(({ g, isOwner, member }) => {
      const plan = g.schedule_plans?.find((p) => p.is_active) || g.schedule_plans?.[0]
      const weeksCount = plan?.weeks_count || 1
      const membersCount = g.group_members?.length || 0
      const startDate = plan?.start_date || g.start_date
      const usesDates = plan?.uses_dates ?? g.uses_dates ?? false
      const { weekNumber } = currentPlanPosition(usesDates ? startDate || undefined : undefined, weeksCount)
      const totalDays = membersCount * weeksCount * (g.daily_division_enabled ? 7 : 1)
      const completed = completedByGroup.get(g.id) || 0

      const status = (["active", "draft", "completed", "archived"] as const).find(
        (s) => s === g.status
      )
      return {
        publicId: g.public_id,
        groupName: g.name,
        title: g.title,
        description: g.description,
        membersCount,
        weeksCount,
        startDate,
        currentWeek: weekNumber,
        progressPercentage: totalDays > 0 ? Math.min(100, Math.round((completed / totalDays) * 100)) : 0,
        status: status || "active",
        isArchived: Boolean(g.is_archived),
        occasionType: g.occasion_type || "normal",
        islamicYear: g.islamic_year,
        dailyDivisionEnabled: Boolean(g.daily_division_enabled),
        recurrence: parseRecurrence(g.recurrence),
        updatedAt: g.updated_at,
        createdAt: g.created_at,
        isOwner,
        userRole: isOwner ? ("owner" as const) : ("member" as const),
        memberPublicId: member?.public_id || undefined,
        memberName: member?.name,
      }
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export type SaveProgressResult = {
  success: boolean
  progressId?: string
  reason?: "invalid" | "not_found" | "forbidden" | "unavailable"
}

/**
 * Records whether a member finished a day's reading.
 *
 * A slot that is not linked to an account is controlled by whoever holds its
 * personal link. Once a member links an account, only that account or the
 * group owner can change the slot's progress.
 */
export async function saveReadingProgress(
  groupPublicId: string,
  memberPublicId: string,
  weekNumber: number,
  dayNumber: number,
  isCompleted: boolean,
  userId?: string | null
): Promise<SaveProgressResult> {
  if (
    !Number.isInteger(weekNumber) ||
    !Number.isInteger(dayNumber) ||
    weekNumber < 1 ||
    dayNumber < 1 ||
    dayNumber > 7 ||
    typeof isCompleted !== "boolean"
  ) {
    return { success: false, reason: "invalid" }
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) return { success: false, reason: "unavailable" }

  const group = await findActiveGroup(groupPublicId)
  if (!group) return { success: false, reason: "not_found" }

  const { data: plan } = (await supabase
    .from("schedule_plans")
    .select("weeks_count")
    .eq("group_id", group.id)
    .eq("is_active", true)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: { weeks_count: number } | null }
  if (!plan || weekNumber > plan.weeks_count) {
    return { success: false, reason: "invalid" }
  }

  const member = await findGroupMember(supabase, group.id, memberPublicId)
  if (!member) return { success: false, reason: "not_found" }

  if (
    member.linked_user_id &&
    member.linked_user_id !== userId &&
    group.owner_user_id !== userId
  ) {
    return { success: false, reason: "forbidden" }
  }

  const { data, error } = await supabase.from("reading_progress")
    .upsert(
      {
        group_id: group.id,
        member_id: member.id,
        user_id: member.linked_user_id || null,
        week_number: weekNumber,
        day_number: dayNumber,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "group_id,member_id,week_number,day_number" }
    )
    .select("id")
    .single()

  if (error) {
    console.error("saveReadingProgress error:", error)
    return { success: false, reason: "unavailable" }
  }

  return { success: true, progressId: data?.id }
}

/**
 * Fetches all reading progress entries for a group.
 */
export async function fetchGroupReadingProgress(groupPublicId: string): Promise<
  Array<{
    memberPublicId: string
    memberName: string
    weekNumber: number
    dayNumber: number
    isCompleted: boolean
    completedAt: string | null
  }>
> {
  const supabase = getSupabaseServerClient()
  if (!supabase) return []

  const { data: group } = await supabase
    .from("groups")
    .select("id")
    .eq("public_id", groupPublicId.trim())
    .single()

  if (!group) return []

  const { data, error } = await supabase
    .from("reading_progress")
    .select(
      `
      week_number,
      day_number,
      is_completed,
      completed_at,
      group_members (public_id, name)
    `
    )
    .eq("group_id", group.id)

  if (error || !data) return []

  const rows = data as unknown as Array<{
    week_number: number
    day_number: number
    is_completed: boolean
    completed_at: string | null
    group_members: { public_id: string | null; name: string } | null
  }>
  return rows.map((d) => ({
    memberPublicId: d.group_members?.public_id || "",
    memberName: d.group_members?.name || "",
    weekNumber: d.week_number,
    dayNumber: d.day_number,
    isCompleted: d.is_completed,
    completedAt: d.completed_at,
  }))
}

/**
 * Saves a bookmark for the authenticated user.
 */
export async function saveBookmark(
  userId: string,
  surahNumber: number,
  ayahNumber: number,
  juzNumber: number,
  note?: string
): Promise<{ success: boolean; id?: string }> {
  if (!userId) return { success: false }

  const supabase = getSupabaseServerClient()
  if (!supabase) return { success: false }

  const { data, error } = await supabase.from("bookmarks")
    .insert({
      user_id: userId,
      surah_number: surahNumber,
      ayah_number: ayahNumber,
      juz_number: juzNumber,
      note: note?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error) return { success: false }
  return { success: true, id: data?.id }
}

/**
 * Fetches all bookmarks for a user.
 */
export async function fetchUserBookmarks(userId: string): Promise<
  Array<{
    id: string
    surahNumber: number
    ayahNumber: number
    juzNumber: number
    note: string | null
    updatedAt: string
  }>
> {
  if (!userId) return []

  const supabase = getSupabaseServerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id, surah_number, ayah_number, juz_number, note, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error || !data) return []

  return data.map((b) => ({
    id: b.id,
    surahNumber: b.surah_number,
    ayahNumber: b.ayah_number,
    juzNumber: b.juz_number,
    note: b.note,
    updatedAt: b.updated_at,
  }))
}

/**
 * Deletes a bookmark.
 */
export async function deleteBookmark(
  bookmarkId: string,
  userId: string
): Promise<boolean> {
  if (!bookmarkId || !userId) return false

  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", bookmarkId)
    .eq("user_id", userId)

  return !error
}

/**
 * Creates an announcement for a group.
 */
export async function createAnnouncement(
  groupPublicId: string,
  title: string,
  content: string,
  userId?: string,
  rawEditToken?: string
): Promise<{ success: boolean; id?: string }> {
  const { authorized, group } = await checkGroupAuthorization(
    groupPublicId,
    rawEditToken,
    userId
  )
  if (!authorized || !group) return { success: false }

  const supabase = getSupabaseServerClient()
  if (!supabase) return { success: false }

  const { data, error } = await supabase.from("announcements")
    .insert({
      group_id: group.id,
      title: title.trim(),
      content: content.trim(),
      created_by: userId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error) return { success: false }
  return { success: true, id: data?.id }
}

/**
 * Fetches all announcements for a group.
 */
export async function fetchAnnouncements(
  groupPublicId: string
): Promise<
  Array<{ id: string; title: string; content: string; createdAt: string }>
> {
  const supabase = getSupabaseServerClient()
  if (!supabase) return []

  const { data: group } = await supabase
    .from("groups")
    .select("id")
    .eq("public_id", groupPublicId.trim())
    .single()

  if (!group) return []

  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, content, created_at")
    .eq("group_id", group.id)
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    createdAt: a.created_at,
  }))
}

/**
 * Deletes an announcement (Authorized by Owner or Edit Token).
 */
export async function deleteAnnouncement(
  announcementId: string,
  groupPublicId: string,
  userId?: string,
  rawEditToken?: string
): Promise<boolean> {
  const { authorized, group } = await checkGroupAuthorization(
    groupPublicId,
    rawEditToken,
    userId
  )
  if (!authorized || !group) return false

  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId)
    .eq("group_id", group.id)

  return !error
}

export type LinkMemberResult =
  | { success: true }
  | {
      success: false
      reason: "not_found" | "already_linked" | "already_member" | "unavailable"
    }

/** Loads a non-expired group's row ID and owner by its public ID. */
async function findActiveGroup(
  groupPublicId: string
): Promise<{ id: string; owner_user_id: string | null } | null> {
  const supabase = getSupabaseServerClient()
  if (!supabase || !groupPublicId) return null
  const { data } = (await supabase
    .from("groups")
    .select("id, owner_user_id, expires_at")
    .eq("public_id", groupPublicId.trim())
    .maybeSingle()) as {
    data: { id: string; owner_user_id: string | null; expires_at: string } | null
  }
  if (!data || new Date(data.expires_at).getTime() < Date.now()) return null
  return data
}

/**
 * Links a member slot to the signed-in account. A slot that already belongs
 * to another account is never taken over, and an account can hold only one
 * slot per group.
 */
export async function linkMemberAccount(
  groupPublicId: string,
  memberPublicId: string,
  userId: string
): Promise<LinkMemberResult> {
  if (!groupPublicId || !memberPublicId || !userId) {
    return { success: false, reason: "not_found" }
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) return { success: false, reason: "unavailable" }

  const group = await findActiveGroup(groupPublicId)
  if (!group) return { success: false, reason: "not_found" }

  const member = await findGroupMember(supabase, group.id, memberPublicId)
  if (!member) return { success: false, reason: "not_found" }

  if (member.linked_user_id === userId) return { success: true }
  if (member.linked_user_id) return { success: false, reason: "already_linked" }

  const { data: otherSlot } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", group.id)
    .eq("linked_user_id", userId)
    .limit(1)
  if (otherSlot && otherSlot.length > 0) {
    return { success: false, reason: "already_member" }
  }

  // The `is null` condition makes the claim atomic: if two people link at the
  // same moment, only one update matches.
  const { data: claimed, error } = (await supabase.from("group_members")
    .update({ linked_user_id: userId })
    .eq("id", member.id)
    .is("linked_user_id", null)
    .select("id")) as { data: Array<{ id: string }> | null; error: unknown }

  if (error) {
    console.error("linkMemberAccount error:", error)
    return { success: false, reason: "unavailable" }
  }
  if (!claimed || claimed.length === 0) {
    return { success: false, reason: "already_linked" }
  }

  await supabase.from("reading_progress")
    .update({ user_id: userId })
    .eq("group_id", group.id)
    .eq("member_id", member.id)
    .is("user_id", null)

  return { success: true }
}

export interface MemberLinkStatusResult {
  isLinked: boolean
  isLinkedToCurrentUser: boolean
  linkedUserId: string | null
  currentUserId: string | null
  isOwner: boolean
  groupOwnerId: string | null
  memberName: string
}

/**
 * Checks whether a member slot is linked to an account. Account IDs are only
 * returned to their own holder.
 */
export async function getMemberLinkStatus(
  groupPublicId: string,
  memberPublicId: string,
  currentUserId?: string | null
): Promise<MemberLinkStatusResult | null> {
  if (!groupPublicId || !memberPublicId) return null

  const supabase = getSupabaseServerClient()
  if (!supabase) return null

  const group = await findActiveGroup(groupPublicId)
  if (!group) return null

  const member = await findGroupMember(supabase, group.id, memberPublicId)
  if (!member) return null

  const isLinkedToCurrentUser = Boolean(
    currentUserId && member.linked_user_id === currentUserId
  )
  const isOwner = Boolean(currentUserId && group.owner_user_id === currentUserId)

  return {
    isLinked: Boolean(member.linked_user_id),
    isLinkedToCurrentUser,
    linkedUserId: isLinkedToCurrentUser ? member.linked_user_id : null,
    currentUserId: currentUserId || null,
    isOwner,
    groupOwnerId: isOwner ? group.owner_user_id : null,
    memberName: member.name,
  }
}

/**
 * Saves notification preferences.
 */
export async function saveNotificationPreferences(
  userId: string,
  prefs: {
    dailyReminderEnabled?: boolean
    reminderTime?: string
    incompleteReminderEnabled?: boolean
    weeklySummaryEnabled?: boolean
    groupAnnouncementsEnabled?: boolean
    timezone?: string
  }
): Promise<boolean> {
  if (!userId) return false

  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  const { error } = await (
    supabase.from("notification_preferences")
  ).upsert({
    user_id: userId,
    daily_reminder_enabled: prefs.dailyReminderEnabled ?? true,
    reminder_time: prefs.reminderTime || "20:00",
    incomplete_reminder_enabled: prefs.incompleteReminderEnabled ?? true,
    weekly_summary_enabled: prefs.weeklySummaryEnabled ?? false,
    group_announcements_enabled: prefs.groupAnnouncementsEnabled ?? true,
    timezone: prefs.timezone || "UTC",
    updated_at: new Date().toISOString(),
  })

  return !error
}

/**
 * Fetches notification preferences.
 */
export type NotificationPreferencesRow =
  Database["public"]["Tables"]["notification_preferences"]["Row"]

export async function fetchNotificationPreferences(
  userId: string
): Promise<NotificationPreferencesRow | null> {
  if (!userId) return null

  const supabase = getSupabaseServerClient()
  if (!supabase) return null

  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  return data || null
}

/**
 * Exports all user data in clean JSON format.
 */
export interface UserDataExport {
  exportedAt: string
  userId: string
  groups: UserGroupSummary[]
  bookmarks: Awaited<ReturnType<typeof fetchUserBookmarks>>
  notificationPreferences: NotificationPreferencesRow | null
}

export async function exportUserData(userId: string): Promise<UserDataExport | null> {
  if (!userId) return null

  const groups = await fetchUserGroups(userId, "all")
  const bookmarks = await fetchUserBookmarks(userId)
  const notifs = await fetchNotificationPreferences(userId)

  return {
    exportedAt: new Date().toISOString(),
    userId,
    groups,
    bookmarks,
    notificationPreferences: notifs,
  }
}

/**
 * Deletes an account and its personal data: owned groups, bookmarks,
 * notification settings and push subscriptions. Member slots the account had
 * linked are released (the group keeps the slot and its progress), and
 * finally the login itself is removed. Returns false if any step fails.
 */
export async function deleteUserAccount(userId: string): Promise<boolean> {
  if (!userId) return false

  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  const steps: Array<[string, PromiseLike<{ error: unknown }>]> = [
    ["groups", supabase.from("groups").delete().eq("owner_user_id", userId)],
    ["bookmarks", supabase.from("bookmarks").delete().eq("user_id", userId)],
    [
      "notification_preferences",
      supabase.from("notification_preferences").delete().eq("user_id", userId),
    ],
    ["push_subscriptions", supabase.from("push_subscriptions").delete().eq("user_id", userId)],
    [
      "group_members",
      supabase.from("group_members")
        .update({ linked_user_id: null })
        .eq("linked_user_id", userId),
    ],
    [
      "reading_progress",
      supabase.from("reading_progress").update({ user_id: null }).eq("user_id", userId),
    ],
  ]

  for (const [table, step] of steps) {
    const { error } = await step
    if (error) {
      console.error(`deleteUserAccount failed on ${table}:`, error)
      return false
    }
  }

  const { error: authError } = await supabase.auth.admin.deleteUser(userId)
  if (authError) {
    console.error("deleteUserAccount failed to remove login:", authError)
    return false
  }

  return true
}

/** What a history entry stores. Entries from before v2 also carry `schedule`. */
export interface ScheduleSnapshot {
  input?: ScheduleInput
  schedule?: { weeksCount?: number; members?: unknown[] }
}

export interface ScheduleHistoryRecord {
  id: string
  groupId: string
  actionType: string
  description: string
  snapshot: ScheduleSnapshot | null
  createdBy: string | null
  createdAt: string
}

/**
 * Creates a schedule history snapshot and enforces a 20-version retention limit.
 */
export async function createScheduleHistorySnapshot(
  groupId: string,
  actionType: string,
  description: string,
  snapshot: ScheduleSnapshot,
  userId?: string
): Promise<boolean> {
  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  // 1. Insert new snapshot
  const { error } = await supabase.from("schedule_history").insert({
    group_id: groupId,
    action_type: actionType,
    description: description.trim(),
    // Snapshots are plain JSON built from schedule input.
    snapshot: snapshot as unknown as Json,
    created_by: userId || null,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error creating schedule history snapshot:", error)
    return false
  }

  // 2. Enforce retention limit (Keep latest 20 versions)
  try {
    const { data: allHistory } = await supabase
      .from("schedule_history")
      .select("id, created_at")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })

    if (allHistory && allHistory.length > 20) {
      const idsToDelete = allHistory.slice(20).map((h) => h.id)
      await supabase.from("schedule_history").delete().in("id", idsToDelete)
    }
  } catch (err) {
    console.warn("History retention prune warning:", err)
  }

  return true
}

/**
 * Fetches all history snapshots for a group (Authorized by Owner or Edit Token).
 */
export async function fetchScheduleHistory(
  groupPublicId: string,
  userId?: string,
  rawEditToken?: string
): Promise<ScheduleHistoryRecord[]> {
  const { authorized, group } = await checkGroupAuthorization(
    groupPublicId,
    rawEditToken,
    userId
  )
  if (!authorized || !group) return []

  const supabase = getSupabaseServerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("schedule_history")
    .select(
      "id, group_id, action_type, description, snapshot, created_by, created_at"
    )
    .eq("group_id", group.id)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error || !data) return []

  return data.map((h) => ({
    id: h.id,
    groupId: h.group_id,
    actionType: h.action_type,
    description: h.description,
    snapshot: h.snapshot as ScheduleSnapshot | null,
    createdBy: h.created_by,
    createdAt: h.created_at,
  }))
}

/**
 * Restores a past schedule snapshot, creating a new revision without losing audit history.
 */
export async function restoreScheduleVersion(
  historyId: string,
  groupPublicId: string,
  userId?: string,
  rawEditToken?: string,
  lang: "ar" | "en" = "ar"
): Promise<LoadedPublicGroup> {
  const { authorized, group } = await checkGroupAuthorization(
    groupPublicId,
    rawEditToken,
    userId
  )
  if (!authorized || !group) {
    throw new Error(
      lang === "ar"
        ? "غير مصرح لك باستعادة هذه النسخة."
        : "Unauthorized to restore this version."
    )
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    throw new Error("Database service unavailable.")
  }

  const { data: historyRecord, error: histError } = (await supabase
    .from("schedule_history")
    .select("snapshot, description")
    .eq("id", historyId)
    .eq("group_id", group.id)
    .single()) as {
    data: { snapshot: { input?: ScheduleInput } | null; description: string } | null
    error: unknown
  }

  if (histError || !historyRecord?.snapshot?.input) {
    throw new Error(
      lang === "ar"
        ? "تعذر العثور على بيانات النسخة المطلوبة."
        : "Version snapshot data not found."
    )
  }

  const restoredInput: ScheduleInput = historyRecord.snapshot.input

  // Execute schedule update with restored configuration
  const updatedGroup = await updateGroupAndRegenerate(
    groupPublicId,
    rawEditToken || "",
    restoredInput,
    lang,
    userId
  )

  // Record restore event in history
  await createScheduleHistorySnapshot(
    group.id,
    "restore_version",
    lang === "ar"
      ? `استعادة نسخة: ${historyRecord.description}`
      : `Restored version: ${historyRecord.description}`,
    historyRecord.snapshot,
    userId
  )

  return updatedGroup
}

/**
 * Creates the next cycle of a recurring group. Running it twice for the same
 * cycle returns the cycle that already exists.
 *
 * The new cycle copies members (with their public IDs and linked accounts),
 * points back to this group, and takes over automatic renewal so only the
 * newest cycle renews.
 */
export async function processRecurringCycle(
  groupPublicId: string,
  userId?: string,
  rawEditToken?: string,
  lang: "ar" | "en" = "ar"
): Promise<SavedGroupResult> {
  const { authorized, group } = await checkGroupAuthorization(groupPublicId, rawEditToken, userId)
  if (!authorized || !group) {
    throw localizedError(
      lang,
      "غير مصرح لك ببدء الدورة التالية.",
      "Unauthorized to renew recurring cycle."
    )
  }
  return createNextCycle(group, lang)
}

async function createNextCycle(group: GroupRow, lang: "ar" | "en"): Promise<SavedGroupResult> {
  const supabase = getSupabaseServerClient()
  if (!supabase) throw localizedError(lang, "الخدمة غير متوفرة.", "Service unavailable.")

  const { data: existingCycle } = (await supabase
    .from("groups")
    .select("public_id, expires_at")
    .eq("recurring_source_group_id", group.id)
    .limit(1)
    .maybeSingle()) as { data: { public_id: string; expires_at: string } | null }

  if (existingCycle) {
    return {
      publicId: existingCycle.public_id,
      editToken: "",
      groupName: group.name,
      expiresAt: existingCycle.expires_at,
    }
  }

  const existing = await getGroupByPublicId(group.public_id)
  if (!existing || existing.isExpired) {
    throw localizedError(lang, "المجموعة غير موجودة.", "Group not found.")
  }

  const recurrence = parseRecurrence(group.recurrence)
  const frequency =
    recurrence?.frequency && recurrence.frequency !== "none"
      ? recurrence.frequency
      : existing.occasionType === "ramadan"
        ? "ramadan"
        : "weekly"

  const nextIndex = (group.cycle_index || 1) + 1
  const nextStartDate = computeNextCycleStart({
    frequency,
    startDate: existing.startDate,
    weeksCount: existing.schedule.weeksCount,
    createdAt: group.created_at,
    islamicYear: existing.islamicYear,
  })
  const isRamadan = frequency === "ramadan"
  const nextIslamicYear = isRamadan
    ? (existing.islamicYear || getCurrentHijriYear()) + 1
    : existing.islamicYear

  const { data: memberRows } = (await supabase
    .from("group_members")
    .select("public_id, linked_user_id")
    .eq("group_id", group.id)) as {
    data: Array<{ public_id: string | null; linked_user_id: string | null }> | null
  }
  const linkByPublicId = new Map<string, string>()
  for (const r of memberRows || []) {
    if (r.public_id && r.linked_user_id) linkByPublicId.set(r.public_id, r.linked_user_id)
  }

  const linkedUserIds = new Map<string, string>()
  const members: MemberConfig[] = sanitizeMembers(existing.membersConfig).map((m, i) => {
    const publicId = existing.membersConfig[i].publicId || generateMemberPublicId()
    const linked = linkByPublicId.get(publicId)
    if (linked) linkedUserIds.set(m.id, linked)
    return { ...m, publicId }
  })

  const cycleTitle = isRamadan
    ? lang === "ar"
      ? `ختمة رمضان ${nextIslamicYear} هـ`
      : `Ramadan Khatmah ${nextIslamicYear} AH`
    : lang === "ar"
      ? `${existing.groupName} - دورة ${nextIndex}`
      : `${existing.groupName} - Cycle ${nextIndex}`

  const input: ScheduleInput = {
    group: {
      name: existing.groupName,
      title: cycleTitle,
      description: existing.description,
      weeksCount: existing.schedule.weeksCount,
      rotationStyle: existing.rotationStyle,
      rangeType: existing.rangeType,
      startJuz: existing.startJuz,
      customRange: existing.customRange,
      startDate: existing.usesDates || isRamadan ? nextStartDate || undefined : undefined,
      usesDates: existing.usesDates,
      occasionType: isRamadan ? "ramadan" : existing.occasionType,
      islamicYear: nextIslamicYear || undefined,
      dailyDivisionEnabled: existing.dailyDivisionEnabled,
      recurrence: { frequency, autoAdvance: recurrence?.autoAdvance !== false },
    },
    members,
  }

  const saved = await createGroupWithSchedule(input, lang, group.owner_user_id, {
    linkedUserIds,
    recurringSourceGroupId: group.id,
    cycleIndex: nextIndex,
  })

  await supabase.from("groups")
    .update({
      last_cycle_generated_at: new Date().toISOString(),
      next_cycle_due_at: null,
      recurrence: recurrenceJson(recurrence ? { ...recurrence, autoAdvance: false } : null),
    })
    .eq("id", group.id)

  return saved
}

/**
 * Cron entry point: creates the next cycle for a recurring group if it is
 * due. Returns true when a new cycle was created.
 */
export async function advanceRecurringGroupIfDue(
  groupPublicId: string,
  now: Date = new Date()
): Promise<boolean> {
  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  const { data: group } = (await supabase
    .from("groups")
    .select("*")
    .eq("public_id", groupPublicId)
    .maybeSingle()) as { data: GroupRow | null }

  if (
    !group ||
    group.is_archived ||
    !group.owner_user_id ||
    !parseRecurrence(group.recurrence)?.autoAdvance ||
    !group.next_cycle_due_at ||
    new Date(group.next_cycle_due_at).getTime() > now.getTime()
  ) {
    return false
  }

  await createNextCycle(group, group.language === "en" ? "en" : "ar")
  return true
}

/**
 * Returns the current week and day (both 1-based) of a plan. Dated plans
 * count whole days from their start date, so day 1 is the plan's first day.
 * Undated plans fall back to week 1 and today's weekday (Sunday = 1).
 */
export function currentPlanPosition(
  startDate: string | undefined,
  weeksCount: number,
  now: Date = new Date()
): { weekNumber: number; dayNumber: number } {
  if (startDate) {
    const start = Date.parse(`${startDate}T00:00:00Z`)
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    const elapsed = Math.floor((today - start) / 86400000)
    if (elapsed < 0) return { weekNumber: 1, dayNumber: 1 }
    const weekNumber = Math.min(weeksCount, Math.floor(elapsed / 7) + 1)
    const dayNumber = elapsed >= weeksCount * 7 ? 7 : (elapsed % 7) + 1
    return { weekNumber, dayNumber }
  }
  return { weekNumber: 1, dayNumber: now.getDay() + 1 }
}

export interface UserTodaysReadingResult {
  groupPublicId: string
  groupName: string
  memberPublicId: string
  memberName: string
  weekNumber: number
  dayNumber: number
  surahNumber: number
  surahNameAr: string
  surahNameEn: string
  startAyah: number
  endAyah: number
  endSurahNumber?: number
  endSurahNameAr?: string
  endSurahNameEn?: string
  juzNumber: number
  isCompleted: boolean
  dateFormatted?: string
  totalWeeklyAmount: number
  totalWeeks: number
}

export interface MemberProgressSummary {
  memberPublicId: string
  memberName: string
  weeklyAmount: number
  assignedPortionDescriptionAr: string
  assignedPortionDescriptionEn: string
  completedDays: number
  totalDays: number
  isCompleted: boolean
  percent: number
  lastActivityAt: string | null
  isLinked: boolean
}

export interface GroupProgressSummary {
  groupPublicId: string
  groupName: string
  totalMembers: number
  totalJuz: number
  completedJuz: number
  remainingJuz: number
  overallPercent: number
  currentWeek: number
  totalWeeks: number
  members: MemberProgressSummary[]
}

/**
 * Derives the active today's reading assignment for an authenticated user from their active groups.
 */
export async function fetchUserTodaysReading(
  userId: string
): Promise<UserTodaysReadingResult | null> {
  if (!userId) return null

  const supabase = getSupabaseServerClient()
  if (!supabase) return null

  // 1. Fetch user's active groups
  const userGroups = await fetchUserGroups(userId, "active")
  if (!userGroups || userGroups.length === 0) return null

  // Only a group where the user holds a member slot has a reading for them.
  // Owning a group does not make the first member's reading yours.
  const activeGroupSummary = userGroups.find((g) => Boolean(g.memberPublicId))
  if (!activeGroupSummary?.memberPublicId) return null

  // 2. Fetch full loaded group data
  const group = await getGroupByPublicId(activeGroupSummary.publicId)
  if (!group || !group.schedule || !group.schedule.weeks.length) return null

  // 3. Current week and day within the plan. Dated plans count from their
  // start date; undated plans use the day of the week.
  const { weekNumber: currentWeekNum, dayNumber: currentDayNum } = currentPlanPosition(
    group.usesDates ? group.startDate : undefined,
    group.schedule.weeksCount
  )

  // 4. The user's own member slot
  const targetMemberPublicId = activeGroupSummary.memberPublicId
  const member = group.membersConfig.find((m) => m.publicId === targetMemberPublicId)
  if (!member) return null

  // 5. Their assignment for the current week
  const week = group.schedule.weeks.find((w) => w.weekNumber === currentWeekNum)
  const assignment = week?.assignments.find((a) => a.memberId === member.id)
  if (!assignment) return null

  // 7. Check if daily breakdown applies
  let surahNumber = assignment.startAyah.surahNumber
  let surahNameAr = assignment.startAyah.surahNameAr
  let surahNameEn = assignment.startAyah.surahNameEn
  let startAyah = assignment.startAyah.ayahNumber
  let endSurahNumber = assignment.endAyah.surahNumber
  let endSurahNameAr = assignment.endAyah.surahNameAr
  let endSurahNameEn = assignment.endAyah.surahNameEn
  let endAyah = assignment.endAyah.ayahNumber
  let juzNumber = assignment.startJuz
  let dateFormatted: string | undefined = undefined

  if (
    group.dailyDivisionEnabled &&
    assignment.dailyBreakdown &&
    assignment.dailyBreakdown.length > 0
  ) {
    const dailyPortion =
      assignment.dailyBreakdown[currentDayNum - 1] ||
      assignment.dailyBreakdown[0]
    if (dailyPortion) {
      surahNumber = dailyPortion.startAyah.surahNumber
      surahNameAr = dailyPortion.startAyah.surahNameAr
      surahNameEn = dailyPortion.startAyah.surahNameEn
      startAyah = dailyPortion.startAyah.ayahNumber
      endSurahNumber = dailyPortion.endAyah.surahNumber
      endSurahNameAr = dailyPortion.endAyah.surahNameAr
      endSurahNameEn = dailyPortion.endAyah.surahNameEn
      endAyah = dailyPortion.endAyah.ayahNumber
      juzNumber = assignment.startJuz
      dateFormatted = dailyPortion.formattedDateAr || dailyPortion.dateStr
    }
  }

  // 8. Check completion status from reading_progress table
  let isCompleted = false
  try {
    const { data: progressRow } = (await supabase
      .from("reading_progress")
      .select("is_completed")
      .eq("group_id", group.schedule.id)
      .eq("member_id", member.id)
      .eq("week_number", currentWeekNum)
      .eq("day_number", currentDayNum)
      .maybeSingle()) as { data: { is_completed: boolean } | null }

    isCompleted = Boolean(progressRow?.is_completed)
  } catch {
    // Non-fatal if query fails
  }

  return {
    groupPublicId: group.publicId,
    groupName: group.groupName,
    memberPublicId: member.publicId || targetMemberPublicId,
    memberName: member.name,
    weekNumber: currentWeekNum,
    dayNumber: currentDayNum,
    surahNumber,
    surahNameAr,
    surahNameEn,
    startAyah,
    endAyah,
    endSurahNumber,
    endSurahNameAr,
    endSurahNameEn,
    juzNumber,
    isCompleted,
    dateFormatted,
    totalWeeklyAmount: assignment.weeklyAmount,
    totalWeeks: group.schedule.weeksCount,
  }
}

/**
 * Aggregates complete progress details and percentages for all members of a group.
 */
export async function fetchGroupProgressSummary(
  groupPublicId: string,
  requestingUserId?: string | null
): Promise<GroupProgressSummary | null> {
  const supabase = getSupabaseServerClient()
  if (!supabase) return null

  const group = await getGroupByPublicId(groupPublicId)
  if (!group || !group.schedule) return null

  // 1. Determine current week
  const { weekNumber: currentWeekNum } = currentPlanPosition(
    group.usesDates ? group.startDate : undefined,
    group.schedule.weeksCount
  )

  // 2. Fetch group DB record & members with linked_user_id
  const { data: groupDb } = await supabase
    .from("groups")
    .select("id, owner_user_id")
    .eq("public_id", groupPublicId.trim())
    .single()

  if (!groupDb) return null

  // Only the signed-in owner can see every member's progress.
  if (!requestingUserId || groupDb.owner_user_id !== requestingUserId) {
    return null
  }

  const { data: membersDb } = await supabase
    .from("group_members")
    .select("id, public_id, name, linked_user_id, weekly_amount")
    .eq("group_id", groupDb.id)

  const { data: progressRows } = await supabase
    .from("reading_progress")
    .select("member_id, week_number, day_number, is_completed, completed_at, updated_at")
    .eq("group_id", groupDb.id)
    .eq("week_number", currentWeekNum)

  const week =
    group.schedule.weeks.find((w) => w.weekNumber === currentWeekNum) ||
    group.schedule.weeks[0]

  const totalDaysPerWeek = group.dailyDivisionEnabled ? 7 : 1

  let totalCompletedJuz = 0
  let totalAssignedJuz = 0

  const memberSummaries: MemberProgressSummary[] = group.membersConfig.map((m) => {
    const dbMem = membersDb?.find((dm) => dm.id === m.id)
    const memberDbId = dbMem?.id

    const assignment = week?.assignments.find((a) => a.memberId === m.id)

    const completedProgress = progressRows?.filter(
      (p) => p.member_id === memberDbId && p.is_completed
    ) || []

    const completedDaysCount = completedProgress.length
    const isCompleted = completedDaysCount >= totalDaysPerWeek
    const percent = Math.min(
      100,
      Math.round((completedDaysCount / totalDaysPerWeek) * 100)
    )

    const memberWeeklyAmount = m.weeklyAmount || assignment?.weeklyAmount || 1
    totalAssignedJuz += memberWeeklyAmount
    totalCompletedJuz += memberWeeklyAmount * (percent / 100)

    const lastActivity =
      completedProgress.length > 0
        ? completedProgress.sort(
            (a, b) =>
              new Date(b.completed_at || b.updated_at).getTime() -
              new Date(a.completed_at || a.updated_at).getTime()
          )[0]?.completed_at
        : null

    const portionDescAr = assignment
      ? `الجزء ${assignment.startJuz} - ${assignment.endJuz} (سورة ${assignment.startAyah.surahNameAr} ${assignment.startAyah.ayahNumber} ← ${assignment.endAyah.surahNameAr} ${assignment.endAyah.ayahNumber})`
      : `${m.weeklyAmount} أجزاء`

    const portionDescEn = assignment
      ? `Juz ${assignment.startJuz} - ${assignment.endJuz} (${assignment.startAyah.surahNameEn} ${assignment.startAyah.ayahNumber} to ${assignment.endAyah.surahNameEn} ${assignment.endAyah.ayahNumber})`
      : `${m.weeklyAmount} Juz`

    return {
      memberPublicId: m.publicId || dbMem?.public_id || m.id,
      memberName: m.name,
      weeklyAmount: memberWeeklyAmount,
      assignedPortionDescriptionAr: portionDescAr,
      assignedPortionDescriptionEn: portionDescEn,
      completedDays: completedDaysCount,
      totalDays: totalDaysPerWeek,
      isCompleted,
      percent,
      lastActivityAt: lastActivity,
      isLinked: Boolean(dbMem?.linked_user_id || m.isLinked),
    }
  })

  const overallPercent =
    totalAssignedJuz > 0
      ? Math.min(100, Math.round((totalCompletedJuz / totalAssignedJuz) * 100))
      : 0

  return {
    groupPublicId: group.publicId,
    groupName: group.groupName,
    totalMembers: group.membersConfig.length,
    totalJuz: totalAssignedJuz,
    completedJuz: Math.round(totalCompletedJuz * 10) / 10,
    remainingJuz: Math.max(0, Math.round((totalAssignedJuz - totalCompletedJuz) * 10) / 10),
    overallPercent,
    currentWeek: currentWeekNum,
    totalWeeks: group.schedule.weeksCount,
    members: memberSummaries,
  }
}

