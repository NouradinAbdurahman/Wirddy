import { quranService } from './service';
import { QuranLocation } from './types';

export interface AyahRef {
  surahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  ayahNumber: number;
  juzNumber: number;
  globalAyahNumber?: number;
}

export interface ExactQuranRange {
  startJuz: number;
  endJuz: number;
  startAyah: AyahRef;
  endAyah: AyahRef;
  startLocation: QuranLocation;
  endLocation: QuranLocation;
  totalJuz: number;
}

/**
 * Resolves a 1-based continuous Juz range [startJuz, endJuz] to exact Ayah references.
 */
export function resolveJuzRange(startJuz: number, endJuz: number): ExactQuranRange {
  if (startJuz < 1 || startJuz > 30 || endJuz < 1 || endJuz > 30 || startJuz > endJuz) {
    throw new Error(`Invalid Juz range: ${startJuz} to ${endJuz}`);
  }

  const { start, end } = quranService.resolveJuzRange(startJuz, endJuz);

  const startAyah: AyahRef = {
    surahNumber: start.surahNumber,
    surahNameAr: start.surahNameArabic,
    surahNameEn: start.surahNameEnglish,
    ayahNumber: start.ayahNumber,
    juzNumber: start.juzNumber,
    globalAyahNumber: start.globalAyahNumber,
  };

  const endAyah: AyahRef = {
    surahNumber: end.surahNumber,
    surahNameAr: end.surahNameArabic,
    surahNameEn: end.surahNameEnglish,
    ayahNumber: end.ayahNumber,
    juzNumber: end.juzNumber,
    globalAyahNumber: end.globalAyahNumber,
  };

  return {
    startJuz,
    endJuz,
    startAyah,
    endAyah,
    startLocation: start,
    endLocation: end,
    totalJuz: endJuz - startJuz + 1,
  };
}

/**
 * Determines the spanning Juz range [minJuz, maxJuz] for a given Surah range [startSurah, endSurah].
 */
export function resolveSurahToJuzRange(
  startSurahNumber: number,
  endSurahNumber: number
): { startJuz: number; endJuz: number } {
  return quranService.mapSurahsToJuz(startSurahNumber, endSurahNumber);
}

/**
 * Formats an Ayah reference for UI display in Arabic or English.
 */
export function formatAyahReference(ref: AyahRef, lang: 'ar' | 'en'): string {
  if (lang === 'ar') {
    return `سورة ${ref.surahNameAr}، الآية ${ref.ayahNumber}`;
  }
  return `${ref.surahNameEn}, Ayah ${ref.ayahNumber}`;
}
