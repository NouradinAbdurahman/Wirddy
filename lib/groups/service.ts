import { getSupabaseServerClient } from "../supabase/server"
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
import { generateQuranSchedule } from "../scheduler/engine"
import { validateScheduleInput } from "../scheduler/validator"
import {
  generateEditToken,
  generateMemberPublicId,
  generatePublicId,
  hashEditToken,
  verifyEditToken,
} from "./crypto"
import { WeekDateRange } from "../dates/calendar"

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

/**
 * Persists a generated schedule group to Supabase without requiring authentication.
 */
export async function saveScheduleGroup(
  input: ScheduleInput,
  schedule: GeneratedSchedule,
  lang: "ar" | "en" = "ar",
  ownerUserId?: string | null
): Promise<SavedGroupResult> {
  // 1. Strict Server-Side Validation
  const validation = validateScheduleInput(input)
  if (!validation.isValid) {
    const errorMsg =
      lang === "ar"
        ? validation.errors[0]?.messageAr || "بيانات الخطة غير صالحة."
        : validation.errors[0]?.messageEn || "Invalid schedule configuration."
    throw new Error(errorMsg)
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    throw new Error(
      lang === "ar"
        ? "خدمة الحفظ غير متوفرة حالياً."
        : "Online saving service is currently unavailable."
    )
  }

  const publicId = generatePublicId(14)
  const editToken = generateEditToken()
  const editTokenHash = hashEditToken(editToken)
  const dir = lang === "ar" ? "rtl" : "ltr"
  const rotationStyle = input.group.rotationStyle || "medium"
  const rangeType = input.group.rangeType || "full"
  const startJuz = input.group.startJuz || 1
  const customRange = input.group.customRange
  const title = input.group.title?.trim() || null
  const description = input.group.description?.trim() || null
  const startDate = input.group.startDate || schedule.startDate || null
  const usesDates = !!input.group.usesDates || !!schedule.usesDates
  const occasionType =
    input.group.occasionType || schedule.occasionType || "normal"
  const islamicYear = input.group.islamicYear || schedule.islamicYear || null
  const dailyDivisionEnabled =
    !!input.group.dailyDivisionEnabled || !!schedule.dailyDivisionEnabled

  // 2. Insert Group
  // Try with all new columns first. If migration hasn't been applied yet (PGRST204),
  // fall back to original columns so the app keeps working while migration is pending.
  let { data: groupData, error: groupError } = (await supabase
    .from("groups")
    .insert({
      public_id: publicId,
      edit_token_hash: editTokenHash,
      owner_user_id: ownerUserId || null,
      status: "active",
      is_archived: false,
      name: input.group.name.trim(),
      title,
      description,
      language: lang,
      direction: dir,
      scheduler_version: "1.3",
      rotation_style: rotationStyle,
      range_type: rangeType,
      start_juz: startJuz,
      range_start_surah: customRange?.startSurah || null,
      range_start_ayah: customRange?.startAyah || null,
      range_end_surah: customRange?.endSurah || null,
      range_end_ayah: customRange?.endAyah || null,
      start_date: startDate,
      uses_dates: usesDates,
      occasion_type: occasionType,
      islamic_year: islamicYear,
      daily_division_enabled: dailyDivisionEnabled,
    } as any)
    .select("id, expires_at")
    .single()) as {
    data: { id: string; expires_at: string } | null
    error: any
  }

  // PGRST204 = column not found in schema cache (migration not yet applied to this DB)
  if (groupError?.code === "PGRST204") {
    console.warn(
      "[Wirddy] Advanced columns not found — applying base-only fallback (run migration to enable all features)."
    )
    const fb = (await supabase
      .from("groups")
      .insert({
        public_id: publicId,
        edit_token_hash: editTokenHash,
        name: input.group.name.trim(),
        language: lang,
        direction: dir,
        scheduler_version: "1.2",
        rotation_style: rotationStyle,
        range_type: rangeType,
        start_juz: startJuz,
        range_start_surah: customRange?.startSurah || null,
        range_start_ayah: customRange?.startAyah || null,
        range_end_surah: customRange?.endSurah || null,
        range_end_ayah: customRange?.endAyah || null,
      } as any)
      .select("id, expires_at")
      .single()) as {
      data: { id: string; expires_at: string } | null
      error: any
    }
    groupData = fb.data
    groupError = fb.error
  }

  if (groupError || !groupData) {
    console.error("Error creating group:", groupError)
    throw new Error(
      lang === "ar"
        ? "تعذر حفظ المجموعة على الخادم."
        : "Failed to save group to server."
    )
  }

  const groupId = groupData.id
  const expiresAt = groupData.expires_at

  // 3. Insert Members with unguessable publicId
  const memberPublicIdMap = new Map<number, string>()
  const memberInserts = input.members.map((m, idx) => {
    const memberPublicId = m.publicId || generateMemberPublicId()
    memberPublicIdMap.set(idx, memberPublicId)
    return {
      group_id: groupId,
      name: m.name.trim(),
      public_id: memberPublicId,
      knowledge_type: m.knowledgeType,
      start_juz: m.startJuz,
      end_juz: m.endJuz,
      start_surah: m.startSurah || null,
      end_surah: m.endSurah || null,
      weekly_amount: m.weeklyAmount,
      sort_order: idx,
    }
  })

  const { data: insertedMembers, error: membersError } = (await supabase
    .from("group_members")
    .insert(memberInserts as any)
    .select("id, sort_order, public_id")) as {
    data: Array<{ id: string; sort_order: number; public_id: string }> | null
    error: any
  }

  if (membersError || !insertedMembers) {
    console.error("Error inserting members:", membersError)
    await supabase.from("groups").delete().eq("id", groupId)
    throw new Error(
      lang === "ar"
        ? "تعذر حفظ بيانات الأعضاء."
        : "Failed to save group members."
    )
  }

  const memberIdMap = new Map<number, string>()
  const memberDbPublicIdMap = new Map<number, string>()
  insertedMembers.forEach((im) => {
    memberIdMap.set(im.sort_order, im.id)
    memberDbPublicIdMap.set(im.sort_order, im.public_id)
  })

  // 4. Insert Schedule Plan
  let { data: planData, error: planError } = (await supabase
    .from("schedule_plans")
    .insert({
      group_id: groupId,
      version_number: 1,
      weeks_count: input.group.weeksCount,
      total_juz_per_week: 30,
      scheduler_version: "1.2",
      is_active: true,
      rotation_style: rotationStyle,
      range_type: rangeType,
      start_juz: startJuz,
      range_start_surah: customRange?.startSurah || null,
      range_start_ayah: customRange?.startAyah || null,
      range_end_surah: customRange?.endSurah || null,
      range_end_ayah: customRange?.endAyah || null,
      title,
      description,
      start_date: startDate,
      uses_dates: usesDates,
      occasion_type: occasionType,
      islamic_year: islamicYear,
      daily_division_enabled: dailyDivisionEnabled,
    } as any)
    .select("id")
    .single()) as { data: { id: string } | null; error: any }

  if (planError?.code === "PGRST204") {
    const fb2 = (await supabase
      .from("schedule_plans")
      .insert({
        group_id: groupId,
        version_number: 1,
        weeks_count: input.group.weeksCount,
        total_juz_per_week: 30,
        scheduler_version: "1.2",
        is_active: true,
        rotation_style: rotationStyle,
        range_type: rangeType,
        start_juz: startJuz,
        range_start_surah: customRange?.startSurah || null,
        range_start_ayah: customRange?.startAyah || null,
        range_end_surah: customRange?.endSurah || null,
        range_end_ayah: customRange?.endAyah || null,
      } as any)
      .select("id")
      .single()) as { data: { id: string } | null; error: any }
    planData = fb2.data
    planError = fb2.error
  }

  if (planError || !planData) {
    console.error("Error inserting plan:", planError)
    await supabase.from("groups").delete().eq("id", groupId)
    throw new Error(
      lang === "ar" ? "تعذر حفظ خطة الجدول." : "Failed to save schedule plan."
    )
  }

  const planId = planData.id

  // 5. Insert Weeks and Assignments
  for (const week of schedule.weeks) {
    const { data: weekData, error: weekError } = (await supabase
      .from("schedule_weeks")
      .insert({
        schedule_plan_id: planId,
        week_number: week.weekNumber,
        total_juz: week.totalJuz || 30,
      } as any)
      .select("id")
      .single()) as { data: { id: string } | null; error: any }

    if (weekError || !weekData) {
      console.error("Error inserting week:", weekError)
      await supabase.from("groups").delete().eq("id", groupId)
      throw new Error(
        lang === "ar"
          ? "تعذر حفظ أسابيع الجدول."
          : "Failed to save schedule weeks."
      )
    }

    const weekId = weekData.id
    const assignmentInserts = week.assignments.map((a, aIdx) => {
      const originalMemberIndex = input.members.findIndex(
        (m) => m.id === a.memberId || m.name === a.memberName
      )
      const dbMemberId =
        (originalMemberIndex >= 0
          ? memberIdMap.get(originalMemberIndex)
          : insertedMembers[0]?.id) || insertedMembers[0].id

      return {
        schedule_week_id: weekId,
        member_id: dbMemberId,
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
        start_global_ayah: a.startAyah.globalAyahNumber || null,
        end_global_ayah: a.endAyah.globalAyahNumber || null,
        daily_breakdown: a.dailyBreakdown ? (a.dailyBreakdown as any) : null,
        sort_order: aIdx,
      }
    })

    const { error: assignError } = await supabase
      .from("schedule_assignments")
      .insert(assignmentInserts as any)

    if (assignError) {
      console.error("Error inserting assignments:", assignError)
      await supabase.from("groups").delete().eq("id", groupId)
      throw new Error(
        lang === "ar"
          ? "تعذر حفظ تعيينات الجدول."
          : "Failed to save schedule assignments."
      )
    }
  }

  // Record initial history snapshot
  await createScheduleHistorySnapshot(
    groupId,
    "create_group",
    lang === "ar" ? "تم إنشاء الجدول" : "Schedule created",
    { input, schedule },
    ownerUserId || undefined
  )

  return {
    publicId,
    editToken,
    groupName: input.group.name,
    expiresAt,
  }
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
      "id, public_id, name, title, description, language, direction, expires_at, rotation_style, range_type, start_juz, range_start_surah, range_start_ayah, range_end_surah, range_end_ayah, start_date, uses_dates, occasion_type, islamic_year, daily_division_enabled, owner_user_id"
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
    } | null
    error: any
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
    error: any
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
    linkedUserId: m.linked_user_id || undefined,
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
    error: any
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
    error: any
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
    error: any
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

  const builtWeeks: WeekSchedule[] = weeks.map((w) => ({
    weekNumber: w.week_number,
    totalJuz: w.total_juz,
    assignments: assignmentMap.get(w.id) || [],
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
    recurrence: (group as any).recurrence || undefined,
    ownerUserId: group.owner_user_id || undefined,
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
  const memberWeeks = group.schedule.weeks.map((week) => {
    const assignment =
      week.assignments.find(
        (a) =>
          a.memberPublicId === member.publicId ||
          a.memberId === member.id ||
          a.memberName === member.name
      ) || week.assignments[0]

    return {
      weekNumber: week.weekNumber,
      assignment,
      dateRange: week.dateRange,
    }
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
 * Updates a saved group with a new schedule plan. Requires a verified secret edit token or authenticated owner.
 */
export async function updateGroupAndRegenerate(
  publicId: string,
  rawEditToken: string,
  input: ScheduleInput,
  lang: "ar" | "en" = "ar",
  userId?: string
): Promise<LoadedPublicGroup> {
  const authCheck = await checkGroupAuthorization(
    publicId,
    rawEditToken,
    userId
  )
  if (!authCheck.authorized || !authCheck.group) {
    throw new Error(
      lang === "ar"
        ? "رمز التعديل غير صحيح أو غير مصرح لك بالتعديل."
        : "Invalid edit token or unauthorized access."
    )
  }

  const validation = validateScheduleInput(input)
  if (!validation.isValid) {
    const errorMsg =
      lang === "ar"
        ? validation.errors[0]?.messageAr || "بيانات الخطة غير صالحة."
        : validation.errors[0]?.messageEn || "Invalid schedule configuration."
    throw new Error(errorMsg)
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    throw new Error("Online service is currently unavailable.")
  }

  const newSchedule = generateQuranSchedule(input)

  // 1. Fetch group
  const { data: group, error: fetchError } = (await supabase
    .from("groups")
    .select("id, owner_user_id")
    .eq("public_id", publicId.trim())
    .single()) as {
    data: { id: string; owner_user_id: string | null } | null
    error: any
  }

  if (fetchError || !group) {
    throw new Error("Group not found.")
  }

  const rotationStyle = input.group.rotationStyle || "medium"
  const rangeType = input.group.rangeType || "full"
  const startJuz = input.group.startJuz || 1
  const customRange = input.group.customRange
  const title = input.group.title?.trim() || null
  const description = input.group.description?.trim() || null
  const startDate = input.group.startDate || newSchedule.startDate || null
  const usesDates = !!input.group.usesDates || !!newSchedule.usesDates
  const occasionType =
    input.group.occasionType || newSchedule.occasionType || "normal"
  const islamicYear = input.group.islamicYear || newSchedule.islamicYear || null
  const dailyDivisionEnabled =
    !!input.group.dailyDivisionEnabled || !!newSchedule.dailyDivisionEnabled

  // Update group record
  await (supabase.from("groups") as any)
    .update({
      name: input.group.name.trim(),
      title,
      description,
      language: lang,
      direction: lang === "ar" ? "rtl" : "ltr",
      rotation_style: rotationStyle,
      range_type: rangeType,
      start_juz: startJuz,
      range_start_surah: customRange?.startSurah || null,
      range_start_ayah: customRange?.startAyah || null,
      range_end_surah: customRange?.endSurah || null,
      range_end_ayah: customRange?.endAyah || null,
      start_date: startDate,
      uses_dates: usesDates,
      occasion_type: occasionType,
      islamic_year: islamicYear,
      daily_division_enabled: dailyDivisionEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", group.id)

  // Re-sync members (preserve existing public_ids where possible)
  await supabase.from("group_members").delete().eq("group_id", group.id)

  const memberInserts = input.members.map((m, idx) => ({
    group_id: group.id,
    name: m.name.trim(),
    public_id: m.publicId || generateMemberPublicId(),
    knowledge_type: m.knowledgeType,
    start_juz: m.startJuz,
    end_juz: m.endJuz,
    start_surah: m.startSurah || null,
    end_surah: m.endSurah || null,
    weekly_amount: m.weeklyAmount,
    sort_order: idx,
  }))

  const { data: insertedMembers, error: membersError } = (await supabase
    .from("group_members")
    .insert(memberInserts as any)
    .select("id, sort_order, public_id")) as {
    data: Array<{ id: string; sort_order: number; public_id: string }> | null
    error: any
  }

  if (membersError || !insertedMembers) {
    throw new Error("Failed to update group members.")
  }

  const memberIdMap = new Map<number, string>()
  insertedMembers.forEach((im) => {
    memberIdMap.set(im.sort_order, im.id)
  })

  // Get highest version number & mark previous plans inactive
  const { data: latestPlan } = (await supabase
    .from("schedule_plans")
    .select("version_number")
    .eq("group_id", group.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .single()) as { data: { version_number: number } | null }

  const nextVersion = (latestPlan?.version_number || 1) + 1

  await (supabase.from("schedule_plans") as any)
    .update({ is_active: false })
    .eq("group_id", group.id)

  // Insert new plan
  const { data: planData, error: planError } = (await supabase
    .from("schedule_plans")
    .insert({
      group_id: group.id,
      version_number: nextVersion,
      weeks_count: input.group.weeksCount,
      total_juz_per_week: 30,
      scheduler_version: "1.2",
      is_active: true,
      rotation_style: rotationStyle,
      range_type: rangeType,
      start_juz: startJuz,
      range_start_surah: customRange?.startSurah || null,
      range_start_ayah: customRange?.startAyah || null,
      range_end_surah: customRange?.endSurah || null,
      range_end_ayah: customRange?.endAyah || null,
      title,
      description,
      start_date: startDate,
      uses_dates: usesDates,
      occasion_type: occasionType,
      islamic_year: islamicYear,
      daily_division_enabled: dailyDivisionEnabled,
    } as any)
    .select("id")
    .single()) as { data: { id: string } | null; error: any }

  if (planError || !planData) {
    throw new Error("Failed to create new plan version.")
  }

  const planId = planData.id

  // Insert weeks and assignments
  for (const week of newSchedule.weeks) {
    const { data: weekData, error: weekError } = (await supabase
      .from("schedule_weeks")
      .insert({
        schedule_plan_id: planId,
        week_number: week.weekNumber,
        total_juz: week.totalJuz || 30,
      } as any)
      .select("id")
      .single()) as { data: { id: string } | null; error: any }

    if (weekError || !weekData) {
      throw new Error("Failed to create plan weeks.")
    }

    const weekId = weekData.id
    const assignmentInserts = week.assignments.map((a, aIdx) => {
      const originalMemberIndex = input.members.findIndex(
        (m) => m.id === a.memberId || m.name === a.memberName
      )
      const dbMemberId =
        (originalMemberIndex >= 0
          ? memberIdMap.get(originalMemberIndex)
          : insertedMembers[0]?.id) || insertedMembers[0].id

      return {
        schedule_week_id: weekId,
        member_id: dbMemberId,
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
        start_global_ayah: a.startAyah.globalAyahNumber || null,
        end_global_ayah: a.endAyah.globalAyahNumber || null,
        daily_breakdown: a.dailyBreakdown ? (a.dailyBreakdown as any) : null,
        sort_order: aIdx,
      }
    })

    await supabase.from("schedule_assignments").insert(assignmentInserts as any)
  }

  // Create history snapshot
  await createScheduleHistorySnapshot(
    group.id,
    "update_schedule",
    lang === "ar" ? "تم تعديل خطة الجدول" : "Schedule plan updated",
    { input, schedule: newSchedule },
    group.owner_user_id || undefined
  )

  const loaded = await getGroupByPublicId(publicId)
  if (!loaded) {
    throw new Error("Failed to load regenerated group.")
  }

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

  const newSchedule = generateQuranSchedule(input)
  return saveScheduleGroup(input, newSchedule, lang, ownerUserId)
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
      startDate: undefined, // Reset start date for the new cycle
      usesDates: existing.usesDates,
      occasionType: existing.occasionType,
      islamicYear: nextIslamicYear || undefined,
      dailyDivisionEnabled: existing.dailyDivisionEnabled,
    },
    members: freshMembers,
  }

  const newSchedule = generateQuranSchedule(input)
  return saveScheduleGroup(input, newSchedule, lang, ownerUserId)
}

/**
 * Authorizes modification request via edit token OR authenticated group owner.
 */
export async function checkGroupAuthorization(
  publicId: string,
  rawEditToken?: string,
  userId?: string
): Promise<{ authorized: boolean; group?: any }> {
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

  const { error } = await (supabase.from("groups") as any)
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

/**
 * Fetches all groups owned by or linked to a user.
 */
export async function fetchUserGroups(
  userId: string,
  filter:
    "all" | "active" | "draft" | "completed" | "archived" | "ramadan" = "all"
): Promise<UserGroupSummary[]> {
  if (!userId) return []

  const supabase = getSupabaseServerClient()
  if (!supabase) return []

  // 1. Fetch groups owned by the user
  let query = supabase
    .from("groups")
    .select(
      `
      id,
      public_id,
      name,
      title,
      description,
      status,
      is_archived,
      occasion_type,
      islamic_year,
      daily_division_enabled,
      recurrence,
      start_date,
      created_at,
      updated_at,
      owner_user_id,
      group_members (id, name, public_id, linked_user_id),
      schedule_plans (id, weeks_count, is_active)
    `
    )
    .eq("owner_user_id", userId)
    .order("updated_at", { ascending: false })

  if (filter === "active") {
    query = query.eq("is_archived", false).eq("status", "active")
  } else if (filter === "archived") {
    query = query.eq("is_archived", true)
  } else if (filter === "completed") {
    query = query.eq("status", "completed")
  } else if (filter === "ramadan") {
    query = query.eq("occasion_type", "ramadan")
  }

  let ownedGroups: any[] | null = null
  const { data: initialOwned, error: ownedError } = await query
  if (initialOwned) {
    ownedGroups = initialOwned as any[]
  }

  if (ownedError) {
    if (
      ownedError.code === "42703" ||
      ownedError.message?.includes("linked_user_id")
    ) {
      // Fallback query for schemas where linked_user_id migration has not yet been applied
      let fallbackQuery = supabase
        .from("groups")
        .select(
          `
          id,
          public_id,
          name,
          title,
          description,
          status,
          is_archived,
          occasion_type,
          islamic_year,
          daily_division_enabled,
          recurrence,
          start_date,
          created_at,
          updated_at,
          owner_user_id,
          group_members (id, name, public_id),
          schedule_plans (id, weeks_count, is_active)
        `
        )
        .eq("owner_user_id", userId)
        .order("updated_at", { ascending: false })

      if (filter === "active") {
        fallbackQuery = fallbackQuery
          .eq("is_archived", false)
          .eq("status", "active")
      } else if (filter === "archived") {
        fallbackQuery = fallbackQuery.eq("is_archived", true)
      } else if (filter === "completed") {
        fallbackQuery = fallbackQuery.eq("status", "completed")
      } else if (filter === "ramadan") {
        fallbackQuery = fallbackQuery.eq("occasion_type", "ramadan")
      }

      const fb = await fallbackQuery
      ownedGroups = (fb.data as any[]) || null
    } else {
      console.error("fetchUserGroups owned error:", ownedError)
    }
  }

  // 2. Fetch groups where user is a linked member (safely handled if linked_user_id column is absent)
  let linkedMembers: any[] | null = null
  try {
    const { data: membersData, error: memberError } = await supabase
      .from("group_members")
      .select(
        `
        id,
        name,
        public_id,
        group_id,
        groups (
          id,
          public_id,
          name,
          title,
          description,
          status,
          is_archived,
          occasion_type,
          islamic_year,
          daily_division_enabled,
          recurrence,
          start_date,
          created_at,
          updated_at,
          owner_user_id,
          group_members (id, name, public_id),
          schedule_plans (id, weeks_count, is_active)
        )
      `
      )
      .eq("linked_user_id", userId)

    if (!memberError && membersData) {
      linkedMembers = membersData
    } else if (
      memberError &&
      memberError.code !== "42703" &&
      !memberError.message?.includes("linked_user_id")
    ) {
      console.error("fetchUserGroups member error:", memberError)
    }
  } catch {
    // Ignore schema absence
  }

  const resultMap = new Map<string, UserGroupSummary>()

  // Process owned groups
  if (ownedGroups) {
    for (const g of ownedGroups as any[]) {
      const activePlan = Array.isArray(g.schedule_plans)
        ? g.schedule_plans.find((p: any) => p.is_active) || g.schedule_plans[0]
        : null
      const weeksCount = activePlan?.weeks_count || 1
      const membersCount = Array.isArray(g.group_members)
        ? g.group_members.length
        : 0

      // Find user's own member link if exists
      const ownMember = Array.isArray(g.group_members)
        ? g.group_members.find((m: any) => m.linked_user_id === userId)
        : null

      resultMap.set(g.public_id, {
        publicId: g.public_id,
        groupName: g.name,
        title: g.title,
        description: g.description,
        membersCount,
        weeksCount,
        startDate: g.start_date,
        currentWeek: 1,
        progressPercentage: 0,
        status: (g.status || "active") as any,
        isArchived: !!g.is_archived,
        occasionType: g.occasion_type || "normal",
        islamicYear: g.islamic_year,
        dailyDivisionEnabled: !!g.daily_division_enabled,
        recurrence: g.recurrence || null,
        updatedAt: g.updated_at,
        createdAt: g.created_at,
        isOwner: true,
        userRole: "owner",
        memberPublicId: ownMember?.public_id,
        memberName: ownMember?.name,
      })
    }
  }

  // Process linked member groups
  if (linkedMembers) {
    for (const lm of linkedMembers as any[]) {
      const g = lm.groups
      if (!g || resultMap.has(g.public_id)) continue

      // Apply filters to member groups as well
      if (
        filter === "active" &&
        (g.is_archived || (g.status && g.status !== "active"))
      )
        continue
      if (filter === "archived" && !g.is_archived) continue
      if (filter === "completed" && g.status !== "completed") continue
      if (filter === "ramadan" && g.occasion_type !== "ramadan") continue

      const activePlan = Array.isArray(g.schedule_plans)
        ? g.schedule_plans.find((p: any) => p.is_active) || g.schedule_plans[0]
        : null
      const weeksCount = activePlan?.weeks_count || 1
      const membersCount = Array.isArray(g.group_members)
        ? g.group_members.length
        : 0

      resultMap.set(g.public_id, {
        publicId: g.public_id,
        groupName: g.name,
        title: g.title,
        description: g.description,
        membersCount,
        weeksCount,
        startDate: g.start_date,
        currentWeek: 1,
        progressPercentage: 0,
        status: (g.status || "active") as any,
        isArchived: !!g.is_archived,
        occasionType: g.occasion_type || "normal",
        islamicYear: g.islamic_year,
        dailyDivisionEnabled: !!g.daily_division_enabled,
        recurrence: g.recurrence || null,
        updatedAt: g.updated_at,
        createdAt: g.created_at,
        isOwner: false,
        userRole: "member",
        memberPublicId: lm.public_id,
        memberName: lm.name,
      })
    }
  }

  return Array.from(resultMap.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

/**
 * Saves daily reading progress for a group member.
 */
export async function saveReadingProgress(
  groupPublicId: string,
  memberPublicId: string,
  weekNumber: number,
  dayNumber: number,
  isCompleted: boolean,
  userId?: string | null
): Promise<{ success: boolean; progressId?: string }> {
  const supabase = getSupabaseServerClient()
  if (!supabase) return { success: false }

  const { data: group } = await supabase
    .from("groups")
    .select("id")
    .eq("public_id", groupPublicId.trim())
    .single()

  if (!group) return { success: false }

  const { data: member } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", group.id)
    .eq("public_id", memberPublicId.trim())
    .single()

  if (!member) return { success: false }

  const completedAt = isCompleted ? new Date().toISOString() : null

  const { data, error } = await (supabase.from("reading_progress") as any)
    .upsert(
      {
        group_id: group.id,
        member_id: member.id,
        user_id: userId || null,
        week_number: weekNumber,
        day_number: dayNumber,
        is_completed: isCompleted,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "group_id,member_id,week_number,day_number" }
    )
    .select("id")
    .single()

  if (error) {
    console.error("saveReadingProgress error:", error)
    return { success: false }
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

  return data.map((d: any) => ({
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

  const { data, error } = await (supabase.from("bookmarks") as any)
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

  return data.map((b: any) => ({
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

  const { data, error } = await (supabase.from("announcements") as any)
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

  return data.map((a: any) => ({
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

/**
 * Links a group member to an authenticated user account.
 */
export async function linkMemberAccount(
  groupPublicId: string,
  memberPublicId: string,
  userId: string
): Promise<boolean> {
  if (!groupPublicId || !memberPublicId || !userId) return false

  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  const { data: group } = await supabase
    .from("groups")
    .select("id")
    .eq("public_id", groupPublicId.trim())
    .single()

  if (!group) return false

  const cleanId = memberPublicId.trim()
  const { data: updated, error } = await (supabase.from("group_members") as any)
    .update({
      linked_user_id: userId,
    })
    .eq("group_id", group.id)
    .or(`public_id.eq.${cleanId},id.eq.${cleanId}`)
    .select("id, public_id, name, linked_user_id")

  if (error) {
    console.error("linkMemberAccount error:", error)
    return false
  }

  // Also associate unassigned reading_progress records for this member with this userId
  if (updated && updated.length > 0) {
    const memberId = updated[0].id
    await (supabase.from("reading_progress") as any)
      .update({ user_id: userId })
      .eq("group_id", group.id)
      .eq("member_id", memberId)
      .is("user_id", null)
    return true
  }

  return false
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
 * Checks whether a specific member slot is linked to an account.
 */
export async function getMemberLinkStatus(
  groupPublicId: string,
  memberPublicId: string,
  currentUserId?: string | null
): Promise<MemberLinkStatusResult | null> {
  if (!groupPublicId || !memberPublicId) return null

  const supabase = getSupabaseServerClient()
  if (!supabase) return null

  const { data: group } = await supabase
    .from("groups")
    .select("id, owner_user_id")
    .eq("public_id", groupPublicId.trim())
    .single()

  if (!group) return null

  const cleanId = memberPublicId.trim()
  const { data: members, error } = await supabase
    .from("group_members")
    .select("id, public_id, name, linked_user_id")
    .eq("group_id", group.id)
    .or(`public_id.eq.${cleanId},id.eq.${cleanId}`)

  if (error || !members || members.length === 0) return null

  const member = members[0]
  const isLinked = Boolean(member.linked_user_id)
  const isLinkedToCurrentUser = Boolean(
    currentUserId && member.linked_user_id === currentUserId
  )
  const isOwner = Boolean(
    currentUserId && group.owner_user_id === currentUserId
  )

  return {
    isLinked,
    isLinkedToCurrentUser,
    linkedUserId: member.linked_user_id || null,
    currentUserId: currentUserId || null,
    isOwner,
    groupOwnerId: group.owner_user_id || null,
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
    supabase.from("notification_preferences") as any
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
export async function fetchNotificationPreferences(
  userId: string
): Promise<any> {
  if (!userId) return null

  const supabase = getSupabaseServerClient()
  if (!supabase) return null

  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single()

  return data || null
}

/**
 * Exports all user data in clean JSON format.
 */
export async function exportUserData(userId: string): Promise<any> {
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
 * Deletes user account and cascades ownership.
 */
export async function deleteUserAccount(userId: string): Promise<boolean> {
  if (!userId) return false

  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  // Delete owned groups
  await supabase.from("groups").delete().eq("owner_user_id", userId)
  // Delete bookmarks
  await supabase.from("bookmarks").delete().eq("user_id", userId)
  // Delete notification prefs
  await supabase.from("notification_preferences").delete().eq("user_id", userId)

  return true
}

export interface ScheduleHistoryRecord {
  id: string
  groupId: string
  actionType: string
  description: string
  snapshot: any
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
  snapshot: any,
  userId?: string
): Promise<boolean> {
  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  // 1. Insert new snapshot
  const { error } = await (supabase.from("schedule_history") as any).insert({
    group_id: groupId,
    action_type: actionType,
    description: description.trim(),
    snapshot: snapshot || null,
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
      const idsToDelete = allHistory.slice(20).map((h: any) => h.id)
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

  return data.map((h: any) => ({
    id: h.id,
    groupId: h.group_id,
    actionType: h.action_type,
    description: h.description,
    snapshot: h.snapshot,
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
    data: { snapshot: any; description: string } | null
    error: any
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
    rawEditToken || "authorized_session",
    restoredInput,
    lang
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
 * Processes recurring schedule cycles (Weekly, Monthly, Ramadan) with idempotency protection.
 */
export async function processRecurringCycle(
  groupPublicId: string,
  userId?: string,
  rawEditToken?: string,
  lang: "ar" | "en" = "ar"
): Promise<SavedGroupResult> {
  const { authorized, group } = await checkGroupAuthorization(
    groupPublicId,
    rawEditToken,
    userId
  )
  if (!authorized || !group) {
    throw new Error("Unauthorized to renew recurring cycle.")
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) throw new Error("Service unavailable.")

  const existing = await getGroupByPublicId(groupPublicId)
  if (!existing) throw new Error("Group not found.")

  const recurrence = (group as any).recurrence
  const frequency =
    recurrence?.frequency ||
    (existing.occasionType === "ramadan" ? "ramadan" : "weekly")

  const nextCycleIndex = ((group as any).cycle_index || 1) + 1

  // Idempotency check: Ensure child cycle doesn't already exist
  const { data: existingCycle } = await supabase
    .from("groups")
    .select("public_id, edit_token_hash, expires_at")
    .eq("recurring_source_group_id", group.id)
    .eq("cycle_index", nextCycleIndex)
    .single()

  if (existingCycle) {
    return {
      publicId: existingCycle.public_id,
      editToken: "",
      groupName: existing.groupName,
      expiresAt: existingCycle.expires_at,
    }
  }

  // Calculate next start date
  let nextStartDate = existing.startDate
  if (existing.startDate && existing.usesDates) {
    const prevDate = new Date(existing.startDate)
    if (String(frequency) === "weekly") {
      prevDate.setDate(prevDate.getDate() + existing.schedule.weeksCount * 7)
      nextStartDate = prevDate.toISOString().slice(0, 10)
    } else if (String(frequency) === "monthly") {
      prevDate.setMonth(prevDate.getMonth() + 1)
      nextStartDate = prevDate.toISOString().slice(0, 10)
    }
  }

  const nextIslamicYear =
    String(frequency) === "ramadan" || existing.occasionType === "ramadan"
      ? (existing.islamicYear || 1447) + 1
      : existing.islamicYear

  const freshMembers: MemberConfig[] = existing.membersConfig.map((m) => ({
    id: generateMemberPublicId(),
    name: m.name,
    publicId: generateMemberPublicId(),
    knowledgeType: m.knowledgeType,
    startJuz: m.startJuz,
    endJuz: m.endJuz,
    startSurah: m.startSurah,
    endSurah: m.endSurah,
    weeklyAmount: m.weeklyAmount,
  }))

  const cycleTitle =
    frequency === "ramadan"
      ? lang === "ar"
        ? `ختمة رمضان ${nextIslamicYear} هـ`
        : `Ramadan Khatmah ${nextIslamicYear} AH`
      : lang === "ar"
        ? `${existing.groupName} - دورة ${nextCycleIndex}`
        : `${existing.groupName} - Cycle ${nextCycleIndex}`

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
      startDate: nextStartDate || undefined,
      usesDates: existing.usesDates,
      occasionType: frequency === "ramadan" ? "ramadan" : "normal",
      islamicYear: nextIslamicYear || undefined,
      dailyDivisionEnabled: existing.dailyDivisionEnabled,
      recurrence: {
        frequency: frequency as any,
        cycleIndex: nextCycleIndex,
        autoAdvance: true,
      },
    },
    members: freshMembers,
  }

  const newSchedule = generateQuranSchedule(input)
  const saved = await saveScheduleGroup(
    input,
    newSchedule,
    lang,
    group.owner_user_id || undefined
  )

  // Update parent group recurring pointers
  await (supabase.from("groups") as any)
    .update({
      last_cycle_generated_at: new Date().toISOString(),
      cycle_index: nextCycleIndex,
    })
    .eq("id", group.id)

  return saved
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
  linkedUserId: string | null
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

  // Prioritize group where user has a linked member slot, otherwise first active group
  const activeGroupSummary =
    userGroups.find((g) => Boolean(g.memberPublicId)) || userGroups[0]

  if (!activeGroupSummary) return null

  // 2. Fetch full loaded group data
  const group = await getGroupByPublicId(activeGroupSummary.publicId)
  if (!group || !group.schedule || !group.schedule.weeks.length) return null

  // 3. Determine current week (1-indexed)
  let currentWeekNum = 1
  if (group.usesDates && group.startDate) {
    const start = new Date(group.startDate).getTime()
    const now = Date.now()
    if (now >= start) {
      const elapsedDays = Math.floor((now - start) / (24 * 60 * 60 * 1000))
      currentWeekNum = Math.min(
        group.schedule.weeksCount,
        Math.max(1, Math.floor(elapsedDays / 7) + 1)
      )
    }
  }

  // 4. Determine current day of week (1 to 7)
  const currentDayNum = Math.max(1, Math.min(7, (new Date().getDay() + 1)))

  // 5. Find member
  const targetMemberPublicId =
    activeGroupSummary.memberPublicId ||
    group.membersConfig[0]?.publicId ||
    group.membersConfig[0]?.id

  const member =
    group.membersConfig.find(
      (m) =>
        m.publicId === targetMemberPublicId || m.id === targetMemberPublicId
    ) || group.membersConfig[0]

  if (!member) return null

  // 6. Find assignment for the current week
  const week =
    group.schedule.weeks.find((w) => w.weekNumber === currentWeekNum) ||
    group.schedule.weeks[0]

  const assignment =
    week.assignments.find(
      (a) =>
        a.memberPublicId === member.publicId ||
        a.memberId === member.id ||
        a.memberName.toLowerCase().trim() === member.name.toLowerCase().trim()
    ) || week.assignments[0]

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
    const { data: memberDb } = await supabase
      .from("group_members")
      .select("id")
      .eq("public_id", member.publicId || targetMemberPublicId)
      .single()

    if (memberDb?.id) {
      const { data: progressRow } = await supabase
        .from("reading_progress")
        .select("is_completed")
        .eq("group_id", (group as any).id || (await supabase.from("groups").select("id").eq("public_id", group.publicId).single()).data?.id)
        .eq("member_id", memberDb.id)
        .eq("week_number", currentWeekNum)
        .eq("day_number", currentDayNum)
        .single()

      if (progressRow) {
        isCompleted = Boolean(progressRow.is_completed)
      }
    }
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
  let currentWeekNum = 1
  if (group.usesDates && group.startDate) {
    const start = new Date(group.startDate).getTime()
    const now = Date.now()
    if (now >= start) {
      const elapsedDays = Math.floor((now - start) / (24 * 60 * 60 * 1000))
      currentWeekNum = Math.min(
        group.schedule.weeksCount,
        Math.max(1, Math.floor(elapsedDays / 7) + 1)
      )
    }
  }

  // 2. Fetch group DB record & members with linked_user_id
  const { data: groupDb } = await supabase
    .from("groups")
    .select("id, owner_user_id")
    .eq("public_id", groupPublicId.trim())
    .single()

  if (!groupDb) return null

  // Security & Privacy: Only the owner of the group can view complete group progress summary
  if (
    requestingUserId &&
    groupDb.owner_user_id &&
    groupDb.owner_user_id !== requestingUserId
  ) {
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
    const dbMem = membersDb?.find(
      (dm: any) =>
        (m.publicId && dm.public_id === m.publicId) ||
        dm.id === m.id ||
        (m.name && dm.name?.trim().toLowerCase() === m.name?.trim().toLowerCase())
    )
    const memberDbId = dbMem?.id

    const assignment =
      week?.assignments.find(
        (a) =>
          a.memberPublicId === m.publicId ||
          a.memberId === m.id ||
          a.memberName.toLowerCase().trim() === m.name.toLowerCase().trim()
      )

    const completedProgress = progressRows?.filter(
      (p: any) => p.member_id === memberDbId && p.is_completed
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
            (a: any, b: any) =>
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
      isLinked: Boolean(dbMem?.linked_user_id || m.linkedUserId || m.isLinked),
      linkedUserId: dbMem?.linked_user_id || m.linkedUserId || null,
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

