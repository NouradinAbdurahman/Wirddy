'use client';

import React from 'react';
import { motion } from 'motion/react';
import { IconArrowLeft, IconArrowRight, IconBook, IconCircleCheck } from '@tabler/icons-react';
import { useI18n } from '@/lib/i18n/context';
import { MemberAssignment } from '@/lib/scheduler/types';
import { Card, CardContent } from '@/components/ui/card';

interface MemberScheduleCardProps {
  assignment: MemberAssignment;
  index: number;
}

export function MemberScheduleCard({ assignment, index }: MemberScheduleCardProps) {
  const { language, dir, t, formatNumber } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(0.2, index * 0.03), ease: 'easeOut' }}
      className="w-full"
    >
      <Card className="border border-border/60 bg-card/90 dark:bg-card/70 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden text-start">
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          {/* Card Top: Strong Member Name & Subdued Amount */}
          <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 shrink-0 rounded-lg overflow-hidden flex items-center justify-center p-1 bg-muted/40 dark:bg-muted/20 border border-border/40">
                <img
                  src="/logo-black.png"
                  alt="Wirddy"
                  className="h-full w-full object-contain block dark:hidden"
                  suppressHydrationWarning
                />
                <img
                  src="/logo-white.png"
                  alt="Wirddy"
                  className="h-full w-full object-contain hidden dark:block"
                  suppressHydrationWarning
                />
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight break-words">
                {assignment.memberName}
              </h4>
            </div>

            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold text-muted-foreground bg-muted/60 dark:bg-muted/40 border border-border/50 shrink-0">
              {formatNumber(assignment.weeklyAmount)} {t.juzUnit}
            </div>
          </div>

          {/* Symmetrical Paired Start & End Quran References */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* START SECTION */}
            <div className="flex flex-col space-y-0.5">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-primary">
                {t.startLabel}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {t.juzLabel} {formatNumber(assignment.startJuz)}
              </span>
              <span className="text-sm font-extrabold text-foreground pt-0.5 break-words">
                {language === 'ar'
                  ? `سورة ${assignment.startAyah.surahNameAr}`
                  : `${assignment.startAyah.surahNameEn}`}
              </span>
              <span className="text-xs text-muted-foreground">
                {t.ayahLabel} {formatNumber(assignment.startAyah.ayahNumber)}
              </span>
            </div>

            {/* END SECTION */}
            <div className="flex flex-col space-y-0.5">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-primary">
                {t.endLabel}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {t.juzLabel} {formatNumber(assignment.endJuz)}
              </span>
              <span className="text-sm font-extrabold text-foreground pt-0.5 break-words">
                {language === 'ar'
                  ? `سورة ${assignment.endAyah.surahNameAr}`
                  : `${assignment.endAyah.surahNameEn}`}
              </span>
              <span className="text-xs text-muted-foreground">
                {t.ayahLabel} {formatNumber(assignment.endAyah.ayahNumber)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
