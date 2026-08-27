import JSZip from "jszip"
import { triggerBrowserDownload } from "./download"
import { getExportFilename, getZipExportFilename } from "./filenames"
import { renderWeekToPngBlob } from "./render-week"
import {
  ExportProgressCallback,
  ExportRenderOptions,
  ExportSchedule,
} from "./types"
import { validatePngBlob, validateZipBlob } from "./validate-file"

/**
 * Generates independent validated PNGs for every week and packages them into a verified ZIP archive.
 */
export async function exportAllWeeksAsZip(
  schedule: ExportSchedule,
  options?: ExportRenderOptions,
  onProgress?: ExportProgressCallback
): Promise<Blob> {
  if (!schedule.weeks || schedule.weeks.length === 0) {
    throw new Error("Cannot export empty schedule.")
  }

  const zip = new JSZip()
  const totalWeeks = schedule.weeks.length

  for (let i = 0; i < totalWeeks; i++) {
    const week = schedule.weeks[i]
    const currentNum = i + 1

    if (onProgress) {
      const msg =
        schedule.language === "ar"
          ? `جارٍ تجهيز الأسبوع ${currentNum} من ${totalWeeks}...`
          : `Preparing Week ${currentNum} of ${totalWeeks}...`
      onProgress(currentNum, totalWeeks, msg)
    }

    // Render individual week PNG
    const pngBlob = await renderWeekToPngBlob(week, options)

    // Validate each PNG before adding to ZIP
    const validation = await validatePngBlob(pngBlob)
    if (!validation.isValid) {
      throw new Error(
        `Week ${week.weekNumber} PNG validation failed: ${validation.error}`
      )
    }

    const filename = getExportFilename(
      week.groupName,
      week.weekNumber,
      week.language,
      ".png"
    )
    zip.file(filename, pngBlob)

    // Small yielding delay to prevent UI freezing
    await new Promise((r) => setTimeout(r, 40))
  }

  if (onProgress) {
    const msg =
      schedule.language === "ar"
        ? "جارٍ ضغط وتجهيز ملف ZIP..."
        : "Compressing and preparing ZIP file..."
    onProgress(totalWeeks, totalWeeks, msg)
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  })

  // Validate ZIP binary integrity
  const zipValidation = await validateZipBlob(zipBlob)
  if (!zipValidation.isValid) {
    throw new Error(`ZIP validation failed: ${zipValidation.error}`)
  }

  const zipFilename = getZipExportFilename(
    schedule.groupName,
    schedule.language
  )
  triggerBrowserDownload(zipBlob, zipFilename)

  return zipBlob
}
