import {
  GeneratedSchedule,
  MemberConfig,
  ScheduleInput,
  SchedulerValidationError,
  SchedulerValidationResult,
} from "./types"

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
      if (
        cr.startSurah < 1 ||
        cr.startSurah > 114 ||
        cr.endSurah < 1 ||
        cr.endSurah > 114 ||
        cr.startAyah < 1 ||
        cr.endAyah < 1
      ) {
        errors.push({
          code: "INVALID_CUSTOM_RANGE_SURAH",
          field: "customRange",
          messageAr: "أرقام السور أو الآيات في النطاق المخصص غير صالحة.",
          messageEn: "Invalid Surah or Ayah numbers in custom range.",
        })
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

    if (
      startJuz < 1 ||
      startJuz > 30 ||
      endJuz < 1 ||
      endJuz > 30 ||
      startJuz > endJuz
    ) {
      errors.push({
        code: "INVALID_KNOWLEDGE_RANGE",
        field: `members[${index}].knowledge`,
        messageAr: `نطاق معرفة القرآن غير صالح للعضو "${memberName || index + 1}".`,
        messageEn: `Invalid Quran knowledge range for member "${memberName || index + 1}".`,
      })
    } else if (rangeType === "full") {
      const knownSpan = endJuz - startJuz + 1
      if (member.weeklyAmount > knownSpan) {
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

  return {
    isValid: errors.length === 0,
    errors,
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
