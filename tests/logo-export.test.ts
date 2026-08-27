import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  clearEmbeddedLogoCache,
  getEmbeddedWirddyLogo,
  preloadExportAssets,
  validateEmbeddedLogoDataUrl,
} from "../lib/export/assets"
import {
  buildPdfPageHtml,
  buildStandaloneWeekExportHtml,
} from "../lib/export/render-week"
import { ExportSchedule, ExportWeek } from "../lib/export/types"

describe("Wirddy Embedded Logo & Deterministic Export Architecture", () => {
  const dummyBase64Black =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  const dummyBase64White =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="

  const sampleWeek: ExportWeek = {
    weekNumber: 1,
    totalWeeks: 4,
    groupName: "عائلة الأمل",
    language: "ar",
    direction: "rtl",
    theme: "dark",
    view: "cards",
    members: [
      {
        name: "طارق",
        amountInJuz: 10,
        start: {
          juzNumber: 1,
          surahNumber: 1,
          surahNameArabic: "الفاتحة",
          surahNameEnglish: "Al-Fatihah",
          ayahNumber: 1,
        },
        end: {
          juzNumber: 10,
          surahNumber: 9,
          surahNameArabic: "التوبة",
          surahNameEnglish: "At-Tawbah",
          ayahNumber: 92,
        },
      },
    ],
  }

  const sampleSchedule: ExportSchedule = {
    groupName: "عائلة الأمل",
    totalWeeks: 4,
    language: "ar",
    direction: "rtl",
    theme: "dark",
    view: "cards",
    weeks: [sampleWeek],
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    clearEmbeddedLogoCache()
  })

  describe("Embedded Logo Validation", () => {
    it("validates valid PNG base64 data URLs", () => {
      expect(validateEmbeddedLogoDataUrl(dummyBase64Black)).toBe(true)
      expect(validateEmbeddedLogoDataUrl(dummyBase64White)).toBe(true)
    })

    it("rejects invalid, relative, or empty image paths", () => {
      expect(validateEmbeddedLogoDataUrl("")).toBe(false)
      expect(validateEmbeddedLogoDataUrl("/wirddy-logo-black.png")).toBe(false)
      expect(validateEmbeddedLogoDataUrl("/wirddy-logo-white.png")).toBe(false)
      expect(validateEmbeddedLogoDataUrl("data:image/png;base64,short")).toBe(
        false
      )
      expect(
        validateEmbeddedLogoDataUrl("http://localhost:3000/logo.png")
      ).toBe(false)
    })
  })

  describe("Logo Loader & In-Memory Caching", () => {
    it("fetches, converts, validates and returns base64 logo for light theme", async () => {
      const mockBlob = new Blob(["fake-black-png-content"], {
        type: "image/png",
      })
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      } as any)

      // Mock FileReader
      class MockFileReader {
        result: string = dummyBase64Black
        onloadend: (() => void) | null = null
        readAsDataURL() {
          if (this.onloadend) this.onloadend()
        }
      }
      vi.stubGlobal("FileReader", MockFileReader)

      const logo = await getEmbeddedWirddyLogo("light")
      expect(logo).toBe(dummyBase64Black)
      expect(logo.startsWith("data:image/png;base64,")).toBe(true)
    })

    it("fetches and returns base64 logo for dark theme", async () => {
      const mockBlob = new Blob(["fake-white-png-content"], {
        type: "image/png",
      })
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      } as any)

      class MockFileReader {
        result: string = dummyBase64White
        onloadend: (() => void) | null = null
        readAsDataURL() {
          if (this.onloadend) this.onloadend()
        }
      }
      vi.stubGlobal("FileReader", MockFileReader)

      const logo = await getEmbeddedWirddyLogo("dark")
      expect(logo).toBe(dummyBase64White)
    })

    it("throws a clear user-facing error if logo fetch fails", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 404,
      } as any)

      // Ensure cache is not masking this test by forcing an error
      await expect(getEmbeddedWirddyLogo("light" as any)).rejects.toThrow(
        "Unable to load the Wirddy logo. Please try again."
      )
    })
  })

  describe("Pre-embedded Logo HTML Generation", () => {
    const assets = {
      wirddyLogoBlack: dummyBase64Black,
      wirddyLogoWhite: dummyBase64White,
      logoBlack: dummyBase64Black,
      logoWhite: dummyBase64White,
    }

    it("embeds dark base64 logo in dark Standalone Week PNG HTML and avoids external paths", () => {
      const html = buildStandaloneWeekExportHtml(
        sampleWeek,
        assets,
        "dark",
        "cards"
      )

      expect(html).toContain(dummyBase64White)
      expect(html).not.toContain('src="/wirddy-logo-white.png"')
      expect(html).not.toContain('src="/wirddy-logo-black.png"')
      expect(html).toContain('width="140" height="38"')
      expect(html).toContain(
        'style="flex-shrink: 0; width: 140px; height: 38px;'
      )
      expect(html).toContain(
        "width: 880px; min-width: 880px; max-width: 880px;"
      )
    })

    it("embeds black base64 logo in light Standalone Week PNG HTML and avoids external paths", () => {
      const html = buildStandaloneWeekExportHtml(
        sampleWeek,
        assets,
        "light",
        "cards"
      )

      expect(html).toContain(dummyBase64Black)
      expect(html).not.toContain('src="/wirddy-logo-white.png"')
      expect(html).not.toContain('src="/wirddy-logo-black.png"')
      expect(html).toContain('width="140" height="38"')
      expect(html).toContain(
        "width: 880px; min-width: 880px; max-width: 880px;"
      )
    })

    it("embeds dark base64 logo in dark PDF Page HTML with fixed A4 dimensions", () => {
      const html = buildPdfPageHtml(
        [sampleWeek],
        sampleSchedule,
        1,
        1,
        true,
        assets,
        "dark",
        "cards"
      )

      expect(html).toContain(dummyBase64White)
      expect(html).not.toContain('src="/wirddy-logo-white.png"')
      expect(html).not.toContain('src="/wirddy-logo-black.png"')
      expect(html).toContain('width="140" height="38"')
      expect(html).toContain(
        "width: 1000px; min-width: 1000px; max-width: 1000px; height: 1414px; min-height: 1414px;"
      )
    })

    it("embeds black base64 logo in light PDF Page HTML with fixed A4 dimensions", () => {
      const html = buildPdfPageHtml(
        [sampleWeek],
        sampleSchedule,
        1,
        1,
        true,
        assets,
        "light",
        "table"
      )

      expect(html).toContain(dummyBase64Black)
      expect(html).not.toContain('src="/wirddy-logo-white.png"')
      expect(html).not.toContain('src="/wirddy-logo-black.png"')
      expect(html).toContain('width="140" height="38"')
      expect(html).toContain(
        "width: 1000px; min-width: 1000px; max-width: 1000px; height: 1414px; min-height: 1414px;"
      )
    })
  })
})
