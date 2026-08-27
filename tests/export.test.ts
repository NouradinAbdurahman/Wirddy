import { describe, expect, it, vi } from "vitest"
import {
  getExportFilename,
  getPdfExportFilename,
  getSafeDownloadFilename,
  getZipExportFilename,
  sanitizeFilename,
} from "../lib/export/filenames"
import {
  validatePdfBlob,
  validatePngBlob,
  validateZipBlob,
} from "../lib/export/validate-file"
import {
  getBlobFirstBytesHex,
  triggerBrowserDownload,
} from "../lib/export/download"
import {
  normalizeScheduleToExport,
  normalizeWeekSchedule,
} from "../lib/export/data"
import { paginateWeeksForA4 } from "../lib/export/render-pdf"
import {
  buildMemberCardHtml,
  buildPdfPageHtml,
  buildStandaloneWeekExportHtml,
  buildWeeklyCardsSectionHtml,
  buildWeeklyTableSectionHtml,
} from "../lib/export/render-week"
import { GeneratedSchedule } from "../lib/scheduler/types"
import { generateQuranSchedule } from "../lib/scheduler/engine"

describe("Export System: Filename Sanitization & Safe Download Filenames", () => {
  it("sanitizes forbidden OS characters in group names", () => {
    const raw = "عائلة/النور:2027*<test>|group?"
    const sanitized = sanitizeFilename(raw)
    expect(sanitized).not.toMatch(/[/\\:*?"<>|]/)
    expect(sanitized).toBe("عائلة-النور-2027-test-group")
  })

  it("formats Arabic week PNG filename correctly", () => {
    const filename = getExportFilename("عائلة النور", 1, "ar", ".png")
    expect(filename).toBe("Wirddy-عائلة-النور-الأسبوع-١.png")
  })

  it("formats English week PNG filename correctly", () => {
    const filename = getExportFilename("Al-Noor Family", 3, "en", ".png")
    expect(filename).toBe("Wirddy-Al-Noor-Family-Week-3.png")
  })

  it("formats ZIP archive filenames for Arabic and English", () => {
    const arZip = getZipExportFilename("ورد رمضان", "ar")
    const enZip = getZipExportFilename("Ramadan Circle", "en")
    expect(arZip).toBe("Wirddy-ورد-رمضان-جميع-الأسابيع.zip")
    expect(enZip).toBe("Wirddy-Ramadan-Circle-All-Weeks.zip")
  })

  it("formats PDF plan filenames for Arabic and English", () => {
    const arPdf = getPdfExportFilename("صحبة الخير", "ar")
    const enPdf = getPdfExportFilename("Friends Circle", "en")
    expect(arPdf).toBe("Wirddy-صحبة-الخير-الخطة-كاملة.pdf")
    expect(enPdf).toBe("Wirddy-Friends-Circle-Full-Plan.pdf")
  })

  it("generates cross-browser safe download filename without duplicate extensions", () => {
    const safePng = getSafeDownloadFilename(
      "Wirddy-عائلة-أحمد-الأسبوع-١.png",
      ".png"
    )
    expect(safePng).toBe("Wirddy-عائلة-أحمد-Week-1.png")
    expect(safePng.endsWith(".png")).toBe(true)
    expect(safePng).not.toContain(".png.png")

    const safePdf = getSafeDownloadFilename(
      "Wirddy-عائلة-الخير-الخطة-كاملة.pdf",
      ".pdf"
    )
    expect(safePdf).toBe("Wirddy-عائلة-الخير-Full-Plan.pdf")
    expect(safePdf.endsWith(".pdf")).toBe(true)

    const safeZip = getSafeDownloadFilename(
      "Wirddy-عائلة-الخير-جميع-الأسابيع.zip",
      ".zip"
    )
    expect(safeZip).toBe("Wirddy-عائلة-الخير-All-Weeks.zip")
    expect(safeZip.endsWith(".zip")).toBe(true)
  })

  it("handles empty or special character filenames gracefully", () => {
    const fallback = getSafeDownloadFilename("", ".png")
    expect(fallback).toBe("Wirddy-export.png")

    const sanitizedSpecial = getSafeDownloadFilename("///:::***???", ".pdf")
    expect(sanitizedSpecial).toBe("Wirddy-export.pdf")
  })
})

describe("Export System: Blob Magic Bytes & Download Helper", () => {
  it("extracts correct magic byte hexadecimal signatures", async () => {
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ])
    const pngBlob = new Blob([pngHeader], { type: "image/png" })
    const pngHex = await getBlobFirstBytesHex(pngBlob, 8)
    expect(pngHex).toBe("89504e470d0a1a0a")

    const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46])
    const pdfBlob = new Blob([pdfHeader], { type: "application/pdf" })
    const pdfHex = await getBlobFirstBytesHex(pdfBlob, 4)
    expect(pdfHex).toBe("25504446")

    const zipHeader = new Uint8Array([0x50, 0x4b, 0x03, 0x04])
    const zipBlob = new Blob([zipHeader], { type: "application/zip" })
    const zipHex = await getBlobFirstBytesHex(zipBlob, 4)
    expect(zipHex).toBe("504b0304")
  })

  it("triggerBrowserDownload rejects empty Blobs", async () => {
    const emptyBlob = new Blob([], { type: "image/png" })
    await expect(triggerBrowserDownload(emptyBlob, "test.png")).rejects.toThrow(
      "Blob is empty"
    )
  })

  it("triggerBrowserDownload performs download with anchor click and safe attributes", async () => {
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3,
    ])
    const testBlob = new Blob([pngBytes], { type: "image/png" })

    const mockAnchor = {
      style: {},
      href: "",
      download: "",
      rel: "",
      click: vi.fn(),
      dispatchEvent: vi.fn().mockReturnValue(true),
    }

    const mockDocument = {
      createElement: vi.fn().mockReturnValue(mockAnchor),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        contains: vi.fn().mockReturnValue(true),
      },
    }

    const originalCreateObjectURL = globalThis.URL.createObjectURL
    const originalRevokeObjectURL = globalThis.URL.revokeObjectURL
    const mockCreateObjectURL = vi
      .fn()
      .mockReturnValue("blob:http://localhost:3000/mock-uuid")
    const mockRevokeObjectURL = vi.fn()

    globalThis.URL.createObjectURL = mockCreateObjectURL
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL

    vi.stubGlobal("window", {})
    vi.stubGlobal("document", mockDocument)

    await triggerBrowserDownload(testBlob, "Wirddy-Week-1.png")

    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockDocument.createElement).toHaveBeenCalledWith("a")
    expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockAnchor)
    expect(mockAnchor.download).toBe("Wirddy-Week-1.png")
    expect(mockAnchor.click).toHaveBeenCalled()
    expect(mockDocument.body.removeChild).toHaveBeenCalledWith(mockAnchor)

    globalThis.URL.createObjectURL = originalCreateObjectURL
    globalThis.URL.revokeObjectURL = originalRevokeObjectURL
    vi.unstubAllGlobals()
  })
})

describe("Export System: Binary Signature Validation", () => {
  it("validates a real PNG binary signature (89 50 4E 47 0D 0A 1A 0A)", async () => {
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
    ])
    const validPngBlob = new Blob([pngHeader], { type: "image/png" })

    const result = await validatePngBlob(validPngBlob)
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it("rejects an invalid or corrupted PNG binary", async () => {
    const fakeData = new Uint8Array([
      0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77,
    ])
    const invalidBlob = new Blob([fakeData], { type: "image/png" })

    const result = await validatePngBlob(invalidBlob)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain("magic bytes signature check failed")
  })

  it("rejects empty PNG blob (0 bytes)", async () => {
    const emptyBlob = new Blob([], { type: "image/png" })
    const result = await validatePngBlob(emptyBlob)
    expect(result.isValid).toBe(false)
    expect(result.error).toContain("empty")
  })

  it("validates a real PDF binary signature (%PDF-)", async () => {
    const pdfHeader = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34,
    ]) // %PDF-1.4
    const validPdfBlob = new Blob([pdfHeader], { type: "application/pdf" })

    const result = await validatePdfBlob(validPdfBlob)
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it("rejects an invalid PDF binary", async () => {
    const fakeData = new Uint8Array([0x48, 0x54, 0x4d, 0x4c]) // HTML
    const invalidBlob = new Blob([fakeData], { type: "application/pdf" })

    const result = await validatePdfBlob(invalidBlob)
    expect(result.isValid).toBe(false)
  })

  it("validates a real ZIP binary signature (PK\x03\x04)", async () => {
    const zipHeader = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00])
    const validZipBlob = new Blob([zipHeader], { type: "application/zip" })

    const result = await validateZipBlob(validZipBlob)
    expect(result.isValid).toBe(true)
  })
})

describe("Export System: Member Card Layout & Typography", () => {
  it("renders unclipped member names without text-overflow ellipsis", () => {
    const mockMember = {
      id: "1",
      name: "عبدالرحمن إسماعيل أحمد آل عثمان",
      amountInJuz: 5,
      start: {
        juzNumber: 1,
        surahNumber: 1,
        surahNameArabic: "الفاتحة",
        surahNameEnglish: "Al-Fatihah",
        ayahNumber: 1,
      },
      end: {
        juzNumber: 5,
        surahNumber: 4,
        surahNameArabic: "النساء",
        surahNameEnglish: "An-Nisa",
        ayahNumber: 147,
      },
    }

    const cardHtml = buildMemberCardHtml(mockMember, true, true)
    expect(cardHtml).not.toContain("text-overflow: ellipsis")
    expect(cardHtml).toContain("عبدالرحمن إسماعيل أحمد آل عثمان")
    expect(cardHtml).toContain("البداية")
    expect(cardHtml).toContain("النهاية")
    expect(cardHtml).toContain("٥ أجزاء")
  })
})

describe("Export System: Table View Rendering & Theme Awareness", () => {
  it("renders premium table HTML with table columns and member data", () => {
    const scheduleInput = {
      group: { name: "عائلة الهدى", weeksCount: 2 },
      members: [
        {
          id: "1",
          name: "طارق",
          knowledgeType: "entire" as const,
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 10,
        },
        {
          id: "2",
          name: "زينب",
          knowledgeType: "entire" as const,
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 10,
        },
        {
          id: "3",
          name: "يوسف",
          knowledgeType: "entire" as const,
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 10,
        },
      ],
    }

    const schedule = generateQuranSchedule(scheduleInput)
    const exportWeek = normalizeWeekSchedule(
      schedule.weeks[0],
      2,
      schedule.groupName,
      "ar",
      "dark",
      "table"
    )

    const tableHtml = buildWeeklyTableSectionHtml(exportWeek, true, true)
    expect(tableHtml).toContain("<table")
    expect(tableHtml).toContain("العضو")
    expect(tableHtml).toContain("الورد")
    expect(tableHtml).toContain("البداية")
    expect(tableHtml).toContain("النهاية")
    expect(tableHtml).toContain("طارق")
  })

  it("renders standalone export with Light theme and correct logo when requested", () => {
    const scheduleInput = {
      group: { name: "Al-Huda Family", weeksCount: 1 },
      members: [
        {
          id: "1",
          name: "Tariq",
          knowledgeType: "entire" as const,
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 15,
        },
        {
          id: "2",
          name: "Zainab",
          knowledgeType: "entire" as const,
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 15,
        },
      ],
    }

    const schedule = generateQuranSchedule(scheduleInput)
    const exportWeek = normalizeWeekSchedule(
      schedule.weeks[0],
      1,
      schedule.groupName,
      "en",
      "light",
      "table"
    )

    const assets = {
      wirddyLogoBlack: "/wirddy-logo-black.png",
      wirddyLogoWhite: "/wirddy-logo-white.png",
      logoBlack: "/logo-black.png",
      logoWhite: "/logo-white.png",
    }

    const standaloneHtml = buildStandaloneWeekExportHtml(
      exportWeek,
      assets,
      "light",
      "table"
    )
    expect(standaloneHtml).toContain("/wirddy-logo-black.png")
    expect(standaloneHtml).toContain("#f8fafc") // Light bg
    expect(standaloneHtml).toContain("<table")
  })
})

describe("Export System: Dynamic Content-Aware A4 PDF Pagination", () => {
  it("packs a 5-week plan with 3 members into exactly 3 PDF pages (2 + 2 + 1)", () => {
    const scheduleInput = {
      group: { name: "عائلة النور", weeksCount: 5 },
      members: [
        {
          id: "1",
          name: "طارق",
          knowledgeType: "entire" as const,
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 10,
        },
        {
          id: "2",
          name: "زينب",
          knowledgeType: "entire" as const,
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 10,
        },
        {
          id: "3",
          name: "يوسف",
          knowledgeType: "entire" as const,
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 10,
        },
      ],
    }

    const schedule = generateQuranSchedule(scheduleInput)
    const exportSchedule = normalizeScheduleToExport(
      schedule,
      "ar",
      "dark",
      "cards"
    )

    const pages = paginateWeeksForA4(exportSchedule.weeks, "cards")
    expect(pages.length).toBe(3)
    expect(pages[0].length).toBe(2) // Weeks 1 & 2
    expect(pages[1].length).toBe(2) // Weeks 3 & 4
    expect(pages[2].length).toBe(1) // Week 5
  })

  it("packs a 2-week plan with 3 members into exactly 1 PDF page", () => {
    const scheduleInput = {
      group: { name: "عائلة النور", weeksCount: 2 },
      members: [
        {
          id: "1",
          name: "طارق",
          knowledgeType: "entire" as const,
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 10,
        },
        {
          id: "2",
          name: "زينب",
          knowledgeType: "entire" as const,
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 10,
        },
        {
          id: "3",
          name: "يوسف",
          knowledgeType: "entire" as const,
          startJuz: 1,
          endJuz: 30,
          weeklyAmount: 10,
        },
      ],
    }

    const schedule = generateQuranSchedule(scheduleInput)
    const exportSchedule = normalizeScheduleToExport(
      schedule,
      "ar",
      "dark",
      "cards"
    )

    const pages = paginateWeeksForA4(exportSchedule.weeks, "cards")
    expect(pages.length).toBe(1)
    expect(pages[0].length).toBe(2)
  })

  it("allocates 1 week per page for very large groups (e.g. 10 members per week) to guarantee readability", () => {
    const members = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      name: `عضو ${i + 1}`,
      knowledgeType: "entire" as const,
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 3,
    }))

    const scheduleInput = {
      group: { name: "مجموعة كبيرة", weeksCount: 3 },
      members,
    }

    const schedule = generateQuranSchedule(scheduleInput)
    const exportSchedule = normalizeScheduleToExport(
      schedule,
      "ar",
      "dark",
      "cards"
    )

    const pages = paginateWeeksForA4(exportSchedule.weeks, "cards")
    expect(pages.length).toBe(3)
    expect(pages[0].length).toBe(1) // Week 1 alone on page 1
    expect(pages[1].length).toBe(1) // Week 2 alone on page 2
    expect(pages[2].length).toBe(1) // Week 3 alone on page 3
  })

  describe("5-Week Schedule Combinations (8/8 Tested)", () => {
    const members = [
      {
        id: "1",
        name: "طارق",
        knowledgeType: "entire" as const,
        startJuz: 1,
        endJuz: 30,
        weeklyAmount: 10,
      },
      {
        id: "2",
        name: "زينب",
        knowledgeType: "entire" as const,
        startJuz: 1,
        endJuz: 30,
        weeklyAmount: 10,
      },
      {
        id: "3",
        name: "يوسف",
        knowledgeType: "entire" as const,
        startJuz: 1,
        endJuz: 30,
        weeklyAmount: 10,
      },
    ]

    const fiveWeekSchedule = generateQuranSchedule({
      group: { name: "عائلة الأمل", weeksCount: 5 },
      members,
    })

    const combinations = [
      {
        lang: "ar" as const,
        view: "cards" as const,
        theme: "light" as const,
        dir: "rtl",
      },
      {
        lang: "ar" as const,
        view: "cards" as const,
        theme: "dark" as const,
        dir: "rtl",
      },
      {
        lang: "ar" as const,
        view: "table" as const,
        theme: "light" as const,
        dir: "rtl",
      },
      {
        lang: "ar" as const,
        view: "table" as const,
        theme: "dark" as const,
        dir: "rtl",
      },
      {
        lang: "en" as const,
        view: "cards" as const,
        theme: "light" as const,
        dir: "ltr",
      },
      {
        lang: "en" as const,
        view: "cards" as const,
        theme: "dark" as const,
        dir: "ltr",
      },
      {
        lang: "en" as const,
        view: "table" as const,
        theme: "light" as const,
        dir: "ltr",
      },
      {
        lang: "en" as const,
        view: "table" as const,
        theme: "dark" as const,
        dir: "ltr",
      },
    ]

    combinations.forEach(({ lang, view, theme, dir }) => {
      it(`renders valid 5-week PDF pages for ${lang} + ${view} + ${theme}`, () => {
        const exportSchedule = normalizeScheduleToExport(
          fiveWeekSchedule,
          lang,
          theme,
          view
        )

        expect(exportSchedule.weeks.length).toBe(5)
        expect(exportSchedule.language).toBe(lang)
        expect(exportSchedule.theme).toBe(theme)
        expect(exportSchedule.direction).toBe(dir)

        const pageBatches = paginateWeeksForA4(exportSchedule.weeks, view)
        expect(pageBatches.length).toBeGreaterThan(0)

        // Flatten all weeks from batches and ensure all 5 weeks are preserved
        const totalWeeksInPages = pageBatches.reduce(
          (acc, batch) => acc + batch.length,
          0
        )
        expect(totalWeeksInPages).toBe(5)

        const dummyAssets = {
          wirddyLogoBlack: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
          wirddyLogoWhite: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
          logoBlack: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
          logoWhite: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
        }

        // Generate HTML for page 1 and verify content
        const page1Html = buildPdfPageHtml(
          pageBatches[0],
          exportSchedule,
          1,
          pageBatches.length,
          true,
          dummyAssets,
          theme,
          view
        )

        expect(page1Html).toContain(`dir="${dir}"`)
        if (theme === "dark") {
          expect(page1Html).toContain("#020617")
        } else {
          expect(page1Html).toContain("#f8fafc")
        }

        if (view === "table") {
          expect(page1Html).toContain("table")
        } else {
          expect(page1Html).toContain("grid-template-columns")
        }
      })
    })
  })
})
