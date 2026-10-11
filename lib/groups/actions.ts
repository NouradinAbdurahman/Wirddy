"use server"

import { headers } from "next/headers"
import { GeneratedSchedule, ScheduleInput } from "../scheduler/types"
import { checkSharedRateLimit } from "./rate-limit"
import {
  archiveGroup,
  createAnnouncement,
  deleteBookmark,
  deleteGroup,
  deleteUserAccount,
  duplicateGroupSchedule,
  exportUserData,
  fetchAnnouncements,
  fetchGroupReadingProgress,
  fetchGroupProgressSummary,
  fetchNotificationPreferences,
  fetchScheduleHistory,
  fetchUserBookmarks,
  fetchUserGroups,
  fetchUserTodaysReading,
  getGroupByPublicId,
  getMemberScheduleByPublicId,
  getMemberLinkStatus,
  MemberLinkStatusResult,
  GroupProgressSummary,
  linkMemberAccount,
  LoadedPublicGroup,
  LoadedPublicMemberSchedule,
  processRecurringCycle,
  restoreScheduleVersion,
  SavedGroupResult,
  SaveProgressResult,
  NotificationPreferencesRow,
  UserDataExport,
  saveBookmark,
  saveNotificationPreferences,
  saveReadingProgress,
  saveScheduleGroup,
  ScheduleHistoryRecord,
  startNewKhatmah,
  updateGroupAndRegenerate,
  UserGroupSummary,
  UserTodaysReadingResult,
  validateEditAccess,
  checkGroupAuthorization,
} from "./service"
import { createSupabaseServerClient } from "../supabase/server"

export interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback
}

async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers()
    // Vercel sets x-real-ip and x-vercel-forwarded-for itself, so prefer them
    // over x-forwarded-for, whose first entry a client can supply.
    const trusted =
      headersList.get("x-vercel-forwarded-for") || headersList.get("x-real-ip")
    if (trusted) {
      return trusted.split(",")[0].trim()
    }
    const forwarded = headersList.get("x-forwarded-for")
    if (forwarded) {
      const parts = forwarded.split(",")
      return parts[parts.length - 1].trim()
    }
  } catch {
    // ignore in testing environments
  }
  return "127.0.0.1"
}

async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient()
    if (!supabase) return null
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.id || null
  } catch {
    return null
  }
}

/**
 * Server Action: Saves a generated schedule and associates with authenticated user if logged in.
 */
export async function saveScheduleAction(
  input: ScheduleInput,
  schedule: GeneratedSchedule | null,
  lang: "ar" | "en" = "ar"
): Promise<ActionResponse<SavedGroupResult>> {
  try {
    const ip = await getClientIp()
    const rate = await checkSharedRateLimit(`save_${ip}`, 20, 600000)
    if (!rate.allowed) {
      return {
        success: false,
        error:
          lang === "ar"
            ? "تجاوزت الحد المسموح به لإنشاء الجداول. يرجى المحاولة بعد قليل."
            : "Too many save requests. Please try again in a few minutes.",
      }
    }

    if (!input || !input.group || !Array.isArray(input.members)) {
      return {
        success: false,
        error:
          lang === "ar"
            ? "بيانات الجدول غير صالحة."
            : "Invalid schedule input.",
      }
    }

    if (input.group.name.length > 100) {
      return {
        success: false,
        error:
          lang === "ar"
            ? "اسم المجموعة طويل جداً (الحد الأقصى 100 حرف)."
            : "Group name is too long (max 100 characters).",
      }
    }

    if (input.members.length > 30) {
      return {
        success: false,
        error:
          lang === "ar"
            ? "الحد الأقصى لعدد الأعضاء هو 30 عضواً."
            : "Maximum member limit is 30.",
      }
    }

    const ownerUserId = await getAuthenticatedUserId()
    const result = await saveScheduleGroup(input, schedule, lang, ownerUserId)

    return {
      success: true,
      data: result,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to save schedule."),
    }
  }
}

/**
 * Server Action: Retrieves a saved public group schedule.
 */
export async function getPublicScheduleAction(
  publicId: string
): Promise<ActionResponse<LoadedPublicGroup>> {
  try {
    const ip = await getClientIp()
    const rate = await checkSharedRateLimit(`get_${ip}`, 120, 60000)
    if (!rate.allowed) {
      return {
        success: false,
        error: "Too many requests. Please slow down.",
      }
    }

    const group = await getGroupByPublicId(publicId)
    if (!group) {
      return {
        success: false,
        error: "Schedule not found.",
      }
    }

    return {
      success: true,
      data: group,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to retrieve schedule."),
    }
  }
}

/**
 * Server Action: Validates an edit token for a group or checks if user is the owner.
 */
export async function validateEditTokenAction(
  publicId: string,
  rawEditToken?: string
): Promise<ActionResponse<boolean>> {
  try {
    const userId = await getAuthenticatedUserId()
    const isAuthorized = await validateEditAccess(
      publicId,
      rawEditToken,
      userId || undefined
    )
    return {
      success: true,
      data: isAuthorized,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Validation failed."),
    }
  }
}

/**
 * Server Action: Checks if current visitor can edit this group (as owner or with token).
 */
export async function checkCanEditGroupAction(
  publicId: string,
  rawEditToken?: string
): Promise<ActionResponse<{ canEdit: boolean; isOwner: boolean }>> {
  try {
    const userId = await getAuthenticatedUserId()
    const { authorized, group } = await checkGroupAuthorization(
      publicId,
      rawEditToken,
      userId || undefined
    )
    const isOwner = Boolean(userId && group && group.owner_user_id === userId)
    return {
      success: true,
      data: {
        canEdit: authorized,
        isOwner,
      },
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to check edit permissions."),
    }
  }
}

/**
 * Server Action: Updates a group configuration and regenerates schedule assignments.
 */
export async function updateScheduleAction(
  publicId: string,
  rawEditToken: string,
  input: ScheduleInput,
  lang: "ar" | "en" = "ar"
): Promise<ActionResponse<LoadedPublicGroup>> {
  try {
    const ip = await getClientIp()
    const rate = await checkSharedRateLimit(`update_${ip}`, 20, 600000)
    if (!rate.allowed) {
      return {
        success: false,
        error:
          lang === "ar"
            ? "تجاوزت الحد المسموح به للتعديل. يرجى المحاولة لاحقاً."
            : "Too many update requests. Please try again later.",
      }
    }

    const userId = await getAuthenticatedUserId()
    const updated = await updateGroupAndRegenerate(
      publicId,
      rawEditToken,
      input,
      lang,
      userId || undefined
    )
    return {
      success: true,
      data: updated,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to update and regenerate schedule."),
    }
  }
}

// Backwards-compatible action aliases
export const verifyEditTokenAction = validateEditTokenAction
export const updateAndRegenerateAction = updateScheduleAction

/**
 * Server Action: Deletes a saved group (Authorized by Owner or Edit Token).
 */
export async function deleteGroupAction(
  publicId: string,
  editToken?: string
): Promise<ActionResponse<boolean>> {
  try {
    const userId = await getAuthenticatedUserId()
    const success = await deleteGroup(publicId, editToken, userId || undefined)
    return {
      success,
      data: success,
    }
  } catch {
    return {
      success: false,
      error: "Failed to delete schedule.",
    }
  }
}

/**
 * Server Action: Archives or restores a group.
 */
export async function archiveGroupAction(
  publicId: string,
  isArchived: boolean = true,
  editToken?: string
): Promise<ActionResponse<boolean>> {
  try {
    const userId = await getAuthenticatedUserId()
    const success = await archiveGroup(
      publicId,
      isArchived,
      editToken,
      userId || undefined
    )
    return {
      success,
      data: success,
    }
  } catch {
    return {
      success: false,
      error: "Failed to update archive status.",
    }
  }
}

/**
 * Server Action: Duplicates a saved group schedule into a new group.
 */
export async function duplicateGroupAction(
  sourcePublicId: string,
  lang: "ar" | "en" = "ar"
): Promise<ActionResponse<SavedGroupResult>> {
  try {
    const ip = await getClientIp()
    const rate = await checkSharedRateLimit(`dup_${ip}`, 15, 600000)
    if (!rate.allowed) {
      return {
        success: false,
        error:
          lang === "ar"
            ? "تجاوزت الحد المسموح به لنسخ الجداول. يرجى المحاولة بعد قليل."
            : "Too many duplicate requests. Please try again later.",
      }
    }

    const userId = await getAuthenticatedUserId()
    const result = await duplicateGroupSchedule(sourcePublicId, lang, userId)
    return {
      success: true,
      data: result,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to duplicate schedule"),
    }
  }
}

/**
 * Server Action: Starts a new Khatmah cycle.
 */
export async function startNewKhatmahAction(
  sourcePublicId: string,
  lang: "ar" | "en" = "ar"
): Promise<ActionResponse<SavedGroupResult>> {
  try {
    const userId = await getAuthenticatedUserId()
    const result = await startNewKhatmah(sourcePublicId, lang, userId)
    return {
      success: true,
      data: result,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to start new Khatmah cycle."),
    }
  }
}

/**
 * Server Action: Fetches a single member's schedule by group publicId and member publicId.
 */
export async function getMemberScheduleAction(
  groupPublicId: string,
  memberPublicId: string
): Promise<ActionResponse<LoadedPublicMemberSchedule>> {
  try {
    const ip = await getClientIp()
    const rate = await checkSharedRateLimit(`get_${ip}`, 120, 60000)
    if (!rate.allowed) {
      return { success: false, error: "Too many requests. Please slow down." }
    }

    const data = await getMemberScheduleByPublicId(
      groupPublicId,
      memberPublicId
    )
    if (!data) {
      return {
        success: false,
        error: "Member schedule not found or expired.",
      }
    }

    return {
      success: true,
      data,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to retrieve member schedule."),
    }
  }
}

/**
 * Server Action: Fetches all groups for the authenticated user.
 */
export async function getMyGroupsAction(
  filter:
    "all" | "active" | "draft" | "completed" | "archived" | "ramadan" = "all"
): Promise<ActionResponse<UserGroupSummary[]>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return {
        success: false,
        error: "User not authenticated.",
        data: [],
      }
    }

    const groups = await fetchUserGroups(userId, filter)
    return {
      success: true,
      data: groups,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to fetch user groups."),
      data: [],
    }
  }
}

/**
 * Server Action: Saves reading progress.
 */
export async function saveReadingProgressAction(
  groupPublicId: string,
  memberPublicId: string,
  weekNumber: number,
  dayNumber: number,
  isCompleted: boolean
): Promise<ActionResponse<SaveProgressResult>> {
  try {
    const ip = await getClientIp()
    const rate = await checkSharedRateLimit(`progress_${ip}`, 240, 600000)
    if (!rate.allowed) {
      return { success: false, error: "Too many requests. Please slow down." }
    }

    const userId = await getAuthenticatedUserId()
    const result = await saveReadingProgress(
      groupPublicId,
      memberPublicId,
      weekNumber,
      dayNumber,
      isCompleted,
      userId
    )
    return {
      success: result.success,
      data: result,
      error: result.success
        ? undefined
        : result.reason === "forbidden"
          ? "This member's progress belongs to a linked account. Sign in with that account to update it."
          : result.reason === "invalid"
            ? "Invalid week or day."
            : "Failed to save reading progress.",
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to save reading progress."),
    }
  }
}

/**
 * Server Action: Fetches reading progress for a group.
 */
export async function getGroupReadingProgressAction(
  groupPublicId: string
): Promise<ActionResponse<Awaited<ReturnType<typeof fetchGroupReadingProgress>>>> {
  try {
    const progress = await fetchGroupReadingProgress(groupPublicId)
    return {
      success: true,
      data: progress,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to fetch progress."),
      data: [],
    }
  }
}

/**
 * Server Action: Saves bookmark for authenticated user.
 */
export async function saveBookmarkAction(
  surahNumber: number,
  ayahNumber: number,
  juzNumber: number,
  note?: string
): Promise<ActionResponse<{ id?: string }>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return { success: false, error: "Authentication required." }
    }

    const res = await saveBookmark(
      userId,
      surahNumber,
      ayahNumber,
      juzNumber,
      note
    )
    return {
      success: res.success,
      data: { id: res.id },
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to save bookmark."),
    }
  }
}

/**
 * Server Action: Fetches bookmarks for authenticated user.
 */
export async function getUserBookmarksAction(): Promise<ActionResponse<Awaited<ReturnType<typeof fetchUserBookmarks>>>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { success: true, data: [] }

    const bookmarks = await fetchUserBookmarks(userId)
    return {
      success: true,
      data: bookmarks,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to fetch bookmarks."),
      data: [],
    }
  }
}

/**
 * Server Action: Deletes a bookmark.
 */
export async function deleteBookmarkAction(
  bookmarkId: string
): Promise<ActionResponse<boolean>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { success: false, error: "Authentication required." }

    const res = await deleteBookmark(bookmarkId, userId)
    return {
      success: res,
      data: res,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to delete bookmark."),
    }
  }
}

/**
 * Server Action: Creates an announcement for a group.
 */
export async function createAnnouncementAction(
  groupPublicId: string,
  title: string,
  content: string,
  rawEditToken?: string
): Promise<ActionResponse<{ id?: string }>> {
  try {
    const userId = await getAuthenticatedUserId()
    const res = await createAnnouncement(
      groupPublicId,
      title,
      content,
      userId || undefined,
      rawEditToken
    )
    return {
      success: res.success,
      data: { id: res.id },
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to create announcement."),
    }
  }
}

/**
 * Server Action: Fetches announcements for a group.
 */
export async function getAnnouncementsAction(
  groupPublicId: string
): Promise<ActionResponse<Awaited<ReturnType<typeof fetchAnnouncements>>>> {
  try {
    const list = await fetchAnnouncements(groupPublicId)
    return {
      success: true,
      data: list,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to fetch announcements."),
      data: [],
    }
  }
}

/**
 * Server Action: Links a member slot to an authenticated account.
 */
const LINK_ERRORS: Record<string, { ar: string; en: string }> = {
  not_found: {
    ar: "لم يتم العثور على هذا العضو في المجموعة.",
    en: "This member was not found in the group.",
  },
  already_linked: {
    ar: "هذا المكان مرتبط بحساب آخر بالفعل. اطلب من منشئ المجموعة المساعدة.",
    en: "This member slot is already linked to another account. Ask the group creator for help.",
  },
  already_member: {
    ar: "حسابك مرتبط بعضو آخر في هذه المجموعة بالفعل.",
    en: "Your account is already linked to another member of this group.",
  },
  unavailable: {
    ar: "الخدمة غير متوفرة حالياً. يرجى المحاولة لاحقاً.",
    en: "The service is unavailable right now. Please try again later.",
  },
}

export async function linkMemberAccountAction(
  groupPublicId: string,
  memberPublicId: string,
  lang: "ar" | "en" = "ar"
): Promise<ActionResponse<boolean>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return {
        success: false,
        error: lang === "ar" ? "يجب تسجيل الدخول أولاً." : "Authentication required.",
      }
    }

    const ip = await getClientIp()
    const rate = await checkSharedRateLimit(`link_${ip}`, 30, 600000)
    if (!rate.allowed) {
      return {
        success: false,
        error: lang === "ar" ? "محاولات كثيرة. حاول لاحقاً." : "Too many attempts. Please try again later.",
      }
    }

    const res = await linkMemberAccount(groupPublicId, memberPublicId, userId)
    if (!res.success) {
      return { success: false, data: false, error: LINK_ERRORS[res.reason][lang] }
    }
    return { success: true, data: true }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to link member account."),
    }
  }
}

/**
 * Server Action: Retrieves link and ownership status for a specific member slot.
 */
export async function getMemberLinkStatusAction(
  groupPublicId: string,
  memberPublicId: string
): Promise<ActionResponse<MemberLinkStatusResult | null>> {
  try {
    const userId = await getAuthenticatedUserId()
    const status = await getMemberLinkStatus(groupPublicId, memberPublicId, userId)
    return {
      success: true,
      data: status,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to fetch member link status."),
      data: null,
    }
  }
}

/**
 * Server Action: Saves notification preferences.
 */
export async function saveNotificationPreferencesAction(
  prefs: Parameters<typeof saveNotificationPreferences>[1]
): Promise<ActionResponse<boolean>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { success: false, error: "Authentication required." }

    const res = await saveNotificationPreferences(userId, prefs)
    return {
      success: res,
      data: res,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to save notification preferences."),
    }
  }
}

/**
 * Server Action: Fetches notification preferences.
 */
export async function getNotificationPreferencesAction(): Promise<
  ActionResponse<NotificationPreferencesRow | null>
> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { success: true, data: null }

    const data = await fetchNotificationPreferences(userId)
    return {
      success: true,
      data,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to fetch notification preferences."),
    }
  }
}

/**
 * Server Action: Exports all user data as JSON.
 */
export async function exportUserDataAction(): Promise<ActionResponse<UserDataExport | null>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { success: false, error: "Authentication required." }

    const data = await exportUserData(userId)
    return {
      success: true,
      data,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to export data."),
    }
  }
}

/**
 * Server Action: Deletes user account and associated personal data.
 */
export async function deleteAccountAction(): Promise<ActionResponse<boolean>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { success: false, error: "Authentication required." }

    const res = await deleteUserAccount(userId)
    return {
      success: res,
      data: res,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to delete account."),
    }
  }
}

/**
 * Server Action: Fetches schedule version history (Authorized by Owner or Edit Token).
 */
export async function fetchScheduleHistoryAction(
  groupPublicId: string,
  rawEditToken?: string
): Promise<ActionResponse<ScheduleHistoryRecord[]>> {
  try {
    const userId = (await getAuthenticatedUserId()) || undefined
    const history = await fetchScheduleHistory(
      groupPublicId,
      userId,
      rawEditToken
    )
    return {
      success: true,
      data: history,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to fetch schedule history."),
    }
  }
}

/**
 * Server Action: Restores a past schedule version snapshot.
 */
export async function restoreScheduleVersionAction(
  historyId: string,
  groupPublicId: string,
  rawEditToken?: string,
  lang: "ar" | "en" = "ar"
): Promise<ActionResponse<LoadedPublicGroup>> {
  try {
    const userId = (await getAuthenticatedUserId()) || undefined
    const restored = await restoreScheduleVersion(
      historyId,
      groupPublicId,
      userId,
      rawEditToken,
      lang
    )
    return {
      success: true,
      data: restored,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to restore version."),
    }
  }
}

/**
 * Server Action: Processes recurring schedule cycles (Weekly, Monthly, Ramadan).
 */
export async function processRecurringCycleAction(
  groupPublicId: string,
  rawEditToken?: string,
  lang: "ar" | "en" = "ar"
): Promise<ActionResponse<SavedGroupResult>> {
  try {
    const userId = (await getAuthenticatedUserId()) || undefined
    const cycle = await processRecurringCycle(
      groupPublicId,
      userId,
      rawEditToken,
      lang
    )
    return {
      success: true,
      data: cycle,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to process recurring cycle."),
    }
  }
}

/**
 * Server Action: Saves browser push subscription.
 */
export async function savePushSubscriptionAction(sub: {
  endpoint: string
  keys: { p256dh: string; auth: string }
}): Promise<ActionResponse<boolean>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { success: false, error: "Authentication required." }

    const { savePushSubscription } = await import("../notifications/service")
    const res = await savePushSubscription(userId, sub)
    return {
      success: res,
      data: res,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to save push subscription."),
    }
  }
}

/**
 * Server Action: Sends a test push notification to the current user.
 */
export async function sendTestNotificationAction(): Promise<
  ActionResponse<{ sent: number; failed: number }>
> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { success: false, error: "Authentication required." }

    const { sendPushNotification } = await import("../notifications/service")
    const res = await sendPushNotification(userId, {
      title: "وِردي | Wirddy",
      body: "تم تفعيل التنبيهات بنجاح! سنقوم بتذكيرك بوردك اليومي بإذن الله.",
      url: "/dashboard",
    })

    return {
      success: true,
      data: res,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to send test notification."),
    }
  }
}

/**
 * Server Action: Fetches real today's reading portion for the authenticated user.
 */
export async function getTodaysReadingAction(): Promise<
  ActionResponse<UserTodaysReadingResult | null>
> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return { success: true, data: null }
    }

    const data = await fetchUserTodaysReading(userId)
    return {
      success: true,
      data,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to fetch today's reading."),
      data: null,
    }
  }
}

/**
 * Server Action: Fetches real group progress summary for all members and overall completion.
 */
export async function getGroupProgressSummaryAction(
  groupPublicId: string
): Promise<ActionResponse<GroupProgressSummary | null>> {
  try {
    if (!groupPublicId) {
      return { success: false, error: "Group ID required.", data: null }
    }

    const userId = await getAuthenticatedUserId()
    const summary = await fetchGroupProgressSummary(groupPublicId, userId)
    if (!summary) {
      return {
        success: false,
        error: "Unauthorized or group not found.",
        data: null,
      }
    }

    return {
      success: true,
      data: summary,
    }
  } catch (err) {
    return {
      success: false,
      error: errorMessage(err, "Failed to fetch group progress summary."),
      data: null,
    }
  }
}

