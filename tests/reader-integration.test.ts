import { describe, expect, it } from "vitest"
import { quranService } from "../lib/quran/service"
import { searchQuran, normalizeArabic } from "../lib/quran/search"
import { translations } from "../lib/i18n/dictionary"

describe("Quran Reader & Navigation Integration Suite", () => {
  it("verifies dictionary keys exist for navigation, stats, and reader settings in ar and en", () => {
    const ar = translations.ar
    const en = translations.en

    // Navigation keys
    expect(ar.navDashboard).toBe("الرئيسية")
    expect(en.navDashboard).toBe("Dashboard")
    expect(ar.navQuranReader).toBe("المصحف الشريف")
    expect(en.navQuranReader).toBe("Quran Reader")
    expect(ar.navBookmarks).toBe("العلامات المحفوظة")
    expect(en.navBookmarks).toBe("Bookmarks")
    expect(ar.navSearch).toBe("البحث في المصحف")
    expect(en.navSearch).toBe("Quran Search")
    expect(ar.navGroupProgress).toBe("تقدم المجموعة")
    expect(en.navGroupProgress).toBe("Group Progress")
    expect(ar.navAnnouncements).toBe("الإعلانات والتنبيهات")
    expect(en.navAnnouncements).toBe("Announcements")
    expect(ar.navHistory).toBe("سجل التعديلات")
    expect(en.navHistory).toBe("Version History")
    expect(ar.navNotifications).toBe("الإشعارات")
    expect(en.navNotifications).toBe("Notifications")

    // Reader Settings keys
    expect(ar.readerFontAmiriQuran).toBeDefined()
    expect(en.readerFontAmiriQuran).toBeDefined()
    expect(ar.readerThemeDark).toBeDefined()
    expect(ar.readerThemeSepia).toBeDefined()
    expect(ar.readerThemeLight).toBeDefined()
    expect(ar.readerSurahList).toBeDefined()
    expect(ar.readerJuzNav).toBeDefined()
  })

  it("normalizes Arabic text correctly with diacritics and Alef variations removed", () => {
    const raw = "إِنَّ ٱلَّذِينَ ءَامَنُواْ وَعَمِلُواْ ٱلصَّـٰلِحَـٰتِ"
    const normalized = normalizeArabic(raw)

    expect(normalized).not.toContain("ٱ")
    expect(normalized).not.toContain("إ")
    expect(normalized).toContain("الذين")
    expect(normalized).toContain("امنوا")
  })

  it("retrieves surah metadata and validates all 114 surah boundaries", () => {
    for (let i = 1; i <= 114; i++) {
      const surah = quranService.getSurah(i)
      expect(surah).toBeDefined()
      expect(surah!.number).toBe(i)
      expect(surah!.nameAr.length).toBeGreaterThan(0)
      expect(surah!.totalAyahs).toBeGreaterThan(0)
      expect(["Meccan", "Medinan"]).toContain(surah!.revelationType)
    }
  })

  it("searches Quran by Surah name and coordinates", async () => {
    // Search by Surah Name
    const fatihaResults = await searchQuran("الفاتحة")
    expect(fatihaResults.length).toBeGreaterThan(0)
    expect(fatihaResults[0].surahNumber).toBe(1)

    // Search by coordinate
    const coordResults = await searchQuran("1:1")
    expect(coordResults.length).toBeGreaterThan(0)
    expect(coordResults[0].surahNumber).toBe(1)
    expect(coordResults[0].ayahNumber).toBe(1)
  })

  it("accurately resolves exact requested Ayah test locations and page coordinates", () => {
    const testCases = [
      { surah: 1, ayah: 1, expectedPage: 1, expectedJuz: 1 },
      { surah: 1, ayah: 7, expectedPage: 1, expectedJuz: 1 },
      { surah: 2, ayah: 1, expectedPage: 2, expectedJuz: 1 },
      { surah: 2, ayah: 17, expectedPage: 4, expectedJuz: 1 },
      { surah: 2, ayah: 286, expectedPage: 49, expectedJuz: 3 },
      { surah: 13, ayah: 1, expectedPage: 249, expectedJuz: 13 },
      { surah: 13, ayah: 43, expectedPage: 255, expectedJuz: 13 },
      { surah: 18, ayah: 1, expectedPage: 293, expectedJuz: 15 },
      { surah: 114, ayah: 6, expectedPage: 604, expectedJuz: 30 },
    ]

    for (const tc of testCases) {
      const loc = quranService.getLocationFromSurahAyah(tc.surah, tc.ayah)
      expect(loc.surahNumber).toBe(tc.surah)
      expect(loc.ayahNumber).toBe(tc.ayah)
      expect(loc.page).toBe(tc.expectedPage)
      expect(loc.juzNumber).toBe(tc.expectedJuz)
    }
  })

  it("handles seamless Ayah navigation across Surah and Page boundaries", () => {
    // 1. Al-Fatihah 1:7 (Page 1) -> Next Ayah is Al-Baqarah 2:1 (Page 2)
    const fatihaEnd = quranService.getLocationFromSurahAyah(1, 7)
    const baqarahStart = quranService.getLocationFromGlobalAyah(fatihaEnd.globalAyahNumber + 1)
    expect(baqarahStart.surahNumber).toBe(2)
    expect(baqarahStart.ayahNumber).toBe(1)
    expect(baqarahStart.page).toBe(2)

    // 2. Al-Baqarah 2:286 (Page 49) -> Next Ayah is Ali 'Imran 3:1 (Page 50)
    const baqarahEnd = quranService.getLocationFromSurahAyah(2, 286)
    const aliImranStart = quranService.getLocationFromGlobalAyah(baqarahEnd.globalAyahNumber + 1)
    expect(aliImranStart.surahNumber).toBe(3)
    expect(aliImranStart.ayahNumber).toBe(1)
    expect(aliImranStart.page).toBe(50)

    // 3. Ali 'Imran 3:1 -> Previous Ayah is Al-Baqarah 2:286
    const prevAyah = quranService.getLocationFromGlobalAyah(aliImranStart.globalAyahNumber - 1)
    expect(prevAyah.surahNumber).toBe(2)
    expect(prevAyah.ayahNumber).toBe(286)
    expect(prevAyah.page).toBe(49)
  })

  it("verifies Ayah Details study dialog dictionary keys in ar and en", () => {
    const ar = translations.ar
    const en = translations.en

    expect(ar.readerAyahDetails).toBe("دراسة وتفاصيل الآية")
    expect(en.readerAyahDetails).toBe("Ayah Details & Study")
    expect(ar.readerCopyArabic).toBe("نسخ النص القرآني")
    expect(en.readerCopyArabic).toBe("Copy Arabic Text")
    expect(ar.readerCopyTranslation).toBe("نسخ الترجمة")
    expect(en.readerCopyTranslation).toBe("Copy Translation")
    expect(ar.readerCopied).toBe("تم النسخ بنجاح")
    expect(en.readerCopied).toBe("Copied to clipboard")
    expect(ar.readerShareAyah).toBe("مشاركة الآية")
    expect(en.readerShareAyah).toBe("Share Ayah")
    expect(ar.readerBookmarkAyah).toBe("حفظ العلامة")
    expect(en.readerBookmarkAyah).toBe("Bookmark Ayah")
    expect(ar.readerTwoPageSpread).toBe("عرض صفحتين (مصحف مفتوح)")
    expect(en.readerTwoPageSpread).toBe("Two-Page Spread")
    expect(ar.readerSinglePage).toBe("عرض صفحة واحدة")
    expect(en.readerSinglePage).toBe("Single Page")
    expect(ar.readerAutoSpread).toBe("تلقائي حسب الشاشة")
    expect(en.readerAutoSpread).toBe("Auto Spread")
    expect(ar.readerToggleSidebar).toBe("طي / إظهار القائمة")
    expect(en.readerToggleSidebar).toBe("Toggle Sidebar")
  })

  it("calculates canonical two-page spread pairings accurately matching Madani Mushaf layout", () => {
    function getSpreadPages(page: number): { p1: number; p2: number | null } {
      if (page === 1) return { p1: 1, p2: 2 }
      const base = page % 2 === 0 ? page : page - 1
      const p1 = Math.max(1, base)
      const p2 = p1 + 1 <= 604 ? p1 + 1 : null
      return { p1, p2 }
    }

    // Page 1 opening spread -> [1, 2]
    expect(getSpreadPages(1)).toEqual({ p1: 1, p2: 2 })

    // Page 2 (even right page) -> [2, 3]
    expect(getSpreadPages(2)).toEqual({ p1: 2, p2: 3 })

    // Page 3 (odd left page) -> [2, 3]
    expect(getSpreadPages(3)).toEqual({ p1: 2, p2: 3 })

    // Page 498 -> [498, 499]
    expect(getSpreadPages(498)).toEqual({ p1: 498, p2: 499 })

    // Page 499 -> [498, 499]
    expect(getSpreadPages(499)).toEqual({ p1: 498, p2: 499 })

    // Page 603 -> [602, 603]
    expect(getSpreadPages(603)).toEqual({ p1: 602, p2: 603 })

    // Page 604 (last page) -> [604, null]
    expect(getSpreadPages(604)).toEqual({ p1: 604, p2: null })
  })
})
