import { toBlob } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ensureFontsReady, preloadExportAssets } from './assets';
import { triggerBrowserDownload } from './download';
import { getPdfExportFilename } from './filenames';
import { buildPdfPageHtml } from './render-week';
import { ExportProgressCallback, ExportRenderOptions, ExportSchedule, ExportViewMode, ExportWeek } from './types';
import { validatePdfBlob } from './validate-file';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read page Blob as Data URL for PDF embedding.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Estimates the rendered pixel height of a weekly section based on member count and view mode.
 */
export function estimateWeekHeight(memberCount: number, viewMode: ExportViewMode = 'cards'): number {
  const headerHeight = 45;
  const marginAfter = 24;

  if (viewMode === 'table') {
    const tableHeaderHeight = 36;
    const rowHeight = 52;
    return headerHeight + tableHeaderHeight + memberCount * rowHeight + marginAfter;
  }

  // Cards layout
  const rows = memberCount <= 2 ? memberCount : Math.ceil(memberCount / 2);
  const cardHeight = 115;
  const gridGap = 12;

  return headerHeight + rows * cardHeight + (rows - 1) * gridGap + marginAfter;
}

/**
 * Dynamically packs weeks into A4 page batches based on content height, view mode, and available space.
 */
export function paginateWeeksForA4(weeks: ExportWeek[], viewMode: ExportViewMode = 'cards'): ExportWeek[][] {
  if (weeks.length === 0) return [];

  const pages: ExportWeek[][] = [];
  let currentPage: ExportWeek[] = [];
  let currentHeight = 0;

  // Maximum content budget in pixels (for 1000x1414 A4 canvas)
  const FIRST_PAGE_BUDGET = 950;
  const CONTINUATION_PAGE_BUDGET = 1050;
  const MAX_WEEKS_PER_PAGE = 2; // Optimal density for standard A4 portrait pages

  for (const week of weeks) {
    const weekView = week.view || viewMode;
    const weekHeight = estimateWeekHeight(week.members.length, weekView);
    const isFirstPage = pages.length === 0;
    const maxBudget = isFirstPage ? FIRST_PAGE_BUDGET : CONTINUATION_PAGE_BUDGET;

    // Start a new page if maximum weeks reached OR adding another week exceeds height budget
    if (
      currentPage.length >= MAX_WEEKS_PER_PAGE ||
      (currentPage.length > 0 && currentHeight + weekHeight > maxBudget)
    ) {
      pages.push(currentPage);
      currentPage = [week];
      currentHeight = weekHeight;
    } else {
      currentPage.push(week);
      currentHeight += weekHeight;
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

/**
 * Generates a full multi-page A4 PDF with dynamic content-aware pagination and triggers browser download.
 */
export async function exportScheduleAsPdf(
  schedule: ExportSchedule,
  options?: ExportRenderOptions,
  onProgress?: ExportProgressCallback
): Promise<Blob> {
  if (!schedule.weeks || schedule.weeks.length === 0) {
    throw new Error('Cannot export empty schedule.');
  }

  const theme = options?.theme || schedule.theme || 'dark';
  const viewMode = options?.view || schedule.view || 'cards';
  const [assets] = await Promise.all([preloadExportAssets(), ensureFontsReady()]);

  // 1. Calculate dynamic A4 pagination batches based on viewMode
  const pageBatches = paginateWeeksForA4(schedule.weeks, viewMode);
  const totalPages = pageBatches.length;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let p = 0; p < totalPages; p++) {
    const pageWeeks = pageBatches[p];
    const isFirstPage = p === 0;
    const pageNum = p + 1;

    if (onProgress) {
      const msg =
        schedule.language === 'ar'
          ? `جارٍ تجهيز صفحة ${pageNum} من ${totalPages}...`
          : `Preparing page ${pageNum} of ${totalPages}...`;
      onProgress(pageNum, totalPages, msg);
    }

    // Create offscreen container for the complete A4 page
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1000px';
    container.style.zIndex = '-9999';
    container.style.pointerEvents = 'none';
    container.style.opacity = '1';

    container.innerHTML = buildPdfPageHtml(
      pageWeeks,
      schedule,
      pageNum,
      totalPages,
      isFirstPage,
      assets,
      theme,
      viewMode
    );

    document.body.appendChild(container);

    try {
      await new Promise((r) => setTimeout(r, 60));

      const targetElement = container.firstElementChild as HTMLElement;
      if (!targetElement) {
        throw new Error('Failed to render PDF page container.');
      }

      const pageBlob = await toBlob(targetElement, {
        quality: 0.98,
        pixelRatio: 2.2, // High resolution for crisp PDF output
        skipFonts: true,
        cacheBust: false,
      });

      if (!pageBlob) {
        throw new Error(`Failed to capture PDF page ${pageNum}.`);
      }

      const dataUrl = await blobToDataUrl(pageBlob);

      if (p > 0) {
        pdf.addPage();
      }

      // Fill A4 page seamlessly
      pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    } finally {
      try {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      } catch {
        // ignore
      }
    }

    await new Promise((r) => setTimeout(r, 30));
  }

  if (onProgress) {
    const msg =
      schedule.language === 'ar'
        ? 'جارٍ إنهاء وتجهيز ملف PDF...'
        : 'Finalizing PDF file...';
    onProgress(totalPages, totalPages, msg);
  }

  const pdfBlob = pdf.output('blob');

  // Validate PDF binary integrity (%PDF-)
  const pdfValidation = await validatePdfBlob(pdfBlob);
  if (!pdfValidation.isValid) {
    throw new Error(`PDF validation failed: ${pdfValidation.error}`);
  }

  const pdfFilename = getPdfExportFilename(schedule.groupName, schedule.language);
  triggerBrowserDownload(pdfBlob, pdfFilename);

  return pdfBlob;
}
