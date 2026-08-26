'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';

export function Footer() {
  const { t, formatNumber } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-muted/20 py-8 text-center text-xs text-muted-foreground">
      <div className="container mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Light mode: black logo */}
          <img
            src="/wirddy-logo-black.png"
            alt={t.appName}
            className="h-6 sm:h-7 w-auto object-contain block dark:hidden"
            suppressHydrationWarning
          />
          {/* Dark mode: white logo */}
          <img
            src="/wirddy-logo-white.png"
            alt={t.appName}
            className="h-6 sm:h-7 w-auto object-contain hidden dark:block"
            suppressHydrationWarning
          />
          <span className="hidden sm:inline text-muted-foreground/40">•</span>
          <span className="text-muted-foreground">{t.tagline}</span>
        </div>
        <div>
          <span>
            © {formatNumber(currentYear)} {t.appName}. {t.footerRights}.
          </span>
        </div>
      </div>
    </footer>
  );
}
