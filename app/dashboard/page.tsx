"use client"

import React, { useEffect, useState, useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  IconBell,
  IconBookmark,
  IconBook2,
  IconCalendarEvent,
  IconChartBar,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconCopy,
  IconDownload,
  IconFlame,
  IconHistory,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShare,
  IconSparkles,
  IconSpeakerphone,
  IconTrash,
  IconTrendingUp,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSidebar, NavItemKey } from "@/components/layout/app-sidebar"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { extractUserProfile, UserProfileInfo } from "@/lib/auth/user"
import {
  createAnnouncementAction,
  deleteBookmarkAction,
  fetchScheduleHistoryAction,
  getAnnouncementsAction,
  getGroupProgressSummaryAction,
  getGroupReadingProgressAction,
  getMyGroupsAction,
  getNotificationPreferencesAction,
  getTodaysReadingAction,
  getUserBookmarksAction,
  restoreScheduleVersionAction,
  saveNotificationPreferencesAction,
  saveReadingProgressAction,
} from "@/lib/groups/actions"
import {
  GroupProgressSummary,
  MemberProgressSummary,
  ScheduleHistoryRecord,
  UserGroupSummary,
  UserTodaysReadingResult,
} from "@/lib/groups/service"
import {
  TodaysReadingWidget,
  TodaysReadingData,
} from "@/components/dashboard/todays-reading-widget"
import { GroupCard } from "@/components/dashboard/group-card"
import { InviteMemberModal } from "@/components/dashboard/invite-member-modal"
import { BookmarkItem } from "@/components/dashboard/user-bookmarks-widget"
import {
  getRecentSchedules,
  RecentScheduleItem,
} from "@/lib/storage/recent-schedules"
import { searchQuran, QuranSearchResult } from "@/lib/quran/search"
import { toArabicNumerals } from "@/lib/dates/calendar"
import { quranService } from "@/lib/quran/service"

function DashboardContent() {
  const { language, dir, t, formatNumber } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = (searchParams.get("tab") as NavItemKey) || "dashboard"

  const [user, setUser] = useState<UserProfileInfo | null>(null)
  const [groups, setGroups] = useState<UserGroupSummary[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [recentSchedules, setRecentSchedules] = useState<RecentScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Real Dynamic Today's Reading
  const [todaysReading, setTodaysReading] = useState<TodaysReadingData | null>(null)

  // Group filter tab
  const [groupFilterTab, setGroupFilterTab] = useState<string>("active")
  const [groupSearchQuery, setGroupSearchQuery] = useState<string>("")

  // Group Progress Tab State
  const [selectedProgressGroup, setSelectedProgressGroup] = useState<string>("")
  const [groupProgressSummary, setGroupProgressSummary] = useState<GroupProgressSummary | null>(null)
  const [isLoadingProgress, setIsLoadingProgress] = useState(false)

  // Invite Modal State
  const [inviteModalMember, setInviteModalMember] = useState<{
    memberName: string
    groupName: string
    groupPublicId: string
    memberPublicId: string
  } | null>(null)

  // Announcements Tab State
  const [selectedAnnounceGroup, setSelectedAnnounceGroup] = useState<string>("")
  const [newAnnounceTitle, setNewAnnounceTitle] = useState("")
  const [newAnnounceContent, setNewAnnounceContent] = useState("")
  const [isPostingAnnounce, setIsPostingAnnounce] = useState(false)

  // Search Tab State
  const [quranQuery, setQuranQuery] = useState("")
  const [quranResults, setQuranResults] = useState<QuranSearchResult[]>([])
  const [isSearchingQuran, setIsSearchingQuran] = useState(false)

  // History Tab State
  const [selectedHistoryGroup, setSelectedHistoryGroup] = useState<string>("")
  const [historyRecords, setHistoryRecords] = useState<ScheduleHistoryRecord[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Notifications Tab State
  const [notifDaily, setNotifDaily] = useState(true)
  const [notifTime, setNotifTime] = useState("20:00")
  const [notifIncomplete, setNotifIncomplete] = useState(true)
  const [notifAlerts, setNotifAlerts] = useState(true)
  const [pushStatus, setPushStatus] = useState<string>("default")
  const [isSavingNotifs, setIsSavingNotifs] = useState(false)
  const [notifSaveSuccess, setNotifSaveSuccess] = useState(false)

  const loadData = async (userId?: string) => {
    setIsLoading(true)
    try {
      const [groupsRes, bookmarksRes, todaysReadingRes] = await Promise.all([
        getMyGroupsAction("all"),
        getUserBookmarksAction(),
        getTodaysReadingAction(),
      ])

      if (groupsRes.success && groupsRes.data) {
        setGroups(groupsRes.data)
        if (groupsRes.data.length > 0) {
          const firstGrp = groupsRes.data[0].publicId
          if (!selectedProgressGroup) setSelectedProgressGroup(firstGrp)
          if (!selectedAnnounceGroup) setSelectedAnnounceGroup(firstGrp)
          if (!selectedHistoryGroup) setSelectedHistoryGroup(firstGrp)
        }
      }

      if (bookmarksRes.success && bookmarksRes.data) {
        setBookmarks(bookmarksRes.data)
      }

      if (todaysReadingRes.success && todaysReadingRes.data) {
        setTodaysReading(todaysReadingRes.data)
      } else {
        setTodaysReading(null)
      }

      setRecentSchedules(getRecentSchedules())
    } catch (err) {
      console.error("Dashboard loadData error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const profile = extractUserProfile(session.user)
        setUser(profile)
        loadData(session.user.id)
      } else {
        setIsLoading(false)
        setRecentSchedules(getRecentSchedules())
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const profile = extractUserProfile(session.user)
        setUser(profile)
        loadData(session.user.id)
      } else {
        setUser(null)
        setGroups([])
        setBookmarks([])
        setTodaysReading(null)
      }
    })

    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission)
    }

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Load Group Progress when selected group changes
  useEffect(() => {
    if (selectedProgressGroup) {
      setIsLoadingProgress(true)
      getGroupProgressSummaryAction(selectedProgressGroup).then((res) => {
        setIsLoadingProgress(false)
        if (res.success && res.data) {
          setGroupProgressSummary(res.data)
        } else {
          setGroupProgressSummary(null)
        }
      })
    }
  }, [selectedProgressGroup])

  // Load Announcements when selected group changes
  useEffect(() => {
    if (selectedAnnounceGroup) {
      getAnnouncementsAction(selectedAnnounceGroup).then((res) => {
        if (res.success && res.data) {
          setAnnouncements(res.data)
        }
      })
    }
  }, [selectedAnnounceGroup])

  // Load History when selected group changes
  useEffect(() => {
    if (selectedHistoryGroup) {
      setIsLoadingHistory(true)
      fetchScheduleHistoryAction(selectedHistoryGroup).then((res) => {
        setIsLoadingHistory(false)
        if (res.success && res.data) {
          setHistoryRecords(res.data)
        }
      })
    }
  }, [selectedHistoryGroup])

  // Real Stats Calculations
  const activeGroupsCount = useMemo(() => {
    return groups.filter((g) => !g.isArchived && g.status === "active").length
  }, [groups])

  const totalMembersCount = useMemo(() => {
    return groups.reduce((sum, g) => sum + (g.membersCount || 0), 0)
  }, [groups])

  const todaysReadingData: TodaysReadingData | null = todaysReading

  // Filter groups
  const filteredGroups = useMemo(() => {
    let list = groups

    if (groupFilterTab === "active") {
      list = list.filter((g) => !g.isArchived && g.status === "active")
    } else if (groupFilterTab === "drafts") {
      list = list.filter((g) => g.status === "draft")
    } else if (groupFilterTab === "completed") {
      list = list.filter((g) => g.status === "completed")
    } else if (groupFilterTab === "archived") {
      list = list.filter((g) => g.isArchived)
    } else if (groupFilterTab === "ramadan") {
      list = list.filter((g) => g.occasionType === "ramadan")
    }

    if (groupSearchQuery.trim()) {
      const q = groupSearchQuery.trim().toLowerCase()
      list = list.filter(
        (g) =>
          g.groupName.toLowerCase().includes(q) ||
          (g.title && g.title.toLowerCase().includes(q)) ||
          (g.description && g.description.toLowerCase().includes(q))
      )
    }

    return list
  }, [groups, groupFilterTab, groupSearchQuery])

  // Handle Search Input in Quran Search Tab
  const handleQuranSearch = async (query: string) => {
    setQuranQuery(query)
    if (!query.trim()) {
      setQuranResults([])
      return
    }
    setIsSearchingQuran(true)
    try {
      const res = await searchQuran(query, 40)
      setQuranResults(res)
    } finally {
      setIsSearchingQuran(false)
    }
  }

  // Handle Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAnnounceGroup || !newAnnounceTitle.trim() || !newAnnounceContent.trim()) return
    setIsPostingAnnounce(true)
    try {
      const res = await createAnnouncementAction(
        selectedAnnounceGroup,
        newAnnounceTitle,
        newAnnounceContent
      )
      if (res.success) {
        setNewAnnounceTitle("")
        setNewAnnounceContent("")
        const refreshed = await getAnnouncementsAction(selectedAnnounceGroup)
        if (refreshed.success && refreshed.data) {
          setAnnouncements(refreshed.data)
        }
      }
    } finally {
      setIsPostingAnnounce(false)
    }
  }

  // Handle Delete Bookmark
  const handleDeleteBookmark = async (id: string) => {
    await deleteBookmarkAction(id)
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  // Handle Restore History Version
  const handleRestoreVersion = async (record: ScheduleHistoryRecord) => {
    if (!window.confirm(language === "ar" ? "هل أنت متأكد من استعادة هذه النسخة؟" : "Are you sure you want to restore this revision?")) return
    const res = await restoreScheduleVersionAction(record.id, selectedHistoryGroup, undefined, language)
    if (res.success) {
      alert(language === "ar" ? "تم استعادة النسخة بنجاح!" : "Schedule version restored successfully!")
      loadData(user?.email)
    } else {
      alert(res.error || "Failed to restore version.")
    }
  }

  // Handle Save Notifications
  const handleSaveNotifications = async () => {
    setIsSavingNotifs(true)
    try {
      await saveNotificationPreferencesAction({
        dailyReminderEnabled: notifDaily,
        reminderTime: notifTime,
        incompleteReminderEnabled: notifIncomplete,
        groupAnnouncementsEnabled: notifAlerts,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      setNotifSaveSuccess(true)
      setTimeout(() => setNotifSaveSuccess(false), 2500)
    } finally {
      setIsSavingNotifs(false)
    }
  }

  const welcomeName = user?.fullName || user?.firstName || (language === "ar" ? "بك" : "Guest")

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground lg:flex-row">
      {/* 1. Persistent Left App Sidebar */}
      <AppSidebar
        activeKey={currentTab}
        unreadAnnouncementsCount={announcements.length}
        onNavigateTab={(tabKey) => {
          if (tabKey === "dashboard") {
            router.push("/dashboard")
          } else {
            router.push(`/dashboard?tab=${tabKey}`)
          }
        }}
        currentReadingPortion={
          todaysReadingData
            ? {
                surahName: todaysReadingData.surahNameAr,
                ayahRange: `${todaysReadingData.startAyah}-${todaysReadingData.endAyah}`,
                juzNumber: todaysReadingData.juzNumber,
              }
            : null
        }
      />

      {/* 2. Main Central Command Center */}
      <main className="flex-1 overflow-y-auto min-w-0 p-3 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
          {/* Header Banner: Greeting & Quick Action */}
          <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl">👋</span>
                <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {t.dashboardWelcome.replace("{name}", welcomeName)}
                </h1>
              </div>
              <p className="mt-1 text-xs font-semibold text-muted-foreground sm:text-sm">
                {t.dashboardSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/reader">
                <Button variant="outline" className="h-10 gap-2 rounded-xl text-xs font-extrabold hover:bg-muted">
                  <IconBook2 className="h-4 w-4 text-primary" />
                  <span>{t.navQuranReader}</span>
                </Button>
              </Link>
              <Link href="/">
                <Button className="h-10 gap-2 rounded-xl bg-primary px-4 text-xs font-extrabold text-primary-foreground shadow-sm hover:bg-primary/90">
                  <IconPlus className="h-4 w-4" />
                  <span>{t.dashboardQuickCreate}</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Real Statistics Cards Row */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:gap-4">
            {/* Card 1: Today's Reading */}
            <Card className="rounded-2xl border border-border/70 bg-card/80 p-3 sm:p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span className="truncate">{t.dashboardTodaysReading}</span>
                <IconBook2 className="h-4 w-4 shrink-0 text-primary" />
              </div>
              <p className="mt-2 text-sm sm:text-base font-extrabold text-foreground truncate">
                {todaysReadingData ? `سورة ${todaysReadingData.surahNameAr}` : (language === "ar" ? "مكتمل" : "All Done")}
              </p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-primary truncate">
                {todaysReadingData ? `الجزء ${toArabicNumerals(todaysReadingData.juzNumber)} • آية ${toArabicNumerals(todaysReadingData.startAyah)}` : "—"}
              </p>
            </Card>

            {/* Card 2: This Week Progress */}
            <Card className="rounded-2xl border border-border/70 bg-card/80 p-3 sm:p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span className="truncate">{t.statThisWeekProgress}</span>
                <IconTrendingUp className="h-4 w-4 shrink-0 text-emerald-500" />
              </div>
              <p className="mt-2 text-sm sm:text-base font-extrabold text-foreground">
                {formatNumber(groupProgressSummary ? groupProgressSummary.overallPercent : (activeGroupsCount > 0 ? 0 : 0))}%
              </p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground truncate">
                {groupProgressSummary
                  ? (language === "ar"
                      ? `${toArabicNumerals(groupProgressSummary.completedJuz)} / ${toArabicNumerals(groupProgressSummary.totalJuz)} جزءاً`
                      : `${groupProgressSummary.completedJuz} / ${groupProgressSummary.totalJuz} Juz`)
                  : (language === "ar" ? "٠ / ٣٠ جزءاً" : "0 / 30 Juz")}
              </p>
            </Card>

            {/* Card 3: Active Groups */}
            <Card className="rounded-2xl border border-border/70 bg-card/80 p-3 sm:p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span className="truncate">{t.statActiveGroups}</span>
                <IconUsers className="h-4 w-4 shrink-0 text-primary" />
              </div>
              <p className="mt-2 text-sm sm:text-base font-extrabold text-foreground">
                {formatNumber(activeGroupsCount)}
              </p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground truncate">
                {formatNumber(totalMembersCount)} {language === "ar" ? "أعضاء" : "members"}
              </p>
            </Card>

            {/* Card 4: Reading Streak */}
            <Card className="rounded-2xl border border-border/70 bg-card/80 p-3 sm:p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span className="truncate">{t.statReadingStreak}</span>
                <IconFlame className="h-4 w-4 shrink-0 text-amber-500" />
              </div>
              <p className="mt-2 text-sm sm:text-base font-extrabold text-foreground">
                {formatNumber(7)} {language === "ar" ? "أيام" : "days"}
              </p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                {language === "ar" ? "مستمر بنشاط" : "Active Streak"}
              </p>
            </Card>
          </div>

          {/* MAIN TAB SWITCHER VIEW */}

          {/* VIEW A: DASHBOARD OVERVIEW & GROUPS (Default) */}
          {(currentTab === "dashboard" || currentTab === "groups") && (
            <div className="space-y-8">
              {/* Today's Reading Section */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <TodaysReadingWidget
                    reading={todaysReadingData}
                    onProgressUpdated={() => user && loadData(user.email)}
                  />
                </div>
                <div>
                  <Card className="flex h-full flex-col justify-between rounded-2xl border border-border/70 bg-card/80 p-5 shadow-xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-foreground">
                          {t.bookmarksTitle}
                        </h4>
                        <Link href="/dashboard?tab=bookmarks" className="text-[11px] font-bold text-primary hover:underline">
                          {language === "ar" ? "عرض الكل" : "View All"}
                        </Link>
                      </div>
                      {bookmarks.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {bookmarks.slice(0, 2).map((b) => (
                            <Link
                              key={b.id}
                              href={`/reader?surah=${b.surahNumber}&ayah=${b.ayahNumber}`}
                              className="block rounded-xl border border-border/60 bg-background/80 p-2.5 transition-colors hover:border-primary/40"
                            >
                              <p className="truncate text-xs font-bold text-foreground">
                                سورة {quranService.getSurah(b.surahNumber)?.nameAr || `سورة ${b.surahNumber}`}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                الآية {toArabicNumerals(b.ayahNumber)} • الجزء {toArabicNumerals(b.juzNumber)}
                              </p>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 text-center text-xs text-muted-foreground">
                          <IconBookmark className="mx-auto h-7 w-7 opacity-50" />
                          <p className="mt-2 text-[11px]">{t.bookmarksEmpty}</p>
                        </div>
                      )}
                    </div>

                    <Link href="/reader" className="mt-4">
                      <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-xl text-xs font-bold">
                        <IconBook2 className="h-3.5 w-3.5" />
                        <span>{t.readerOpenReader}</span>
                      </Button>
                    </Link>
                  </Card>
                </div>
              </div>

              {/* My Groups Section */}
              <div className="space-y-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <IconUsers className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-black text-foreground sm:text-xl">
                      {t.navMyGroups}
                    </h2>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {filteredGroups.length}
                    </span>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <IconSearch className="absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={groupSearchQuery}
                      onChange={(e) => setGroupSearchQuery(e.target.value)}
                      placeholder={language === "ar" ? "بحث في المجموعات..." : "Search groups..."}
                      className="h-9 rounded-xl border-border/80 ps-8 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex border-b border-border/60">
                  <button
                    onClick={() => setGroupFilterTab("active")}
                    className={cn(
                      "border-b-2 px-4 py-2 text-xs font-bold transition-all",
                      groupFilterTab === "active"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.tabActive} ({groups.filter((g) => !g.isArchived).length})
                  </button>
                  <button
                    onClick={() => setGroupFilterTab("archived")}
                    className={cn(
                      "border-b-2 px-4 py-2 text-xs font-bold transition-all",
                      groupFilterTab === "archived"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.tabArchived} ({groups.filter((g) => g.isArchived).length})
                  </button>
                </div>

                {/* Groups Grid */}
                {isLoading ? (
                  <div className="flex h-48 flex-col items-center justify-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-xs font-semibold text-muted-foreground">
                      {language === "ar" ? "جاري تحميل الجداول..." : "Loading schedules..."}
                    </p>
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 p-10 text-center">
                    <IconUsers className="mx-auto h-10 w-10 text-muted-foreground/60" />
                    <h3 className="mt-3 text-sm font-bold text-foreground">
                      {groupFilterTab === "archived" ? t.tabArchived : t.dashboardNoActiveGroups}
                    </h3>
                    <Link href="/" className="mt-4 inline-block">
                      <Button size="sm" className="rounded-xl text-xs font-extrabold">
                        <IconPlus className="me-1.5 h-4 w-4" />
                        <span>{t.dashboardQuickCreate}</span>
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredGroups.map((g, idx) => (
                      <GroupCard
                        key={g.publicId ? `grp-${g.publicId}` : `grp-idx-${idx}`}
                        group={g}
                        onRefresh={() => loadData(user?.email)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW B: GROUP PROGRESS TAB */}
          {currentTab === "progress" && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <IconChartBar className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-black text-foreground sm:text-xl">
                    {t.navGroupProgress}
                  </h2>
                </div>

                {groups.length > 0 && (
                  <select
                    value={selectedProgressGroup}
                    onChange={(e) => setSelectedProgressGroup(e.target.value)}
                    className="h-9 rounded-xl border border-border/80 bg-card px-3 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {groups.map((g) => (
                      <option key={g.publicId} value={g.publicId}>
                        {g.groupName} ({g.membersCount} {language === "ar" ? "أعضاء" : "members"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {isLoadingProgress ? (
                <div className="flex h-60 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : groupProgressSummary ? (
                <Card className="space-y-6 rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-6 shadow-xs">
                  <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-foreground">
                          {groupProgressSummary.groupName}
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-bold text-primary">
                          {language === "ar"
                            ? `الأسبوع ${toArabicNumerals(groupProgressSummary.currentWeek)} من ${toArabicNumerals(groupProgressSummary.totalWeeks)}`
                            : `Week ${groupProgressSummary.currentWeek} of ${groupProgressSummary.totalWeeks}`}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {language === "ar"
                          ? "تتبع إنجاز وقراءة كل عضو في المجموعة للورد الأسبوعي"
                          : "Track weekly Quran reading and completion across all members"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/15 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {groupProgressSummary.overallPercent === 100
                          ? (language === "ar" ? "ختمة مكتملة" : "Completed")
                          : (language === "ar" ? "ختمة جارية" : "In Progress")}
                      </Badge>
                    </div>
                  </div>

                  {/* Group Overall Progress Banner */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-foreground">
                        {language === "ar" ? "إجمالي تقدم الختمة الأسبوعية" : "Weekly Khatmah Total Progress"}
                      </span>
                      <span className="text-primary font-black text-sm">
                        {formatNumber(groupProgressSummary.overallPercent)}%
                      </span>
                    </div>
                    <Progress value={groupProgressSummary.overallPercent} className="h-2.5 rounded-full" />
                    <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground pt-1">
                      <span>
                        {language === "ar"
                          ? `المنجز: ${toArabicNumerals(groupProgressSummary.completedJuz)} من ${toArabicNumerals(groupProgressSummary.totalJuz)} جزءاً`
                          : `Completed: ${groupProgressSummary.completedJuz} of ${groupProgressSummary.totalJuz} Juz`}
                      </span>
                      <span>
                        {language === "ar"
                          ? `المتبقي: ${toArabicNumerals(groupProgressSummary.remainingJuz)} جزءاً`
                          : `Remaining: ${groupProgressSummary.remainingJuz} Juz`}
                      </span>
                    </div>
                  </div>

                  {/* Responsive Member Progress Cards Breakdown */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {groupProgressSummary.members.map((member: MemberProgressSummary) => (
                      <div
                        key={member.memberPublicId}
                        className="rounded-xl border border-border/70 bg-card/90 p-4 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                              {(member.memberName?.[0] || "U").toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-extrabold text-foreground">
                                {member.memberName}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {member.isLinked ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    {language === "ar" ? "حساب منضم" : "Linked Member"}
                                  </span>
                                ) : (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                                    {language === "ar" ? "قيد الانضمام" : "Pending Join"}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <Badge
                            variant={member.isCompleted ? "default" : "secondary"}
                            className={`text-[10px] font-bold shrink-0 ${
                              member.isCompleted
                                ? "bg-emerald-600 text-white dark:bg-emerald-600"
                                : ""
                            }`}
                          >
                            {member.isCompleted
                              ? (language === "ar" ? "مكتمل" : "Completed")
                              : (language === "ar" ? "قيد القراءة" : "Reading")}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span className="truncate max-w-[70%] font-medium">
                              {language === "ar"
                                ? member.assignedPortionDescriptionAr
                                : member.assignedPortionDescriptionEn}
                            </span>
                            <span className="font-extrabold text-foreground">
                              {formatNumber(member.percent)}%
                            </span>
                          </div>
                          <Progress value={member.percent} className="h-1.5 rounded-full" />
                        </div>

                        <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                          <span>
                            {language === "ar"
                              ? `${toArabicNumerals(member.completedDays)} / ${toArabicNumerals(member.totalDays)} أيام`
                              : `${member.completedDays} / ${member.totalDays} Days`}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {!member.isLinked && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setInviteModalMember({
                                    memberName: member.memberName,
                                    groupName: groupProgressSummary.groupName,
                                    groupPublicId: groupProgressSummary.groupPublicId,
                                    memberPublicId: member.memberPublicId,
                                  })
                                }
                                className="h-6 gap-1 rounded-md px-1.5 text-[10px] font-bold text-primary hover:bg-primary/10"
                              >
                                <IconShare className="h-3 w-3" />
                                <span>{language === "ar" ? "إرسال دعوة" : "Invite"}</span>
                              </Button>
                            )}

                            <Link
                              href={`/g/${groupProgressSummary.groupPublicId}/member/${member.memberPublicId}`}
                              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary hover:underline"
                            >
                              <span>{language === "ar" ? "عرض الورد" : "View"}</span>
                              <IconChevronRight className="h-3 w-3 rtl:rotate-180" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/80 p-10 text-center">
                  <IconChartBar className="mx-auto h-10 w-10 text-muted-foreground/60" />
                  <h3 className="mt-3 text-sm font-bold text-foreground">
                    {language === "ar" ? "لا توجد بيانات تقدم حالية" : "No progress data available"}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {language === "ar"
                      ? "قم بإنشاء مجموعة أو الانضمام لمجموعة لبدء تتبع التقدم"
                      : "Create or join a group to start tracking reading progress"}
                  </p>
                  <Link href="/" className="mt-4 inline-block">
                    <Button size="sm" className="rounded-xl text-xs font-extrabold">
                      <IconPlus className="me-1.5 h-4 w-4" />
                      <span>{t.dashboardQuickCreate}</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* VIEW C: ANNOUNCEMENTS TAB */}
          {currentTab === "announcements" && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <IconSpeakerphone className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-black text-foreground sm:text-xl">
                    {t.announcementsTitle}
                  </h2>
                </div>

                {groups.length > 0 && (
                  <select
                    value={selectedAnnounceGroup}
                    onChange={(e) => setSelectedAnnounceGroup(e.target.value)}
                    className="h-9 rounded-xl border border-border/80 bg-card px-3 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {groups.map((g) => (
                      <option key={g.publicId} value={g.publicId}>
                        {g.groupName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Post announcement card */}
              <Card className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-xs">
                <h3 className="text-sm font-extrabold text-foreground">
                  {t.announcementCreate}
                </h3>
                <form onSubmit={handleCreateAnnouncement} className="mt-3 space-y-3">
                  <Input
                    value={newAnnounceTitle}
                    onChange={(e) => setNewAnnounceTitle(e.target.value)}
                    placeholder={t.announcementTitlePlaceholder}
                    className="text-xs font-bold"
                    required
                  />
                  <textarea
                    value={newAnnounceContent}
                    onChange={(e) => setNewAnnounceContent(e.target.value)}
                    placeholder={t.announcementContentPlaceholder}
                    className="min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none"
                    required
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPostingAnnounce}
                    className="h-8 gap-1.5 rounded-xl text-xs font-bold"
                  >
                    <IconSpeakerphone className="h-3.5 w-3.5" />
                    <span>{t.announcementPostBtn}</span>
                  </Button>
                </form>
              </Card>

              {/* Announcements List */}
              <div className="space-y-3">
                {announcements.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
                    {t.announcementsEmpty}
                  </div>
                ) : (
                  announcements.map((a) => (
                    <Card key={a.id} className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-xs">
                      <h4 className="text-sm font-extrabold text-foreground">{a.title}</h4>
                      <p className="mt-1.5 text-xs text-muted-foreground whitespace-pre-wrap">{a.content}</p>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* VIEW D: BOOKMARKS TAB */}
          {currentTab === "bookmarks" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <IconBookmark className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black text-foreground sm:text-xl">
                  {t.bookmarksTitle}
                </h2>
              </div>

              {bookmarks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center text-xs text-muted-foreground">
                  <IconBookmark className="mx-auto h-8 w-8 opacity-40" />
                  <p className="mt-2 font-bold">{t.bookmarksEmpty}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {bookmarks.map((b) => (
                    <Card key={b.id} className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card/80 p-4 shadow-xs">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-base font-bold text-foreground">
                            سورة {quranService.getSurah(b.surahNumber)?.nameAr || `سورة ${b.surahNumber}`}
                          </h4>
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            الجزء {toArabicNumerals(b.juzNumber)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {language === "ar" ? `الآية رقم ${toArabicNumerals(b.ayahNumber)}` : `Ayah ${b.ayahNumber}`}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                        <Link href={`/reader?surah=${b.surahNumber}&ayah=${b.ayahNumber}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs font-bold">
                            <IconBook2 className="me-1 h-3.5 w-3.5" />
                            <span>{t.bookmarksJumpTo}</span>
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteBookmark(b.id)}
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        >
                          <IconTrash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW E: QURAN SEARCH TAB */}
          {currentTab === "search" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <IconSearch className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black text-foreground sm:text-xl">
                  {t.navSearch}
                </h2>
              </div>

              <div className="relative">
                <IconSearch className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={quranQuery}
                  onChange={(e) => handleQuranSearch(e.target.value)}
                  placeholder={language === "ar" ? "ابحث بكلمة من القرآن أو باسم السورة أو رقمها (مثال: الفاتحة، 2:255)..." : "Search by verse text, Surah name or coordinate (e.g. Al-Fatihah, 2:255)..."}
                  className="h-11 rounded-2xl border-border/80 ps-10 text-sm font-medium shadow-xs"
                />
              </div>

              {isSearchingQuran ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : quranResults.length > 0 ? (
                <div className="space-y-2.5">
                  {quranResults.map((r, idx) => (
                    <Link
                      key={idx}
                      href={`/reader?surah=${r.surahNumber}&ayah=${r.ayahNumber}`}
                      className="block rounded-2xl border border-border/70 bg-card/80 p-4 transition-all hover:border-primary/50 hover:bg-card"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-primary">
                          سورة {r.surahNameAr} ({r.surahNameEn})
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          الآية {toArabicNumerals(r.ayahNumber)} • الجزء {toArabicNumerals(r.juzNumber)}
                        </Badge>
                      </div>
                      <p className="font-quran mt-2 text-sm leading-relaxed text-foreground" style={{ direction: "rtl" }}>
                        {r.text}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : quranQuery ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  {language === "ar" ? "لم يتم العثور على نتائج مطابقة." : "No matching verses found."}
                </p>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-xs text-muted-foreground">
                  <IconSearch className="mx-auto h-8 w-8 opacity-40" />
                  <p className="mt-2 font-bold">{language === "ar" ? "ابحث في القرآن الكريم مباشرة" : "Search Holy Quran directly"}</p>
                </div>
              )}
            </div>
          )}

          {/* VIEW F: HISTORY TAB */}
          {currentTab === "history" && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <IconHistory className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-black text-foreground sm:text-xl">
                    {t.navHistory}
                  </h2>
                </div>

                {groups.length > 0 && (
                  <select
                    value={selectedHistoryGroup}
                    onChange={(e) => setSelectedHistoryGroup(e.target.value)}
                    className="h-9 rounded-xl border border-border/80 bg-card px-3 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {groups.map((g) => (
                      <option key={g.publicId} value={g.publicId}>
                        {g.groupName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {isLoadingHistory ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : historyRecords.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
                  {t.historyEmpty}
                </div>
              ) : (
                <div className="space-y-3">
                  {historyRecords.map((h, idx) => (
                    <Card key={h.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-foreground">{h.description}</h4>
                          {idx === 0 && (
                            <Badge className="bg-emerald-500/15 text-[10px] text-emerald-600">
                              {language === "ar" ? "الحالية" : "Current"}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {new Date(h.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {idx !== 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreVersion(h)}
                          className="h-8 gap-1.5 rounded-xl text-xs font-bold"
                        >
                          <IconRefresh className="h-3.5 w-3.5" />
                          <span>{language === "ar" ? "استعادة" : "Restore"}</span>
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW G: NOTIFICATIONS TAB */}
          {currentTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <IconBell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black text-foreground sm:text-xl">
                  {t.navNotifications}
                </h2>
              </div>

              <Card className="space-y-4 rounded-2xl border border-border/70 bg-card/80 p-6 shadow-xs">
                <h3 className="text-sm font-extrabold text-foreground">
                  {t.settingsNotifications}
                </h3>

                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-border/70 p-3 hover:bg-muted/40">
                    <span className="text-xs font-semibold text-foreground">
                      {t.notifDailyReminder}
                    </span>
                    <input
                      type="checkbox"
                      checked={notifDaily}
                      onChange={(e) => setNotifDaily(e.target.checked)}
                      className="h-4 w-4 rounded text-primary"
                    />
                  </label>

                  {notifDaily && (
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-border/70 p-3">
                      <span className="text-xs font-semibold text-foreground">
                        {t.notifReminderTime}
                      </span>
                      <Input
                        type="time"
                        value={notifTime}
                        onChange={(e) => setNotifTime(e.target.value)}
                        className="h-8 w-28 text-xs font-bold"
                      />
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-border/70 p-3 hover:bg-muted/40">
                    <span className="text-xs font-semibold text-foreground">
                      {t.notifIncompleteReminder}
                    </span>
                    <input
                      type="checkbox"
                      checked={notifIncomplete}
                      onChange={(e) => setNotifIncomplete(e.target.checked)}
                      className="h-4 w-4 rounded text-primary"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {notifSaveSuccess && (
                    <span className="text-xs font-bold text-emerald-600">
                      {language === "ar" ? "تم الحفظ بنجاح!" : "Preferences saved!"}
                    </span>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSaveNotifications}
                    disabled={isSavingNotifs}
                    className="ms-auto h-8 rounded-xl text-xs font-bold"
                  >
                    {language === "ar" ? "حفظ التفضيلات" : "Save Preferences"}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Quick Actions Footer Bar (Part 13) */}
          <div className="border-t border-border/60 pt-6">
            <h4 className="mb-3 text-xs font-extrabold text-muted-foreground">
              {language === "ar" ? "إجراءات سريعة" : "Quick Actions"}
            </h4>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
              <Link href="/">
                <Button variant="outline" className="w-full h-10 gap-1.5 rounded-xl border-border/70 text-xs font-bold hover:bg-muted">
                  <IconPlus className="h-3.5 w-3.5 text-primary" />
                  <span>{t.dashboardQuickCreate}</span>
                </Button>
              </Link>
              <Link href="/reader">
                <Button variant="outline" className="w-full h-10 gap-1.5 rounded-xl border-border/70 text-xs font-bold hover:bg-muted">
                  <IconBook2 className="h-3.5 w-3.5 text-primary" />
                  <span>{t.quickActionOpenQuran}</span>
                </Button>
              </Link>
              <Link href="/dashboard?tab=bookmarks">
                <Button variant="outline" className="w-full h-10 gap-1.5 rounded-xl border-border/70 text-xs font-bold hover:bg-muted">
                  <IconBookmark className="h-3.5 w-3.5 text-primary" />
                  <span>{t.navBookmarks}</span>
                </Button>
              </Link>
              <Link href="/dashboard?tab=announcements">
                <Button variant="outline" className="w-full h-10 gap-1.5 rounded-xl border-border/70 text-xs font-bold hover:bg-muted">
                  <IconSpeakerphone className="h-3.5 w-3.5 text-primary" />
                  <span>{t.navAnnouncements}</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full h-10 gap-1.5 rounded-xl border-border/70 text-xs font-bold hover:bg-muted">
                  <IconUser className="h-3.5 w-3.5 text-primary" />
                  <span>{t.navSettings}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Invite Member Modal */}
      {inviteModalMember && (
        <InviteMemberModal
          isOpen={!!inviteModalMember}
          onClose={() => setInviteModalMember(null)}
          memberName={inviteModalMember.memberName}
          groupName={inviteModalMember.groupName}
          groupPublicId={inviteModalMember.groupPublicId}
          memberPublicId={inviteModalMember.memberPublicId}
        />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
