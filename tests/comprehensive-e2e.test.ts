import { describe, expect, it } from "vitest"
import { quranService } from "../lib/quran/service"
import { resolveCustomQuranRange } from "../lib/quran/resolver"
import { generateQuranSchedule } from "../lib/scheduler/engine"
import {
  CustomQuranRange,
  MemberConfig,
  RotationStyle,
  ScheduleInput,
} from "../lib/scheduler/types"
import {
  paginateWeeksForA4,
  estimateWeekHeight,
} from "../lib/export/render-pdf"
import {
  buildPdfPageHtml,
  buildStandaloneWeekExportHtml,
} from "../lib/export/render-week"
import {
  normalizeScheduleToExport,
  normalizeWeekSchedule,
} from "../lib/export/data"
import {
  generateEditToken,
  generatePublicId,
  hashEditToken,
  verifyEditToken,
} from "../lib/groups/crypto"

describe("1. Custom Quran Range Math & Partitioning", () => {
  const threeMembers: MemberConfig[] = [
    {
      id: "m1",
      name: "عضو ١",
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 10,
    },
    {
      id: "m2",
      name: "عضو ٢",
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 10,
    },
    {
      id: "m3",
      name: "عضو ٣",
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 10,
    },
  ]

  it("Test Range 1: Al-Baqarah 20 -> Al-Baqarah 100", () => {
    const range: CustomQuranRange = {
      startSurah: 2,
      startAyah: 20,
      endSurah: 2,
      endAyah: 100,
    }
    const resolved = resolveCustomQuranRange(
      range.startSurah,
      range.startAyah,
      range.endSurah,
      range.endAyah
    )
    expect(resolved.totalAyahs).toBe(81) // inclusive: 100 - 20 + 1 = 81

    const input: ScheduleInput = {
      group: {
        name: "مجموعة البقرة",
        weeksCount: 3,
        rangeType: "custom",
        customRange: range,
      },
      members: threeMembers,
    }

    const schedule = generateQuranSchedule(input)
    expect(schedule.weeks).toHaveLength(3)

    for (const week of schedule.weeks) {
      expect(week.assignments).toHaveLength(3)

      // First member must start at Al-Baqarah 20
      expect(week.assignments[0].startAyah.surahNumber).toBe(2)
      expect(week.assignments[0].startAyah.ayahNumber).toBe(20)

      // Last member must end at Al-Baqarah 100
      const last = week.assignments[week.assignments.length - 1]
      expect(last.endAyah.surahNumber).toBe(2)
      expect(last.endAyah.ayahNumber).toBe(100)

      // Verify continuity: no gaps, no overlaps
      for (let i = 0; i < week.assignments.length - 1; i++) {
        const curr = week.assignments[i]
        const next = week.assignments[i + 1]
        const currEndGlobal = curr.endAyah.globalAyahNumber!
        const nextStartGlobal = next.startAyah.globalAyahNumber!
        expect(nextStartGlobal).toBe(currEndGlobal + 1)
      }
    }
  })

  it("Test Range 2: Al-Baqarah 1 -> Al-Kahf 110", () => {
    const range: CustomQuranRange = {
      startSurah: 2,
      startAyah: 1,
      endSurah: 18,
      endAyah: 110,
    }
    const resolved = resolveCustomQuranRange(
      range.startSurah,
      range.startAyah,
      range.endSurah,
      range.endAyah
    )
    expect(resolved.totalAyahs).toBeGreaterThan(2000)

    const input: ScheduleInput = {
      group: {
        name: "البقرة إلى الكهف",
        weeksCount: 4,
        rangeType: "custom",
        customRange: range,
      },
      members: threeMembers,
    }

    const schedule = generateQuranSchedule(input)
    for (const week of schedule.weeks) {
      expect(week.assignments[0].startAyah.surahNumber).toBe(2)
      expect(week.assignments[0].startAyah.ayahNumber).toBe(1)
      const last = week.assignments[week.assignments.length - 1]
      expect(last.endAyah.surahNumber).toBe(18)
      expect(last.endAyah.ayahNumber).toBe(110)

      // Continuity check across entire span
      for (let i = 0; i < week.assignments.length - 1; i++) {
        expect(week.assignments[i + 1].startAyah.globalAyahNumber).toBe(
          week.assignments[i].endAyah.globalAyahNumber! + 1
        )
      }
    }
  })

  it("Test Range 3: Juz 15 -> Juz 20 exactly", () => {
    const juz15 = quranService.getJuzBoundary(15)!
    const juz20 = quranService.getJuzBoundary(20)!

    const range: CustomQuranRange = {
      startSurah: juz15.start.surahNumber,
      startAyah: juz15.start.ayahNumber,
      endSurah: juz20.end.surahNumber,
      endAyah: juz20.end.ayahNumber,
    }

    const input: ScheduleInput = {
      group: {
        name: "الأجزاء ١٥ إلى ٢٠",
        weeksCount: 2,
        rangeType: "custom",
        customRange: range,
      },
      members: threeMembers,
    }

    const schedule = generateQuranSchedule(input)
    for (const week of schedule.weeks) {
      expect(week.assignments[0].startAyah.surahNumber).toBe(
        juz15.start.surahNumber
      )
      expect(week.assignments[0].startAyah.ayahNumber).toBe(
        juz15.start.ayahNumber
      )
      const last = week.assignments[week.assignments.length - 1]
      expect(last.endAyah.surahNumber).toBe(juz20.end.surahNumber)
      expect(last.endAyah.ayahNumber).toBe(juz20.end.ayahNumber)
    }
  })

  it("Test Range 4: Mid-Juz Start and Mid-Juz End (e.g. Maryam 50 -> Ta-Ha 80)", () => {
    const range: CustomQuranRange = {
      startSurah: 19,
      startAyah: 50,
      endSurah: 20,
      endAyah: 80,
    }

    const input: ScheduleInput = {
      group: {
        name: "مريم وطه",
        weeksCount: 2,
        rangeType: "custom",
        customRange: range,
      },
      members: threeMembers,
    }

    const schedule = generateQuranSchedule(input)
    for (const week of schedule.weeks) {
      expect(week.assignments[0].startAyah.surahNumber).toBe(19)
      expect(week.assignments[0].startAyah.ayahNumber).toBe(50)
      const last = week.assignments[week.assignments.length - 1]
      expect(last.endAyah.surahNumber).toBe(20)
      expect(last.endAyah.ayahNumber).toBe(80)
      expect(last.endAyah.globalAyahNumber).toBeGreaterThan(
        week.assignments[0].startAyah.globalAyahNumber!
      )
    }
  })
})

describe("2. Custom Starting Point & Sequence Wrap-around", () => {
  const members: MemberConfig[] = [
    {
      id: "m1",
      name: "عضو ١",
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 15,
    },
    {
      id: "m2",
      name: "عضو ٢",
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 15,
    },
  ]

  it.each([1, 15, 26, 30])("Wraps correctly with startJuz = %i", (startJuz) => {
    const input: ScheduleInput = {
      group: {
        name: `خطة بداية جزء ${startJuz}`,
        weeksCount: 2,
        startJuz,
      },
      members,
    }

    const schedule = generateQuranSchedule(input)
    const week1 = schedule.weeks[0]

    // First member must start at startJuz
    expect(week1.assignments[0].startJuz).toBe(startJuz)

    // Check all 30 Juz covered in week 1 without duplicates
    const coveredJuz = new Set<number>()
    for (const a of week1.assignments) {
      let j = a.startJuz
      for (let count = 0; count < a.weeklyAmount; count++) {
        coveredJuz.add(j)
        j = j >= 30 ? 1 : j + 1
      }
    }
    expect(coveredJuz.size).toBe(30)
    for (let i = 1; i <= 30; i++) {
      expect(coveredJuz.has(i)).toBe(true)
    }
  })
})

describe("3. Rotation Quality: 4 Distinct Behavior Modes", () => {
  const members: MemberConfig[] = [
    {
      id: "m1",
      name: "أحمد",
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 6,
    },
    {
      id: "m2",
      name: "سارة",
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 6,
    },
    {
      id: "m3",
      name: "عمر",
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 6,
    },
    {
      id: "m4",
      name: "مريم",
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 6,
    },
    {
      id: "m5",
      name: "يوسف",
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 6,
    },
  ]

  const styles: RotationStyle[] = ["large", "medium", "small", "random"]

  it("Generates distinct assignment distributions for all 4 rotation modes", () => {
    const results = styles.map((style) => {
      const schedule = generateQuranSchedule({
        group: {
          name: "مجموعة التدوير",
          weeksCount: 4,
          rotationStyle: style,
        },
        members,
      })
      // Capture which member is assigned to which slot in Week 2
      return {
        style,
        week2MemberOrder: schedule.weeks[1].assignments
          .map((a) => a.memberId)
          .join(","),
      }
    })

    const sigLarge = results.find((r) => r.style === "large")!.week2MemberOrder
    const sigMedium = results.find(
      (r) => r.style === "medium"
    )!.week2MemberOrder
    const sigSmall = results.find((r) => r.style === "small")!.week2MemberOrder
    const sigRandom = results.find(
      (r) => r.style === "random"
    )!.week2MemberOrder

    expect(sigLarge).not.toBe(sigSmall)
    expect(sigLarge).not.toBe(sigMedium)
    expect(sigSmall).not.toBe(sigMedium)
    expect(sigRandom).toBeTruthy()
  })

  it("Random mode is deterministic (same seed -> identical schedule)", () => {
    const input: ScheduleInput = {
      group: {
        name: "ختمة محددة البذرة",
        weeksCount: 4,
        rotationStyle: "random",
      },
      members,
    }

    const run1 = generateQuranSchedule(input)
    const run2 = generateQuranSchedule(input)

    expect(run1.weeks[0].assignments).toEqual(run2.weeks[0].assignments)
    expect(run1.weeks[1].assignments).toEqual(run2.weeks[1].assignments)
    expect(run1.weeks[2].assignments).toEqual(run2.weeks[2].assignments)
    expect(run1.weeks[3].assignments).toEqual(run2.weeks[3].assignments)
  })
})

describe("4. PDF and HTML Export Quality & Arabic Verification", () => {
  const dummyAssets = {
    wirddyLogoBlack:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    wirddyLogoWhite:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    logoBlack:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    logoWhite:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    qrCode:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  }

  const baseInput: ScheduleInput = {
    group: { name: "ختمة العائلة", weeksCount: 2 },
    members: [
      {
        id: "m1",
        name: "طارق",
        knowledgeType: "entire",
        startJuz: 1,
        endJuz: 30,
        weeklyAmount: 15,
      },
      {
        id: "m2",
        name: "زينب",
        knowledgeType: "entire",
        startJuz: 1,
        endJuz: 30,
        weeklyAmount: 15,
      },
    ],
  }
  const schedule = generateQuranSchedule(baseInput)

  const combinations = [
    { lang: "ar", theme: "light", view: "cards" },
    { lang: "ar", theme: "dark", view: "cards" },
    { lang: "ar", theme: "light", view: "table" },
    { lang: "ar", theme: "dark", view: "table" },
    { lang: "en", theme: "light", view: "cards" },
    { lang: "en", theme: "dark", view: "cards" },
    { lang: "en", theme: "light", view: "table" },
    { lang: "en", theme: "dark", view: "table" },
  ] as const

  it.each(combinations)(
    "Generates valid PDF HTML for combination: %s",
    ({ lang, theme, view }) => {
      const expSchedule = normalizeScheduleToExport(
        schedule,
        lang,
        theme,
        view,
        {
          showLogo: true,
          showQr: true,
          showGroupName: true,
          showDate: true,
        }
      )

      const html = buildPdfPageHtml(
        expSchedule.weeks,
        expSchedule,
        1,
        1,
        true,
        dummyAssets,
        theme,
        view
      )

      expect(html).toContain('dir="' + (lang === "ar" ? "rtl" : "ltr") + '"')
      expect(html).not.toContain("undefined")
      expect(html).not.toContain("NaN")
      expect(html).toContain(dummyAssets.wirddyLogoBlack)
      expect(html).toContain(dummyAssets.qrCode)
    }
  )
})

describe("5. Automatic Dynamic PDF Pagination", () => {
  it.each([1, 2, 5, 10, 20])(
    "Correctly paginates %i weeks plan dynamically",
    (weeksCount) => {
      const input: ScheduleInput = {
        group: { name: "خطة تجربة", weeksCount },
        members: [
          {
            id: "m1",
            name: "عضو ١",
            knowledgeType: "entire",
            startJuz: 1,
            endJuz: 30,
            weeklyAmount: 10,
          },
          {
            id: "m2",
            name: "عضو ٢",
            knowledgeType: "entire",
            startJuz: 1,
            endJuz: 30,
            weeklyAmount: 10,
          },
          {
            id: "m3",
            name: "عضو ٣",
            knowledgeType: "entire",
            startJuz: 1,
            endJuz: 30,
            weeklyAmount: 10,
          },
        ],
      }
      const sched = generateQuranSchedule(input)
      const expSched = normalizeScheduleToExport(sched, "ar", "dark", "cards")
      const pages = paginateWeeksForA4(expSched.weeks, "cards")

      // Total weeks across all pages must equal weeksCount
      const totalWeeks = pages.reduce((acc, p) => acc + p.length, 0)
      expect(totalWeeks).toBe(weeksCount)
      expect(pages.length).toBeGreaterThan(0)
    }
  )
})

describe("6. Cryptographic Security & No-Auth Protection", () => {
  it("Generates random 14-char publicId and 32-byte editToken", () => {
    const id1 = generatePublicId(14)
    const id2 = generatePublicId(14)
    expect(id1).toHaveLength(14)
    expect(id2).toHaveLength(14)
    expect(id1).not.toBe(id2)

    const token1 = generateEditToken()
    const token2 = generateEditToken()
    expect(token1).toHaveLength(64)
    expect(token1).not.toBe(token2)
  })

  it("Correctly hashes and verifies secret edit tokens", () => {
    const rawToken = generateEditToken()
    const hash = hashEditToken(rawToken)

    expect(verifyEditToken(rawToken, hash)).toBe(true)
    expect(verifyEditToken("wrong-token", hash)).toBe(false)
  })
})
