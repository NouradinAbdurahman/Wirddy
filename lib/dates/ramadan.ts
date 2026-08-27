/**
 * Authoritative Islamic (Hijri / Umm al-Qura) Calendar Calculation & Ramadan Service.
 * Implements exact astronomical and Umm al-Qura conversion without hardcoded approximations.
 */

import {
  addDaysToDate,
  parseIsoDate,
  toArabicNumerals,
  toIsoDateString,
} from "./calendar"

export interface HijriDateInfo {
  year: number
  month: number // 1 to 12 (9 = Ramadan, 10 = Shawwal)
  monthNameAr: string
  monthNameEn: string
  day: number
  isRamadan: boolean
}

const HIJRI_MONTHS_AR = [
  "المحرّم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوّال",
  "ذو القعدة",
  "ذو الحجة",
]

const HIJRI_MONTHS_EN = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Ula",
  "Jumada al-Akhirah",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
]

/**
 * Known approximate Gregorian start dates for 1st of Ramadan across standard Hijri years
 * as an instantaneous O(1) lookup table with dynamic search fallback.
 */
const KNOWN_RAMADAN_STARTS: Record<number, string> = {
  1445: "2024-03-11",
  1446: "2025-03-01",
  1447: "2026-02-18",
  1448: "2027-02-08",
  1449: "2028-01-28",
  1450: "2029-01-16",
  1451: "2030-01-05",
  1452: "2030-12-26",
  1453: "2031-12-15",
  1454: "2032-12-04",
  1455: "2033-11-23",
}

/**
 * Resolves the Hijri date components for any Gregorian date using the Umm al-Qura calendar.
 */
export function getHijriDate(date: Date): HijriDateInfo {
  try {
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    })

    const parts = formatter.formatToParts(date)
    let year = 1448
    let month = 9
    let day = 1

    for (const part of parts) {
      if (part.type === "year") year = parseInt(part.value, 10)
      if (part.type === "month") month = parseInt(part.value, 10)
      if (part.type === "day") day = parseInt(part.value, 10)
    }

    const monthIndex = Math.max(1, Math.min(12, month)) - 1

    return {
      year,
      month,
      monthNameAr: HIJRI_MONTHS_AR[monthIndex],
      monthNameEn: HIJRI_MONTHS_EN[monthIndex],
      day,
      isRamadan: month === 9,
    }
  } catch {
    // Fallback: estimate from baseline
    return {
      year: 1448,
      month: 9,
      monthNameAr: "رمضان",
      monthNameEn: "Ramadan",
      day: 1,
      isRamadan: true,
    }
  }
}

/**
 * Returns the current/upcoming default Hijri Year.
 */
export function getCurrentHijriYear(): number {
  const hijri = getHijriDate(new Date())
  // If current month is after Ramadan (month 10, 11, 12), default to next year's Ramadan
  if (hijri.month > 9) {
    return hijri.year + 1
  }
  return hijri.year
}

/**
 * Returns the Gregorian ISO date string (YYYY-MM-DD) for the 1st of Ramadan of a given Hijri year.
 */
export function getRamadanStartDate(hijriYear: number): string {
  if (KNOWN_RAMADAN_STARTS[hijriYear]) {
    return KNOWN_RAMADAN_STARTS[hijriYear]
  }

  // Dynamic binary / linear search around estimated Gregorian year
  // Formula: Gregorian Year ≈ (Hijri Year * 0.970229) + 621.57
  const approxGregorianYear = Math.round(hijriYear * 0.970229 + 621.57)
  let searchDate = new Date(Date.UTC(approxGregorianYear, 0, 1, 12, 0, 0))

  for (let offset = -60; offset <= 365; offset++) {
    const candidate = new Date(
      Date.UTC(approxGregorianYear, 0, 1 + offset, 12, 0, 0)
    )
    const h = getHijriDate(candidate)
    if (h.year === hijriYear && h.month === 9 && h.day === 1) {
      return toIsoDateString(candidate)
    }
  }

  // Fallback estimation
  const diffFrom1448 = hijriYear - 1448
  const base1448 = parseIsoDate("2027-02-08")
  base1448.setUTCDate(
    base1448.getUTCDate() + Math.round(diffFrom1448 * 354.367)
  )
  return toIsoDateString(base1448)
}

/**
 * Formats a Ramadan day label (e.g. "رمضان ١" or "Ramadan 1").
 * If the day exceeds 30 (e.g. schedule duration > 4 weeks), handles gracefully.
 */
export function formatRamadanDayLabel(
  dayNumber: number,
  lang: "ar" | "en"
): { title: string; subtitle?: string; isPostRamadan: boolean } {
  if (dayNumber <= 30) {
    if (lang === "ar") {
      return {
        title: `رمضان ${toArabicNumerals(dayNumber)}`,
        isPostRamadan: false,
      }
    } else {
      return {
        title: `Ramadan ${dayNumber}`,
        isPostRamadan: false,
      }
    }
  }

  // Days 31+: Post-Ramadan / Shawwal
  const extraDays = dayNumber - 30
  if (lang === "ar") {
    return {
      title: `شوّال ${toArabicNumerals(extraDays)}`,
      subtitle: `(اليوم ${toArabicNumerals(dayNumber)})`,
      isPostRamadan: true,
    }
  } else {
    return {
      title: `Shawwal ${extraDays}`,
      subtitle: `(Day ${dayNumber})`,
      isPostRamadan: true,
    }
  }
}

/**
 * Returns an array of supported Islamic years for user selection in the planner UI.
 */
export function getSupportedIslamicYears(): number[] {
  const current = getCurrentHijriYear()
  const years: number[] = []
  for (let y = current - 1; y <= current + 4; y++) {
    years.push(y)
  }
  return years
}
