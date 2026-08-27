import { getSupabaseServerClient } from "../supabase/server"
import {
  CustomQuranRange,
  GeneratedSchedule,
  MemberConfig,
  RangeType,
  RotationStyle,
  ScheduleInput,
  WeekSchedule,
} from "../scheduler/types"
import { generateQuranSchedule } from "../scheduler/engine"
import { validateScheduleInput } from "../scheduler/validator"
import {
  generateEditToken,
  generatePublicId,
  hashEditToken,
  verifyEditToken,
} from "./crypto"

export interface SavedGroupResult {
  publicId: string
  editToken: string
  groupName: string
  expiresAt: string
}

export interface LoadedPublicGroup {
  publicId: string
  groupName: string
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

  // 2. Insert Group
  const { data: groupData, error: groupError } = (await supabase
    .from("groups")
    .insert({
      public_id: publicId,
      edit_token_hash: editTokenHash,
      name: input.group.name.trim(),
      language: lang,
      direction: dir,
      scheduler_version: "1.1",
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

  // 3. Insert Members
  const memberInserts = input.members.map((m, idx) => ({
    group_id: groupId,
    name: m.name.trim(),
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
    .select("id, sort_order")) as {
    data: Array<{ id: string; sort_order: number }> | null
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
  insertedMembers.forEach((im) => {
    memberIdMap.set(im.sort_order, im.id)
  })

  // 4. Insert Schedule Plan
  const { data: planData, error: planError } = (await supabase
    .from("schedule_plans")
    .insert({
      group_id: groupId,
      version_number: 1,
      weeks_count: input.group.weeksCount,
      total_juz_per_week: 30,
      scheduler_version: "1.1",
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
      "id, public_id, name, language, direction, expires_at, rotation_style, range_type, start_juz, range_start_surah, range_start_ayah, range_end_surah, range_end_ayah"
    )
    .eq("public_id", publicId.trim())
    .single()) as {
    data: {
      id: string
      public_id: string
      name: string
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
      "id, name, knowledge_type, start_juz, end_juz, start_surah, end_surah, weekly_amount, sort_order"
    )
    .eq("group_id", group.id)
    .order("sort_order", { ascending: true })) as {
    data: Array<{
      id: string
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
    name: m.name,
    knowledgeType: m.knowledge_type,
    startJuz: m.start_juz,
    endJuz: m.end_juz,
    startSurah: m.start_surah || undefined,
    endSurah: m.end_surah || undefined,
    weeklyAmount: m.weekly_amount,
  }))

  // 3. Fetch active plan
  const { data: plan, error: planError } = (await supabase
    .from("schedule_plans")
    .select(
      "id, version_number, weeks_count, scheduler_version, rotation_style, range_type, start_juz, range_start_surah, range_start_ayah, range_end_surah, range_end_ayah"
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
      "id, schedule_week_id, member_id, member_name, weekly_amount, start_juz, end_juz, start_surah, start_surah_name_ar, start_surah_name_en, start_ayah, end_surah, end_surah_name_ar, end_surah_name_en, end_ayah, start_global_ayah, end_global_ayah, sort_order"
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

  // Reconstruct weeks
  const weekSchedules: WeekSchedule[] = weeks.map((w) => {
    const weekAssignments = assignments
      .filter((a) => a.schedule_week_id === w.id)
      .map((a) => ({
        memberId: a.member_id,
        memberName: a.member_name,
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
      }))

    return {
      weekNumber: w.week_number,
      totalJuz: w.total_juz,
      assignments: weekAssignments,
    }
  })

  const generatedSchedule: GeneratedSchedule = {
    id: group.id,
    createdAt: new Date().toISOString(),
    groupName: group.name,
    weeksCount: plan.weeks_count,
    rotationStyle: plan.rotation_style || group.rotation_style,
    rangeType: plan.range_type || group.range_type,
    startJuz: plan.start_juz || group.start_juz,
    customRange,
    weeks: weekSchedules,
    members: membersConfig,
  }

  return {
    publicId: group.public_id,
    groupName: group.name,
    language: group.language,
    direction: group.direction,
    expiresAt: group.expires_at,
    isExpired: false,
    schedule: generatedSchedule,
    membersConfig,
    versionNumber: plan.version_number,
    rotationStyle: plan.rotation_style || group.rotation_style,
    rangeType: plan.range_type || group.range_type,
    startJuz: plan.start_juz || group.start_juz,
    customRange,
  }
}

/**
 * Validates whether an edit token is authorized to manage a group.
 */
export async function validateEditAccess(
  publicId: string,
  rawEditToken: string
): Promise<boolean> {
  if (!publicId || !rawEditToken || typeof rawEditToken !== "string") {
    return false
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  const { data: group, error } = (await supabase
    .from("groups")
    .select("edit_token_hash")
    .eq("public_id", publicId.trim())
    .single()) as { data: { edit_token_hash: string } | null; error: any }

  if (error || !group) return false

  return verifyEditToken(rawEditToken, group.edit_token_hash)
}

/**
 * Updates group configuration and regenerates a new versioned schedule snapshot.
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
        ? "غير مصرح لك بتعديل هذا الجدول."
        : "You are not authorized to edit this schedule."
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
    throw new Error("Supabase unavailable.")
  }

  const { data: group } = (await supabase
    .from("groups")
    .select("id, name, language, direction, expires_at")
    .eq("public_id", publicId.trim())
    .single()) as {
    data: {
      id: string
      name: string
      language: "ar" | "en"
      direction: "rtl" | "ltr"
      expires_at: string
    } | null
  }

  if (!group) {
    throw new Error("Group not found.")
  }

  const newSchedule = generateQuranSchedule(input)
  const rotationStyle = input.group.rotationStyle || "medium"
  const rangeType = input.group.rangeType || "full"
  const startJuz = input.group.startJuz || 1
  const customRange = input.group.customRange

  // Update group
  await (supabase.from("groups") as any)
    .update({
      name: input.group.name.trim(),
      rotation_style: rotationStyle,
      range_type: rangeType,
      start_juz: startJuz,
      range_start_surah: customRange?.startSurah || null,
      range_start_ayah: customRange?.startAyah || null,
      range_end_surah: customRange?.endSurah || null,
      range_end_ayah: customRange?.endAyah || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", group.id)

  // Replace members
  await supabase.from("group_members").delete().eq("group_id", group.id)

  const memberInserts = input.members.map((m, idx) => ({
    group_id: group.id,
    name: m.name.trim(),
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
    .select("id, sort_order")) as {
    data: Array<{ id: string; sort_order: number }> | null
    error: any
  }

  if (membersError || !insertedMembers) {
    throw new Error("Failed to update members.")
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
      scheduler_version: "1.1",
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

  const input: ScheduleInput = {
    group: {
      name: duplicateName,
      weeksCount: existing.schedule.weeksCount,
      rotationStyle: existing.rotationStyle,
      rangeType: existing.rangeType,
      startJuz: existing.startJuz,
      customRange: existing.customRange,
    },
    members: existing.membersConfig,
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
