"use client"

import React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  IconLanguage,
  IconLayoutDashboard,
  IconLogout,
  IconMenu2,
  IconMoon,
  IconSun,
  IconUser,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { extractUserProfile, UserProfileInfo } from "@/lib/auth/user"

interface HeaderProps {
  onNewGroup?: () => void
  onShowHowItWorks?: () => void
  onGoHome?: () => void
  onLogoClick?: () => void
  inPlanner?: boolean
}

export function Header({
  onNewGroup,
  onShowHowItWorks,
  onGoHome,
  onLogoClick,
  inPlanner,
}: HeaderProps) {
  const { language, setLanguage, t } = useI18n()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [user, setUser] = React.useState<UserProfileInfo | null>(null)

  React.useEffect(() => {
    setMounted(true)

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    // Initial session & user profile check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(extractUserProfile(session.user))
      } else {
        setUser(null)
      }

      // If landed with code/error query param in address bar, cleanly strip it
      if (
        typeof window !== "undefined" &&
        (window.location.search.includes("code=") ||
          window.location.search.includes("error="))
      ) {
        const cleanUrl = window.location.pathname + (window.location.hash || "")
        window.history.replaceState({}, "", cleanUrl)
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

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient()
    if (supabase) {
      await supabase.auth.signOut()
      setUser(null)
    }
  }

  const isDark = mounted ? theme === "dark" || resolvedTheme === "dark" : false

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md print:hidden">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault()
              if (onLogoClick) {
                onLogoClick()
              } else if (onGoHome) {
                onGoHome()
              } else {
                window.location.href = "/"
              }
            }}
            className="group flex cursor-pointer items-center gap-2.5 transition-transform active:scale-95"
          >
            {/* Light mode: black logo */}
            <img
              src="/wirddy-logo-black.png"
              alt={t.appName}
              className="block h-8 w-auto object-contain sm:h-9 dark:hidden"
              suppressHydrationWarning
            />
            {/* Dark mode: white logo */}
            <img
              src="/wirddy-logo-white.png"
              alt={t.appName}
              className="hidden h-8 w-auto object-contain sm:h-9 dark:block"
              suppressHydrationWarning
            />
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Desktop Only: Language Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="hidden h-9 gap-1.5 rounded-lg border-border/70 px-3 text-xs font-bold tracking-wide hover:bg-muted sm:inline-flex"
            title={
              language === "ar" ? "Switch to English" : "التحويل إلى العربية"
            }
          >
            <IconLanguage className="h-4 w-4" />
            <span>{language === "ar" ? "ENG" : "AR"}</span>
          </Button>

          {/* Desktop Only: Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-neutral-800 bg-neutral-900 text-white shadow-sm transition-colors hover:bg-neutral-800 hover:text-white sm:inline-flex dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            aria-label="Toggle theme"
          >
            {mounted ? (
              isDark ? (
                <IconSun className="h-4 w-4 text-white" />
              ) : (
                <IconMoon className="h-4 w-4 text-white" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </Button>

          {/* Authenticated Profile / Sign-In Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={
                  language === "ar" ? "قائمة الحساب" : "Open account menu"
                }
                className="inline-flex h-9 max-w-[160px] cursor-pointer items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-2.5 text-xs font-bold text-foreground transition-all hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:max-w-[200px]"
              >
                <span className="truncate text-xs font-bold">
                  {user.firstName}
                </span>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-border/50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-extrabold text-primary">
                    {(user.firstName[0] || "U").toUpperCase()}
                  </div>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 text-start">
                {/* Full Profile Information Header */}
                <div className="flex items-center gap-3 p-2">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border/60"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-extrabold text-primary">
                      {(user.firstName[0] || "U").toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-xs font-extrabold text-foreground">
                      {user.fullName}
                    </p>
                    <p className="truncate text-[11px] font-medium text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold">
                    <IconLayoutDashboard className="h-4 w-4 shrink-0 text-primary" />
                    <span>{t.navDashboard}</span>
                  </DropdownMenuItem>
                </Link>

                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold">
                    <IconUser className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{t.settingsTitle}</span>
                  </DropdownMenuItem>
                </Link>

                {/* Mobile-only Quick Controls: Language & Theme */}
                <div className="sm:hidden">
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                    className="cursor-pointer justify-between rounded-lg px-2.5 py-2 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <IconLanguage className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>
                        {language === "ar"
                          ? "English (الإنجليزية)"
                          : "العربية (Arabic)"}
                      </span>
                    </div>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {language === "ar" ? "ENG" : "AR"}
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="cursor-pointer justify-between rounded-lg px-2.5 py-2 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      {mounted && isDark ? (
                        <IconSun className="h-4 w-4 shrink-0 text-amber-500" />
                      ) : (
                        <IconMoon className="h-4 w-4 shrink-0 text-primary" />
                      )}
                      <span>
                        {mounted
                          ? isDark
                            ? language === "ar"
                              ? "الوضع الفاتح"
                              : "Light Mode"
                            : language === "ar"
                              ? "الوضع الداكن"
                              : "Dark Mode"
                          : language === "ar"
                            ? "المظهر"
                            : "Theme"}
                      </span>
                    </div>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator />

                {/* Sign-Out Action */}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <IconLogout className="h-4 w-4 shrink-0" />
                  <span>{t.authSignOut}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {/* Desktop Sign-In Button */}
              <Link href="/login" className="hidden sm:inline-flex">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-lg border-border/70 px-3 text-xs font-bold hover:bg-muted"
                >
                  <IconUser className="h-4 w-4" />
                  <span>{t.authSignIn}</span>
                </Button>
              </Link>

              {/* Mobile Guest Hamburger Menu */}
              <div className="flex sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label={
                      language === "ar" ? "القائمة الرئيسية" : "Main menu"
                    }
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border/70 bg-card/60 text-foreground transition-all hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <IconMenu2 className="h-5 w-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 p-2 text-start"
                  >
                    <Link href="/login">
                      <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg bg-primary/10 px-2.5 py-2 text-xs font-bold text-primary focus:bg-primary/20">
                        <IconUser className="h-4 w-4 shrink-0" />
                        <span>{t.authSignIn}</span>
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() =>
                        setLanguage(language === "ar" ? "en" : "ar")
                      }
                      className="cursor-pointer justify-between rounded-lg px-2.5 py-2 text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <IconLanguage className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>
                          {language === "ar"
                            ? "English (الإنجليزية)"
                            : "العربية (Arabic)"}
                        </span>
                      </div>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {language === "ar" ? "ENG" : "AR"}
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setTheme(isDark ? "light" : "dark")}
                      className="cursor-pointer justify-between rounded-lg px-2.5 py-2 text-xs font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        {mounted && isDark ? (
                          <IconSun className="h-4 w-4 shrink-0 text-amber-500" />
                        ) : (
                          <IconMoon className="h-4 w-4 shrink-0 text-primary" />
                        )}
                        <span>
                          {mounted
                            ? isDark
                              ? language === "ar"
                                ? "الوضع الفاتح"
                                : "Light Mode"
                              : language === "ar"
                                ? "الوضع الداكن"
                                : "Dark Mode"
                            : language === "ar"
                              ? "المظهر"
                              : "Theme"}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
