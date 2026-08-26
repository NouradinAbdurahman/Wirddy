'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconFileTypePdf,
  IconFileTypePng,
  IconFileZip,
  IconLoader2,
  IconShare,
} from '@tabler/icons-react';
import { useI18n } from '@/lib/i18n/context';
import { GeneratedSchedule } from '@/lib/scheduler/types';
import {
  ExportTheme,
  ExportViewMode,
  exportAllWeeksAsZip,
  exportScheduleAsPdf,
  exportWeekAsPng,
  normalizeScheduleToExport,
  normalizeWeekSchedule,
} from '@/lib/export';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: GeneratedSchedule;
  activeWeek: number;
  viewMode?: ExportViewMode;
}

export function ExportModal({
  open,
  onOpenChange,
  schedule,
  activeWeek,
  viewMode = 'cards',
}: ExportModalProps) {
  const { language, t, formatNumber } = useI18n();
  const { theme, resolvedTheme } = useTheme();

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeExportTheme: ExportTheme =
    (theme === 'light' || resolvedTheme === 'light') ? 'light' : 'dark';

  const resetStatus = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // 1. Download Current Week (PNG)
  const handleExportCurrentPng = async () => {
    if (isExporting) return;
    setIsExporting(true);
    resetStatus();
    setExportProgress(t.exportLoadingCurrent);

    try {
      const targetWeek =
        schedule.weeks.find((w) => w.weekNumber === activeWeek) || schedule.weeks[0];

      const exportWeek = normalizeWeekSchedule(
        targetWeek,
        schedule.weeksCount,
        schedule.groupName,
        language,
        activeExportTheme,
        viewMode
      );

      await exportWeekAsPng(exportWeek, { theme: activeExportTheme, view: viewMode });
      setSuccessMessage(t.exportSuccess);
      setTimeout(() => {
        onOpenChange(false);
        setSuccessMessage(null);
      }, 1200);
    } catch (err) {
      console.error('Current week PNG export failed:', err);
      setErrorMessage(t.exportError);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // 2. Download All Weeks (ZIP)
  const handleExportAllZip = async () => {
    if (isExporting) return;
    setIsExporting(true);
    resetStatus();
    setExportProgress(t.exportLoadingAll);

    try {
      const exportSchedule = normalizeScheduleToExport(
        schedule,
        language,
        activeExportTheme,
        viewMode
      );
      await exportAllWeeksAsZip(
        exportSchedule,
        { theme: activeExportTheme, view: viewMode },
        (_curr, _total, msg) => {
          setExportProgress(msg);
        }
      );

      setSuccessMessage(t.exportSuccess);
      setTimeout(() => {
        onOpenChange(false);
        setSuccessMessage(null);
      }, 1200);
    } catch (err) {
      console.error('All weeks ZIP export failed:', err);
      setErrorMessage(t.exportError);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // 3. Download Full Plan (PDF)
  const handleExportFullPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    resetStatus();
    setExportProgress(t.exportLoadingPdf);

    try {
      const exportSchedule = normalizeScheduleToExport(
        schedule,
        language,
        activeExportTheme,
        viewMode
      );
      await exportScheduleAsPdf(
        exportSchedule,
        { theme: activeExportTheme, view: viewMode },
        (_curr, _total, msg) => {
          setExportProgress(msg);
        }
      );

      setSuccessMessage(t.exportSuccess);
      setTimeout(() => {
        onOpenChange(false);
        setSuccessMessage(null);
      }, 1200);
    } catch (err) {
      console.error('Full plan PDF export failed:', err);
      setErrorMessage(t.exportError);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${t.appName} - ${schedule.groupName}`,
          text: `${t.planTitle}: ${schedule.groupName} (${schedule.weeksCount} ${t.weeksUnit})`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isExporting && onOpenChange(val)}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 text-start">
        <DialogHeader className="space-y-1.5 pb-2">
          <DialogTitle className="text-xl font-bold text-foreground">
            {t.exportTitle}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {t.exportSubtitle}
          </DialogDescription>
        </DialogHeader>

        {/* Progress State */}
        {exportProgress && (
          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold flex items-center gap-2.5 animate-pulse">
            <IconLoader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>{exportProgress}</span>
          </div>
        )}

        {/* Success State */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
            <IconCheck className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2.5">
            <IconAlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Exactly 3 Core Export Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Action 1: Current Week PNG */}
          <Card
            onClick={!isExporting ? handleExportCurrentPng : undefined}
            className={`p-4 rounded-2xl border transition-all text-start flex flex-col justify-between ${
              isExporting
                ? 'opacity-60 cursor-not-allowed border-border/40'
                : 'border-border/60 hover:border-teal-500/50 hover:bg-teal-500/5 cursor-pointer group shadow-sm'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform mb-3">
              <IconFileTypePng className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground leading-snug">
                {t.exportPngCurrent}
              </div>
              <div className="inline-block mt-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400">
                {t.exportPngCurrentFormat}
              </div>
            </div>
          </Card>

          {/* Action 2: All Weeks ZIP */}
          <Card
            onClick={!isExporting ? handleExportAllZip : undefined}
            className={`p-4 rounded-2xl border transition-all text-start flex flex-col justify-between ${
              isExporting
                ? 'opacity-60 cursor-not-allowed border-border/40'
                : 'border-border/60 hover:border-amber-500/50 hover:bg-amber-500/5 cursor-pointer group shadow-sm'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform mb-3">
              <IconFileZip className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground leading-snug">
                {t.exportZipAll}
              </div>
              <div className="inline-block mt-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {t.exportZipAllFormat}
              </div>
            </div>
          </Card>

          {/* Action 3: Full Plan PDF */}
          <Card
            onClick={!isExporting ? handleExportFullPdf : undefined}
            className={`p-4 rounded-2xl border transition-all text-start flex flex-col justify-between ${
              isExporting
                ? 'opacity-60 cursor-not-allowed border-border/40'
                : 'border-border/60 hover:border-rose-500/50 hover:bg-rose-500/5 cursor-pointer group shadow-sm'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform mb-3">
              <IconFileTypePdf className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground leading-snug">
                {t.exportPdfAll}
              </div>
              <div className="inline-block mt-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {t.exportPdfAllFormat}
              </div>
            </div>
          </Card>
        </div>

        {/* Share & Copy Link Option */}
        <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isExporting}
            onClick={handleShare}
            className="w-full rounded-xl h-11 font-semibold gap-2 border-border/80"
          >
            {copied ? (
              <>
                <IconCheck className="h-4 w-4 text-emerald-500" />
                <span>{t.linkCopied}</span>
              </>
            ) : (
              <>
                <IconShare className="h-4 w-4" />
                <span>{t.btnShare}</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
