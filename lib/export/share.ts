import { triggerBrowserDownload } from "./download"
import { renderSchedulePdfBlob } from "./render-pdf"
import {
  ExportProgressCallback,
  ExportRenderOptions,
  ExportSchedule,
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
 * Shares the complete generated plan as a PDF file using the native Web Share API,
 * or gracefully falls back to downloading the PDF file.
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
    ? `وردي - ${schedule.groupName}`
    : `Wirddy - ${schedule.groupName}`
  const text = isArabic
    ? `الخطة الكاملة لورد القرآن - ${schedule.groupName}`
    : `${schedule.groupName} - Full Quran Schedule`

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
        // User closed or canceled the share sheet — NOT an error
        return { success: false, method: "canceled" }
      }
      // Fallback to download
      await triggerBrowserDownload(blob, filename)
      return {
        success: true,
        method: "fallback-download",
        error: err?.message || "Native share failed",
      }
    }
  }

  // Fallback for unsupported browsers
  await triggerBrowserDownload(blob, filename)
  return { success: true, method: "fallback-download" }
}
