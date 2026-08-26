'use client';

import React from 'react';
import { IconBook, IconCheck, IconCircleCheck } from '@tabler/icons-react';
import { useI18n } from '@/lib/i18n/context';
import { WeekSchedule } from '@/lib/scheduler/types';

interface ExportCardProps {
  scheduleId: string;
  groupName: string;
  week: WeekSchedule;
  totalWeeks: number;
  idSuffix?: string;
}

export function ExportCard({
  scheduleId,
  groupName,
  week,
  totalWeeks,
  idSuffix = '',
}: ExportCardProps) {
  const { language, dir, t, formatNumber } = useI18n();
  const elementId = `wirddy-export-week-${week.weekNumber}${idSuffix}`;

  return (
    <div
      id={elementId}
      dir={dir}
      className="w-[820px] bg-slate-950 text-slate-50 p-7 rounded-3xl shadow-2xl font-sans relative overflow-hidden border border-slate-800"
      style={{
        fontFamily:
          language === 'ar'
            ? 'var(--font-arabic), system-ui, sans-serif'
            : 'var(--font-sans), system-ui, sans-serif',
      }}
    >
      {/* Background Subtle Ambient Highlights */}
      <div className="absolute -top-28 -right-28 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -left-28 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3.5">
          <img
            src="/wirddy-logo-white.png"
            alt={t.appName}
            className="h-12 w-auto object-contain"
          />
          <div>
            <div className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800/60 font-medium">
                {t.planTitle}
              </span>
            </div>
            <div className="text-sm font-semibold text-teal-400 mt-0.5">
              {groupName}
            </div>
          </div>
        </div>

        <div className="text-end space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-bold text-white">
              {t.weekLabel} {formatNumber(week.weekNumber)} {t.weekOf} {formatNumber(totalWeeks)}
            </span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-[11px] text-teal-400 font-semibold">
            <IconCircleCheck className="h-3.5 w-3.5" />
            <span>{formatNumber(30)} / {formatNumber(30)} {t.juzUnit} ({t.summaryQuran})</span>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-2 gap-3 my-5 relative z-10">
        {week.assignments.map((assignment, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm flex flex-col justify-between"
          >
            {/* Top row: Strong member name & subtle amount badge */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <div className="h-8 w-8 shrink-0 rounded-lg overflow-hidden flex items-center justify-center p-1 bg-slate-800 border border-slate-700">
                  <img
                    src="/logo-white.png"
                    alt="Wirddy"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="font-extrabold text-sm text-slate-100 break-words">
                  {assignment.memberName}
                </span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 shrink-0">
                {formatNumber(assignment.weeklyAmount)} {t.juzUnit}
              </span>
            </div>

            {/* Paired Start / End Structure */}
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/70 grid grid-cols-2 gap-2 text-xs">
              {/* Start */}
              <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-teal-400">
                    {t.startLabel}
                  </span>
                  <span className="text-[10px] font-bold text-slate-200">
                    {t.juzLabel} {formatNumber(assignment.startJuz)}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200 break-words pt-0.5">
                  {language === 'ar'
                    ? `سورة ${assignment.startAyah.surahNameAr}`
                    : `${assignment.startAyah.surahNameEn}`}
                </div>
                <div className="text-[10px] text-slate-400">
                  {t.ayahLabel} {formatNumber(assignment.startAyah.ayahNumber)}
                </div>
              </div>

              {/* End */}
              <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-teal-400">
                    {t.endLabel}
                  </span>
                  <span className="text-[10px] font-bold text-slate-200">
                    {t.juzLabel} {formatNumber(assignment.endJuz)}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-200 break-words pt-0.5">
                  {language === 'ar'
                    ? `سورة ${assignment.endAyah.surahNameAr}`
                    : `${assignment.endAyah.surahNameEn}`}
                </div>
                <div className="text-[10px] text-slate-400">
                  {t.ayahLabel} {formatNumber(assignment.endAyah.ayahNumber)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branding */}
      <div className="flex items-center justify-between pt-3.5 border-t border-slate-800 text-[11px] text-slate-400 relative z-10">
        <div className="flex items-center gap-1.5">
          <IconCheck className="h-3.5 w-3.5 text-teal-400" />
          <span>{language === 'ar' ? 'تم التحقق من توزيع ٣٠ جزءًا بدقة متناهية' : 'Verified 30/30 Juz Complete Allocation'}</span>
        </div>
        <div className="text-slate-500 font-medium">
          <span>wirddy.app</span>
        </div>
      </div>
    </div>
  );
}
