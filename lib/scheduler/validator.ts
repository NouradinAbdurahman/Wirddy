import {
  GeneratedSchedule,
  MemberConfig,
  ScheduleInput,
  SchedulerValidationError,
  SchedulerValidationResult,
} from "./types"
import { quranService } from "../quran/service"
import { getFullyKnownJuz } from "./knowledge"

/** Returns the global ayah number, or null when the Surah/Ayah pair does not exist. */
function exactGlobalAyah(surah: number, ayah: number): number | null {
  if (!Number.isInteger(surah) || !Number.isInteger(ayah)) return null
  const info = quranService.getSurah(surah)
  if (!info || ayah < 1 || ayah > info.totalAyahs) return null
  return quranService.getGlobalAyahNumber(surah, ayah)
}

export function validateScheduleInput(
  input: ScheduleInput
): SchedulerValidationResult {
  const errors: SchedulerValidationError[] = []

  const groupName = input.group?.name?.trim() || ""
  if (!groupName) {
    errors.push({
      code: "EMPTY_GROUP_NAME",
      field: "groupName",
      messageAr: "يرجى إدخال اسم المجموعة.",
      messageEn: "Please enter a group name.",
    })
  } else if (groupName.length > 100) {
    errors.push({
      code: "GROUP_NAME_TOO_LONG",
      field: "groupName",
      messageAr: "اسم المجموعة يجب ألا يتجاوز ١٠٠ حرف.",
      messageEn: "Group name must not exceed 100 characters.",
    })
  }

  if (input.group?.title && input.group.title.trim().length > 200) {
    errors.push({
      code: "TITLE_TOO_LONG",
      field: "title",
      messageAr: "عنوان الجدول يجب ألا يتجاوز ٢٠٠ حرف.",
      messageEn: "Schedule title must not exceed 200 characters.",
    })
  }

  if (input.group?.description && input.group.description.trim().length > 500) {
    errors.push({
      code: "DESCRIPTION_TOO_LONG",
      field: "description",
      messageAr: "وصف الجدول يجب ألا يتجاوز ٥٠٠ حرف.",
      messageEn: "Schedule description must not exceed 500 characters.",
    })
  }

  if (input.group?.usesDates && input.group.startDate) {
    const isIso = /^\d{4}-\d{2}-\d{2}$/.test(input.group.startDate)
    if (!isIso) {
      errors.push({
        code: "INVALID_START_DATE",
        field: "startDate",
        messageAr: "تاريخ البداية المحدد غير صالح.",
        messageEn: "Selected start date is invalid.",
      })
    }
  }

  if (input.group?.occasionType === "ramadan" && input.group.islamicYear) {
    if (input.group.islamicYear < 1400 || input.group.islamicYear > 1600) {
      errors.push({
        code: "INVALID_ISLAMIC_YEAR",
        field: "islamicYear",
        messageAr: "السنة الهجرية المحددة غير صالحة.",
        messageEn: "Selected Islamic year is invalid.",
      })
    }
  }

  const weeksCount = input.group?.weeksCount
  if (!weeksCount || weeksCount < 1 || weeksCount > 52) {
    errors.push({
      code: "INVALID_WEEKS_COUNT",
      field: "weeksCount",
      messageAr: "يرجى اختيار عدد أسابيع بين ١ و ٥٢ أسبوعًا.",
      messageEn: "Please select a valid number of weeks between 1 and 52.",
    })
  }

  const rangeType = input.group?.rangeType || "full"

  // Custom Quran range validation
  let customRangeAyahs: number | null = null
  if (rangeType === "custom") {
    const cr = input.group?.customRange
    if (!cr) {
      errors.push({
        code: "MISSING_CUSTOM_RANGE",
        field: "customRange",
        messageAr: "يرجى تحديد بداية ونهاية نطاق القراءة المخصص.",
        messageEn: "Please specify start and end for custom Quran range.",
      })
    } else {
      const startGlobal = exactGlobalAyah(cr.startSurah, cr.startAyah)
      const endGlobal = exactGlobalAyah(cr.endSurah, cr.endAyah)
      if (startGlobal === null || endGlobal === null) {
        errors.push({
          code: "INVALID_CUSTOM_RANGE_SURAH",
          field: "customRange",
          messageAr: "أرقام السور أو الآيات في النطاق المخصص غير صالحة.",
          messageEn: "Invalid Surah or Ayah numbers in custom range.",
        })
      } else if (endGlobal < startGlobal) {
        errors.push({
          code: "CUSTOM_RANGE_REVERSED",
          field: "customRange",
          messageAr: "نهاية النطاق المخصص يجب أن تأتي بعد بدايته.",
          messageEn: "The custom range must end after it starts.",
        })
      } else {
        customRangeAyahs = endGlobal - startGlobal + 1
      }
    }
  }

  // Rotation style validation
  if (
    input.group?.rotationStyle &&
    !["large", "medium", "small", "random"].includes(input.group.rotationStyle)
  ) {
    errors.push({
      code: "INVALID_ROTATION_STYLE",
      field: "rotationStyle",
      messageAr: "طريقة التغيير المحددة غير صالحة.",
      messageEn: "Selected rotation style is invalid.",
    })
  }

  // Start Juz validation
  if (
    input.group?.startJuz !== undefined &&
    (input.group.startJuz < 1 || input.group.startJuz > 30)
  ) {
    errors.push({
      code: "INVALID_START_JUZ",
      field: "startJuz",
      messageAr: "بداية الورد يجب أن تكون بين الجزء ١ والجزء ٣٠.",
      messageEn: "Starting point must be between Juz 1 and Juz 30.",
    })
  }

  if (!input.members || input.members.length === 0) {
    errors.push({
      code: "NO_MEMBERS",
      field: "members",
      messageAr: "لم تتم إضافة أي عضو. أضف عضوًا واحدًا على الأقل.",
      messageEn: "No members added. Please add at least one member.",
    })
    return { isValid: errors.length === 0, errors }
  }

  let totalWeeklyAmount = 0
  const coveredJuz = new Set<number>()

  input.members.forEach((member, index) => {
    const memberName = member.name?.trim() || ""
    if (!memberName) {
      errors.push({
        code: "EMPTY_MEMBER_NAME",
        field: `members[${index}].name`,
        messageAr: `يرجى إدخال اسم العضو رقم ${index + 1}.`,
        messageEn: `Please enter a name for member #${index + 1}.`,
      })
    }

    if (!member.weeklyAmount || member.weeklyAmount < 1) {
      errors.push({
        code: "INVALID_MEMBER_AMOUNT",
        field: `members[${index}].weeklyAmount`,
        messageAr: `مقدار القراءة للعضو "${memberName || index + 1}" يجب أن يكون جزءًا واحدًا على الأقل.`,
        messageEn: `Weekly reading amount for member "${memberName || index + 1}" must be at least 1 Juz.`,
      })
    } else {
      totalWeeklyAmount += member.weeklyAmount
    }

    const startJuz = member.startJuz || 1
    const endJuz = member.endJuz || 30
    const hasSurahs =
      member.knowledgeType === "surah_range" && member.startSurah && member.endSurah

    if (
      startJuz < 1 ||
      startJuz > 30 ||
      endJuz < 1 ||
      endJuz > 30 ||
      startJuz > endJuz ||
      (hasSurahs &&
        (member.startSurah! < 1 ||
          member.endSurah! > 114 ||
          member.startSurah! > member.endSurah!))
    ) {
      errors.push({
        code: "INVALID_KNOWLEDGE_RANGE",
        field: `members[${index}].knowledge`,
        messageAr: `نطاق معرفة القرآن غير صالح للعضو "${memberName || index + 1}".`,
        messageEn: `Invalid Quran knowledge range for member "${memberName || index + 1}".`,
      })
    } else if (rangeType === "full") {
      const knownJuz = getFullyKnownJuz(member)
      knownJuz.forEach((j) => coveredJuz.add(j))
      if (knownJuz.length === 0) {
        errors.push({
          code: "NO_FULL_JUZ_KNOWN",
          field: `members[${index}].knowledge`,
          messageAr: `السور التي يحفظها العضو "${memberName || index + 1}" لا تغطي جزءًا كاملًا. اختر سورًا تشمل جزءًا كاملًا على الأقل أو استخدم نطاقًا مخصصًا.`,
          messageEn: `The Surahs "${memberName || index + 1}" knows do not cover a whole Juz. Pick Surahs that span at least one full Juz, or use a custom range.`,
        })
      } else if (member.weeklyAmount > knownJuz.length) {
        const knownSpan = knownJuz.length
        errors.push({
          code: "AMOUNT_EXCEEDS_KNOWLEDGE",
          field: `members[${index}].weeklyAmount`,
          messageAr: `مقدار القراءة المطلوب للعضو "${memberName || index + 1}" (${member.weeklyAmount} أجزاء) يتجاوز نطاق القرآن الذي حدده (${knownSpan} أجزاء).`,
          messageEn: `Requested reading amount for "${memberName || index + 1}" (${member.weeklyAmount} Juz) exceeds their known Quran range (${knownSpan} Juz).`,
        })
      }
    }
  })

  if (rangeType === "full" && totalWeeklyAmount !== 30) {
    errors.push({
      code: "TOTAL_NOT_30",
      field: "total",
      messageAr: `مجموع القراءة الأسبوعية هو ${totalWeeklyAmount} جزءًا. يجب أن يساوي المجموع ٣٠ جزءًا بالضبط في ختمة القرآن كاملًا.`,
      messageEn: `Weekly reading total is ${totalWeeklyAmount} Juz. It must equal exactly 30 Juz for Full Quran mode.`,
    })
  } else if (totalWeeklyAmount <= 0) {
    errors.push({
      code: "INVALID_TOTAL_AMOUNT",
      field: "total",
      messageAr: "يجب تحديد مقدار قراءة أسبوعي للأعضاء.",
      messageEn: "Weekly reading amount must be specified for members.",
    })
  }

  if (rangeType === "full" && errors.length === 0) {
    const missing: number[] = []
    for (let j = 1; j <= 30; j++) if (!coveredJuz.has(j)) missing.push(j)
    if (missing.length > 0) {
      errors.push({
        code: "JUZ_NOT_COVERED",
        field: "members",
        messageAr: `لا يوجد عضو يحفظ ${missing.length === 1 ? "الجزء" : "الأجزاء"} ${missing.join("، ")}. يجب أن يغطي الأعضاء جميع الأجزاء الثلاثين.`,
        messageEn: `No member knows Juz ${missing.join(", ")}. Members together must cover all 30 Juz.`,
      })
    }
  }

  if (rangeType === "custom" && customRangeAyahs !== null) {
    const minPerMember = input.group?.dailyDivisionEnabled ? 7 : 1
    if (customRangeAyahs < input.members.length * minPerMember) {
      errors.push({
        code: "CUSTOM_RANGE_TOO_SMALL",
        field: "customRange",
        messageAr: input.group?.dailyDivisionEnabled
          ? `النطاق المخصص (${customRangeAyahs} آية) صغير جدًا. مع التقسيم اليومي يحتاج كل عضو ٧ آيات على الأقل.`
          : `النطاق المخصص (${customRangeAyahs} آية) أصغر من عدد الأعضاء.`,
        messageEn: input.group?.dailyDivisionEnabled
          ? `The custom range (${customRangeAyahs} ayahs) is too small. With daily division each member needs at least 7 ayahs.`
          : `The custom range (${customRangeAyahs} ayahs) has fewer ayahs than there are members.`,
      })
    }
  }

  const warnings: SchedulerValidationError[] = []
  if (input.group?.occasionType === "ramadan" && weeksCount && weeksCount * 7 > 30) {
    const extraDays = weeksCount * 7 - 30
    warnings.push({
      code: "RAMADAN_EXCEEDS_MONTH",
      field: "weeksCount",
      messageAr: `رمضان ٢٩ أو ٣٠ يومًا، لذلك تمتد ${weeksCount} أسابيع نحو ${extraDays} أيام بعد نهاية الشهر. اختر ٤ أسابيع لتنتهي الخطة داخل رمضان.`,
      messageEn: `Ramadan has 29 or 30 days, so ${weeksCount} weeks run about ${extraDays} days past the end of the month. Choose 4 weeks to finish within Ramadan.`,
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validateGeneratedSchedule(
  schedule: GeneratedSchedule,
  input: ScheduleInput
): SchedulerValidationResult {
  const errors: SchedulerValidationError[] = []

  if (
    !schedule ||
    !schedule.weeks ||
    schedule.weeks.length !== input.group.weeksCount
  ) {
    errors.push({
      code: "INCORRECT_WEEKS_GENERATED",
      messageAr: `عدد الأسابيع المنشأة (${schedule?.weeks?.length || 0}) لا يطابق العدد المطلوب (${input.group.weeksCount}).`,
      messageEn: `Generated weeks count (${schedule?.weeks?.length || 0}) does not match requested count (${input.group.weeksCount}).`,
    })
  }

  const memberMap = new Map<string, MemberConfig>()
  input.members.forEach((m) => memberMap.set(m.id, m))

  schedule.weeks.forEach((week) => {
    let weekTotal = 0

    week.assignments.forEach((assignment) => {
      const member = memberMap.get(assignment.memberId)
      if (!member) {
        errors.push({
          code: "UNKNOWN_MEMBER_ASSIGNMENT",
          messageAr: `تم العثور على تعيين لعضو غير معروف: ${assignment.memberId}`,
          messageEn: `Found assignment for unknown member: ${assignment.memberId}`,
        })
        return
      }

      weekTotal += assignment.weeklyAmount
    })

    if (input.group.rangeType !== "custom" && weekTotal !== 30) {
      errors.push({
        code: "WEEK_TOTAL_NOT_30",
        messageAr: `مجموع الأسبوع ${week.weekNumber} هو ${weekTotal} جزءًا بدلاً من ٣٠ جزءًا.`,
        messageEn: `Week ${week.weekNumber} total is ${weekTotal} Juz instead of 30 Juz.`,
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}
