"use client"

import React from "react"
import { useI18n } from "@/lib/i18n/context"

export function Footer() {
  const { t, formatNumber } = useI18n()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border/40 bg-muted/20 py-8 text-center text-xs text-muted-foreground">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <div className="flex items-center gap-3">
          {/* Light mode: black logo */}
          <img
            src="/wirddy-logo-black.png"
            alt={t.appName}
            className="block h-6 w-auto object-contain sm:h-7 dark:hidden"
            suppressHydrationWarning
          />
          {/* Dark mode: white logo */}
          <img
            src="/wirddy-logo-white.png"
            alt={t.appName}
            className="hidden h-6 w-auto object-contain sm:h-7 dark:block"
            suppressHydrationWarning
          />
          <span className="hidden text-muted-foreground/40 sm:inline">•</span>
          <span className="text-muted-foreground">{t.tagline}</span>
        </div>
        <div>
          <span>
            © {formatNumber(currentYear)} {t.appName}. {t.footerRights}.
          </span>
        </div>
      </div>
    </footer>
  )
}
