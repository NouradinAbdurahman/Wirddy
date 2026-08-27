"use client"

import React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { IconBook, IconLanguage, IconMoon, IconSun } from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? theme === "dark" || resolvedTheme === "dark" : false

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
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
          {/* Language Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="h-9 gap-1.5 rounded-lg border-border/70 px-3 text-xs font-bold tracking-wide hover:bg-muted"
            title={
              language === "ar" ? "Switch to English" : "التحويل إلى العربية"
            }
          >
            <IconLanguage className="h-4 w-4" />
            <span>{language === "ar" ? "ENG" : "AR"}</span>
          </Button>

          {/* Theme Toggle with White Icon in both modes */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-9 w-9 cursor-pointer rounded-lg border-neutral-800 bg-neutral-900 text-white shadow-sm transition-colors hover:bg-neutral-800 hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
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
        </div>
      </div>
    </header>
  )
}
