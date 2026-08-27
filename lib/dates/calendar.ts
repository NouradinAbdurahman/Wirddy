/**
 * Timezone-Safe Calendar & Date Mathematics for Wirddy Schedules.
 * All operations work strictly on ISO date strings (YYYY-MM-DD) or UTC timestamps
 * to prevent browser timezone offsets from shifting calendar days.
 */

export interface WeekDateRange {
  weekNumber: number
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  formattedAr: string // e.g. "١ سبتمبر → ٧ سبتمبر"
  formattedEn: string // e.g. "Sep 1 → Sep 7"
  fullFormattedAr: string // e.g. "١ سبتمبر ٢٠٢٦ إلى ٧ سبتمبر ٢٠٢٦"
  fullFormattedEn: string // e.g. "September 1, 2026 to September 7, 2026"
}

export interface DayDateInfo {
  dayIndex: number // 1 to 7
  dateStr: string // YYYY-MM-DD
  formattedAr: string // e.g. "١ سبتمبر"
  formattedEn: string // e.g. "Sep 1"
  dayNameAr: string // e.g. "السبت"
  dayNameEn: string // e.g. "Saturday"
}

/**
 * Converts Western Arabic digits (0-9) to Eastern Arabic-Indic numerals (٠-٩).
 */
export function toArabicNumerals(num: number | string): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
  return String(num).replace(/[0-9]/g, (d) => arabicDigits[Number(d)])
}

/**
 * Parses a YYYY-MM-DD string into a safe UTC Date object.
 */
export function parseIsoDate(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number)
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return new Date()
  }
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0))
}

/**
 * Formats a Date object into an ISO YYYY-MM-DD string.
 */
export function toIsoDateString(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Adds N days to an ISO date string in a timezone-safe UTC manner.
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const d = parseIsoDate(dateStr)
  d.setUTCDate(d.getUTCDate() + days)
  return toIsoDateString(d)
}

const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
]

const ENGLISH_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const ENGLISH_MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const ARABIC_WEEKDAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
]

const ENGLISH_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

/**
 * Formats a single date in Arabic (e.g. "١ سبتمبر ٢٠٢٦" or "١ سبتمبر").
 */
export function formatSingleDateAr(dateStr: string, includeYear = false): string {
  const d = parseIsoDate(dateStr)
  const day = toArabicNumerals(d.getUTCDate())
  const month = ARABIC_MONTHS[d.getUTCMonth()]
  const year = toArabicNumerals(d.getUTCFullYear())
  return includeYear ? `${day} ${month} ${year}` : `${day} ${month}`
}

/**
 * Formats a single date in English (e.g. "September 1, 2026" or "Sep 1").
 */
export function formatSingleDateEn(dateStr: string, includeYear = false): string {
  const d = parseIsoDate(dateStr)
  const day = d.getUTCDate()
  const monthShort = ENGLISH_MONTHS_SHORT[d.getUTCMonth()]
  const monthFull = ENGLISH_MONTHS_FULL[d.getUTCMonth()]
  const year = d.getUTCFullYear()
  return includeYear ? `${monthFull} ${day}, ${year}` : `${monthShort} ${day}`
}

/**
 * Formats a date range compactly (e.g. "١ سبتمبر → ٧ سبتمبر" / "Sep 1 → Sep 7").
 */
export function formatCompactRange(
  startIso: string,
  endIso: string,
  lang: "ar" | "en"
): string {
  if (lang === "ar") {
    const s = formatSingleDateAr(startIso, false)
    const e = formatSingleDateAr(endIso, false)
    return `${s} ← ${e}`
  } else {
    const s = formatSingleDateEn(startIso, false)
    const e = formatSingleDateEn(endIso, false)
    return `${s} → ${e}`
  }
}

/**
 * Calculates date ranges for all weeks of a schedule.
 * Week 1: Day 0 to Day 6 (7 days inclusive)
 * Week 2: Day 7 to Day 13
 */
export function calculateWeekDateRanges(
  startDateStr: string,
  totalWeeks: number
): WeekDateRange[] {
  const ranges: WeekDateRange[] = []

  for (let w = 1; w <= totalWeeks; w++) {
    const startOffset = (w - 1) * 7
    const endOffset = startOffset + 6

    const weekStart = addDaysToDate(startDateStr, startOffset)
    const weekEnd = addDaysToDate(startDateStr, endOffset)

    const formattedAr = `${formatSingleDateAr(weekStart, false)} ← ${formatSingleDateAr(weekEnd, false)}`
    const formattedEn = `${formatSingleDateEn(weekStart, false)} → ${formatSingleDateEn(weekEnd, false)}`
    const fullFormattedAr = `${formatSingleDateAr(weekStart, true)} إلى ${formatSingleDateAr(weekEnd, true)}`
    const fullFormattedEn = `${formatSingleDateEn(weekStart, true)} to ${formatSingleDateEn(weekEnd, true)}`

    ranges.push({
      weekNumber: w,
      startDate: weekStart,
      endDate: weekEnd,
      formattedAr,
      formattedEn,
      fullFormattedAr,
      fullFormattedEn,
    })
  }

  return ranges
}

/**
 * Calculates the 7 daily dates for a given week.
 */
export function calculateDailyDates(weekStartDateStr: string): DayDateInfo[] {
  const days: DayDateInfo[] = []

  for (let d = 0; d < 7; d++) {
    const dayIso = addDaysToDate(weekStartDateStr, d)
    const dateObj = parseIsoDate(dayIso)
    const dayOfWeek = dateObj.getUTCDay()

    days.push({
      dayIndex: d + 1,
      dateStr: dayIso,
      formattedAr: formatSingleDateAr(dayIso, false),
      formattedEn: formatSingleDateEn(dayIso, false),
      dayNameAr: ARABIC_WEEKDAYS[dayOfWeek],
      dayNameEn: ENGLISH_WEEKDAYS[dayOfWeek],
    })
  }

  return days
}
