import { JUZ_BOUNDARIES, SURAHS, SURAH_TO_JUZ_MAP } from './data';
import { JuzBoundary, QuranLocation, SurahInfo } from './types';

/**
 * Unified Quran Data Service for Wirddy.
 * Operates offline-first using validated dataset derived from AlQuran Cloud API (OpenAPI spec),
 * ensuring instantaneous deterministic scheduling with zero network latency.
 */
class QuranDataService {
  private readonly juzBoundaries: JuzBoundary[];
  private readonly surahs: SurahInfo[];
  private readonly surahToJuzMap: Record<number, number>;

  constructor() {
    this.juzBoundaries = JUZ_BOUNDARIES;
    this.surahs = SURAHS;
    this.surahToJuzMap = SURAH_TO_JUZ_MAP;
  }

  /**
   * Returns all 30 validated Juz boundaries.
   */
  getAllJuzBoundaries(): JuzBoundary[] {
    return this.juzBoundaries;
  }

  /**
   * Returns a specific Juz boundary (1 to 30).
   */
  getJuzBoundary(juzNumber: number): JuzBoundary {
    const clamped = Math.max(1, Math.min(30, Math.floor(juzNumber)));
    return this.juzBoundaries[clamped - 1];
  }

  /**
   * Returns all 114 Surahs.
   */
  getAllSurahs(): SurahInfo[] {
    return this.surahs;
  }

  /**
   * Returns a Surah by its number (1 to 114).
   */
  getSurah(surahNumber: number): SurahInfo | undefined {
    return this.surahs.find((s) => s.number === surahNumber);
  }

  /**
   * Maps a Surah range to its covering Juz range by checking boundary overlaps.
   */
  mapSurahsToJuz(startSurah: number, endSurah: number): { startJuz: number; endJuz: number } {
    const minS = Math.min(startSurah, endSurah);
    const maxS = Math.max(startSurah, endSurah);

    let minJuz = 30;
    let maxJuz = 1;
    let found = false;

    for (const b of this.juzBoundaries) {
      const bStart = b.start.surahNumber;
      const bEnd = b.end.surahNumber;

      // Check if Juz boundary interval [bStart, bEnd] overlaps with [minS, maxS]
      if (bStart <= maxS && bEnd >= minS) {
        minJuz = Math.min(minJuz, b.juzNumber);
        maxJuz = Math.max(maxJuz, b.juzNumber);
        found = true;
      }
    }

    if (!found) {
      const sJuz = this.surahToJuzMap[minS] || 1;
      const eJuz = this.surahToJuzMap[maxS] || 30;
      return {
        startJuz: Math.min(sJuz, eJuz),
        endJuz: Math.max(sJuz, eJuz),
      };
    }

    return {
      startJuz: Math.max(1, Math.min(30, minJuz)),
      endJuz: Math.max(1, Math.min(30, maxJuz)),
    };
  }

  /**
   * Resolves a range of Juz numbers (e.g. 1 to 5) to exact start and end QuranLocation coordinates.
   */
  resolveJuzRange(startJuz: number, endJuz: number): { start: QuranLocation; end: QuranLocation } {
    const sJuz = Math.max(1, Math.min(30, Math.floor(startJuz)));
    const eJuz = Math.max(1, Math.min(30, Math.floor(endJuz)));

    const startBoundary = this.getJuzBoundary(sJuz);
    const endBoundary = this.getJuzBoundary(eJuz);

    return {
      start: startBoundary.start,
      end: endBoundary.end,
    };
  }

  /**
   * Formats a QuranLocation into a displayable string according to locale.
   */
  formatLocation(loc: QuranLocation, language: 'ar' | 'en'): string {
    const surahName = language === 'ar' ? loc.surahNameArabic : loc.surahNameEnglish;
    return `${surahName} ${loc.ayahNumber}`;
  }
}

export const quranService = new QuranDataService();
