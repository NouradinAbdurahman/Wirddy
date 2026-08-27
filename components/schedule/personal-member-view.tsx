"use client"

import React, { useEffect, useState } from "react"
import QRCode from "qrcode"
import {
  IconArrowLeft,
  IconArrowRight,
  IconBook,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconDownload,
  IconFileTypePdf,
  IconMoon,
  IconPhoto,
  IconQrcode,
  IconShare,
  IconSparkles,
  IconUserCheck,
  IconUsersGroup,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import {
  CustomQuranRange,
  DailyPortion,
  GeneratedSchedule,
  MemberAssignment,
  MemberConfig,
  OccasionType,
  RotationStyle,
} from "@/lib/scheduler/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toArabicNumerals } from "@/lib/dates/calendar"
import { QuranReader } from "@/components/reader/quran-reader"
import {
  linkMemberAccountAction,
  saveReadingProgressAction,
} from "@/lib/groups/actions"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface PersonalMemberViewProps {
  groupPublicId?: string
  groupName: string
  title?: string
  description?: string
  member: MemberConfig
  allMembers: MemberConfig[]
  schedule: GeneratedSchedule
  onSelectMember: (memberId: string) => void
  onBackToGroup: () => void
  onExportPng?: () => void
  onExportPdf?: () => void
}

export function PersonalMemberView({
  groupPublicId,
  groupName,
  title,
  description,
  member,
  allMembers,
  schedule,
  onSelectMember,
  onBackToGroup,
  onExportPng,
  onExportPdf,
}: PersonalMemberViewProps) {
  const { language, dir, t } = useI18n()
  const [showQr, setShowQr] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    1: true,
  })
  const [activePortion, setActivePortion] = useState<DailyPortion | null>(null)
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>(
    {}
  )
  const [isLinked, setIsLinked] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [linkToast, setLinkToast] = useState(false)

  const BackArrowIcon = dir === "rtl" ? IconArrowRight : IconArrowLeft

  const memberPublicId = member.publicId || member.id
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://wirddy.app"
  const memberPersonalUrl = groupPublicId
    ? `${origin}/g/${groupPublicId}/member/${memberPublicId}`
    : ""

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsLinked(true)
        }
      })
    }
  }, [])

  const handleLinkAccount = async () => {
    if (!groupPublicId || isLinking) return
    setIsLinking(true)
    try {
      const res = await linkMemberAccountAction(groupPublicId, memberPublicId)
      if (res.success) {
        setIsLinked(true)
        setLinkToast(true)
        setTimeout(() => setLinkToast(false), 3000)
      }
    } finally {
      setIsLinking(false)
    }
  }

  const handleToggleDayComplete = async (
    weekNum: number,
    dayIdx: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    const key = `${weekNum}-${dayIdx}`
    const nextState = !completedDays[key]
    setCompletedDays((prev) => ({ ...prev, [key]: nextState }))

    if (groupPublicId) {
      await saveReadingProgressAction(
        groupPublicId,
        memberPublicId,
        weekNum,
        dayIdx,
        nextState
      )
    }
  }

  useEffect(() => {
    if (memberPersonalUrl) {
      QRCode.toDataURL(memberPersonalUrl, {
        margin: 1,
        width: 200,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error generating personal QR:", err))
    }
  }, [memberPersonalUrl])

  const handleCopyLink = () => {
    if (!memberPersonalUrl) return
    navigator.clipboard.writeText(memberPersonalUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const toggleWeekExpand = (weekNum: number) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekNum]: !prev[weekNum],
    }))
  }

  // Get assignments across all weeks for this member
  const memberWeeks = schedule.weeks.map((week) => {
    const assignment =
      week.assignments.find(
        (a) =>
          a.memberPublicId === member.publicId ||
          a.memberId === member.id ||
          a.memberName === member.name
      ) || week.assignments[0]

    return {
      weekNumber: week.weekNumber,
      assignment,
      dateRange: week.dateRange,
    }
  })

  return (
    <div className="space-y-6">
      {/* Top Bar: Member Switcher & Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={onBackToGroup}
          className="h-10 gap-2 self-start rounded-xl border-border/80 text-xs font-bold text-foreground hover:bg-muted"
        >
          <BackArrowIcon className="h-4 w-4" />
          <span>{t.returnToGroupView}</span>
        </Button>

        {/* Member Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {t.selectYourName}:
          </span>
          <select
            value={member.id}
            onChange={(e) => onSelectMember(e.target.value)}
            className="h-10 rounded-xl border border-border/80 bg-card px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {allMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (
                {language === "ar"
                  ? toArabicNumerals(m.weeklyAmount)
                  : m.weeklyAmount}{" "}
                {t.juzUnit})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Member Hero Card */}
      <Card className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/90 p-6 text-start shadow-md backdrop-blur-md">
        <div className="pointer-events-none absolute end-0 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1 border-primary/40 bg-primary/10 text-xs font-bold text-primary"
              >
                <IconSparkles className="h-3.5 w-3.5" />
                <span>
                  {language === "ar"
                    ? "جدول القراءة الفردي"
                    : "Personal Reading Schedule"}
                </span>
              </Badge>

              {schedule.occasionType === "ramadan" && (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400"
                >
                  <IconMoon className="h-3.5 w-3.5" />
                  <span>
                    {t.ramadanBadge}{" "}
                    {schedule.islamicYear
                      ? `${toArabicNumerals(schedule.islamicYear)} هـ`
                      : ""}
                  </span>
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {member.name}
            </h1>

            <p className="text-xs font-medium text-muted-foreground sm:text-sm">
              {title ? `${title} • ` : ""}
              <span className="font-semibold text-foreground">{groupName}</span>
              {description ? ` — ${description}` : ""}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/50 px-2.5 py-1 font-semibold text-foreground">
                <span>
                  {language === "ar" ? "الورد الأسبوعي:" : "Weekly Amount:"}
                </span>
                <span className="font-bold text-primary">
                  {language === "ar"
                    ? `${toArabicNumerals(member.weeklyAmount)} أجزاء / أسبوع`
                    : `${member.weeklyAmount} Juz / week`}
                </span>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/50 px-2.5 py-1 font-semibold text-foreground">
                <span>{language === "ar" ? "المدة:" : "Duration:"}</span>
                <span className="font-bold text-foreground">
                  {language === "ar"
                    ? `${toArabicNumerals(schedule.weeksCount)} أسابيع`
                    : `${schedule.weeksCount} weeks`}
                </span>
              </div>
            </div>
          </div>

          {/* Member Direct Export & Share Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {memberPersonalUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-semibold"
                >
                  {copiedLink ? (
                    <>
                      <IconCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {t.linkCopied}
                      </span>
                    </>
                  ) : (
                    <>
                      <IconCopy className="h-3.5 w-3.5" />
                      <span>{t.copyPublicLink}</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQr(!showQr)}
                  className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-semibold"
                >
                  <IconQrcode className="h-3.5 w-3.5" />
                  <span>{t.btnQrCode}</span>
                </Button>
              </>
            )}

            {onExportPng && (
              <Button
                variant="default"
                size="sm"
                onClick={onExportPng}
                className="h-9 gap-1.5 rounded-xl text-xs font-bold shadow-sm"
              >
                <IconPhoto className="h-3.5 w-3.5" />
                <span>{t.exportMemberPng}</span>
              </Button>
            )}

            {onExportPdf && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportPdf}
                className="h-9 gap-1.5 rounded-xl text-xs font-bold shadow-sm"
              >
                <IconFileTypePdf className="h-3.5 w-3.5" />
                <span>{t.exportMemberPdf}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Member QR Code Drawer */}
        {showQr && memberPersonalUrl && (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/90 p-5 text-center shadow-inner">
            {qrDataUrl && (
              <div className="rounded-xl bg-white p-3 shadow-md">
                <img
                  src={qrDataUrl}
                  alt="Personal Member QR"
                  className="h-44 w-44 object-contain"
                />
              </div>
            )}
            <p className="mt-3 text-xs font-bold text-foreground">
              {t.scanToOpenMySchedule}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {memberPersonalUrl}
            </p>
          </div>
        )}
      </Card>

      {/* Weeks Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-foreground">
            {language === "ar"
              ? "جدول الأسابيع والورد"
              : "Weekly Schedule Breakdown"}
          </h3>
          <span className="text-xs text-muted-foreground">
            {language === "ar"
              ? `${toArabicNumerals(memberWeeks.length)} أسابيع`
              : `${memberWeeks.length} weeks`}
          </span>
        </div>

        <div className="space-y-4">
          {memberWeeks.map(({ weekNumber, assignment, dateRange }) => {
            const isExpanded = !!expandedWeeks[weekNumber]
            const surahStart =
              language === "ar"
                ? assignment.startAyah.surahNameAr
                : assignment.startAyah.surahNameEn
            const surahEnd =
              language === "ar"
                ? assignment.endAyah.surahNameAr
                : assignment.endAyah.surahNameEn

            const isSameSurah =
              assignment.startAyah.surahNumber ===
              assignment.endAyah.surahNumber

            const rangeText = isSameSurah
              ? `${surahStart} (${language === "ar" ? toArabicNumerals(assignment.startAyah.ayahNumber) : assignment.startAyah.ayahNumber} - ${language === "ar" ? toArabicNumerals(assignment.endAyah.ayahNumber) : assignment.endAyah.ayahNumber})`
              : `${surahStart} (${language === "ar" ? toArabicNumerals(assignment.startAyah.ayahNumber) : assignment.startAyah.ayahNumber}) ← ${surahEnd} (${language === "ar" ? toArabicNumerals(assignment.endAyah.ayahNumber) : assignment.endAyah.ayahNumber})`

            const hasDaily = !!(
              assignment.dailyBreakdown && assignment.dailyBreakdown.length > 0
            )

            return (
              <Card
                key={weekNumber}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 transition-all hover:border-primary/40"
              >
                {/* Week Header Row */}
                <div
                  onClick={() => hasDaily && toggleWeekExpand(weekNumber)}
                  className={`flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center ${
                    hasDaily ? "cursor-pointer select-none" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary">
                      {toArabicNumerals(weekNumber)}
                    </div>

                    <div className="text-start">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground sm:text-base">
                          {language === "ar"
                            ? `الأسبوع ${toArabicNumerals(weekNumber)}`
                            : `Week ${weekNumber}`}
                        </span>

                        {dateRange && (
                          <Badge
                            variant="outline"
                            className="text-[11px] font-medium"
                          >
                            {language === "ar"
                              ? dateRange.formattedAr
                              : dateRange.formattedEn}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-primary">
                        {rangeText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-end">
                      <span className="text-xs font-bold text-foreground">
                        {language === "ar"
                          ? `من الجزء ${toArabicNumerals(assignment.startJuz)} إلى ${toArabicNumerals(assignment.endJuz)}`
                          : `Juz ${assignment.startJuz} to ${assignment.endJuz}`}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {language === "ar"
                          ? `${toArabicNumerals(assignment.weeklyAmount)} أجزاء`
                          : `${assignment.weeklyAmount} Juz`}
                      </p>
                    </div>

                    {hasDaily && (
                      <div className="text-muted-foreground">
                        {isExpanded ? (
                          <IconChevronUp className="h-4 w-4" />
                        ) : (
                          <IconChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 7-Day Daily Breakdown for this week */}
                {hasDaily && isExpanded && (
                  <div className="border-t border-border/50 bg-muted/20">
                    <div className="grid grid-cols-1 divide-y divide-border/40 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:divide-border/40 lg:grid-cols-7 lg:divide-y-0 sm:rtl:divide-x-reverse">
                      {assignment.dailyBreakdown!.map((portion, pIdx) => {
                        const dStartSurah =
                          language === "ar"
                            ? portion.startAyah.surahNameAr
                            : portion.startAyah.surahNameEn
                        const dEndSurah =
                          language === "ar"
                            ? portion.endAyah.surahNameAr
                            : portion.endAyah.surahNameEn

                        const isPortionSame =
                          portion.startAyah.surahNumber ===
                          portion.endAyah.surahNumber

                        const dailyRange = isPortionSame
                          ? `${dStartSurah} (${language === "ar" ? toArabicNumerals(portion.startAyah.ayahNumber) : portion.startAyah.ayahNumber} - ${language === "ar" ? toArabicNumerals(portion.endAyah.ayahNumber) : portion.endAyah.ayahNumber})`
                          : `${dStartSurah} (${language === "ar" ? toArabicNumerals(portion.startAyah.ayahNumber) : portion.startAyah.ayahNumber}) ← ${dEndSurah} (${language === "ar" ? toArabicNumerals(portion.endAyah.ayahNumber) : portion.endAyah.ayahNumber})`

                        return (
                          <div
                            key={pIdx}
                            className="flex flex-col justify-between p-3 transition-colors hover:bg-muted/40"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-primary">
                                {language === "ar"
                                  ? portion.dayNameAr
                                  : portion.dayNameEn}
                              </span>

                              {(portion.formattedDateAr || portion.dateStr) && (
                                <span className="text-[10px] text-muted-foreground">
                                  {language === "ar"
                                    ? portion.formattedDateAr
                                    : portion.formattedDateEn ||
                                      portion.dateStr?.slice(5)}
                                </span>
                              )}
                            </div>

                            <div className="my-1.5 text-start">
                              <p className="text-xs leading-tight font-semibold text-foreground">
                                {dailyRange}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {language === "ar"
                                  ? `${toArabicNumerals(portion.totalAyahs)} آية`
                                  : `${portion.totalAyahs} Ayahs`}
                              </p>
                            </div>

                            <div className="mt-2 flex items-center justify-between border-t border-border/30 pt-2 text-[10px]">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActivePortion(portion)}
                                className="h-6 gap-1 rounded-md px-1.5 text-[10px] font-bold text-primary hover:bg-primary/10"
                              >
                                <IconBook className="h-3 w-3" />
                                <span>{t.readerOpenReader}</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) =>
                                  handleToggleDayComplete(
                                    weekNumber,
                                    portion.dayIndex,
                                    e
                                  )
                                }
                                className={`h-6 gap-1 rounded-md px-1.5 text-[10px] font-bold transition-colors ${
                                  completedDays[
                                    `${weekNumber}-${portion.dayIndex}`
                                  ]
                                    ? "bg-emerald-500/20 font-extrabold text-emerald-600 dark:text-emerald-400"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <IconCheck className="h-3 w-3" />
                                <span>
                                  {completedDays[
                                    `${weekNumber}-${portion.dayIndex}`
                                  ]
                                    ? t.dashboardCompleted
                                    : t.dashboardMarkComplete}
                                </span>
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Embedded Quran Reader */}
      {activePortion && (
        <QuranReader
          isOpen={!!activePortion}
          onClose={() => setActivePortion(null)}
          initialSurahNumber={activePortion.startAyah.surahNumber}
          initialAyahNumber={activePortion.startAyah.ayahNumber}
          endSurahNumber={activePortion.endAyah.surahNumber}
          endAyahNumber={activePortion.endAyah.ayahNumber}
          assignmentTitle={`${language === "ar" ? activePortion.dayNameAr : activePortion.dayNameEn} - ${groupName}`}
          onCompleteAssignment={() => {
            const key = `1-${activePortion.dayIndex}`
            setCompletedDays((prev) => ({ ...prev, [key]: true }))
          }}
        />
      )}
    </div>
  )
}
