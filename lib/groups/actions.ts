"use server"

import { headers } from "next/headers"
import {
  GeneratedSchedule,
  MemberConfig,
  ScheduleInput,
} from "../scheduler/types"
import { checkRateLimit } from "./rate-limit"
import {
  deleteGroup,
  duplicateGroupSchedule,
  getGroupByPublicId,
  LoadedPublicGroup,
  SavedGroupResult,
  saveScheduleGroup,
  updateGroupAndRegenerate,
  validateEditAccess,
} from "./service"

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

/**
 * Server Action: Saves a generated schedule and returns public and edit access tokens.
 */
export async function saveScheduleAction(
  input: ScheduleInput,
  schedule: GeneratedSchedule,
  lang: "ar" | "en" = "ar"
): Promise<ActionResponse<SavedGroupResult>> {
  try {
    const ip = await getClientIp()
    const rate = checkRateLimit(`save_${ip}`, 15, 600000) // 15 saves per 10 minutes
    if (!rate.allowed) {
      return {
        success: false,
        error:
          lang === "ar"
            ? "تجاوزت الحد المسموح به لإنشاء الجداول. يرجى المحاولة بعد قليل."
            : "Too many save requests. Please try again in a few minutes.",
      }
    }

    // Input sanitization and bounds check
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

    const result = await saveScheduleGroup(input, schedule, lang)
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
    const rate = checkRateLimit(`get_${ip}`, 120, 60000) // 120 reads per minute
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
      error: err.message || "Failed to load schedule.",
    }
  }
}

/**
 * Server Action: Validates whether an edit token is valid.
 */
export async function verifyEditTokenAction(
  publicId: string,
  editToken: string
): Promise<ActionResponse<boolean>> {
  try {
    const isAuthorized = await validateEditAccess(publicId, editToken)
    return {
      success: true,
      data: isAuthorized,
    }
  } catch {
    return {
      success: false,
      data: false,
    }
  }
}

/**
 * Server Action: Updates group configuration and regenerates schedule.
 */
export async function updateAndRegenerateAction(
  publicId: string,
  editToken: string,
  input: ScheduleInput,
  lang: "ar" | "en" = "ar"
): Promise<ActionResponse<LoadedPublicGroup>> {
  try {
    const ip = await getClientIp()
    const rate = checkRateLimit(`regen_${ip}`, 20, 600000)
    if (!rate.allowed) {
      return {
        success: false,
        error:
          lang === "ar"
            ? "تجاوزت الحد المسموح به لإعادة إنشاء الجداول. يرجى المحاولة بعد قليل."
            : "Too many update requests. Please wait a moment.",
      }
    }

    const updated = await updateGroupAndRegenerate(
      publicId,
      editToken,
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

/**
 * Server Action: Deletes a saved group.
 */
export async function deleteGroupAction(
  publicId: string,
  editToken: string
): Promise<ActionResponse<boolean>> {
  try {
    const success = await deleteGroup(publicId, editToken)
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
 * Server Action: Duplicates a saved group schedule into a new group.
 */
export async function duplicateGroupAction(
  sourcePublicId: string,
  lang: "ar" | "en" = "ar"
): Promise<ActionResponse<SavedGroupResult>> {
  try {
    const ip = await getClientIp()
    const rate = checkRateLimit(`dup_${ip}`, 10, 600000)
    if (!rate.allowed) {
      return {
        success: false,
        error:
          lang === "ar"
            ? "تجاوزت الحد المسموح به لنسخ الجداول. يرجى المحاولة بعد قليل."
            : "Too many duplicate requests. Please try again later.",
      }
    }

    const result = await duplicateGroupSchedule(sourcePublicId, lang)
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
