import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  canShareFiles,
  shareScheduleAsPdf,
  shareScheduleWeekAsPng,
} from "../lib/export/share"
import { ExportSchedule, ExportWeek } from "../lib/export/types"
import * as downloadModule from "../lib/export/download"
import * as renderPngModule from "../lib/export/render-png"
import * as renderPdfModule from "../lib/export/render-pdf"

describe("Schedule Share Functionality", () => {
  const sampleWeek: ExportWeek = {
    weekNumber: 3,
    totalWeeks: 4,
    groupName: "عائلة الفرح",
    language: "ar",
    direction: "rtl",
    theme: "dark",
    view: "cards",
    members: [
      {
        name: "طارق",
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
      },
    ],
  }

  const sampleSchedule: ExportSchedule = {
    groupName: "Family Circle",
    totalWeeks: 4,
    language: "en",
    direction: "ltr",
    theme: "light",
    view: "table",
    weeks: [sampleWeek],
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("canShareFiles returns false when navigator.share is unavailable", () => {
    vi.stubGlobal("navigator", {})
    expect(canShareFiles()).toBe(false)
  })

  it("shares PNG file via native Web Share when supported", async () => {
    const mockBlob = new Blob(["fake-png-data"], { type: "image/png" })
    vi.spyOn(renderPngModule, "renderWeekPngBlob").mockResolvedValue({
      blob: mockBlob,
      filename: "wirddy_عائلة_الفرح_week_3.png",
    })

    let sharedPayload: any = null
    vi.stubGlobal("navigator", {
      share: vi.fn().mockImplementation(async (payload) => {
        sharedPayload = payload
      }),
      canShare: vi.fn().mockReturnValue(true),
    })

    const result = await shareScheduleWeekAsPng(sampleWeek)

    expect(result.success).toBe(true)
    expect(result.method).toBe("native-share")
    expect(sharedPayload).not.toBeNull()
    expect(sharedPayload.title).toBe("وِردي - عائلة الفرح")
    expect(sharedPayload.text).toContain("عائلة الفرح")
    expect(sharedPayload.files).toBeDefined()
    expect(sharedPayload.files.length).toBe(1)
    expect(sharedPayload.files[0] instanceof File).toBe(true)
    expect(sharedPayload.files[0].type).toBe("image/png")
  })

  it("handles user cancellation (AbortError) without error or download fallback", async () => {
    const mockBlob = new Blob(["fake-png-data"], { type: "image/png" })
    vi.spyOn(renderPngModule, "renderWeekPngBlob").mockResolvedValue({
      blob: mockBlob,
      filename: "wirddy_test.png",
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

    const result = await shareScheduleWeekAsPng(sampleWeek)

    expect(result.success).toBe(false)
    expect(result.method).toBe("canceled")
    expect(downloadSpy).not.toHaveBeenCalled()
  })

  it("gracefully falls back to file download when Web Share is unsupported", async () => {
    const mockBlob = new Blob(["fake-png-data"], { type: "image/png" })
    vi.spyOn(renderPngModule, "renderWeekPngBlob").mockResolvedValue({
      blob: mockBlob,
      filename: "wirddy_fallback.png",
    })

    const downloadSpy = vi
      .spyOn(downloadModule, "triggerBrowserDownload")
      .mockImplementation(() => {})

    vi.stubGlobal("navigator", {
      share: undefined,
      canShare: undefined,
    })

    const result = await shareScheduleWeekAsPng(sampleWeek)

    expect(result.success).toBe(true)
    expect(result.method).toBe("fallback-download")
    expect(downloadSpy).toHaveBeenCalledWith(mockBlob, "wirddy_fallback.png")
  })

  it("shares PDF file with application/pdf type when supported", async () => {
    const mockPdfBlob = new Blob(["%PDF-fake"], { type: "application/pdf" })
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

    const result = await shareScheduleAsPdf(sampleSchedule)

    expect(result.success).toBe(true)
    expect(result.method).toBe("native-share")
    expect(sharedPayload.title).toBe("Wirddy - Family Circle")
    expect(sharedPayload.text).toContain("Complete Schedule")
    expect(sharedPayload.files[0].type).toBe("application/pdf")
  })
})
