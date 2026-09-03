"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
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
  IconLayoutDashboard,
  IconAlertCircle,
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
  getMemberLinkStatusAction,
  linkMemberAccountAction,
  saveReadingProgressAction,
} from "@/lib/groups/actions"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

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
  const [linkStatus, setLinkStatus] = useState<{
    isLinked: boolean
    isLinkedToCurrentUser: boolean
    isOwner: boolean
    currentUserId: string | null
    isLoading: boolean
  }>({
    isLinked: member.isLinked || false,
    isLinkedToCurrentUser: false,
    isOwner: false,
    currentUserId: null,
    isLoading: true,
  })
  const [isLinking, setIsLinking] = useState(false)
  const [linkToast, setLinkToast] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  const BackArrowIcon = dir === "rtl" ? IconArrowRight : IconArrowLeft

  const memberPublicId = member.publicId || member.id
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://wirddy.app"
  const memberPersonalUrl = groupPublicId
    ? `${origin}/g/${groupPublicId}/member/${memberPublicId}`
    : ""

  const checkLinkStatus = async () => {
    if (!groupPublicId) return
    try {
      const res = await getMemberLinkStatusAction(groupPublicId, memberPublicId)
      if (res.success && res.data) {
        const data = res.data
        setLinkStatus({
          isLinked: data.isLinked,
          isLinkedToCurrentUser: data.isLinkedToCurrentUser,
          isOwner: data.isOwner,
          currentUserId: data.currentUserId,
          isLoading: false,
        })

        // Auto-link if redirected from login with autolink param
        if (
          typeof window !== "undefined" &&
          window.location.search.includes("autolink=true") &&
          data.currentUserId &&
          !data.isLinked
        ) {
          window.history.replaceState({}, document.title, window.location.pathname)
          executeLink()
        }
      } else {
        setLinkStatus((prev) => ({ ...prev, isLoading: false }))
      }
    } catch {
      setLinkStatus((prev) => ({ ...prev, isLoading: false }))
    }
  }

  useEffect(() => {
    checkLinkStatus()
    const supabase = getSupabaseBrowserClient()
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(() => {
        checkLinkStatus()
      })
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [groupPublicId, memberPublicId])

  const executeLink = async () => {
    if (!groupPublicId || isLinking) return
    setIsLinking(true)
    setLinkError(null)
    try {
      const res = await linkMemberAccountAction(groupPublicId, memberPublicId)
      if (res.success) {
        setLinkStatus((prev) => ({
          ...prev,
          isLinked: true,
          isLinkedToCurrentUser: true,
        }))
        setLinkToast(true)
        setTimeout(() => setLinkToast(false), 5000)
      } else {
        setLinkError(
          res.error ||
            (language === "ar"
              ? "تعذر ربط الحساب. يرجى المحاولة مرة أخرى."
              : "Failed to link account. Please try again.")
        )
      }
    } catch (err: any) {
      setLinkError(err?.message || "Failed to link account.")
    } finally {
      setIsLinking(false)
    }
  }

  const handleLinkAccount = () => {
    if (!linkStatus.currentUserId) {
      // Prompt / redirect unauthenticated user to login with autolink return URL
      const nextUrl = `${window.location.pathname}?autolink=true`
      window.location.href = `/login?next=${encodeURIComponent(nextUrl)}`
      return
    }
    executeLink()
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

      {/* Account Linking / Join Banner */}
      {groupPublicId && (
        <div className="space-y-3">
          {/* Success Celebration Toast Banner */}
          {linkToast && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-950 dark:text-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold">
                  <IconCheck className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold leading-relaxed">
                  {language === "ar"
                    ? "🎉 تم انضمامك وربط الورد بحسابك بنجاح! يمكنك الآن متابعة قراءتك اليومية مباشرة من لوحة التحكم."
                    : "🎉 Successfully joined and linked! You can now track your daily reading directly on your dashboard."}
                </p>
              </div>
              <Link href="/dashboard" className="shrink-0">
                <Button size="sm" className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold gap-1.5 px-3">
                  <IconLayoutDashboard className="h-3.5 w-3.5" />
                  <span>{language === "ar" ? "الانتقال إلى لوحة التحكم" : "Go to Dashboard"}</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Error Message */}
          {linkError && (
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              <span>{linkError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold",
                  linkStatus.isLinkedToCurrentUser
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-primary/10 text-primary"
                )}
              >
                {linkStatus.isLinkedToCurrentUser ? (
                  <IconCheck className="h-5 w-5" />
                ) : (
                  <IconUserCheck className="h-5 w-5" />
                )}
              </div>
              <div className="text-start">
                <p className="text-xs font-bold text-foreground">
                  {linkStatus.isLinkedToCurrentUser
                    ? (language === "ar"
                        ? `مرحباً بك يا ${member.name} (وردك مرتبط بحسابك)`
                        : `Welcome back, ${member.name} (Linked to your account)`)
                    : linkStatus.isLinked
                    ? (language === "ar"
                        ? `ورد العضو: ${member.name}`
                        : `Reading Assignment: ${member.name}`)
                    : (language === "ar"
                        ? `هل هذا وردك الخاص يا ${member.name}؟`
                        : `Is this your reading assignment, ${member.name}?`)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {linkStatus.isLinkedToCurrentUser
                    ? (language === "ar"
                        ? "يمكنك متابعة قراءتك اليومية ومصادقة إنجازك مباشرة من لوحة التحكم الخاصة بك."
                        : "You can track your daily reading and confirm progress directly on your dashboard.")
                    : linkStatus.isLinked
                    ? (language === "ar"
                        ? "هذا الورد تم ربطه بعضو منضم في المجموعة ويتابع إنجازه عبر حسابه."
                        : "This reading assignment is claimed by a joined member.")
                    : (language === "ar"
                        ? "اربط هذا الجدول بحسابك لتظهر قراءتك اليومية مباشرة في لوحة التحكم الخاصة بك وتتابع إنجازك."
                        : "Link this schedule to your account to track your daily reading directly on your dashboard.")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {linkStatus.isLinkedToCurrentUser ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/15 text-xs font-bold text-emerald-600 dark:text-emerald-400 py-1.5 px-3">
                    <IconCheck className="h-3.5 w-3.5 me-1" />
                    <span>{language === "ar" ? "مرتبط بحسابك" : "Linked to Account"}</span>
                  </Badge>
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="h-8.5 rounded-xl px-3 text-xs font-extrabold gap-1 hover:bg-primary/10">
                      <IconLayoutDashboard className="h-3.5 w-3.5 text-primary" />
                      <span>{language === "ar" ? "لوحة التحكم" : "Dashboard"}</span>
                    </Button>
                  </Link>
                </div>
              ) : linkStatus.isLinked ? (
                <Badge variant="secondary" className="text-xs font-bold py-1.5 px-3">
                  <IconUserCheck className="h-3.5 w-3.5 me-1 text-emerald-500" />
                  <span>{language === "ar" ? "عضو منضم" : "Member Joined"}</span>
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={handleLinkAccount}
                  disabled={isLinking}
                  className="h-8.5 rounded-xl px-3.5 text-xs font-extrabold shadow-sm"
                >
                  <IconUserCheck className="h-4 w-4 me-1.5" />
                  <span>
                    {isLinking
                      ? (language === "ar" ? "جاري الانضمام..." : "Linking...")
                      : (language === "ar" ? "انضمام وربط بحسابي" : "Join & Link to My Dashboard")}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

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

                      <p className={cn("text-xs font-semibold text-primary", language === "ar" && "font-quran text-sm font-bold")}>
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
                              <p className={cn("text-xs leading-tight font-semibold text-foreground", language === "ar" && "font-quran text-sm")}>
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
          isModal={true}
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
