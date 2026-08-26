'use client';

import React from 'react';
import { IconArrowLeft, IconArrowRight, IconBook, IconCalendarEvent, IconSparkles, IconUsers } from '@tabler/icons-react';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface HeroProps {
  onCreateGroup: () => void;
  onHowItWorks: () => void;
}

export function Hero({ onCreateGroup, onHowItWorks }: HeroProps) {
  const { language, dir, t, formatNumber } = useI18n();
  const ArrowIcon = dir === 'rtl' ? IconArrowLeft : IconArrowRight;

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Main Heading */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15]"
        >
          <span className="block text-primary">{t.appName}</span>
          <span className="block mt-2 text-2xl sm:text-3xl md:text-4xl font-semibold text-muted-foreground">
            {t.tagline}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          {t.heroSubtitle}
        </p>

        {/* Action Buttons */}
        <div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <Button
            size="lg"
            onClick={onCreateGroup}
            className="w-full sm:w-auto h-12 px-7 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all gap-2"
          >
            <span>{t.ctaCreateGroup}</span>
            <ArrowIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onHowItWorks}
            className="w-full sm:w-auto h-12 px-6 text-base font-medium rounded-xl border-border/80 hover:bg-muted/70 transition-colors"
          >
            {t.ctaHowItWorks}
          </Button>
        </div>

        {/* Hero Interactive Mini-Schedule Card Preview */}
        <div
          className="mt-12 max-w-3xl mx-auto"
        >
          <Card className="border border-border/60 bg-card/70 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden text-start p-0 py-0 gap-0">
            {/* Header flush with the top edge with distinct background and generous padding */}
            <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-border/60 bg-muted/60 dark:bg-muted/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  {language === 'ar' ? 'نموذج جدول دوري — الأسبوع الأول' : 'Sample Rotating Schedule — Week 1'}
                </span>
              </div>
              <Badge variant="outline" className="text-xs sm:text-sm font-semibold px-3.5 py-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shrink-0">
                {language === 'ar' ? '٣٠ جزءًا • ختمة أسبوعية' : '30 Juz • 1 Complete Quran'}
              </Badge>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Sample Card 1 */}
              <div className="p-4 rounded-2xl bg-card/90 dark:bg-card/70 border border-border/60 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2.5 mb-2.5">
                  <span className="font-extrabold text-sm text-foreground break-words">
                    {language === 'ar' ? 'طارق' : 'Tariq'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/60 dark:bg-muted/40 border border-border/50 text-muted-foreground shrink-0">
                    {formatNumber(5)} {t.juzUnit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-[9px] uppercase font-extrabold tracking-wider text-primary">
                      {t.startLabel}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {t.juzLabel} {formatNumber(1)}
                    </span>
                    <span className="text-xs font-extrabold text-foreground pt-0.5 break-words">
                      {language === 'ar' ? 'الفاتحة ١' : 'Al-Fatihah 1'}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-0.5">
                    <span className="text-[9px] uppercase font-extrabold tracking-wider text-primary">
                      {t.endLabel}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {t.juzLabel} {formatNumber(5)}
                    </span>
                    <span className="text-xs font-extrabold text-foreground pt-0.5 break-words">
                      {language === 'ar' ? 'النساء ١٤٧' : 'An-Nisa 147'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Card 2 */}
              <div className="p-4 rounded-2xl bg-card/90 dark:bg-card/70 border border-border/60 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2.5 mb-2.5">
                  <span className="font-extrabold text-sm text-foreground break-words">
                    {language === 'ar' ? 'زينب' : 'Zainab'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/60 dark:bg-muted/40 border border-border/50 text-muted-foreground shrink-0">
                    {formatNumber(2)} {t.juzUnit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-[9px] uppercase font-extrabold tracking-wider text-primary">
                      {t.startLabel}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {t.juzLabel} {formatNumber(6)}
                    </span>
                    <span className="text-xs font-extrabold text-foreground pt-0.5 break-words">
                      {language === 'ar' ? 'النساء ١٤٨' : 'An-Nisa 148'}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-0.5">
                    <span className="text-[9px] uppercase font-extrabold tracking-wider text-primary">
                      {t.endLabel}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {t.juzLabel} {formatNumber(7)}
                    </span>
                    <span className="text-xs font-extrabold text-foreground pt-0.5 break-words">
                      {language === 'ar' ? 'الأنعام ١١٠' : 'Al-An\'am 110'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Card 3 */}
              <div className="p-4 rounded-2xl bg-card/90 dark:bg-card/70 border border-border/60 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2.5 mb-2.5">
                  <span className="font-extrabold text-sm text-foreground break-words">
                    {language === 'ar' ? 'يوسف' : 'Yousef'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/60 dark:bg-muted/40 border border-border/50 text-muted-foreground shrink-0">
                    {formatNumber(2)} {t.juzUnit}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-[9px] uppercase font-extrabold tracking-wider text-primary">
                      {t.startLabel}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {t.juzLabel} {formatNumber(26)}
                    </span>
                    <span className="text-xs font-extrabold text-foreground pt-0.5 break-words">
                      {language === 'ar' ? 'الأحقاف ١' : 'Al-Ahqaf 1'}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-0.5">
                    <span className="text-[9px] uppercase font-extrabold tracking-wider text-primary">
                      {t.endLabel}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {t.juzLabel} {formatNumber(27)}
                    </span>
                    <span className="text-xs font-extrabold text-foreground pt-0.5 break-words">
                      {language === 'ar' ? 'الحديد ٢٩' : 'Al-Hadid 29'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
