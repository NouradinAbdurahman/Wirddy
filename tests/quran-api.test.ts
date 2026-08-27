import { describe, expect, it } from "vitest"
import { quranService } from "../lib/quran/service"
import { validateJuzBoundaries } from "../lib/quran/juz"
import {
  normalizeApiAyah,
  normalizeApiJuzData,
  normalizeApiSurah,
} from "../lib/quran/normalize"
import { resolveJuzRange, resolveSurahToJuzRange } from "../lib/quran/resolver"
import { ApiAyah, ApiJuzData, ApiSurahReference } from "../lib/quran/types"

describe("AlQuran Cloud API Integration & Quran Data Model", () => {
  it("loads all 30 verified Juz boundaries", () => {
    const boundaries = quranService.getAllJuzBoundaries()
    expect(boundaries).toHaveLength(30)

    for (let i = 0; i < 30; i++) {
      expect(boundaries[i].juzNumber).toBe(i + 1)
      expect(boundaries[i].start).toBeDefined()
      expect(boundaries[i].end).toBeDefined()
      expect(boundaries[i].start.globalAyahNumber).toBeLessThanOrEqual(
        boundaries[i].end.globalAyahNumber
      )
    }
  })

  it("validates sequential continuity of all 30 Juz with zero gaps and zero overlaps", () => {
    const boundaries = quranService.getAllJuzBoundaries()
    const result = validateJuzBoundaries(boundaries)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)

    // Continuous globalAyahNumber check
    for (let i = 1; i < 30; i++) {
      expect(boundaries[i].start.globalAyahNumber).toBe(
        boundaries[i - 1].end.globalAyahNumber + 1
      )
    }
  })

  it("starts at Al-Fatihah 1:1 (Global Ayah 1) and ends at An-Nas 114:6 (Global Ayah 6236)", () => {
    const juz1 = quranService.getJuzBoundary(1)
    const juz30 = quranService.getJuzBoundary(30)

    expect(juz1.start.globalAyahNumber).toBe(1)
    expect(juz1.start.surahNumber).toBe(1)
    expect(juz1.start.ayahNumber).toBe(1)

    expect(juz30.end.globalAyahNumber).toBe(6236)
    expect(juz30.end.surahNumber).toBe(114)
    expect(juz30.end.ayahNumber).toBe(6)
  })

  it("loads all 114 Surahs with Arabic and English names", () => {
    const surahs = quranService.getAllSurahs()
    expect(surahs).toHaveLength(114)

    const fatihah = surahs[0]
    expect(fatihah.number).toBe(1)
    expect(fatihah.totalAyahs).toBe(7)
    expect(fatihah.transliteration).toBe("Al-Faatiha")

    const baqarah = surahs[1]
    expect(baqarah.number).toBe(2)
    expect(baqarah.totalAyahs).toBe(286)

    const nas = surahs[113]
    expect(nas.number).toBe(114)
    expect(nas.totalAyahs).toBe(6)
  })

  it("normalizes OpenAPI ApiAyah correctly", () => {
    const mockAyah: ApiAyah = {
      number: 1,
      text: "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ",
      surah: {
        number: 1,
        name: "سُورَةُ ٱلْفَاتِحَةِ",
        englishName: "Al-Faatiha",
        englishNameTranslation: "The Opening",
        numberOfAyahs: 7,
        revelationType: "Meccan",
      },
      numberInSurah: 1,
      juz: 1,
      manzil: 1,
      page: 1,
      ruku: 1,
      hizbQuarter: 1,
      sajda: false,
    }

    const location = normalizeApiAyah(mockAyah)
    expect(location.globalAyahNumber).toBe(1)
    expect(location.surahNumber).toBe(1)
    expect(location.ayahNumber).toBe(1)
    expect(location.surahNameArabic).toBe("ٱلْفَاتِحَةِ")
    expect(location.surahNameEnglish).toBe("Al-Faatiha")
  })

  it("normalizes OpenAPI ApiSurahReference correctly", () => {
    const mockSurahRef: ApiSurahReference = {
      number: 112,
      name: "سُورَةُ الإِخۡلَاصِ",
      englishName: "Al-Ikhlaas",
      englishNameTranslation: "Sincerity",
      numberOfAyahs: 4,
      revelationType: "Meccan",
    }

    const surah = normalizeApiSurah(mockSurahRef)
    expect(surah.number).toBe(112)
    expect(surah.nameAr).toBe("الإِخۡلَاصِ")
    expect(surah.transliteration).toBe("Al-Ikhlaas")
    expect(surah.totalAyahs).toBe(4)
  })

  it("resolves multi-Juz ranges with exact boundary Ayahs", () => {
    const range1to5 = resolveJuzRange(1, 5)
    expect(range1to5.startJuz).toBe(1)
    expect(range1to5.endJuz).toBe(5)
    expect(range1to5.startAyah.surahNumber).toBe(1)
    expect(range1to5.startAyah.ayahNumber).toBe(1)
    expect(range1to5.endAyah.surahNumber).toBe(4)
    expect(range1to5.endAyah.ayahNumber).toBe(147) // Juz 5 ends at An-Nisa 147

    const range26to30 = resolveJuzRange(26, 30)
    expect(range26to30.startAyah.surahNumber).toBe(46) // Al-Ahqaf
    expect(range26to30.startAyah.ayahNumber).toBe(1)
    expect(range26to30.endAyah.surahNumber).toBe(114) // An-Nas
    expect(range26to30.endAyah.ayahNumber).toBe(6)
  })

  it("correctly maps Surah range to covering Juz range", () => {
    // Al-Fatihah (1) to Al-Baqarah (2) spans Juz 1 to 3
    const range = resolveSurahToJuzRange(1, 2)
    expect(range.startJuz).toBe(1)
    expect(range.endJuz).toBe(3)

    // Amma section: An-Naba (78) to An-Nas (114) is in Juz 30
    const ammaRange = resolveSurahToJuzRange(78, 114)
    expect(ammaRange.startJuz).toBe(30)
    expect(ammaRange.endJuz).toBe(30)
  })
})
