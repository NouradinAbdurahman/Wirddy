"use client"

import React from "react"
import { useI18n } from "@/lib/i18n/context"

export function Footer() {
  const { t, formatNumber } = useI18n()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border/40 bg-muted/20 py-10 text-center text-xs text-muted-foreground print:hidden">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:gap-4">
        {/* Branding */}
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
          <div className="flex items-center gap-2.5">
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
          </div>
          <span className="hidden text-muted-foreground/40 sm:inline">•</span>
          <span className="text-muted-foreground">{t.tagline}</span>
        </div>

        {/* Quick Nav Links */}
        <nav className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-muted-foreground/80 sm:gap-6">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            {t.navHowItWorks}
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            {t.navFeatures}
          </a>
          <a href="#preview" className="transition-colors hover:text-foreground">
            {t.navPreview}
          </a>
          <a href="#install" className="transition-colors hover:text-foreground">
            {t.navInstall}
          </a>
        </nav>

        {/* Copyright */}
        <div>
          <span>
            © {formatNumber(currentYear)} {t.appName}. {t.footerRights}.
          </span>
        </div>
      </div>
    </footer>
  )
}
