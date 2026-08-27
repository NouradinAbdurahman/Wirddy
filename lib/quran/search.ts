import { SURAHS } from "./data"
import { fetchSurah } from "./api"
import { quranService } from "./service"

export interface QuranSearchResult {
  surahNumber: number
  surahNameAr: string
  surahNameEn: string
  ayahNumber: number
  juzNumber: number
  text: string
  highlightSnippet?: string
}

/**
 * Normalizes Arabic text for flexible, diacritic-insensitive search matching.
 */
export function normalizeArabic(text: string): string {
  if (!text) return ""
  return text
    .replace(/\u0670/g, "ا") // Convert dagger alif to standard alif
    .replace(/[\u064B-\u065F\u06D6-\u06ED]/g, "") // Strip tashkeel & Quranic marks
    .replace(/[إأآٱ]/g, "ا") // Normalize alif variations
    .replace(/[ىيئ]/g, "ي") // Normalize yaa variations
    .replace(/ة/g, "ه") // Normalize taa marbuta
    .replace(/ؤ/g, "و") // Normalize waw with hamza
    .replace(/ـ/g, "") // Strip tatweel
    .replace(/ا{2,}/g, "ا") // Normalize multiple consecutive alifs
    .replace(/[^\w\s\u0600-\u06FF]/g, "") // Keep words and Arabic letters
    .trim()
    .toLowerCase()
}

// In-memory cache for loaded Surah texts
const surahCache = new Map<number, Array<{ number: number; text: string }>>()

/**
 * Pre-fetches and caches Surah text for instant searching.
 */
export async function getOrLoadSurahText(
  surahNumber: number
): Promise<Array<{ number: number; text: string }>> {
  if (surahCache.has(surahNumber)) {
    return surahCache.get(surahNumber)!
  }

  try {
    const data = await fetchSurah(surahNumber)
    const ayahs = data.ayahs.map((a) => ({
      number: a.numberInSurah,
      text: a.text,
    }))
    surahCache.set(surahNumber, ayahs)
    return ayahs
  } catch {
    return []
  }
}

/**
 * Searches across the Quran for matching Surahs, Ayahs, or keywords.
 */
export async function searchQuran(
  query: string,
  limit: number = 30
): Promise<QuranSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const normQuery = normalizeArabic(trimmed)
  const results: QuranSearchResult[] = []

  // 1. Check for Surah Name / Number pattern (e.g. "البقرة", "2", "2:255", "الفاتحة 2")
  const matchColon = trimmed.match(/^(\d{1,3}):(\d{1,3})$/)
  if (matchColon) {
    const sNum = parseInt(matchColon[1], 10)
    const aNum = parseInt(matchColon[2], 10)
    const sInfo = SURAHS.find((s) => s.number === sNum)
    if (sInfo && aNum <= sInfo.totalAyahs) {
      const globalAyah = quranService.getGlobalAyahNumber(sNum, aNum)
      const loc = quranService.getLocationFromGlobalAyah(globalAyah)
      return [
        {
          surahNumber: sNum,
          surahNameAr: sInfo.nameAr,
          surahNameEn: sInfo.transliteration || sInfo.nameEn,
          ayahNumber: aNum,
          juzNumber: loc.juzNumber || 1,
          text: `سورة ${sInfo.nameAr} - الآية ${aNum}`,
        },
      ]
    }
  }

  // 2. Surah name matching
  for (const s of SURAHS) {
    const normNameAr = normalizeArabic(s.nameAr)
    const normNameEn = s.nameEn.toLowerCase()
    const normTrans = (s.transliteration || "").toLowerCase()

    if (
      normNameAr.includes(normQuery) ||
      normNameEn.includes(normQuery.toLowerCase()) ||
      normTrans.includes(normQuery.toLowerCase())
    ) {
      const globalAyah = quranService.getGlobalAyahNumber(s.number, 1)
      const loc = quranService.getLocationFromGlobalAyah(globalAyah)
      results.push({
        surahNumber: s.number,
        surahNameAr: s.nameAr,
        surahNameEn: s.transliteration || s.nameEn,
        ayahNumber: 1,
        juzNumber: loc.juzNumber || 1,
        text: `سورة ${s.nameAr} (${s.totalAyahs} آية)`,
      })
      if (results.length >= limit) return results
    }
  }

  // 3. Search text in core/popular Surahs and cached Surahs
  const searchSurahs = [1, 2, 3, 18, 36, 55, 56, 67, 112, 113, 114]
  for (const sNum of searchSurahs) {
    const ayahs = await getOrLoadSurahText(sNum)
    const sInfo = SURAHS.find((s) => s.number === sNum)
    if (!sInfo) continue

    for (const a of ayahs) {
      const normAyahText = normalizeArabic(a.text)
      if (normAyahText.includes(normQuery)) {
        const globalAyah = quranService.getGlobalAyahNumber(sNum, a.number)
        const loc = quranService.getLocationFromGlobalAyah(globalAyah)

        results.push({
          surahNumber: sNum,
          surahNameAr: sInfo.nameAr,
          surahNameEn: sInfo.transliteration || sInfo.nameEn,
          ayahNumber: a.number,
          juzNumber: loc.juzNumber || 1,
          text: a.text,
          highlightSnippet: a.text,
        })

        if (results.length >= limit) return results
      }
    }
  }

  return results
}
