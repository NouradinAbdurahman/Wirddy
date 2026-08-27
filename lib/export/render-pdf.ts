import { toBlob } from "html-to-image"
import { jsPDF } from "jspdf"
import {
  ensureFontsReady,
  preloadExportAssets,
  waitForImagesToLoad,
} from "./assets"
import { triggerBrowserDownload } from "./download"
import { getPdfExportFilename } from "./filenames"
import { buildPdfPageHtml } from "./render-week"
import {
  ExportProgressCallback,
  ExportRenderOptions,
  ExportSchedule,
  ExportViewMode,
  ExportWeek,
} from "./types"
import { validatePdfBlob } from "./validate-file"

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () =>
      reject(
        new Error("Failed to read page Blob as Data URL for PDF embedding.")
      )
    reader.readAsDataURL(blob)
  })
}

/**
 * Estimates the rendered pixel height of a weekly section based on member count and view mode.
 */
export function estimateWeekHeight(
  memberCount: number,
  viewMode: ExportViewMode = "cards"
): number {
  const headerHeight = 45
  const marginAfter = 24

  if (viewMode === "table") {
    const tableHeaderHeight = 36
    const rowHeight = 52
    return (
      headerHeight + tableHeaderHeight + memberCount * rowHeight + marginAfter
    )
  }

  // Cards layout
  const rows = memberCount <= 2 ? memberCount : Math.ceil(memberCount / 2)
  const cardHeight = 115
  const gridGap = 12

  return headerHeight + rows * cardHeight + (rows - 1) * gridGap + marginAfter
}

/**
 * Dynamically packs weeks into A4 page batches based on content height, view mode, and available space.
 */
export function paginateWeeksForA4(
  weeks: ExportWeek[],
  viewMode: ExportViewMode = "cards"
): ExportWeek[][] {
  if (weeks.length === 0) return []

  const pages: ExportWeek[][] = []
  let currentPage: ExportWeek[] = []
  let currentHeight = 0

  // Maximum content budget in pixels (for 1000x1414 A4 canvas)
  const FIRST_PAGE_BUDGET = 950
  const CONTINUATION_PAGE_BUDGET = 1050
  const MAX_WEEKS_PER_PAGE = 2 // Optimal density for standard A4 portrait pages

  for (const week of weeks) {
    const weekView = week.view || viewMode
    const weekHeight = estimateWeekHeight(week.members.length, weekView)
    const isFirstPage = pages.length === 0
    const maxBudget = isFirstPage ? FIRST_PAGE_BUDGET : CONTINUATION_PAGE_BUDGET

    // Start a new page if maximum weeks reached OR adding another week exceeds height budget
    if (
      currentPage.length >= MAX_WEEKS_PER_PAGE ||
      (currentPage.length > 0 && currentHeight + weekHeight > maxBudget)
    ) {
      pages.push(currentPage)
      currentPage = [week]
      currentHeight = weekHeight
    } else {
      currentPage.push(week)
      currentHeight += weekHeight
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage)
  }

  return pages
}

/**
 * Generates a full multi-page A4 PDF Blob and filename without automatically downloading.
 */
export async function renderSchedulePdfBlob(
  schedule: ExportSchedule,
  options?: ExportRenderOptions,
  onProgress?: ExportProgressCallback
): Promise<{ blob: Blob; filename: string }> {
  if (!schedule.weeks || schedule.weeks.length === 0) {
    throw new Error("Cannot export empty schedule.")
  }

  const theme = options?.theme || schedule.theme || "dark"
  const viewMode = options?.view || schedule.view || "cards"
  const [assets] = await Promise.all([
    preloadExportAssets(),
    ensureFontsReady(),
  ])

  // 1. Calculate dynamic A4 pagination batches based on viewMode
  const pageBatches = paginateWeeksForA4(schedule.weeks, viewMode)
  const totalPages = pageBatches.length

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  for (let p = 0; p < totalPages; p++) {
    const pageWeeks = pageBatches[p]
    const isFirstPage = p === 0
    const pageNum = p + 1

    if (onProgress) {
      const msg =
        schedule.language === "ar"
          ? `جارٍ تجهيز صفحة ${pageNum} من ${totalPages}...`
          : `Preparing page ${pageNum} of ${totalPages}...`
      onProgress(pageNum, totalPages, msg)
    }

    // Mount off-canvas, visible from the start so the browser lays it out fully.
    // Do NOT use z-index:-9999 — hides from compositor, yields blank blobs.
    // Do NOT start with visibility:hidden — height resolves to 0, canvas is empty.
    const container = document.createElement("div")
    container.style.cssText = [
      "position:absolute",
      "left:-9999px",
      "top:0",
      "width:1000px",
      "min-width:1000px",
      "max-width:1000px",
      "box-sizing:border-box",
      "pointer-events:none",
      "overflow:visible",
      "visibility:visible",
    ].join(";")

    container.innerHTML = buildPdfPageHtml(
      pageWeeks,
      schedule,
      pageNum,
      totalPages,
      isFirstPage,
      assets,
      theme,
      viewMode
    )

    document.body.appendChild(container)

    try {
      const targetElement = container.firstElementChild as HTMLElement
      if (!targetElement) {
        throw new Error("Failed to render PDF page container.")
      }

      await waitForImagesToLoad(targetElement)

      // Double rAF — guarantees a full layout + paint cycle before measuring.
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))

      // Use getBoundingClientRect for layout-accurate dimensions.
      const rect = targetElement.getBoundingClientRect()
      const measuredWidth = Math.round(rect.width) || 1000
      const measuredHeight = Math.round(rect.height) || 1414

      const pageBlob = await toBlob(targetElement, {
        quality: 1.0,
        pixelRatio: 3.6,
        width: measuredWidth,
        height: measuredHeight,
        skipFonts: true,
        cacheBust: false,
      })

      if (!pageBlob) {
        throw new Error(`Failed to capture PDF page ${pageNum}.`)
      }

      const dataUrl = await blobToDataUrl(pageBlob)

      if (p > 0) {
        pdf.addPage()
      }

      // Fill A4 page seamlessly with maximum fidelity
      pdf.addImage(
        dataUrl,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "SLOW"
      )
    } finally {
      try {
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      } catch {
        // ignore
      }
    }

    await new Promise((r) => setTimeout(r, 30))
  }

  if (onProgress) {
    const msg =
      schedule.language === "ar"
        ? "جارٍ إنهاء وتجهيز ملف PDF..."
        : "Finalizing PDF file..."
    onProgress(totalPages, totalPages, msg)
  }

  const pdfBlob = pdf.output("blob")

  // Validate PDF binary integrity (%PDF-)
  const pdfValidation = await validatePdfBlob(pdfBlob)
  if (!pdfValidation.isValid) {
    throw new Error(`PDF validation failed: ${pdfValidation.error}`)
  }

  const pdfFilename = getPdfExportFilename(
    schedule.groupName,
    schedule.language
  )

  return { blob: pdfBlob, filename: pdfFilename }
}

/**
 * Generates a full multi-page A4 PDF with dynamic content-aware pagination and triggers browser download.
 */
export async function exportScheduleAsPdf(
  schedule: ExportSchedule,
  options?: ExportRenderOptions,
  onProgress?: ExportProgressCallback
): Promise<Blob> {
  const { blob, filename } = await renderSchedulePdfBlob(
    schedule,
    options,
    onProgress
  )
  triggerBrowserDownload(blob, filename)
  return blob
}

/**
 * Exports an individual member's personal schedule as an A4 PDF.
 */
export async function exportMemberScheduleAsPdf(
  member: import("../scheduler/types").MemberConfig,
  schedule: import("../scheduler/types").GeneratedSchedule,
  options?: ExportRenderOptions,
  customQrUrl?: string
): Promise<Blob> {
  // Convert full schedule to a single-member ExportSchedule
  const isArabic = options?.language ? options.language === "ar" : true
  const memberWeeks: ExportWeek[] = schedule.weeks.map((week) => {
    const assignment =
      week.assignments.find(
        (a) =>
          a.memberPublicId === member.publicId ||
          a.memberId === member.id ||
          a.memberName === member.name
      ) || week.assignments[0]

    return {
      weekNumber: week.weekNumber,
      totalWeeks: schedule.weeksCount,
      groupName: schedule.groupName,
      title: schedule.title,
      description: schedule.description,
      dateRangeText: week.dateRange
        ? isArabic
          ? week.dateRange.formattedAr
          : week.dateRange.formattedEn
        : undefined,
      occasionType: schedule.occasionType,
      islamicYear: schedule.islamicYear,
      language: isArabic ? "ar" : "en",
      direction: isArabic ? "rtl" : "ltr",
      theme: options?.theme || "dark",
      view: options?.view || "cards",
      branding: {
        ...options?.branding,
        qrUrl: customQrUrl,
      },
      members: [
        {
          name: member.name,
          amountInJuz: assignment.weeklyAmount,
          start: {
            juzNumber: assignment.startJuz,
            surahNumber: assignment.startAyah.surahNumber,
            surahNameArabic: assignment.startAyah.surahNameAr,
            surahNameEnglish: assignment.startAyah.surahNameEn,
            ayahNumber: assignment.startAyah.ayahNumber,
          },
          end: {
            juzNumber: assignment.endJuz,
            surahNumber: assignment.endAyah.surahNumber,
            surahNameArabic: assignment.endAyah.surahNameAr,
            surahNameEnglish: assignment.endAyah.surahNameEn,
            ayahNumber: assignment.endAyah.ayahNumber,
          },
          dailyBreakdown: assignment.dailyBreakdown,
        },
      ],
    }
  })

  const exportScheduleData: ExportSchedule = {
    groupName: `${member.name} - ${schedule.groupName}`,
    title: schedule.title,
    description: schedule.description,
    totalWeeks: schedule.weeksCount,
    startDate: schedule.startDate,
    usesDates: schedule.usesDates,
    occasionType: schedule.occasionType,
    islamicYear: schedule.islamicYear,
    dailyDivisionEnabled: schedule.dailyDivisionEnabled,
    language: isArabic ? "ar" : "en",
    direction: isArabic ? "rtl" : "ltr",
    theme: options?.theme || "dark",
    view: options?.view || "cards",
    branding: {
      ...options?.branding,
      qrUrl: customQrUrl,
    },
    weeks: memberWeeks,
  }

  return exportScheduleAsPdf(exportScheduleData, options)
}
