import {
  ApiAyah,
  ApiJuzData,
  ApiSurahReference,
  JuzBoundary,
  QuranLocation,
  SurahInfo,
} from './types';

/**
 * Normalizes an Arabic Surah name by trimming prefixes like 'سُورَةُ ' or 'سورة ' if needed.
 */
export function normalizeSurahNameArabic(rawName: string): string {
  if (!rawName) return '';
  return rawName.replace(/^سُورَةُ\s+/i, '').replace(/^سورة\s+/i, '').trim();
}

/**
 * Normalizes an ApiAyah into a clean internal QuranLocation.
 */
export function normalizeApiAyah(
  ayah: ApiAyah,
  surahOverride?: { nameAr: string; nameEn: string }
): QuranLocation {
  const surahNumber = ayah.surah?.number || 1;
  const surahNameArabic =
    surahOverride?.nameAr ||
    normalizeSurahNameArabic(ayah.surah?.name || '');
  const surahNameEnglish =
    surahOverride?.nameEn ||
    ayah.surah?.englishName ||
    '';

  return {
    globalAyahNumber: ayah.number,
    juzNumber: ayah.juz,
    surahNumber,
    surahNameArabic,
    surahNameEnglish,
    ayahNumber: ayah.numberInSurah,
    page: ayah.page,
    hizbQuarter: ayah.hizbQuarter,
  };
}

/**
 * Normalizes an ApiSurahReference into a clean SurahInfo.
 */
export function normalizeApiSurah(surah: ApiSurahReference): SurahInfo {
  return {
    number: surah.number,
    nameAr: normalizeSurahNameArabic(surah.name),
    nameEn: surah.englishNameTranslation || surah.englishName,
    transliteration: surah.englishName,
    totalAyahs: surah.numberOfAyahs,
    revelationType: surah.revelationType,
  };
}

/**
 * Normalizes a full ApiJuzData into a JuzBoundary by determining the exact first and last Ayah.
 */
export function normalizeApiJuzData(juzData: ApiJuzData): JuzBoundary {
  const ayahs = juzData.ayahs;
  if (!ayahs || ayahs.length === 0) {
    throw new Error(`Juz ${juzData.number} data contains no Ayahs.`);
  }

  const firstAyah = ayahs[0];
  const lastAyah = ayahs[ayahs.length - 1];

  return {
    juzNumber: juzData.number,
    start: normalizeApiAyah(firstAyah),
    end: normalizeApiAyah(lastAyah),
    totalAyahs: ayahs.length,
  };
}
