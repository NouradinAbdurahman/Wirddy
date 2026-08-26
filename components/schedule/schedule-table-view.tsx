'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useI18n } from '@/lib/i18n/context';
import { MemberAssignment, WeekSchedule } from '@/lib/scheduler/types';
import { Card } from '@/components/ui/card';

interface ScheduleTableViewProps {
  week: WeekSchedule;
}

export function ScheduleTableView({ week }: ScheduleTableViewProps) {
  const { language, t, formatNumber } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full"
    >
      <Card className="border border-border/60 bg-card/90 dark:bg-card/70 backdrop-blur-md rounded-2xl shadow-sm overflow-hidden p-0 gap-0 text-start">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-start text-sm">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-border/60 bg-muted/50 dark:bg-muted/25 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4 sm:px-5 text-start w-[28%] min-w-[140px]">
                  {t.tableHeaderMember}
                </th>
                <th className="py-3 px-3 text-center w-[12%] min-w-[70px]">
                  {t.tableHeaderAmount}
                </th>
                <th className="py-3 px-4 sm:px-5 text-start w-[30%] min-w-[160px]">
                  <span className="text-primary">{t.tableHeaderStart}</span>
                </th>
                <th className="py-3 px-4 sm:px-5 text-start w-[30%] min-w-[160px]">
                  <span className="text-primary">{t.tableHeaderEnd}</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border/40">
              {week.assignments.map((assignment: MemberAssignment, idx: number) => {
                const startSurah =
                  language === 'ar'
                    ? `سورة ${assignment.startAyah.surahNameAr}`
                    : assignment.startAyah.surahNameEn;
                const endSurah =
                  language === 'ar'
                    ? `سورة ${assignment.endAyah.surahNameAr}`
                    : assignment.endAyah.surahNameEn;

                return (
                  <tr
                    key={`${assignment.memberId}-${idx}`}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Member Name */}
                    <td className="py-3.5 px-4 sm:px-5 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 shrink-0 rounded-md overflow-hidden flex items-center justify-center p-1 bg-muted/40 dark:bg-muted/20 border border-border/40">
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
                        <span className="font-extrabold text-sm sm:text-base text-foreground break-words leading-tight">
                          {assignment.memberName}
                        </span>
                      </div>
                    </td>

                    {/* Reading Amount */}
                    <td className="py-3.5 px-3 text-center align-middle">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold text-muted-foreground bg-muted/60 dark:bg-muted/40 border border-border/50">
                        {formatNumber(assignment.weeklyAmount)}
                      </span>
                    </td>

                    {/* Start Location */}
                    <td className="py-3.5 px-4 sm:px-5 align-middle">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-[11px] font-bold text-muted-foreground">
                          {t.juzLabel} {formatNumber(assignment.startJuz)}
                        </span>
                        <span className="text-sm font-extrabold text-foreground break-words leading-tight">
                          {startSurah}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t.ayahLabel} {formatNumber(assignment.startAyah.ayahNumber)}
                        </span>
                      </div>
                    </td>

                    {/* End Location */}
                    <td className="py-3.5 px-4 sm:px-5 align-middle">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-[11px] font-bold text-muted-foreground">
                          {t.juzLabel} {formatNumber(assignment.endJuz)}
                        </span>
                        <span className="text-sm font-extrabold text-foreground break-words leading-tight">
                          {endSurah}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t.ayahLabel} {formatNumber(assignment.endAyah.ayahNumber)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
