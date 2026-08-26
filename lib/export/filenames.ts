import { ExportLanguage } from './types';

/**
 * Sanitizes a string for safe usage across macOS, Windows, Linux, iOS, and Android filenames.
 * Strips forbidden characters (/ \ : * ? " < > | \0) and trims spaces/dots.
 */
export function sanitizeFilename(input: string, fallback: string = 'Wirddy-Schedule'): string {
  if (!input || typeof input !== 'string') return fallback;

  // Replace invalid OS filename characters with hyphens
  const sanitized = input
    .replace(/[/\\:*?"<>|\x00-\x1F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .trim();

  return sanitized || fallback;
}

export function formatArabicNumeral(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/\d/g, (d) => arabicDigits[parseInt(d, 10)]);
}

export function getExportFilename(
  groupName: string,
  weekNumber: number,
  language: ExportLanguage,
  extension: string
): string {
  const safeGroupName = sanitizeFilename(groupName, 'Wirddy');
  const ext = extension.startsWith('.') ? extension : `.${extension}`;

  if (language === 'ar') {
    const weekStr = formatArabicNumeral(weekNumber);
    return `Wirddy-${safeGroupName}-الأسبوع-${weekStr}${ext}`;
  }

  return `Wirddy-${safeGroupName}-Week-${weekNumber}${ext}`;
}

export function getZipExportFilename(groupName: string, language: ExportLanguage): string {
  const safeGroupName = sanitizeFilename(groupName, 'Wirddy');
  if (language === 'ar') {
    return `Wirddy-${safeGroupName}-جميع-الأسابيع.zip`;
  }
  return `Wirddy-${safeGroupName}-All-Weeks.zip`;
}

export function getPdfExportFilename(groupName: string, language: ExportLanguage): string {
  const safeGroupName = sanitizeFilename(groupName, 'Wirddy');
  if (language === 'ar') {
    return `Wirddy-${safeGroupName}-الخطة-كاملة.pdf`;
  }
  return `Wirddy-${safeGroupName}-Full-Plan.pdf`;
}
