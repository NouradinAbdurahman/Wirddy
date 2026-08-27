"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  IconBell,
  IconBookmark,
  IconBook2,
  IconCalendarEvent,
  IconChartBar,
  IconDeviceMobile,
  IconDownload,
  IconHistory,
  IconLanguage,
  IconLayoutDashboard,
  IconLogout,
  IconMoon,
  IconSearch,
  IconSettings,
  IconSpeakerphone,
  IconSun,
  IconUser,
  IconUsers,
  IconX,
  IconMenu2,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { extractUserProfile, UserProfileInfo } from "@/lib/auth/user"
import { cn } from "@/lib/utils"

export type NavItemKey =
  | "dashboard"
  | "schedule"
  | "reader"
  | "bookmarks"
  | "search"
  | "groups"
  | "progress"
  | "announcements"
  | "history"
  | "notifications"
  | "settings"

interface AppSidebarProps {
  activeKey?: NavItemKey
  unreadAnnouncementsCount?: number
  onNavigateTab?: (key: NavItemKey) => void
  currentReadingPortion?: {
    surahName: string
    ayahRange: string
    juzNumber: number
    percentComplete?: number
  } | null
  className?: string
}

export function AppSidebar({
  activeKey = "dashboard",
  unreadAnnouncementsCount = 0,
  onNavigateTab,
  currentReadingPortion,
  className,
}: AppSidebarProps) {
  const { language, setLanguage, dir, t } = useI18n()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<UserProfileInfo | null>(null)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(extractUserProfile(session.user))
      } else {
        setUser(null)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(extractUserProfile(session.user))
      } else {
        setUser(null)
      }
    })

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient()
    if (supabase) {
      await supabase.auth.signOut()
      setUser(null)
      window.location.href = "/"
    }
  }

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt()
      installPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === "accepted") {
          setInstallPrompt(null)
        }
      })
    } else {
      window.location.href = "/#install"
    }
  }

  const isDark = mounted ? theme === "dark" || resolvedTheme === "dark" : false

  const navItems = [
    {
      key: "dashboard" as NavItemKey,
      label: t.navDashboard,
      icon: IconLayoutDashboard,
      href: "/dashboard",
    },
    {
      key: "schedule" as NavItemKey,
      label: t.navMySchedule,
      icon: IconCalendarEvent,
      href: "/",
    },
    {
      key: "reader" as NavItemKey,
      label: t.navQuranReader,
      icon: IconBook2,
      href: "/reader",
    },
    {
      key: "bookmarks" as NavItemKey,
      label: t.navBookmarks,
      icon: IconBookmark,
      href: "/dashboard?tab=bookmarks",
    },
    {
      key: "search" as NavItemKey,
      label: t.navSearch,
      icon: IconSearch,
      href: "/dashboard?tab=search",
    },
    {
      key: "groups" as NavItemKey,
      label: t.navMyGroups,
      icon: IconUsers,
      href: "/dashboard?tab=groups",
    },
    {
      key: "progress" as NavItemKey,
      label: t.navGroupProgress,
      icon: IconChartBar,
      href: "/dashboard?tab=progress",
    },
    {
      key: "announcements" as NavItemKey,
      label: t.navAnnouncements,
      icon: IconSpeakerphone,
      href: "/dashboard?tab=announcements",
      badge: unreadAnnouncementsCount > 0 ? unreadAnnouncementsCount : undefined,
    },
    {
      key: "history" as NavItemKey,
      label: t.navHistory,
      icon: IconHistory,
      href: "/dashboard?tab=history",
    },
    {
      key: "notifications" as NavItemKey,
      label: t.navNotifications,
      icon: IconBell,
      href: "/dashboard?tab=notifications",
    },
    {
      key: "settings" as NavItemKey,
      label: t.navSettings,
      icon: IconSettings,
      href: "/settings",
    },
  ]

  const renderNavContent = () => (
    <div className="flex h-full flex-col justify-between overflow-y-auto p-3.5">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-2 pb-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-transform active:scale-95"
          >
            <img
              src="/wirddy-logo-black.png"
              alt={t.appName}
              className="block h-7 w-auto object-contain dark:hidden"
            />
            <img
              src="/wirddy-logo-white.png"
              alt={t.appName}
              className="hidden h-7 w-auto object-contain dark:block"
            />
          </Link>

          {/* Quick Language Switcher & Theme */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="flex h-7 px-1.5 items-center rounded-lg border border-border/60 bg-muted/40 text-[10px] font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={language === "ar" ? "Switch to English" : "التحويل إلى العربية"}
            >
              {language === "ar" ? "EN" : "عربي"}
            </button>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {mounted && isDark ? (
                <IconSun className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <IconMoon className="h-3.5 w-3.5 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items List */}
        <nav className="mt-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isItemActive = activeKey === item.key

            const handleClick = (e: React.MouseEvent) => {
              setIsMobileOpen(false)
              if (onNavigateTab && pathname === "/dashboard" && item.href.startsWith("/dashboard")) {
                e.preventDefault()
                onNavigateTab(item.key)
              }
            }

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={handleClick}
                className={cn(
                  "group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all",
                  isItemActive
                    ? "bg-primary/15 font-extrabold text-primary shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      isItemActive ? "text-primary" : "text-muted-foreground/80"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <Badge className="h-4 min-w-4 px-1 text-[10px] font-extrabold bg-primary text-primary-foreground">
                    {item.badge}
                  </Badge>
                )}

                {isItemActive && (
                  <span
                    className={cn(
                      "absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary",
                      dir === "rtl" ? "right-1" : "left-1"
                    )}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section: Reading Progress Widget, Install PWA, Profile */}
      <div className="space-y-3 pt-4 border-t border-border/50">
        {/* Today's Reading mini progress card */}
        {currentReadingPortion ? (
          <Link
            href="/reader"
            onClick={() => setIsMobileOpen(false)}
            className="block rounded-xl border border-primary/20 bg-primary/5 p-2.5 transition-colors hover:border-primary/40 hover:bg-primary/10"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-primary">
                {t.sidebarReadingProgress}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {t.readerJuz} {currentReadingPortion.juzNumber}
              </span>
            </div>
            <p className="mt-1 truncate text-xs font-bold text-foreground">
              سورة {currentReadingPortion.surahName}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {currentReadingPortion.ayahRange}
            </p>
          </Link>
        ) : (
          <Link
            href="/reader"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-card/60 p-2.5 text-xs font-bold text-foreground transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <IconBook2 className="h-4 w-4 text-primary" />
              <span>{t.quickActionOpenQuran}</span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              {language === "ar" ? "٣٠ جزءاً" : "30 Juz"}
            </span>
          </Link>
        )}

        {/* Install App Trigger */}
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <div className="flex items-center gap-2">
            <IconDeviceMobile className="h-3.5 w-3.5 text-primary" />
            <span>{t.sidebarInstallApp}</span>
          </div>
          <IconDownload className="h-3.5 w-3.5 opacity-70" />
        </button>

        {/* User Profile / Auth Status */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-xl border border-border/70 bg-card/90 p-2 text-start transition-all hover:bg-muted focus-visible:outline-none">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-border/60"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-extrabold text-primary">
                  {(user.firstName[0] || "U").toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-foreground">
                  {user.firstName}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 text-start">
              <div className="px-2 py-1.5 border-b border-border/60 mb-1">
                <p className="truncate text-xs font-extrabold text-foreground">
                  {user.fullName}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <Link href="/settings" onClick={() => setIsMobileOpen(false)}>
                <DropdownMenuItem className="cursor-pointer gap-2 text-xs font-semibold">
                  <IconSettings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{t.settingsTitle}</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer gap-2 text-xs font-bold text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <IconLogout className="h-3.5 w-3.5" />
                <span>{t.authSignOut}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login" onClick={() => setIsMobileOpen(false)} className="block">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 gap-2 rounded-xl text-xs font-bold hover:bg-muted"
            >
              <IconUser className="h-3.5 w-3.5" />
              <span>{t.authSignIn}</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 border-border/60 bg-card/60 backdrop-blur-md lg:block",
          dir === "rtl" ? "border-l" : "border-r",
          "w-60 h-screen sticky top-0 z-30",
          className
        )}
      >
        {renderNavContent()}
      </aside>

      {/* Mobile Top Navigation Header */}
      <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-3 backdrop-blur-md sm:px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/wirddy-logo-black.png"
            alt={t.appName}
            className="block h-6 w-auto object-contain dark:hidden"
          />
          <img
            src="/wirddy-logo-white.png"
            alt={t.appName}
            className="hidden h-6 w-auto object-contain dark:block"
          />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/reader">
            <Button variant="ghost" size="sm" className="h-8 gap-1 rounded-xl px-2 text-xs font-bold text-primary hover:bg-primary/10">
              <IconBook2 className="h-4 w-4" />
              <span className="hidden xs:inline">{t.navQuranReader}</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileOpen(true)}
            className="h-8 w-8 rounded-xl border-border/70"
            aria-label="Open Navigation Menu"
          >
            <IconMenu2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay Drawer with strict RTL/LTR side slide */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/70 backdrop-blur-xs lg:hidden">
          <div
            className={cn(
              "relative flex h-full w-72 max-w-[85vw] flex-col bg-background shadow-2xl transition-all overflow-y-auto",
              dir === "rtl" ? "ms-auto" : "me-auto"
            )}
          >
            <div className="absolute end-3 top-3 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                className="h-7 w-7 rounded-full hover:bg-muted"
                aria-label="Close Navigation"
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>
            {renderNavContent()}
          </div>
          <div
            className="flex-1 cursor-pointer"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close backdrop"
          />
        </div>
      )}
    </>
  )
}
