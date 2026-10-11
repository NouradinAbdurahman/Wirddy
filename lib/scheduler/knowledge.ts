import { quranService } from "../quran/service"
import { MemberConfig } from "./types"

export const TOTAL_AYAHS = 6236

/** Inclusive global ayah interval (1 to 6236) that a member can read. */
export interface KnownAyahInterval {
  start: number
  end: number
}

/**
 * Returns the global ayah interval a member knows.
 *
 * - `entire` covers the whole Quran.
 * - `juz_range` covers the first ayah of `startJuz` to the last ayah of `endJuz`.
 * - `surah_range` covers the first ayah of `startSurah` to the last ayah of
 *   `endSurah`. Older saved members without Surah numbers fall back to their
 *   Juz bounds.
 */
export function getKnownAyahInterval(member: MemberConfig): KnownAyahInterval {
  if (member.knowledgeType === "surah_range" && member.startSurah && member.endSurah) {
    const s = Math.min(member.startSurah, member.endSurah)
    const e = Math.max(member.startSurah, member.endSurah)
    const lastSurah = quranService.getSurah(e)
    return {
      start: quranService.getGlobalAyahNumber(s, 1),
      end: quranService.getGlobalAyahNumber(e, lastSurah?.totalAyahs ?? 1),
    }
  }

  if (member.knowledgeType === "juz_range" || member.knowledgeType === "surah_range") {
    const s = Math.max(1, Math.min(30, member.startJuz || 1))
    const e = Math.max(s, Math.min(30, member.endJuz || 30))
    return {
      start: quranService.getJuzBoundary(s).start.globalAyahNumber,
      end: quranService.getJuzBoundary(e).end.globalAyahNumber,
    }
  }

  return { start: 1, end: TOTAL_AYAHS }
}

/**
 * Returns the Juz numbers a member fully knows, in order. A Juz counts only
 * when all of its ayahs fall inside the member's known interval.
 */
export function getFullyKnownJuz(member: MemberConfig): number[] {
  const known = getKnownAyahInterval(member)
  const out: number[] = []
  for (let j = 1; j <= 30; j++) {
    const b = quranService.getJuzBoundary(j)
    if (b.start.globalAyahNumber >= known.start && b.end.globalAyahNumber <= known.end) {
      out.push(j)
    }
  }
  return out
}
