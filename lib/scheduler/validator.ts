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
  } else if (groupName.length > 60) {
    errors.push({
      code: "GROUP_NAME_TOO_LONG",
      field: "groupName",
      messageAr: "اسم المجموعة يجب ألا يتجاوز ٦٠ حرفًا.",
      messageEn: "Group name must not exceed 60 characters.",
    })
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
    } else {
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

  if (totalWeeklyAmount !== 30) {
    errors.push({
      code: "TOTAL_NOT_30",
      field: "total",
      messageAr: `مجموع القراءة الأسبوعية هو ${totalWeeklyAmount} جزءًا. يجب أن يساوي المجموع ٣٠ جزءًا بالضبط.`,
      messageEn: `Weekly reading total is ${totalWeeklyAmount} Juz. It must equal exactly 30 Juz.`,
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
    const coveredJuz = new Set<number>()
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

      const assignedSpan = assignment.endJuz - assignment.startJuz + 1
      if (assignedSpan !== member.weeklyAmount) {
        errors.push({
          code: "ASSIGNMENT_AMOUNT_MISMATCH",
          messageAr: `تم تعيين ${assignedSpan} جزءًا للعضو "${member.name}" بينما المطلوب هو ${member.weeklyAmount}.`,
          messageEn: `Assigned ${assignedSpan} Juz to member "${member.name}" but required was ${member.weeklyAmount}.`,
        })
      }

      // Check knowledge bounds
      if (
        assignment.startJuz < member.startJuz ||
        assignment.endJuz > member.endJuz
      ) {
        errors.push({
          code: "ASSIGNMENT_OUTSIDE_KNOWLEDGE",
          messageAr: `تم تعيين أجزاء (${assignment.startJuz} إلى ${assignment.endJuz}) للعضو "${member.name}" خارج نطاقه المحدد (${member.startJuz} إلى ${member.endJuz}).`,
          messageEn: `Assigned Juz (${assignment.startJuz} to ${assignment.endJuz}) to "${member.name}" outside their allowed range (${member.startJuz} to ${member.endJuz}).`,
        })
      }

      // Check ayah references
      if (
        !assignment.startAyah ||
        !assignment.endAyah ||
        !assignment.startAyah.surahNumber ||
        !assignment.endAyah.surahNumber
      ) {
        errors.push({
          code: "INVALID_AYAH_REFERENCES",
          messageAr: `بيانات الآيات غير مكتملة للعضو "${member.name}" في الأسبوع ${week.weekNumber}.`,
          messageEn: `Incomplete Ayah references for "${member.name}" in week ${week.weekNumber}.`,
        })
      }

      for (let j = assignment.startJuz; j <= assignment.endJuz; j++) {
        if (coveredJuz.has(j)) {
          errors.push({
            code: "DUPLICATE_JUZ_COVERAGE",
            messageAr: `الجزء ${j} مكرر في الأسبوع ${week.weekNumber}.`,
            messageEn: `Juz ${j} is duplicated in week ${week.weekNumber}.`,
          })
        }
        coveredJuz.add(j)
      }

      weekTotal += assignedSpan
    })

    if (weekTotal !== 30 || coveredJuz.size !== 30) {
      errors.push({
        code: "WEEK_INCOMPLETE_COVERAGE",
        messageAr: `الأسبوع ${week.weekNumber} لا يغطي القرآن كاملًا (٣٠ جزءًا). الأجزاء المغطاة: ${coveredJuz.size}.`,
        messageEn: `Week ${week.weekNumber} does not completely cover the Quran (30 Juz). Covered: ${coveredJuz.size}.`,
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}
