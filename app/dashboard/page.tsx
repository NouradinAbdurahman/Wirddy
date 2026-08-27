"use client"

import React, { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  IconBook,
  IconBookmark,
  IconHistory,
  IconMoon,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { extractUserProfile, UserProfileInfo } from "@/lib/auth/user"
import { getMyGroupsAction, getUserBookmarksAction } from "@/lib/groups/actions"
import { UserGroupSummary } from "@/lib/groups/service"
import {
  TodaysReadingWidget,
  TodaysReadingData,
} from "@/components/dashboard/todays-reading-widget"
import {
  ContinueReadingWidget,
  ContinueReadingData,
} from "@/components/dashboard/continue-reading-widget"
import { GroupCard } from "@/components/dashboard/group-card"
import {
  UserBookmarksWidget,
  BookmarkItem,
} from "@/components/dashboard/user-bookmarks-widget"
import {
  getRecentSchedules,
  RecentScheduleItem,
} from "@/lib/storage/recent-schedules"

export default function DashboardPage() {
  const { language, t } = useI18n()
  const [user, setUser] = useState<UserProfileInfo | null>(null)
  const [groups, setGroups] = useState<UserGroupSummary[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [recentSchedules, setRecentSchedules] = useState<RecentScheduleItem[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("active")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const loadData = async (_userId?: string) => {
    setIsLoading(true)
    try {
      const [groupsRes, bookmarksRes] = await Promise.all([
        getMyGroupsAction("all"),
        getUserBookmarksAction(),
      ])

      if (groupsRes.success && groupsRes.data) {
        setGroups(groupsRes.data)
      }
      if (bookmarksRes.success && bookmarksRes.data) {
        setBookmarks(bookmarksRes.data)
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
        // Also load recent local schedules for guest view
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
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Filter groups by active tab and search query
  const filteredGroups = useMemo(() => {
    let list = groups

    if (activeTab === "active") {
      list = list.filter((g) => !g.isArchived && g.status === "active")
    } else if (activeTab === "drafts") {
      list = list.filter((g) => g.status === "draft")
    } else if (activeTab === "completed") {
      list = list.filter((g) => g.status === "completed")
    } else if (activeTab === "archived") {
      list = list.filter((g) => g.isArchived)
    } else if (activeTab === "ramadan") {
      list = list.filter((g) => g.occasionType === "ramadan")
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        (g) =>
          g.groupName.toLowerCase().includes(q) ||
          (g.title && g.title.toLowerCase().includes(q)) ||
          (g.description && g.description.toLowerCase().includes(q))
      )
    }

    return list
  }, [groups, activeTab, searchQuery])

  // Derive today's reading sample from active group if available
  const sampleTodaysReading: TodaysReadingData | null = useMemo(() => {
    const active = groups.find((g) => !g.isArchived && g.status === "active")
    if (!active) return null

    return {
      groupPublicId: active.publicId,
      groupName: active.groupName,
      memberPublicId: "",
      memberName: user?.firstName || "أنت",
      weekNumber: 1,
      dayNumber: 1,
      surahNumber: 4,
      surahNameAr: "النساء",
      surahNameEn: "An-Nisa",
      startAyah: 48,
      endAyah: 71,
      juzNumber: 5,
      isCompleted: false,
    }
  }, [groups, user])

  // Derive continue reading from last bookmark
  const sampleContinueReading: ContinueReadingData | null = useMemo(() => {
    if (bookmarks.length === 0) return null
    const latest = bookmarks[0]
    return {
      surahNumber: latest.surahNumber,
      surahNameAr: "النساء",
      surahNameEn: "An-Nisa",
      ayahNumber: latest.ayahNumber,
      juzNumber: latest.juzNumber,
      note: latest.note,
    }
  }, [bookmarks])

  const welcomeMessage = t.dashboardWelcome.replace(
    "{name}",
    user?.firstName || (language === "ar" ? "بك" : "Guest")
  )

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="container mx-auto max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {/* Welcome Section */}
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl">👋</span>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {welcomeMessage}
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {t.dashboardSubtitle}
            </p>
          </div>

          <Link href="/">
            <Button className="h-10 gap-2 rounded-xl bg-primary px-4 text-xs font-extrabold text-primary-foreground shadow-sm hover:bg-primary/90">
              <IconPlus className="h-4 w-4" />
              <span>{t.dashboardQuickCreate}</span>
            </Button>
          </Link>
        </div>

        {/* Widgets Grid: Today's Reading & Continue Reading */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TodaysReadingWidget
              reading={sampleTodaysReading}
              onProgressUpdated={() => user && loadData(user.email)}
            />
          </div>
          <div>
            {sampleContinueReading ? (
              <ContinueReadingWidget data={sampleContinueReading} />
            ) : bookmarks.length > 0 ? (
              <UserBookmarksWidget
                bookmarks={bookmarks}
                onBookmarkDeleted={() => user && loadData(user.email)}
              />
            ) : (
              <div className="flex h-full flex-col justify-center rounded-2xl border border-dashed border-border p-6 text-center">
                <IconBookmark className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <h4 className="mt-2 text-xs font-bold text-foreground">
                  {t.bookmarksTitle}
                </h4>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {t.bookmarksEmpty}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* My Groups Section */}
        <div className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <IconUsers className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-extrabold text-foreground sm:text-xl">
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.dashboardSearchPlaceholder}
                className="h-9 rounded-xl border-border/80 ps-8 text-xs"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex h-auto flex-wrap gap-1 rounded-xl bg-muted/60 p-1">
                <TabsTrigger
                  value="active"
                  className="rounded-lg px-3 py-1.5 text-xs font-bold"
                >
                  {t.tabActive}
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="rounded-lg px-3 py-1.5 text-xs font-bold"
                >
                  {t.tabAll}
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="rounded-lg px-3 py-1.5 text-xs font-bold"
                >
                  {t.tabCompleted}
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className="rounded-lg px-3 py-1.5 text-xs font-bold"
                >
                  {t.tabArchived}
                </TabsTrigger>
                <TabsTrigger
                  value="ramadan"
                  className="rounded-lg px-3 py-1.5 text-xs font-bold"
                >
                  {t.tabRamadan}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Groups Grid */}
          {isLoading ? (
            <div className="mt-8 flex h-48 flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs font-semibold text-muted-foreground">
                {language === "ar"
                  ? "جاري تحميل الجداول..."
                  : "Loading schedules..."}
              </p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border/80 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <IconBook className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-foreground">
                {activeTab === "archived"
                  ? t.tabArchived
                  : t.dashboardNoActiveGroups}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {language === "ar"
                  ? "ابدأ بتنظيم ورد القرآن لعائلتك أو مجموعتك بسهولة."
                  : "Start by creating a Quran reading plan for your family or group."}
              </p>
              <Link href="/" className="mt-4 inline-block">
                <Button size="sm" className="rounded-xl text-xs font-extrabold">
                  <IconPlus className="me-1.5 h-4 w-4" />
                  <span>{t.dashboardQuickCreate}</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map((g, idx) => (
                <GroupCard
                  key={g.publicId ? `grp-${g.publicId}` : `grp-idx-${idx}`}
                  group={g}
                  onRefresh={() => loadData()}
                />
              ))}
            </div>
          )}
        </div>

        {/* Local Recent Schedules Section */}
        {recentSchedules.length > 0 && (
          <div className="mt-12 border-t border-border/60 pt-8">
            <div className="mb-4 flex items-center gap-2">
              <IconHistory className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-extrabold text-foreground">
                {t.dashboardRecentSchedules}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentSchedules.slice(0, 4).map((r, idx) => (
                <Link
                  key={
                    r.publicId
                      ? `recent-pub-${r.publicId}`
                      : `recent-idx-${idx}-${r.groupName}`
                  }
                  href={r.publicId ? `/g/${r.publicId}` : `/`}
                  className="rounded-xl border border-border/70 bg-card p-3.5 transition-colors hover:border-primary/40"
                >
                  <p className="truncate text-xs font-extrabold text-foreground">
                    {r.groupName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {r.weeksCount} {language === "ar" ? "أسابيع" : "weeks"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
