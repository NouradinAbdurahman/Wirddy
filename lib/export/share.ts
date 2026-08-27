import { triggerBrowserDownload } from "./download"
import { formatArabicNumeral } from "./filenames"
import { renderSchedulePdfBlob } from "./render-pdf"
import { renderWeekPngBlob } from "./render-png"
import {
  ExportProgressCallback,
  ExportRenderOptions,
  ExportSchedule,
  ExportWeek,
} from "./types"

export type ShareMethod = "native-share" | "fallback-download" | "canceled"

export interface ShareResult {
  success: boolean
  method: ShareMethod
  error?: string
}

/**
 * Checks if the current browser supports Web Share with file attachments.
 */
export function canShareFiles(file?: File): boolean {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.share !== "function" ||
    typeof navigator.canShare !== "function"
  ) {
    return false
  }

  if (file) {
    try {
      return navigator.canShare({ files: [file] })
    } catch {
      return false
    }
  }

  return true
}

/**
 * Shares the current week's schedule as a PNG file using native Web Share,
 * or gracefully falls back to downloading the file.
 */
export async function shareScheduleWeekAsPng(
  week: ExportWeek,
  options?: ExportRenderOptions
): Promise<ShareResult> {
  const { blob, filename } = await renderWeekPngBlob(week, options)

  const pngFile = new File([blob], filename, {
    type: "image/png",
  })

  const isArabic = week.language === "ar"
  const title = isArabic
    ? `وِردي - ${week.groupName}`
    : `Wirddy - ${week.groupName}`
  const text = isArabic
    ? `${week.groupName} - الأسبوع ${formatArabicNumeral(week.weekNumber)}`
    : `${week.groupName} - Week ${week.weekNumber}`

  // Check if browser supports sharing this File
  if (canShareFiles(pngFile)) {
    try {
      await navigator.share({
        files: [pngFile],
        title,
        text,
      })
      return { success: true, method: "native-share" }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // User closed or canceled the share sheet — NOT an error
        return { success: false, method: "canceled" }
      }
      // For any other unexpected native share failure, fallback to download
      triggerBrowserDownload(blob, filename)
      return {
        success: true,
        method: "fallback-download",
        error: err?.message || "Native share failed",
      }
    }
  }

  // Fallback for browsers without file-share support (e.g. desktop)
  triggerBrowserDownload(blob, filename)
  return { success: true, method: "fallback-download" }
}

/**
 * Shares the entire schedule plan as a PDF file using native Web Share,
 * or gracefully falls back to downloading the file.
 */
export async function shareScheduleAsPdf(
  schedule: ExportSchedule,
  options?: ExportRenderOptions,
  onProgress?: ExportProgressCallback
): Promise<ShareResult> {
  const { blob, filename } = await renderSchedulePdfBlob(
    schedule,
    options,
    onProgress
  )

  const pdfFile = new File([blob], filename, {
    type: "application/pdf",
  })

  const isArabic = schedule.language === "ar"
  const title = isArabic
    ? `وِردي - ${schedule.groupName}`
    : `Wirddy - ${schedule.groupName}`
  const text = isArabic
    ? `${schedule.groupName} - خطة الختمة كاملة (${formatArabicNumeral(schedule.totalWeeks)} أسابيع)`
    : `${schedule.groupName} - Complete Schedule (${schedule.totalWeeks} Weeks)`

  // Check if browser supports sharing this PDF File
  if (canShareFiles(pdfFile)) {
    try {
      await navigator.share({
        files: [pdfFile],
        title,
        text,
      })
      return { success: true, method: "native-share" }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // User closed or canceled the share sheet
        return { success: false, method: "canceled" }
      }
      // Fallback to download
      triggerBrowserDownload(blob, filename)
      return {
        success: true,
        method: "fallback-download",
        error: err?.message || "Native share failed",
      }
    }
  }

  // Fallback for unsupported browsers
  triggerBrowserDownload(blob, filename)
  return { success: true, method: "fallback-download" }
}
