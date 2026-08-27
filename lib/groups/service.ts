import { getSupabaseServerClient } from "../supabase/server"
import {
  CustomQuranRange,
  DailyPortion,
  GeneratedSchedule,
  MemberAssignment,
  MemberConfig,
  OccasionType,
  RangeType,
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
  lang: "ar" | "en" = "ar"
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
  const occasionType = input.group.occasionType || schedule.occasionType || "normal"
  const islamicYear = input.group.islamicYear || schedule.islamicYear || null
  const dailyDivisionEnabled = !!input.group.dailyDivisionEnabled || !!schedule.dailyDivisionEnabled

  // 2. Insert Group
  const { data: groupData, error: groupError } = (await supabase
    .from("groups")
    .insert({
      public_id: publicId,
      edit_token_hash: editTokenHash,
      name: input.group.name.trim(),
      title,
      description,
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
  const { data: planData, error: planError } = (await supabase
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
      "id, public_id, name, title, description, language, direction, expires_at, rotation_style, range_type, start_juz, range_start_surah, range_start_ayah, range_end_surah, range_end_ayah, start_date, uses_dates, occasion_type, islamic_year, daily_division_enabled"
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
      "id, public_id, name, knowledge_type, start_juz, end_juz, start_surah, end_surah, weekly_amount, sort_order"
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
  const effectiveDescription = plan.description || group.description || undefined
  const effectiveStartDate = plan.start_date || group.start_date || undefined
  const effectiveUsesDates = plan.uses_dates ?? group.uses_dates ?? false
  const effectiveOccasion = plan.occasion_type || group.occasion_type || "normal"
  const effectiveIslamicYear = plan.islamic_year || group.islamic_year || undefined
  const effectiveDaily = plan.daily_division_enabled ?? group.daily_division_enabled ?? false

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
 * Validates edit access for a group using the raw secret edit token.
 */
export async function validateEditAccess(
  publicId: string,
  rawEditToken: string
): Promise<boolean> {
  if (!publicId || !rawEditToken || typeof rawEditToken !== "string") {
    return false
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return false
  }

  const { data: group, error } = (await supabase
    .from("groups")
    .select("edit_token_hash, expires_at")
    .eq("public_id", publicId.trim())
    .single()) as {
    data: { edit_token_hash: string; expires_at: string } | null
    error: any
  }

  if (error || !group) {
    return false
  }

  if (new Date(group.expires_at).getTime() < Date.now()) {
    return false
  }

  return verifyEditToken(rawEditToken, group.edit_token_hash)
}

/**
 * Updates a saved group with a new schedule plan. Requires a verified secret edit token.
 */
export async function updateGroupAndRegenerate(
  publicId: string,
  rawEditToken: string,
  input: ScheduleInput,
  lang: "ar" | "en" = "ar"
): Promise<LoadedPublicGroup> {
  const isAuthorized = await validateEditAccess(publicId, rawEditToken)
  if (!isAuthorized) {
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
    .select("id")
    .eq("public_id", publicId.trim())
    .single()) as { data: { id: string } | null; error: any }

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
  const occasionType = input.group.occasionType || newSchedule.occasionType || "normal"
  const islamicYear = input.group.islamicYear || newSchedule.islamicYear || null
  const dailyDivisionEnabled = !!input.group.dailyDivisionEnabled || !!newSchedule.dailyDivisionEnabled

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
  lang: "ar" | "en" = "ar"
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
  return saveScheduleGroup(input, newSchedule, lang)
}

/**
 * Deletes a group and all cascading child records.
 */
export async function deleteGroup(
  publicId: string,
  rawEditToken: string
): Promise<boolean> {
  const isAuthorized = await validateEditAccess(publicId, rawEditToken)
  if (!isAuthorized) {
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
