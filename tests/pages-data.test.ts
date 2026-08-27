import { describe, expect, it } from "vitest"
import {
  PAGE_START_AYAH_TABLE,
  SURAH_START_PAGES,
  JUZ_START_PAGES,
  getPageForSurahAyah,
  getSurahStartPage,
  getJuzStartPage,
} from "../lib/quran/pages-data"
import { quranService } from "../lib/quran/service"

describe("Canonical 604-Page Mushaf Boundaries & Mapping Suite", () => {
  it("contains exactly 604 verified Mushaf page boundaries", () => {
    expect(PAGE_START_AYAH_TABLE).toHaveLength(604)

    // Page 1 is Al-Fatihah 1:1
    expect(PAGE_START_AYAH_TABLE[0]).toEqual({ surah: 1, ayah: 1 })

    // Page 2 is Al-Baqarah 2:1
    expect(PAGE_START_AYAH_TABLE[1]).toEqual({ surah: 2, ayah: 1 })

    // Page 604 is Surah 112:1
    expect(PAGE_START_AYAH_TABLE[603]).toEqual({ surah: 112, ayah: 1 })
  })

  it("verifies sequential monotonicity of all 604 page starting references", () => {
    for (let i = 1; i < 604; i++) {
      const prev = PAGE_START_AYAH_TABLE[i - 1]
      const curr = PAGE_START_AYAH_TABLE[i]

      if (curr.surah === prev.surah) {
        expect(curr.ayah).toBeGreaterThan(prev.ayah)
      } else {
        expect(curr.surah).toBeGreaterThan(prev.surah)
      }
    }
  })

  it("maps key Quran coordinates to exact canonical Mushaf pages", () => {
    // Al-Fatihah 1:1 -> Page 1
    expect(getPageForSurahAyah(1, 1)).toBe(1)
    expect(getPageForSurahAyah(1, 7)).toBe(1)

    // Al-Baqarah 2:1 -> Page 2
    expect(getPageForSurahAyah(2, 1)).toBe(2)
    // Al-Baqarah 2:6 -> Page 3
    expect(getPageForSurahAyah(2, 6)).toBe(3)
    // Al-Baqarah 2:286 -> Page 49
    expect(getPageForSurahAyah(2, 286)).toBe(49)

    // Aal-i-Imran 3:1 -> Page 50
    expect(getPageForSurahAyah(3, 1)).toBe(50)

    // An-Nisa 4:48 -> Page 86
    expect(getPageForSurahAyah(4, 48)).toBe(86)

    // Al-Kahf 18:1 -> Page 293
    expect(getPageForSurahAyah(18, 1)).toBe(293)

    // An-Nas 114:6 -> Page 604
    expect(getPageForSurahAyah(114, 6)).toBe(604)
  })

  it("maps all 114 Surahs to valid start pages (1 to 604)", () => {
    for (let s = 1; s <= 114; s++) {
      const startPage = getSurahStartPage(s)
      expect(startPage).toBeGreaterThanOrEqual(1)
      expect(startPage).toBeLessThanOrEqual(604)
      if (s > 1) {
        expect(startPage).toBeGreaterThanOrEqual(getSurahStartPage(s - 1))
      }
    }

    expect(getSurahStartPage(1)).toBe(1)
    expect(getSurahStartPage(2)).toBe(2)
    expect(getSurahStartPage(3)).toBe(50)
    expect(getSurahStartPage(114)).toBe(604)
  })

  it("maps all 30 Juz to valid start pages matching canonical boundaries", () => {
    expect(getJuzStartPage(1)).toBe(1)
    expect(getJuzStartPage(2)).toBe(22)
    expect(getJuzStartPage(3)).toBe(42)
    expect(getJuzStartPage(4)).toBe(62)
    expect(getJuzStartPage(5)).toBe(82)
    expect(getJuzStartPage(13)).toBe(242)
    expect(getJuzStartPage(30)).toBe(582)

    for (let j = 1; j <= 30; j++) {
      expect(JUZ_START_PAGES[j]).toBeDefined()
      expect(JUZ_START_PAGES[j]).toBeGreaterThanOrEqual(1)
      expect(JUZ_START_PAGES[j]).toBeLessThanOrEqual(604)
    }
  })

  it("integrates seamlessly into QuranDataService", () => {
    expect(quranService.getPageForSurahAyah(1, 1)).toBe(1)
    expect(quranService.getSurahStartPage(18)).toBe(293)
    expect(quranService.getJuzStartPage(30)).toBe(582)

    const loc = quranService.getLocationFromSurahAyah(4, 48)
    expect(loc.page).toBe(86)
  })
})
