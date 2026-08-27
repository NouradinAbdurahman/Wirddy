import { toBlob } from "html-to-image"
import {
  ensureFontsReady,
  ExportAssets,
  preloadExportAssets,
  waitForImagesToLoad,
} from "./assets"
import { formatArabicNumeral } from "./filenames"
import {
  ExportMember,
  ExportRenderOptions,
  ExportSchedule,
  ExportViewMode,
  ExportWeek,
} from "./types"

/**
 * Builds clean, unclipped HTML for an individual member assignment card.
 * Uses a single outer card with paired START / END columns and zero text truncation.
 */
export function buildMemberCardHtml(
  member: ExportMember,
  isArabic: boolean,
  isDark: boolean
): string {
  const amountStr = isArabic
    ? `${formatArabicNumeral(member.amountInJuz)} ${member.amountInJuz === 1 ? "جزء" : member.amountInJuz === 2 ? "جزآن" : member.amountInJuz <= 10 ? "أجزاء" : "جزء"}`
    : `${member.amountInJuz} Juz`

  const startJuzStr = isArabic
    ? `الجزء ${formatArabicNumeral(member.start.juzNumber)}`
    : `Juz ${member.start.juzNumber}`
  const endJuzStr = isArabic
    ? `الجزء ${formatArabicNumeral(member.end.juzNumber)}`
    : `Juz ${member.end.juzNumber}`
  const startSurahStr = isArabic
    ? `سورة ${member.start.surahNameArabic}`
    : member.start.surahNameEnglish
  const endSurahStr = isArabic
    ? `سورة ${member.end.surahNameArabic}`
    : member.end.surahNameEnglish
  const startAyahStr = isArabic
    ? `الآية ${formatArabicNumeral(member.start.ayahNumber)}`
    : `Ayah ${member.start.ayahNumber}`
  const endAyahStr = isArabic
    ? `الآية ${formatArabicNumeral(member.end.ayahNumber)}`
    : `Ayah ${member.end.ayahNumber}`
  const startLabel = isArabic ? "البداية" : "START"
  const endLabel = isArabic ? "النهاية" : "END"

  const cardBg = isDark ? "#0f172a" : "#ffffff"
  const cardBorder = isDark
    ? "rgba(51, 65, 85, 0.7)"
    : "rgba(226, 232, 240, 0.9)"
  const dividerColor = isDark
    ? "rgba(51, 65, 85, 0.5)"
    : "rgba(241, 245, 249, 0.9)"
  const primaryText = isDark ? "#f8fafc" : "#0f172a"
  const secondaryText = isDark ? "#94a3b8" : "#64748b"
  const accentColor = "#0d9488" // teal-600

  // Single-line, un-truncated: names stay whole and never break mid-word onto a new line.
  const noWrapLine = "white-space: nowrap;"

  return `
    <div style="background-color: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: 16px; padding: 12px 16px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 2px rgba(0,0,0,0.05); box-sizing: border-box;">
      <!-- Top Row: Member Name (single line, unclipped) + Compact Amount Badge -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 9px; min-width: 0;">
        <div style="flex: 1 1 auto; min-width: 0; font-weight: 800; font-size: 14px; line-height: 1.3; color: ${primaryText}; ${noWrapLine}">
          ${member.name}
        </div>
        <div style="flex-shrink: 0; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background-color: ${isDark ? "#1e293b" : "#f1f5f9"}; color: ${secondaryText}; border: 1px solid ${isDark ? "#334155" : "#e2e8f0"}; white-space: nowrap;">
          ${amountStr}
        </div>
      </div>

      <!-- Symmetrical Paired Start & End Section -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 9px; border-top: 1px solid ${dividerColor};">
        <!-- START Column -->
        <div style="display: flex; flex-direction: column; min-width: 0;">
          <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: ${accentColor}; letter-spacing: 0.5px; margin-bottom: 2px; ${noWrapLine}">
            ${startLabel}
          </div>
          <div style="font-size: 10px; font-weight: 700; color: ${secondaryText}; ${noWrapLine}">
            ${startJuzStr}
          </div>
          <div style="font-size: 12px; font-weight: 800; color: ${primaryText}; margin-top: 1px; ${noWrapLine}">
            ${startSurahStr}
          </div>
          <div style="font-size: 10px; color: ${secondaryText}; margin-top: 1px; ${noWrapLine}">
            ${startAyahStr}
          </div>
        </div>

        <!-- END Column -->
        <div style="display: flex; flex-direction: column; min-width: 0;">
          <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: ${accentColor}; letter-spacing: 0.5px; margin-bottom: 2px; ${noWrapLine}">
            ${endLabel}
          </div>
          <div style="font-size: 10px; font-weight: 700; color: ${secondaryText}; ${noWrapLine}">
            ${endJuzStr}
          </div>
          <div style="font-size: 12px; font-weight: 800; color: ${primaryText}; margin-top: 1px; ${noWrapLine}">
            ${endSurahStr}
          </div>
          <div style="font-size: 10px; color: ${secondaryText}; margin-top: 1px; ${noWrapLine}">
            ${endAyahStr}
          </div>
        </div>
      </div>
    </div>
  `
}

/**
 * Builds a distinct weekly schedule section containing its week heading and member cards grid.
 */
export function buildWeeklyCardsSectionHtml(
  week: ExportWeek,
  isArabic: boolean,
  isDark: boolean
): string {
  const primaryText = isDark ? "#f8fafc" : "#0f172a"
  const borderPrimary = isDark
    ? "rgba(51, 65, 85, 0.6)"
    : "rgba(226, 232, 240, 0.8)"

  const weekLabelStr = isArabic
    ? `الأسبوع ${formatArabicNumeral(week.weekNumber)} من ${formatArabicNumeral(week.totalWeeks)}`
    : `Week ${week.weekNumber} of ${week.totalWeeks}`
  const completionText = isArabic
    ? `${formatArabicNumeral(30)} / ${formatArabicNumeral(30)} جزء • اكتمال الختمة`
    : `30 / 30 Juz • Full Completion`

  const memberCardsHtml = week.members
    .map((member) => buildMemberCardHtml(member, isArabic, isDark))
    .join("")

  const gridColumns = week.members.length <= 2 ? "1fr" : "1fr 1fr"

  return `
    <div style="margin-bottom: 24px; box-sizing: border-box;">
      <!-- Week Section Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid ${borderPrimary};">
        <div style="min-width: 0; font-size: 13px; font-weight: 800; color: ${primaryText}; display: flex; align-items: center; gap: 8px; white-space: nowrap;">
          <span style="flex-shrink: 0; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #0d9488;"></span>
          <span>${weekLabelStr}</span>
        </div>
        <div style="flex-shrink: 0; font-size: 10.5px; font-weight: 700; color: #10b981; white-space: nowrap;">
          ${completionText}
        </div>
      </div>

      <!-- Member Cards Grid -->
      <div style="display: grid; grid-template-columns: ${gridColumns}; gap: 12px;">
        ${memberCardsHtml}
      </div>
    </div>
  `
}

/**
 * Builds a distinct weekly schedule section containing its week heading and a premium tabular layout.
 */
export function buildWeeklyTableSectionHtml(
  week: ExportWeek,
  isArabic: boolean,
  isDark: boolean
): string {
  const primaryText = isDark ? "#f8fafc" : "#0f172a"
  const secondaryText = isDark ? "#94a3b8" : "#64748b"
  const borderPrimary = isDark
    ? "rgba(51, 65, 85, 0.6)"
    : "rgba(226, 232, 240, 0.8)"
  const rowDivider = isDark
    ? "rgba(51, 65, 85, 0.4)"
    : "rgba(241, 245, 249, 0.9)"
  const headerBg = isDark ? "rgba(30, 41, 59, 0.7)" : "#f1f5f9"
  const cardBg = isDark ? "#0f172a" : "#ffffff"
  const accentColor = "#0d9488"

  const weekLabelStr = isArabic
    ? `الأسبوع ${formatArabicNumeral(week.weekNumber)} من ${formatArabicNumeral(week.totalWeeks)}`
    : `Week ${week.weekNumber} of ${week.totalWeeks}`
  const completionText = isArabic
    ? `${formatArabicNumeral(30)} / ${formatArabicNumeral(30)} جزء • اكتمال الختمة`
    : `30 / 30 Juz • Full Completion`

  const headerMember = isArabic ? "العضو" : "MEMBER"
  const headerAmount = isArabic ? "الورد" : "JUZ"
  const headerStart = isArabic ? "البداية" : "START"
  const headerEnd = isArabic ? "النهاية" : "END"

  const rowsHtml = week.members
    .map((member) => {
      const startJuzStr = isArabic
        ? `الجزء ${formatArabicNumeral(member.start.juzNumber)}`
        : `Juz ${member.start.juzNumber}`
      const endJuzStr = isArabic
        ? `الجزء ${formatArabicNumeral(member.end.juzNumber)}`
        : `Juz ${member.end.juzNumber}`
      const startSurahStr = isArabic
        ? `سورة ${member.start.surahNameArabic}`
        : member.start.surahNameEnglish
      const endSurahStr = isArabic
        ? `سورة ${member.end.surahNameArabic}`
        : member.end.surahNameEnglish
      const startAyahStr = isArabic
        ? `الآية ${formatArabicNumeral(member.start.ayahNumber)}`
        : `Ayah ${member.start.ayahNumber}`
      const endAyahStr = isArabic
        ? `الآية ${formatArabicNumeral(member.end.ayahNumber)}`
        : `Ayah ${member.end.ayahNumber}`

      const cellNoWrap = "white-space: nowrap;"

      return `
        <tr style="border-bottom: 1px solid ${rowDivider};">
          <td style="padding: 9px 14px; vertical-align: middle;">
            <div style="font-weight: 800; font-size: 13px; color: ${primaryText}; ${cellNoWrap}">
              ${member.name}
            </div>
          </td>
          <td style="padding: 9px 10px; vertical-align: middle; text-align: center;">
            <span style="display: inline-block; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background-color: ${isDark ? "#1e293b" : "#f1f5f9"}; color: ${secondaryText}; border: 1px solid ${isDark ? "#334155" : "#e2e8f0"}; white-space: nowrap;">
              ${formatArabicNumeral(member.amountInJuz)}
            </span>
          </td>
          <td style="padding: 9px 14px; vertical-align: middle;">
            <div style="font-size: 9.5px; font-weight: 700; color: ${secondaryText}; ${cellNoWrap}">
              ${startJuzStr}
            </div>
            <div style="font-size: 11px; font-weight: 800; color: ${primaryText}; margin-top: 1px; ${cellNoWrap}">
              ${startSurahStr}
            </div>
            <div style="font-size: 9.5px; color: ${secondaryText}; margin-top: 1px; ${cellNoWrap}">
              ${startAyahStr}
            </div>
          </td>
          <td style="padding: 9px 14px; vertical-align: middle;">
            <div style="font-size: 9.5px; font-weight: 700; color: ${secondaryText}; ${cellNoWrap}">
              ${endJuzStr}
            </div>
            <div style="font-size: 11px; font-weight: 800; color: ${primaryText}; margin-top: 1px; ${cellNoWrap}">
              ${endSurahStr}
            </div>
            <div style="font-size: 9.5px; color: ${secondaryText}; margin-top: 1px; ${cellNoWrap}">
              ${endAyahStr}
            </div>
          </td>
        </tr>
      `
    })
    .join("")

  return `
    <div style="margin-bottom: 24px; box-sizing: border-box;">
      <!-- Week Section Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid ${borderPrimary};">
        <div style="min-width: 0; font-size: 13px; font-weight: 800; color: ${primaryText}; display: flex; align-items: center; gap: 8px; white-space: nowrap;">
          <span style="flex-shrink: 0; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #0d9488;"></span>
          <span>${weekLabelStr}</span>
        </div>
        <div style="flex-shrink: 0; font-size: 10.5px; font-weight: 700; color: #10b981; white-space: nowrap;">
          ${completionText}
        </div>
      </div>

      <!-- Table Container -->
      <div style="background-color: ${cardBg}; border: 1px solid ${borderPrimary}; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <table style="width: 100%; table-layout: fixed; border-collapse: collapse; text-align: ${isArabic ? "right" : "left"};">
          <thead>
            <tr style="background-color: ${headerBg}; border-bottom: 1px solid ${borderPrimary}; font-size: 9.5px; font-weight: 800; letter-spacing: 0.5px; color: ${secondaryText}; text-transform: uppercase;">
              <th style="padding: 9px 14px; text-align: ${isArabic ? "right" : "left"}; width: 28%; white-space: nowrap;">${headerMember}</th>
              <th style="padding: 9px 10px; text-align: center; width: 12%; white-space: nowrap;">${headerAmount}</th>
              <th style="padding: 9px 14px; text-align: ${isArabic ? "right" : "left"}; width: 30%; color: ${accentColor}; white-space: nowrap;">${headerStart}</th>
              <th style="padding: 9px 14px; text-align: ${isArabic ? "right" : "left"}; width: 30%; color: ${accentColor}; white-space: nowrap;">${headerEnd}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `
}

/**
 * Builds weekly section HTML based on the specified viewMode ('cards' | 'table').
 */
export function buildWeeklySectionHtml(
  week: ExportWeek,
  isArabic: boolean,
  isDark: boolean,
  viewMode: ExportViewMode = "cards"
): string {
  if (viewMode === "table" || week.view === "table") {
    return buildWeeklyTableSectionHtml(week, isArabic, isDark)
  }
  return buildWeeklyCardsSectionHtml(week, isArabic, isDark)
}

/**
 * Builds standalone single-week export document HTML (for PNG and Web view).
 */
export function buildStandaloneWeekExportHtml(
  week: ExportWeek,
  assets: ExportAssets,
  theme: "light" | "dark",
  viewMode: ExportViewMode = "cards"
): string {
  const isArabic = week.language === "ar"
  const isDark = theme === "dark"
  const dir = isArabic ? "rtl" : "ltr"

  const logoSrc = isDark ? assets.wirddyLogoWhite : assets.wirddyLogoBlack
  const bg = isDark ? "#020617" : "#f8fafc"
  const textPrimary = isDark ? "#f8fafc" : "#0f172a"
  const textSecondary = isDark ? "#94a3b8" : "#475569"
  const borderPrimary = isDark
    ? "rgba(51, 65, 85, 0.6)"
    : "rgba(226, 232, 240, 0.8)"
  const planTag = isArabic ? "خطة ختم القرآن الكريم" : "Quran Completion Plan"
  const footerText = isArabic
    ? "تم إنشاء هذا الجدول عبر تطبيق وِردي"
    : "Generated with Wirddy"
  const showLogo = week.branding?.showLogo !== false
  const showGroupName = week.branding?.showGroupName !== false
  const showDate = week.branding?.showDate !== false
  const showQr = week.branding?.showQr !== false
  const dateStr = new Date().toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const weeklyContentHtml = buildWeeklySectionHtml(
    week,
    isArabic,
    isDark,
    viewMode
  )

  return `
    <div dir="${dir}" style="width: 880px; min-width: 880px; max-width: 880px; background-color: ${bg}; color: ${textPrimary}; font-family: var(--font-arabic), var(--font-sans), system-ui, -apple-system, sans-serif; padding: 32px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid ${borderPrimary}; border-radius: 24px; position: relative;">
      
      <!-- Top Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid ${borderPrimary}; padding-bottom: 20px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px; min-width: 0; flex: 1 1 auto;">
          ${showLogo ? `<img src="${logoSrc}" alt="Wirddy" width="140" height="38" style="flex-shrink: 0; width: 140px; height: 38px; max-width: 140px; max-height: 38px; object-fit: contain; display: block;" />` : ""}
          <div style="min-width: 0;">
            <div style="display: inline-block; width: max-content; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 10px; border-radius: 6px; background-color: ${isDark ? "rgba(13, 148, 136, 0.15)" : "rgba(13, 148, 136, 0.1)"}; color: #0d9488; border: 1px solid rgba(13, 148, 136, 0.3); white-space: nowrap; box-sizing: content-box;">
              ${planTag}
            </div>
            ${showGroupName ? `<div style="font-size: 19px; font-weight: 800; color: ${textPrimary}; margin-top: 3px; white-space: nowrap;">${week.groupName}</div>` : ""}
          </div>
        </div>

        <div style="flex-shrink: 0; text-align: ${isArabic ? "left" : "right"};">
          <div style="font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 10px; background-color: ${isDark ? "#0f172a" : "#ffffff"}; border: 1px solid ${borderPrimary}; color: ${textPrimary}; display: inline-block; white-space: nowrap;">
            ${isArabic ? `الأسبوع ${formatArabicNumeral(week.weekNumber)} من ${formatArabicNumeral(week.totalWeeks)}` : `Week ${week.weekNumber} of ${week.totalWeeks}`}
          </div>
        </div>
      </div>

      <!-- Weekly Section Content (Cards or Table) -->
      <div style="flex: 1;">
        ${weeklyContentHtml}
      </div>

      <!-- Bottom Footer -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid ${borderPrimary}; padding-top: 16px; font-size: 10.5px; color: ${textSecondary}; margin-top: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${showQr && assets.qrCode ? `<img src="${assets.qrCode}" alt="QR" width="32" height="32" style="width: 32px; height: 32px; border-radius: 5px; background-color: #ffffff; padding: 2px; box-sizing: border-box; flex-shrink: 0;" />` : ""}
          <span style="white-space: nowrap;">${footerText}</span>
        </div>
        ${showDate ? `<span style="white-space: nowrap;">${dateStr}</span>` : ""}
      </div>
    </div>
  `
}

/**
 * Builds an A4 portrait multi-week PDF page container (width: 1000px, 1:1.414 A4 ratio).
 */
export function buildPdfPageHtml(
  pageWeeks: ExportWeek[],
  schedule: ExportSchedule,
  pageNumber: number,
  totalPages: number,
  isFirstPage: boolean,
  assets: ExportAssets,
  theme: "light" | "dark",
  viewMode: ExportViewMode = "cards"
): string {
  const isArabic = schedule.language === "ar"
  const isDark = theme === "dark"
  const dir = isArabic ? "rtl" : "ltr"

  const showLogo = schedule.branding?.showLogo !== false
  const showGroupName = schedule.branding?.showGroupName !== false
  const showDate = schedule.branding?.showDate !== false
  const showQr = schedule.branding?.showQr !== false
  const dateStr = new Date().toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const logoSrc = isDark ? assets.wirddyLogoWhite : assets.wirddyLogoBlack
  const bg = isDark ? "#020617" : "#f8fafc"
  const textPrimary = isDark ? "#f8fafc" : "#0f172a"
  const textSecondary = isDark ? "#94a3b8" : "#475569"
  const borderPrimary = isDark
    ? "rgba(51, 65, 85, 0.6)"
    : "rgba(226, 232, 240, 0.8)"
  const planTag = isArabic ? "خطة ختم القرآن الكريم" : "Quran Completion Plan"
  const footerText = isArabic
    ? "تم إنشاء هذا الجدول عبر تطبيق وِردي — تنظيم قراءة القرآن في مجموعات"
    : "Generated with Wirddy — Quran Reading Planner for Groups"

  const pageLabelStr = isArabic
    ? `صفحة ${formatArabicNumeral(pageNumber)} من ${formatArabicNumeral(totalPages)}`
    : `Page ${pageNumber} of ${totalPages}`

  const weeksHtml = pageWeeks
    .map((week) => buildWeeklySectionHtml(week, isArabic, isDark, viewMode))
    .join("")

  // Page Header (Full header for page 1, compact continuation header for subsequent pages)
  const headerHtml = isFirstPage
    ? `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; border-bottom: 1px solid ${borderPrimary}; padding-bottom: 18px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1 1 auto;">
          ${showLogo ? `<img src="${logoSrc}" alt="Wirddy" width="140" height="38" style="flex-shrink: 0; width: 140px; height: 38px; max-width: 140px; max-height: 38px; object-fit: contain; display: block;" />` : ""}
          <div style="min-width: 0;">
            <div style="display: inline-block; width: max-content; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 10px; border-radius: 6px; background-color: ${isDark ? "rgba(13, 148, 136, 0.15)" : "rgba(13, 148, 136, 0.1)"}; color: #0d9488; border: 1px solid rgba(13, 148, 136, 0.3); white-space: nowrap; box-sizing: content-box;">
              ${planTag}
            </div>
            ${showGroupName ? `<div style="font-size: 19px; font-weight: 800; color: ${textPrimary}; margin-top: 3px; white-space: nowrap;">${schedule.groupName}</div>` : ""}
          </div>
        </div>

        <div style="flex-shrink: 0; text-align: ${isArabic ? "left" : "right"}; display: flex; flex-direction: column; align-items: ${isArabic ? "flex-start" : "flex-end"}; gap: 4px;">
          <div style="font-size: 11.5px; font-weight: 800; padding: 4px 12px; border-radius: 8px; background-color: ${isDark ? "#0f172a" : "#ffffff"}; border: 1px solid ${borderPrimary}; color: ${textPrimary}; white-space: nowrap;">
            ${isArabic ? `${formatArabicNumeral(schedule.totalWeeks)} أسابيع` : `${schedule.totalWeeks} Weeks Plan`}
          </div>
          <div style="font-size: 10.5px; font-weight: 700; color: #10b981; white-space: nowrap;">
            ${isArabic ? "٣٠ جزءًا أسبوعيًا" : "30 Juz / Week"}
          </div>
        </div>
      </div>
    `
    : `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid ${borderPrimary}; padding-bottom: 12px; margin-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1 1 auto;">
          ${showLogo ? `<img src="${logoSrc}" alt="Wirddy" width="100" height="28" style="flex-shrink: 0; width: 100px; height: 28px; max-width: 100px; max-height: 28px; object-fit: contain; display: block;" />` : ""}
          ${showGroupName ? `<span style="min-width: 0; font-size: 13px; font-weight: 800; color: ${textPrimary}; white-space: nowrap;">${schedule.groupName}</span>` : ""}
        </div>
        <div style="flex-shrink: 0; font-size: 10.5px; font-weight: 700; color: ${textSecondary}; white-space: nowrap;">
          ${pageLabelStr}
        </div>
      </div>
    `

  return `
    <div dir="${dir}" style="width: 1000px; min-width: 1000px; max-width: 1000px; height: 1414px; min-height: 1414px; max-height: 1414px; background-color: ${bg}; color: ${textPrimary}; font-family: var(--font-arabic), var(--font-sans), system-ui, -apple-system, sans-serif; padding: 36px 40px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid ${borderPrimary}; position: relative;">
      
      <!-- Page Header -->
      <div>
        ${headerHtml}
        <!-- Stacked Weekly Sections (Cards or Tables) -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${weeksHtml}
        </div>
      </div>

      <!-- Page-Level Single Footer -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid ${borderPrimary}; padding-top: 14px; font-size: 10.5px; color: ${textSecondary}; margin-top: 20px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${showQr && assets.qrCode ? `<img src="${assets.qrCode}" alt="QR" width="30" height="30" style="width: 30px; height: 30px; border-radius: 4px; background-color: #ffffff; padding: 2px; box-sizing: border-box; flex-shrink: 0;" />` : ""}
          <span style="min-width: 0; white-space: nowrap;">${footerText}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          ${showDate ? `<span style="white-space: nowrap;">${dateStr}</span>` : ""}
          <span style="flex-shrink: 0; font-weight: 600; white-space: nowrap;">${pageLabelStr}</span>
        </div>
      </div>
    </div>
  `
}

/**
 * Renders an ExportWeek deterministically to a verified PNG Blob without touching the active UI DOM.
 */
export async function renderWeekToPngBlob(
  week: ExportWeek,
  options?: ExportRenderOptions
): Promise<Blob> {
  const theme = options?.theme || week.theme || "dark"
  const viewMode = options?.view || week.view || "cards"
  const pixelRatio = options?.pixelRatio || 2.2

  // Preload assets & wait for font readiness
  const [assets] = await Promise.all([
    preloadExportAssets(),
    ensureFontsReady(),
  ])

  // Create isolated off-screen mount container with strict fixed dimensions
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "0"
  container.style.top = "0"
  container.style.width = "880px"
  container.style.minWidth = "880px"
  container.style.maxWidth = "880px"
  container.style.boxSizing = "border-box"
  container.style.zIndex = "-9999"
  container.style.pointerEvents = "none"
  container.style.opacity = "1"
  container.style.transform = "none"
  container.style.overflow = "hidden"

  container.innerHTML = buildStandaloneWeekExportHtml(
    week,
    assets,
    theme,
    viewMode
  )
  document.body.appendChild(container)

  try {
    const targetElement = container.firstElementChild as HTMLElement
    if (!targetElement) {
      throw new Error("Failed to create export DOM element.")
    }

    await waitForImagesToLoad(targetElement)
    await new Promise((r) => setTimeout(r, 40))

    const blob = await toBlob(targetElement, {
      quality: 0.98,
      pixelRatio,
      skipFonts: true,
      cacheBust: false,
    })

    if (!blob) {
      throw new Error("toBlob returned null or empty result.")
    }

    return blob
  } finally {
    try {
      if (document.body.contains(container)) {
        document.body.removeChild(container)
      }
    } catch {
      // ignore
    }
  }
}
