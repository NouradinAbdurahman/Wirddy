import { ExportLanguage } from "./types"

/**
 * Sanitizes a string for safe usage across macOS, Windows, Linux, iOS, and Android filenames.
 * Strips forbidden characters (/ \ : * ? " < > | \0) and trims spaces/dots.
 */
export function sanitizeFilename(
  input: string,
  fallback: string = "Wirddy-Schedule"
): string {
  if (!input || typeof input !== "string") return fallback

  // Replace invalid OS filename characters with hyphens
  const sanitized = input
    .replace(/[/\\:*?"<>|\x00-\x1F\x7F]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .trim()

  return sanitized || fallback
}

/**
 * Formats a number as Arabic-Indic digits.
 */
export function formatArabicNumeral(num: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
  return num.toString().replace(/\d/g, (d) => arabicDigits[parseInt(d, 10)])
}

/**
 * Produces a 100% ASCII-clean, extension-guaranteed download filename.
 *
 * CRITICAL CROSS-BROWSER RULE:
 * Chrome on macOS and Windows drops the `download` attribute on blob: URLs if the filename
 * contains non-ASCII Unicode / Arabic characters, causing Chrome to fall back to the blob URL UUID.
 * Safari supports Unicode in `download`, but ASCII works reliably across ALL browsers.
 *
 * This function transliterates common Arabic terms (الأسبوع -> Week, الخطة-كاملة -> Full-Plan, etc.)
 * and strips non-ASCII characters to guarantee an ASCII filename with the exact required extension.
 */
export function getSafeDownloadFilename(
  filename: string,
  expectedExtension?: string
): string {
  if (!filename) {
    const ext = expectedExtension
      ? expectedExtension.startsWith(".")
        ? expectedExtension
        : `.${expectedExtension}`
      : ".bin"
    return `Wirddy-export${ext}`
  }

  // Determine extension
  let ext = ""
  let base = filename

  const lastDot = filename.lastIndexOf(".")
  if (lastDot > 0 && lastDot < filename.length - 1) {
    ext = filename.slice(lastDot).toLowerCase()
    base = filename.slice(0, lastDot)
  }

  if (expectedExtension) {
    const normExpected = expectedExtension.startsWith(".")
      ? expectedExtension.toLowerCase()
      : `.${expectedExtension.toLowerCase()}`
    ext = normExpected
  }

  // Transliterate common Arabic terms to universal ASCII tokens
  const transliterated = base
    .replace(/الأسبوع/g, "Week")
    .replace(/الخطة-كاملة/g, "Full-Plan")
    .replace(/الخطة_كاملة/g, "Full-Plan")
    .replace(/الخطة كاملة/g, "Full-Plan")
    .replace(/جميع-الأسابيع/g, "All-Weeks")
    .replace(/جميع_الأسابيع/g, "All-Weeks")
    .replace(/جميع الأسابيع/g, "All-Weeks")
    .replace(/بطاقات-الأعضاء/g, "Members-Cards")
    .replace(/جداول-الأعضاء/g, "Members-Schedules")
    // Arabic-Indic digits to Western digits
    .replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    // Strip non-ASCII characters for 100% universal browser download attribute support
    .replace(/[^\x20-\x7E]/g, "")
    // Remove filesystem-unsafe and control characters
    .replace(/[/\\:*?"<>|\x00-\x1F\x7F]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .trim()

  const safeBase = transliterated || "Wirddy-Schedule"
  return `${safeBase}${ext}`
}

export function getExportFilename(
  groupName: string,
  weekNumber: number,
  language: ExportLanguage,
  extension: string
): string {
  const safeGroupName = sanitizeFilename(groupName, "Wirddy")
  const ext = extension.startsWith(".") ? extension : `.${extension}`

  if (language === "ar") {
    const weekStr = formatArabicNumeral(weekNumber)
    return `Wirddy-${safeGroupName}-الأسبوع-${weekStr}${ext}`
  }

  return `Wirddy-${safeGroupName}-Week-${weekNumber}${ext}`
}

export function getZipExportFilename(
  groupName: string,
  language: ExportLanguage
): string {
  const safeGroupName = sanitizeFilename(groupName, "Wirddy")
  if (language === "ar") {
    return `Wirddy-${safeGroupName}-جميع-الأسابيع.zip`
  }
  return `Wirddy-${safeGroupName}-All-Weeks.zip`
}

export function getPdfExportFilename(
  groupName: string,
  language: ExportLanguage
): string {
  const safeGroupName = sanitizeFilename(groupName, "Wirddy")
  if (language === "ar") {
    return `Wirddy-${safeGroupName}-الخطة-كاملة.pdf`
  }
  return `Wirddy-${safeGroupName}-Full-Plan.pdf`
}
