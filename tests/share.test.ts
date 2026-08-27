import { beforeEach, describe, expect, it, vi } from "vitest"
import { canShareFiles, shareScheduleAsPdf } from "../lib/export/share"
import { ExportSchedule, ExportWeek } from "../lib/export/types"
import * as downloadModule from "../lib/export/download"
import * as renderPdfModule from "../lib/export/render-pdf"

describe("Schedule Full Plan PDF Share", () => {
  const sampleArabicWeek: ExportWeek = {
    weekNumber: 1,
    totalWeeks: 5,
    groupName: "عائلة الفرح",
    language: "ar",
    direction: "rtl",
    theme: "dark",
    view: "cards",
    members: [
      {
        name: "طارق",
        amountInJuz: 6,
        start: {
          juzNumber: 1,
          surahNumber: 1,
          surahNameArabic: "الفاتحة",
          surahNameEnglish: "Al-Fatihah",
          ayahNumber: 1,
        },
        end: {
          juzNumber: 6,
          surahNumber: 4,
          surahNameArabic: "النساء",
          surahNameEnglish: "An-Nisa",
          ayahNumber: 147,
        },
      },
    ],
  }

  const sampleArabicSchedule: ExportSchedule = {
    groupName: "عائلة الفرح",
    totalWeeks: 5,
    language: "ar",
    direction: "rtl",
    theme: "dark",
    view: "cards",
    weeks: [sampleArabicWeek],
  }

  const sampleEnglishSchedule: ExportSchedule = {
    groupName: "Family Circle",
    totalWeeks: 5,
    language: "en",
    direction: "ltr",
    theme: "light",
    view: "table",
    weeks: [
      {
        ...sampleArabicWeek,
        language: "en",
        direction: "ltr",
        theme: "light",
        view: "table",
      },
    ],
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("canShareFiles returns false when navigator.share is unavailable", () => {
    vi.stubGlobal("navigator", {})
    expect(canShareFiles()).toBe(false)
  })

  it("shares English PDF file via native Web Share with correct title, text, and application/pdf type", async () => {
    const mockPdfBlob = new Blob(["%PDF-1.4-data"], { type: "application/pdf" })
    vi.spyOn(renderPdfModule, "renderSchedulePdfBlob").mockResolvedValue({
      blob: mockPdfBlob,
      filename: "wirddy_Family_Circle.pdf",
    })

    let sharedPayload: any = null
    vi.stubGlobal("navigator", {
      share: vi.fn().mockImplementation(async (payload) => {
        sharedPayload = payload
      }),
      canShare: vi.fn().mockReturnValue(true),
    })

    const result = await shareScheduleAsPdf(sampleEnglishSchedule)

    expect(result.success).toBe(true)
    expect(result.method).toBe("native-share")
    expect(sharedPayload).not.toBeNull()
    expect(sharedPayload.title).toBe("Wirddy - Family Circle")
    expect(sharedPayload.text).toBe("Family Circle - Full Quran Schedule")
    expect(sharedPayload.files).toBeDefined()
    expect(sharedPayload.files.length).toBe(1)
    expect(sharedPayload.files[0] instanceof File).toBe(true)
    expect(sharedPayload.files[0].type).toBe("application/pdf")
    expect(sharedPayload.files[0].name).toBe("wirddy_Family_Circle.pdf")
  })

  it("shares Arabic PDF file via native Web Share with correct Arabic title and text", async () => {
    const mockPdfBlob = new Blob(["%PDF-1.4-arabic"], {
      type: "application/pdf",
    })
    vi.spyOn(renderPdfModule, "renderSchedulePdfBlob").mockResolvedValue({
      blob: mockPdfBlob,
      filename: "wirddy_عائلة_الفرح.pdf",
    })

    let sharedPayload: any = null
    vi.stubGlobal("navigator", {
      share: vi.fn().mockImplementation(async (payload) => {
        sharedPayload = payload
      }),
      canShare: vi.fn().mockReturnValue(true),
    })

    const result = await shareScheduleAsPdf(sampleArabicSchedule)

    expect(result.success).toBe(true)
    expect(result.method).toBe("native-share")
    expect(sharedPayload.title).toBe("وردي - عائلة الفرح")
    expect(sharedPayload.text).toBe("الخطة الكاملة لورد القرآن - عائلة الفرح")
    expect(sharedPayload.files[0].type).toBe("application/pdf")
  })

  it("handles user cancellation (AbortError) gracefully without error or download fallback", async () => {
    const mockPdfBlob = new Blob(["%PDF-fake"], { type: "application/pdf" })
    vi.spyOn(renderPdfModule, "renderSchedulePdfBlob").mockResolvedValue({
      blob: mockPdfBlob,
      filename: "wirddy_test.pdf",
    })

    const downloadSpy = vi
      .spyOn(downloadModule, "triggerBrowserDownload")
      .mockImplementation(() => {})

    const abortError = new Error("User canceled share")
    abortError.name = "AbortError"

    vi.stubGlobal("navigator", {
      share: vi.fn().mockRejectedValue(abortError),
      canShare: vi.fn().mockReturnValue(true),
    })

    const result = await shareScheduleAsPdf(sampleEnglishSchedule)

    expect(result.success).toBe(false)
    expect(result.method).toBe("canceled")
    expect(downloadSpy).not.toHaveBeenCalled()
  })

  it("gracefully falls back to PDF file download when Web Share is unsupported", async () => {
    const mockPdfBlob = new Blob(["%PDF-fallback"], { type: "application/pdf" })
    vi.spyOn(renderPdfModule, "renderSchedulePdfBlob").mockResolvedValue({
      blob: mockPdfBlob,
      filename: "wirddy_fallback.pdf",
    })

    const downloadSpy = vi
      .spyOn(downloadModule, "triggerBrowserDownload")
      .mockImplementation(() => {})

    vi.stubGlobal("navigator", {
      share: undefined,
      canShare: undefined,
    })

    const result = await shareScheduleAsPdf(sampleEnglishSchedule)

    expect(result.success).toBe(true)
    expect(result.method).toBe("fallback-download")
    expect(downloadSpy).toHaveBeenCalledWith(mockPdfBlob, "wirddy_fallback.pdf")
  })
})
