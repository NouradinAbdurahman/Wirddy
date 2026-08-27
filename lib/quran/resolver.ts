import { quranService } from "./service"
import { QuranLocation } from "./types"

export interface AyahRef {
  surahNumber: number
  surahNameAr: string
  surahNameEn: string
  ayahNumber: number
  juzNumber: number
  globalAyahNumber?: number
}

export interface ExactQuranRange {
  startJuz: number
  endJuz: number
  startAyah: AyahRef
  endAyah: AyahRef
  startLocation: QuranLocation
  endLocation: QuranLocation
  totalJuz: number
  totalAyahs?: number
}

/**
 * Converts a QuranLocation to AyahRef.
 */
export function locationToAyahRef(loc: QuranLocation): AyahRef {
  return {
    surahNumber: loc.surahNumber,
    surahNameAr: loc.surahNameArabic,
    surahNameEn: loc.surahNameEnglish,
    ayahNumber: loc.ayahNumber,
    juzNumber: loc.juzNumber,
    globalAyahNumber: loc.globalAyahNumber,
  }
}

/**
 * Resolves a 1-based continuous Juz range [startJuz, endJuz] to exact Ayah references.
 */
export function resolveJuzRange(
  startJuz: number,
  endJuz: number
): ExactQuranRange {
  if (
    startJuz < 1 ||
    startJuz > 30 ||
    endJuz < 1 ||
    endJuz > 30 ||
    startJuz > endJuz
  ) {
    throw new Error(`Invalid Juz range: ${startJuz} to ${endJuz}`)
  }

  const { start, end } = quranService.resolveJuzRange(startJuz, endJuz)

  return {
    startJuz,
    endJuz,
    startAyah: locationToAyahRef(start),
    endAyah: locationToAyahRef(end),
    startLocation: start,
    endLocation: end,
    totalJuz: endJuz - startJuz + 1,
    totalAyahs: end.globalAyahNumber - start.globalAyahNumber + 1,
  }
}

/**
 * Resolves a custom Quran location range defined by start and end Surah & Ayah numbers.
 */
export function resolveCustomQuranRange(
  startSurah: number,
  startAyah: number,
  endSurah: number,
  endAyah: number
): ExactQuranRange {
  const startLoc = quranService.getLocationFromSurahAyah(startSurah, startAyah)
  const endLoc = quranService.getLocationFromSurahAyah(endSurah, endAyah)

  if (startLoc.globalAyahNumber > endLoc.globalAyahNumber) {
    throw new Error(
      `Invalid custom range: Start (${startSurah}:${startAyah}) is after End (${endSurah}:${endAyah})`
    )
  }

  const totalAyahs = endLoc.globalAyahNumber - startLoc.globalAyahNumber + 1
  const approximateJuz = Math.max(
    1,
    Math.round((totalAyahs / 6236) * 30 * 10) / 10
  )

  return {
    startJuz: startLoc.juzNumber,
    endJuz: endLoc.juzNumber,
    startAyah: locationToAyahRef(startLoc),
    endAyah: locationToAyahRef(endLoc),
    startLocation: startLoc,
    endLocation: endLoc,
    totalJuz: endLoc.juzNumber - startLoc.juzNumber + 1,
    totalAyahs,
  }
}

/**
 * Determines the spanning Juz range [minJuz, maxJuz] for a given Surah range [startSurah, endSurah].
 */
export function resolveSurahToJuzRange(
  startSurahNumber: number,
  endSurahNumber: number
): { startJuz: number; endJuz: number } {
  return quranService.mapSurahsToJuz(startSurahNumber, endSurahNumber)
}

/**
 * Formats an Ayah reference for UI display in Arabic or English.
 */
export function formatAyahReference(ref: AyahRef, lang: "ar" | "en"): string {
  if (lang === "ar") {
    return `سورة ${ref.surahNameAr}، الآية ${ref.ayahNumber}`
  }
  return `${ref.surahNameEn}, Ayah ${ref.ayahNumber}`
}
