import { toBlob } from "html-to-image"
import {
  ensureFontsReady,
  ExportAssets,
  getEmbeddedFontCSS,
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
import { GeneratedSchedule, MemberConfig } from "../scheduler/types"

/**
 * Builds clean, unclipped HTML for an individual member assignment card.
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

  const noWrapLine = "white-space: nowrap;"

  // Daily breakdown preview if present
  let dailyBreakdownHtml = ""
  if (member.dailyBreakdown && member.dailyBreakdown.length > 0) {
    const dailyItems = member.dailyBreakdown
      .map((d) => {
        const dSurah = isArabic
          ? d.startAyah.surahNameAr
          : d.startAyah.surahNameEn
        const dDay = isArabic ? d.dayNameAr : d.dayNameEn
        const dAyahRange = `${formatArabicNumeral(d.startAyah.ayahNumber)}-${formatArabicNumeral(d.endAyah.ayahNumber)}`
        return `
          <div style="padding: 4px 6px; border-radius: 6px; background-color: ${isDark ? "#1e293b" : "#f8fafc"}; border: 1px solid ${dividerColor}; text-align: center; min-width: 0;">
            <div style="font-size: 7.5px; font-weight: 800; color: ${accentColor}; ${noWrapLine}">${dDay}</div>
            <div style="font-size: ${isArabic ? "9.5px" : "8px"}; font-weight: 700; ${isArabic ? "font-family: Amiri, 'Amiri Quran', serif; font-feature-settings: 'liga' 1, 'calt' 1, 'locl' 1, 'mkmk' 1, 'mark' 1;" : ""} color: ${primaryText}; margin-top: 1px; ${noWrapLine}">${dSurah}</div>
            <div style="font-size: 7.5px; color: ${secondaryText}; ${noWrapLine}">${dAyahRange}</div>
          </div>
        `
      })
      .join("")

    dailyBreakdownHtml = `
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${dividerColor};">
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
          ${dailyItems}
        </div>
      </div>
    `
  }

  return `
    <div style="background-color: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: 16px; padding: 12px 16px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 2px rgba(0,0,0,0.05); box-sizing: border-box;">
      <!-- Top Row: Member Name + Amount Badge -->
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
          <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: ${accentColor}; letter-spacing: ${isArabic ? "normal" : "0.5px"}; margin-bottom: 2px; ${noWrapLine}">
            ${startLabel}
          </div>
          <div style="font-size: 10px; font-weight: 700; color: ${secondaryText}; ${noWrapLine}">
            ${startJuzStr}
          </div>
          <div style="font-size: ${isArabic ? "13.5px" : "12px"}; font-weight: 700; ${isArabic ? "font-family: Amiri, 'Amiri Quran', serif; font-feature-settings: 'liga' 1, 'calt' 1, 'locl' 1, 'mkmk' 1, 'mark' 1;" : ""} color: ${primaryText}; margin-top: 1px; ${noWrapLine}">
            ${startSurahStr}
          </div>
          <div style="font-size: 10px; color: ${secondaryText}; margin-top: 1px; ${noWrapLine}">
            ${startAyahStr}
          </div>
        </div>

        <!-- END Column -->
        <div style="display: flex; flex-direction: column; min-width: 0;">
          <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: ${accentColor}; letter-spacing: ${isArabic ? "normal" : "0.5px"}; margin-bottom: 2px; ${noWrapLine}">
            ${endLabel}
          </div>
          <div style="font-size: 10px; font-weight: 700; color: ${secondaryText}; ${noWrapLine}">
            ${endJuzStr}
          </div>
          <div style="font-size: ${isArabic ? "13.5px" : "12px"}; font-weight: 700; ${isArabic ? "font-family: Amiri, 'Amiri Quran', serif; font-feature-settings: 'liga' 1, 'calt' 1, 'locl' 1, 'mkmk' 1, 'mark' 1;" : ""} color: ${primaryText}; margin-top: 1px; ${noWrapLine}">
            ${endSurahStr}
          </div>
          <div style="font-size: 10px; color: ${secondaryText}; margin-top: 1px; ${noWrapLine}">
            ${endAyahStr}
          </div>
        </div>
      </div>

      ${dailyBreakdownHtml}
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
          ${week.dateRangeText ? `<span style="font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 5px; background-color: ${isDark ? "#1e293b" : "#e2e8f0"}; color: ${isDark ? "#94a3b8" : "#475569"};">${week.dateRangeText}</span>` : ""}
          ${week.occasionType === "ramadan" ? `<span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 5px; background-color: rgba(245, 158, 11, 0.15); color: #d97706;">${isArabic ? "ختمة رمضان" : "Ramadan"}</span>` : ""}
        </div>
        <div style="flex-shrink: 0; font-size: 10.5px; font-weight: 700; color: #10b981; white-space: nowrap;">
          ${completionText}
        </div>
      </div>

      <!-- Member Cards Symmetrical Grid -->
      <div style="display: grid; grid-template-columns: ${gridColumns}; gap: 12px;">
        ${memberCardsHtml}
      </div>
    </div>
  `
}

/**
 * Builds a dense, high-efficiency weekly table section.
 */
export function buildWeeklyTableSectionHtml(
  week: ExportWeek,
  isArabic: boolean,
  isDark: boolean
): string {
  const primaryText = isDark ? "#f8fafc" : "#0f172a"
  const secondaryText = isDark ? "#94a3b8" : "#64748b"
  const cardBg = isDark ? "#0f172a" : "#ffffff"
  const headerBg = isDark ? "#1e293b" : "#f8fafc"
  const borderPrimary = isDark
    ? "rgba(51, 65, 85, 0.6)"
    : "rgba(226, 232, 240, 0.8)"
  const rowDivider = isDark
    ? "rgba(51, 65, 85, 0.4)"
    : "rgba(241, 245, 249, 0.9)"
  const accentColor = "#0d9488"

  const weekLabelStr = isArabic
    ? `الأسبوع ${formatArabicNumeral(week.weekNumber)} من ${formatArabicNumeral(week.totalWeeks)}`
    : `Week ${week.weekNumber} of ${week.totalWeeks}`

  const completionText = isArabic
    ? `${formatArabicNumeral(30)} / ${formatArabicNumeral(30)} جزء • اكتمال الختمة`
    : `30 / 30 Juz • Full Completion`

  const headerMember = isArabic ? "العضو" : "Member"
  const headerAmount = isArabic ? "الورد" : "Juz"
  const headerStart = isArabic ? "البداية" : "Start"
  const headerEnd = isArabic ? "النهاية" : "End"

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
            <div style="font-size: ${isArabic ? "13px" : "11px"}; font-weight: 700; ${isArabic ? "font-family: Amiri, 'Amiri Quran', serif; font-feature-settings: 'liga' 1, 'calt' 1, 'locl' 1, 'mkmk' 1, 'mark' 1;" : ""} color: ${primaryText}; margin-top: 1px; ${cellNoWrap}">
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
            <div style="font-size: ${isArabic ? "13px" : "11px"}; font-weight: 700; ${isArabic ? "font-family: Amiri, 'Amiri Quran', serif; font-feature-settings: 'liga' 1, 'calt' 1, 'locl' 1, 'mkmk' 1, 'mark' 1;" : ""} color: ${primaryText}; margin-top: 1px; ${cellNoWrap}">
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
          ${week.dateRangeText ? `<span style="font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 5px; background-color: ${isDark ? "#1e293b" : "#e2e8f0"}; color: ${isDark ? "#94a3b8" : "#475569"};">${week.dateRangeText}</span>` : ""}
          ${week.occasionType === "ramadan" ? `<span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 5px; background-color: rgba(245, 158, 11, 0.15); color: #d97706;">${isArabic ? "ختمة رمضان" : "Ramadan"}</span>` : ""}
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
 * Builds standalone single-week export document HTML.
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
    <div dir="${dir}" style="width: 880px; min-width: 880px; max-width: 880px; background-color: ${bg}; color: ${textPrimary}; font-family: Cairo, Amiri, 'Amiri Quran', Inter, system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; image-rendering: -webkit-optimize-contrast; padding: 32px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; border: none; border-radius: 0; position: relative;">
      
      <!-- Top Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid ${borderPrimary}; padding-bottom: 20px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px; min-width: 0; flex: 1 1 auto;">
          ${showLogo ? `<img src="${logoSrc}" alt="Wirddy" width="140" height="38" style="flex-shrink: 0; width: 140px; height: 38px; max-width: 140px; max-height: 38px; object-fit: contain; display: block;" />` : ""}
          <div style="min-width: 0;">
            <div style="display: inline-block; width: max-content; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: ${isArabic ? "normal" : "0.5px"}; padding: 3px 10px; border-radius: 6px; background-color: ${isDark ? "rgba(13, 148, 136, 0.15)" : "rgba(13, 148, 136, 0.1)"}; color: #0d9488; border: 1px solid rgba(13, 148, 136, 0.3); white-space: nowrap; box-sizing: content-box;">
              ${planTag}
            </div>
            ${showGroupName ? `<div style="font-size: 19px; font-weight: 800; color: ${textPrimary}; margin-top: 3px; white-space: nowrap;">${week.title ? `${week.title} • ${week.groupName}` : week.groupName}</div>` : ""}
            ${week.description ? `<div style="font-size: 11px; color: ${textSecondary}; margin-top: 2px;">${week.description}</div>` : ""}
          </div>
        </div>

        <div style="flex-shrink: 0; text-align: ${isArabic ? "left" : "right"};">
          <div style="font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 10px; background-color: ${isDark ? "#0f172a" : "#ffffff"}; border: 1px solid ${borderPrimary}; color: ${textPrimary}; display: inline-block; white-space: nowrap;">
            ${isArabic ? `الأسبوع ${formatArabicNumeral(week.weekNumber)} من ${formatArabicNumeral(week.totalWeeks)}` : `Week ${week.weekNumber} of ${week.totalWeeks}`}
          </div>
        </div>
      </div>

      <!-- Weekly Section Content -->
      <div style="flex: 1;">
        ${weeklyContentHtml}
      </div>

      <!-- Bottom Footer -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid ${borderPrimary}; padding-top: 16px; font-size: 10.5px; color: ${textSecondary}; margin-top: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${showQr && assets.qrCode ? `<img src="${assets.qrCode}" alt="QR Code" width="46" height="46" style="width: 46px; height: 46px; border-radius: 6px; background-color: #ffffff; padding: 2px; box-sizing: border-box; flex-shrink: 0; display: block; border: 1px solid ${borderPrimary};" />` : ""}
          <span style="white-space: nowrap;">${footerText}</span>
        </div>
        ${showDate ? `<span style="white-space: nowrap;">${dateStr}</span>` : ""}
      </div>
    </div>
  `
}

/**
 * Builds an A4 portrait multi-week PDF page container.
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

  const headerHtml = isFirstPage
    ? `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; border-bottom: 1px solid ${borderPrimary}; padding-bottom: 18px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1 1 auto;">
          ${showLogo ? `<img src="${logoSrc}" alt="Wirddy" width="140" height="38" style="flex-shrink: 0; width: 140px; height: 38px; max-width: 140px; max-height: 38px; object-fit: contain; display: block;" />` : ""}
          <div style="min-width: 0;">
            <div style="display: inline-block; width: max-content; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 10px; border-radius: 6px; background-color: ${isDark ? "rgba(13, 148, 136, 0.15)" : "rgba(13, 148, 136, 0.1)"}; color: #0d9488; border: 1px solid rgba(13, 148, 136, 0.3); white-space: nowrap; box-sizing: content-box;">
              ${planTag}
            </div>
            ${showGroupName ? `<div style="font-size: 19px; font-weight: 800; color: ${textPrimary}; margin-top: 3px; white-space: nowrap;">${schedule.title ? `${schedule.title} • ${schedule.groupName}` : schedule.groupName}</div>` : ""}
            ${schedule.description ? `<div style="font-size: 11px; color: ${textSecondary}; margin-top: 2px;">${schedule.description}</div>` : ""}
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
    <div dir="${dir}" style="width: 1000px; min-width: 1000px; max-width: 1000px; height: 1414px; min-height: 1414px; max-height: 1414px; background-color: ${bg}; color: ${textPrimary}; font-family: Cairo, Amiri, 'Amiri Quran', Inter, system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; image-rendering: -webkit-optimize-contrast; padding: 36px 40px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid ${borderPrimary}; position: relative;">
      
      <!-- Page Header -->
      <div>
        ${headerHtml}
        <!-- Stacked Weekly Sections -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${weeksHtml}
        </div>
      </div>

      <!-- Page-Level Single Footer -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid ${borderPrimary}; padding-top: 14px; font-size: 10.5px; color: ${textSecondary}; margin-top: 20px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${showQr && assets.qrCode ? `<img src="${assets.qrCode}" alt="QR Code" width="38" height="38" style="width: 38px; height: 38px; border-radius: 4px; background-color: #ffffff; padding: 2px; box-sizing: border-box; flex-shrink: 0; display: block; border: 1px solid ${borderPrimary};" />` : ""}
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
 * Builds a dedicated, 4K multi-week standalone schedule card for an individual member.
 */
export function buildMemberPersonalScheduleHtml(
  member: MemberConfig,
  schedule: GeneratedSchedule,
  assets: ExportAssets,
  theme: "light" | "dark",
  isArabic: boolean = true
): string {
  const isDark = theme === "dark"
  const dir = isArabic ? "rtl" : "ltr"
  const logoSrc = isDark ? assets.wirddyLogoWhite : assets.wirddyLogoBlack
  const bg = isDark ? "#020617" : "#f8fafc"
  const cardBg = isDark ? "#0f172a" : "#ffffff"
  const textPrimary = isDark ? "#f8fafc" : "#0f172a"
  const textSecondary = isDark ? "#94a3b8" : "#475569"
  const borderPrimary = isDark
    ? "rgba(51, 65, 85, 0.6)"
    : "rgba(226, 232, 240, 0.8)"
  const accentColor = "#0d9488"

  const memberWeeks = schedule.weeks.map((week) => {
    const assignment =
      week.assignments.find(
        (a) =>
          a.memberPublicId === member.publicId ||
          a.memberId === member.id ||
          a.memberName === member.name
      ) || week.assignments[0]

    return {
      weekNumber: week.weekNumber,
      assignment,
      dateRange: week.dateRange,
    }
  })

  const weekRowsHtml = memberWeeks
    .map(({ weekNumber, assignment, dateRange }) => {
      const sSurah = isArabic
        ? assignment.startAyah.surahNameAr
        : assignment.startAyah.surahNameEn
      const eSurah = isArabic
        ? assignment.endAyah.surahNameAr
        : assignment.endAyah.surahNameEn
      const isSame =
        assignment.startAyah.surahNumber === assignment.endAyah.surahNumber
      const rangeText = isSame
        ? `${sSurah} (${formatArabicNumeral(assignment.startAyah.ayahNumber)} - ${formatArabicNumeral(assignment.endAyah.ayahNumber)})`
        : `${sSurah} (${formatArabicNumeral(assignment.startAyah.ayahNumber)}) ← ${eSurah} (${formatArabicNumeral(assignment.endAyah.ayahNumber)})`

      return `
        <div style="background-color: ${cardBg}; border: 1px solid ${borderPrimary}; border-radius: 14px; padding: 12px 16px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background-color: rgba(13, 148, 136, 0.15); color: ${accentColor}; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${formatArabicNumeral(weekNumber)}
            </div>
            <div style="min-width: 0;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 800; font-size: 13px; color: ${textPrimary}; white-space: nowrap;">
                  ${isArabic ? `الأسبوع ${formatArabicNumeral(weekNumber)}` : `Week ${weekNumber}`}
                </span>
                ${dateRange ? `<span style="font-size: 9.5px; font-weight: 600; padding: 1px 6px; border-radius: 4px; background-color: ${isDark ? "#1e293b" : "#e2e8f0"}; color: ${textSecondary};">${isArabic ? dateRange.formattedAr : dateRange.formattedEn}</span>` : ""}
              </div>
              <div style="font-size: ${isArabic ? "13px" : "11.5px"}; font-weight: 700; ${isArabic ? "font-family: Amiri, 'Amiri Quran', serif; font-feature-settings: 'liga' 1, 'calt' 1, 'locl' 1, 'mkmk' 1, 'mark' 1;" : ""} color: ${accentColor}; margin-top: 2px; white-space: nowrap;">
                ${rangeText}
              </div>
            </div>
          </div>

          <div style="text-align: ${isArabic ? "left" : "right"}; flex-shrink: 0;">
            <div style="font-size: 11px; font-weight: 800; color: ${textPrimary}; white-space: nowrap;">
              ${isArabic ? `من جزء ${formatArabicNumeral(assignment.startJuz)} إلى ${formatArabicNumeral(assignment.endJuz)}` : `Juz ${assignment.startJuz} to ${assignment.endJuz}`}
            </div>
            <div style="font-size: 9.5px; color: ${textSecondary}; margin-top: 1px;">
              ${formatArabicNumeral(assignment.weeklyAmount)} ${isArabic ? "أجزاء" : "Juz"}
            </div>
          </div>
        </div>
      `
    })
    .join("")

  return `
    <div dir="${dir}" style="width: 880px; min-width: 880px; max-width: 880px; background-color: ${bg}; color: ${textPrimary}; font-family: Cairo, Amiri, 'Amiri Quran', Inter, system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; image-rendering: -webkit-optimize-contrast; padding: 32px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; border: none; border-radius: 0; position: relative;">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid ${borderPrimary}; padding-bottom: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 16px; min-width: 0;">
          <img src="${logoSrc}" alt="Wirddy" width="130" height="36" style="flex-shrink: 0; width: 130px; height: 36px; object-fit: contain;" />
          <div style="min-width: 0;">
            <div style="display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; background-color: rgba(13, 148, 136, 0.15); color: ${accentColor};">
              ${isArabic ? "جدول القراءة الفردي" : "Personal Reading Plan"}
            </div>
            <div style="font-size: 20px; font-weight: 900; color: ${textPrimary}; margin-top: 2px;">${member.name}</div>
            <div style="font-size: 11px; color: ${textSecondary};">${schedule.title ? `${schedule.title} • ` : ""}${schedule.groupName}</div>
          </div>
        </div>

        <div style="flex-shrink: 0; text-align: ${isArabic ? "left" : "right"};">
          <div style="font-size: 12px; font-weight: 800; padding: 6px 12px; border-radius: 8px; background-color: ${cardBg}; border: 1px solid ${borderPrimary}; color: ${textPrimary};">
            ${isArabic ? `${formatArabicNumeral(member.weeklyAmount)} أجزاء / أسبوع` : `${member.weeklyAmount} Juz / week`}
          </div>
        </div>
      </div>

      <!-- Weekly rows list -->
      <div style="flex: 1; margin-bottom: 16px;">
        ${weekRowsHtml}
      </div>

      <!-- Footer -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid ${borderPrimary}; padding-top: 14px; font-size: 10.5px; color: ${textSecondary};">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${assets.qrCode ? `<img src="${assets.qrCode}" alt="QR" width="44" height="44" style="width: 44px; height: 44px; border-radius: 6px; background-color: #fff; padding: 2px; border: 1px solid ${borderPrimary};" />` : ""}
          <span>${isArabic ? "تم إنشاء هذا الجدول عبر تطبيق وِردي" : "Generated with Wirddy"}</span>
        </div>
        <span>${new Date().toLocaleDateString(isArabic ? "ar-SA" : "en-US")}</span>
      </div>
    </div>
  `
}

/**
 * Renders an individual member's multi-week schedule card to a 4K PNG Blob.
 */
export async function renderMemberPersonalSchedulePngBlob(
  member: MemberConfig,
  schedule: GeneratedSchedule,
  options?: ExportRenderOptions,
  customQrUrl?: string
): Promise<Blob> {
  const theme = options?.theme || "dark"
  const isArabic = options?.language === "ar"
  const pixelRatio = options?.pixelRatio || 4.0

  const [assets] = await Promise.all([
    preloadExportAssets(customQrUrl),
    ensureFontsReady(),
  ])

  // Mount the container off-canvas. We use position:absolute + left:-9999px
  // (NOT z-index:-9999, which hides from the compositor and returns blank blobs).
  const container = document.createElement("div")
  container.style.cssText = [
    "position:absolute",
    "left:-9999px",
    "top:0",
    "width:880px",
    "min-width:880px",
    "max-width:880px",
    "box-sizing:border-box",
    "pointer-events:none",
    "overflow:visible",
    "visibility:visible", // visible from the start so the browser lays it out
  ].join(";")

  container.innerHTML = buildMemberPersonalScheduleHtml(
    member,
    schedule,
    assets,
    theme,
    isArabic
  )
  document.body.appendChild(container)

  try {
    const targetElement = container.firstElementChild as HTMLElement
    if (!targetElement) {
      throw new Error("Failed to create member schedule DOM element.")
    }

    await waitForImagesToLoad(targetElement)

    // Double rAF guarantees the browser has completed a full layout + paint cycle.
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r()))
    )

    // Embed fonts as base64 so Chrome can render Cairo/Inter inside SVG foreignObject.
    // Chrome strips CSS custom properties (var(--font-arabic)) in that context.
    const fontEmbedCSS = await getEmbeddedFontCSS()

    // Measure the ACTUAL rendered size — clientWidth/clientHeight are unreliable
    // for off-canvas elements. getBoundingClientRect is layout-accurate.
    const rect = targetElement.getBoundingClientRect()
    const measuredWidth = Math.round(rect.width) || 880
    const measuredHeight = Math.round(rect.height) || 1200

    const blob = await toBlob(targetElement, {
      quality: 1.0,
      pixelRatio,
      width: measuredWidth,
      height: measuredHeight,
      fontEmbedCSS,
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

/**
 * Renders an ExportWeek deterministically to a verified PNG Blob without touching the active UI DOM.
 */
export async function renderWeekToPngBlob(
  week: ExportWeek,
  options?: ExportRenderOptions
): Promise<Blob> {
  const theme = options?.theme || week.theme || "dark"
  const viewMode = options?.view || week.view || "cards"
  const pixelRatio = options?.pixelRatio || 4.0
  const qrUrl = week.branding?.qrUrl

  const [assets] = await Promise.all([
    preloadExportAssets(qrUrl),
    ensureFontsReady(),
  ])

  // Mount off-canvas. visible from the start so the browser lays it out fully.
  const container = document.createElement("div")
  container.style.cssText = [
    "position:absolute",
    "left:-9999px",
    "top:0",
    "width:880px",
    "min-width:880px",
    "max-width:880px",
    "box-sizing:border-box",
    "pointer-events:none",
    "overflow:visible",
    "visibility:visible",
  ].join(";")

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

    // Double rAF guarantees browser completes full layout + paint before we measure.
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r()))
    )

    // Embed fonts as base64 so Chrome renders Cairo/Inter inside SVG foreignObject.
    const fontEmbedCSS = await getEmbeddedFontCSS()

    // Use getBoundingClientRect for layout-accurate dimensions.
    const rect = targetElement.getBoundingClientRect()
    const measuredWidth = Math.round(rect.width) || 880
    const measuredHeight = Math.round(rect.height) || 1200

    const blob = await toBlob(targetElement, {
      quality: 1.0,
      pixelRatio,
      width: measuredWidth,
      height: measuredHeight,
      fontEmbedCSS,
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
