import { triggerBrowserDownload } from "./download"
import { getExportFilename } from "./filenames"
import { renderWeekToPngBlob } from "./render-week"
import { ExportRenderOptions, ExportWeek } from "./types"
import { validatePngBlob } from "./validate-file"

/**
 * Renders a single ExportWeek to a verified PNG Blob and filename without automatically downloading.
 */
export async function renderWeekPngBlob(
  week: ExportWeek,
  options?: ExportRenderOptions
): Promise<{ blob: Blob; filename: string }> {
  const blob = await renderWeekToPngBlob(week, options)

  // Validate PNG binary integrity
  const validation = await validatePngBlob(blob)
  if (!validation.isValid) {
    throw new Error(`PNG validation failed: ${validation.error}`)
  }

  const filename = getExportFilename(
    week.groupName,
    week.weekNumber,
    week.language,
    ".png"
  )

  return { blob, filename }
}

/**
 * Renders a single ExportWeek to a verified PNG and triggers browser download.
 */
export async function exportWeekAsPng(
  week: ExportWeek,
  options?: ExportRenderOptions
): Promise<Blob> {
  const { blob, filename } = await renderWeekPngBlob(week, options)
  await triggerBrowserDownload(blob, filename)
  return blob
}
