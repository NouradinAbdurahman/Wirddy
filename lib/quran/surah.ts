import { fetchSurahs, fetchSurah } from "./api"
import { normalizeApiSurah } from "./normalize"
import { SurahInfo } from "./types"

/**
 * Fetches all 114 Surahs from the API and normalizes them.
 */
export async function fetchAllSurahs(): Promise<SurahInfo[]> {
  const rawSurahs = await fetchSurahs()
  return rawSurahs.map(normalizeApiSurah)
}

/**
 * Finds a Surah by its 1-indexed number.
 */
export function getSurahByNumber(
  surahs: SurahInfo[],
  number: number
): SurahInfo | undefined {
  return surahs.find((s) => s.number === number)
}

/**
 * Resolves a Surah number range to an approximate covering Juz range.
 */
export function mapSurahsToJuzRange(
  startSurahNumber: number,
  endSurahNumber: number,
  surahToJuzMap: Record<number, number>
): { startJuz: number; endJuz: number } {
  const startJuz = surahToJuzMap[startSurahNumber] || 1
  const endJuz = surahToJuzMap[endSurahNumber] || 30
  return {
    startJuz: Math.min(startJuz, endJuz),
    endJuz: Math.max(startJuz, endJuz),
  }
}
