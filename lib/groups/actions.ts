"use server"

import { headers } from "next/headers"
import {
  GeneratedSchedule,
  MemberConfig,
  ScheduleInput,
} from "../scheduler/types"
import { checkRateLimit } from "./rate-limit"
import {
  archiveGroup,
  createAnnouncement,
  deleteAnnouncement,
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
} from "./service"
import { createSupabaseServerClient } from "../supabase/server"

export interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
}

async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers()
    const forwarded = headersList.get("x-forwarded-for")
    if (forwarded) {
      return forwarded.split(",")[0].trim()
    }
    const realIp = headersList.get("x-real-ip")
    if (realIp) {
      return realIp.trim()
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
  schedule: GeneratedSchedule,
  lang: "ar" | "en" = "ar"
): Promise<ActionResponse<SavedGroupResult>> {
  try {
    const ip = await getClientIp()
    const rate = checkRateLimit(`save_${ip}`, 20, 600000)
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
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to save schedule.",
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
    const rate = checkRateLimit(`get_${ip}`, 120, 60000)
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
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to retrieve schedule.",
    }
  }
}

/**
 * Server Action: Validates an edit token for a group.
 */
export async function validateEditTokenAction(
  publicId: string,
  rawEditToken: string
): Promise<ActionResponse<boolean>> {
  try {
    const isAuthorized = await validateEditAccess(publicId, rawEditToken)
    return {
      success: true,
      data: isAuthorized,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Validation failed.",
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
    const rate = checkRateLimit(`update_${ip}`, 20, 600000)
    if (!rate.allowed) {
      return {
        success: false,
        error:
          lang === "ar"
            ? "تجاوزت الحد المسموح به للتعديل. يرجى المحاولة لاحقاً."
            : "Too many update requests. Please try again later.",
      }
    }

    const updated = await updateGroupAndRegenerate(
      publicId,
      rawEditToken,
      input,
      lang
    )
    return {
      success: true,
      data: updated,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to update and regenerate schedule.",
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
    const rate = checkRateLimit(`dup_${ip}`, 15, 600000)
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to duplicate schedule",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to start new Khatmah cycle.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to retrieve member schedule.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to fetch user groups.",
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
): Promise<ActionResponse<{ success: boolean; progressId?: string }>> {
  try {
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
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to save reading progress.",
    }
  }
}

/**
 * Server Action: Fetches reading progress for a group.
 */
export async function getGroupReadingProgressAction(
  groupPublicId: string
): Promise<ActionResponse<any[]>> {
  try {
    const progress = await fetchGroupReadingProgress(groupPublicId)
    return {
      success: true,
      data: progress,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to fetch progress.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to save bookmark.",
    }
  }
}

/**
 * Server Action: Fetches bookmarks for authenticated user.
 */
export async function getUserBookmarksAction(): Promise<ActionResponse<any[]>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { success: true, data: [] }

    const bookmarks = await fetchUserBookmarks(userId)
    return {
      success: true,
      data: bookmarks,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to fetch bookmarks.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to delete bookmark.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to create announcement.",
    }
  }
}

/**
 * Server Action: Fetches announcements for a group.
 */
export async function getAnnouncementsAction(
  groupPublicId: string
): Promise<ActionResponse<any[]>> {
  try {
    const list = await fetchAnnouncements(groupPublicId)
    return {
      success: true,
      data: list,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to fetch announcements.",
      data: [],
    }
  }
}

/**
 * Server Action: Links a member slot to an authenticated account.
 */
export async function linkMemberAccountAction(
  groupPublicId: string,
  memberPublicId: string
): Promise<ActionResponse<boolean>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return { success: false, error: "Authentication required." }
    }

    const res = await linkMemberAccount(groupPublicId, memberPublicId, userId)
    return {
      success: res,
      data: res,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to link member account.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to fetch member link status.",
      data: null,
    }
  }
}

/**
 * Server Action: Saves notification preferences.
 */
export async function saveNotificationPreferencesAction(
  prefs: any
): Promise<ActionResponse<boolean>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { success: false, error: "Authentication required." }

    const res = await saveNotificationPreferences(userId, prefs)
    return {
      success: res,
      data: res,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to save notification preferences.",
    }
  }
}

/**
 * Server Action: Fetches notification preferences.
 */
export async function getNotificationPreferencesAction(): Promise<
  ActionResponse<any>
> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { success: true, data: null }

    const data = await fetchNotificationPreferences(userId)
    return {
      success: true,
      data,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to fetch notification preferences.",
    }
  }
}

/**
 * Server Action: Exports all user data as JSON.
 */
export async function exportUserDataAction(): Promise<ActionResponse<any>> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return { success: false, error: "Authentication required." }

    const data = await exportUserData(userId)
    return {
      success: true,
      data,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to export data.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to delete account.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to fetch schedule history.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to restore version.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to process recurring cycle.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to save push subscription.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to send test notification.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to fetch today's reading.",
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
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to fetch group progress summary.",
      data: null,
    }
  }
}

