import { describe, expect, it } from "vitest"
import {
  getExportFilename,
  getPdfExportFilename,
  getZipExportFilename,
  sanitizeFilename,
} from "../lib/export/filenames"
import {
  validatePdfBlob,
  validatePngBlob,
  validateZipBlob,
} from "../lib/export/validate-file"
import {
  normalizeScheduleToExport,
  normalizeWeekSchedule,
} from "../lib/export/data"
import { paginateWeeksForA4 } from "../lib/export/render-pdf"
import {
  buildMemberCardHtml,
  buildWeeklyTableSectionHtml,
  buildWeeklyCardsSectionHtml,
  buildStandaloneWeekExportHtml,
} from "../lib/export/render-week"
import { GeneratedSchedule } from "../lib/scheduler/types"
import { generateQuranSchedule } from "../lib/scheduler/engine"

describe("Export System: Filename Sanitization", () => {
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
})
