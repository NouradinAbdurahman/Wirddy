/**
 * AlQuran Cloud API Types & Wirddy Internal Quran Data Models
 * Based on OpenAPI Specification (yaml.yml) from https://api.alquran.cloud/v1
 */

// ==========================================
// 1. Raw OpenAPI API Response Schemas
// ==========================================

export interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}

export interface ApiSurahReference {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface ApiPartialSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface ApiAyah {
  number: number; // Global ayah number (1 to 6236)
  text: string;
  surah?: ApiPartialSurah;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface ApiJuzData {
  number: number;
  ayahs: ApiAyah[];
  surahs?: Record<string, ApiPartialSurah>;
  edition?: {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
  };
}

export interface ApiMetaReference {
  surah: number;
  ayah: number;
}

export interface ApiMetaResponseData {
  ayahs: {
    count: number;
  };
  surahs: {
    count: number;
    references: ApiSurahReference[];
  };
  sajdas?: {
    count: number;
    references: Array<{ surah: number; ayah: number; recommended: boolean; obligatory: boolean }>;
  };
  rukus?: {
    count: number;
    references: ApiMetaReference[];
  };
  pages?: {
    count: number;
    references: ApiMetaReference[];
  };
  manzils?: {
    count: number;
    references: ApiMetaReference[];
  };
  hizbQuarters?: {
    count: number;
    references: ApiMetaReference[];
  };
  juzs: {
    count: number;
    references: ApiMetaReference[];
  };
}

// ==========================================
// 2. Normalized Internal Quran Data Models
// ==========================================

export interface SurahInfo {
  number: number;
  nameAr: string;
  nameEn: string;
  transliteration: string;
  totalAyahs: number;
  revelationType?: string;
}

export interface QuranLocation {
  globalAyahNumber: number; // 1 to 6236
  juzNumber: number;        // 1 to 30
  surahNumber: number;      // 1 to 114
  surahNameArabic: string;  // e.g. "الفاتحة"
  surahNameEnglish: string; // e.g. "Al-Fatihah"
  ayahNumber: number;       // Ayah index within Surah (e.g. 1 to 286)
  page?: number;
  hizbQuarter?: number;
}

export interface JuzBoundary {
  juzNumber: number;
  start: QuranLocation;
  end: QuranLocation;
  totalAyahs: number;
}

export interface QuranAssignment {
  memberId: string;
  memberName: string;
  weeklyAmount: number;
  start: QuranLocation;
  end: QuranLocation;
}

export interface QuranValidationResult {
  isValid: boolean;
  errors: string[];
}
