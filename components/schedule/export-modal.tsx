"use client"

import React, { useState } from "react"
import { useTheme } from "next-themes"
import {
  IconAlertCircle,
  IconCheck,
  IconFileTypePdf,
  IconFileTypePng,
  IconFileZip,
  IconInfoCircle,
  IconLoader2,
  IconShare,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { GeneratedSchedule } from "@/lib/scheduler/types"
import {
  ExportTheme,
  ExportViewMode,
  exportAllWeeksAsZip,
  exportScheduleAsPdf,
  exportWeekAsPng,
  normalizeScheduleToExport,
  normalizeWeekSchedule,
  shareScheduleAsPdf,
  shareScheduleWeekAsPng,
} from "@/lib/export"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: GeneratedSchedule
  activeWeek: number
  viewMode?: ExportViewMode
}

export function ExportModal({
  open,
  onOpenChange,
  schedule,
  activeWeek,
  viewMode = "cards",
}: ExportModalProps) {
  const { language, t } = useI18n()
  const { theme, resolvedTheme } = useTheme()

  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const activeExportTheme: ExportTheme =
    theme === "light" || resolvedTheme === "light" ? "light" : "dark"

  const resetStatus = () => {
    setSuccessMessage(null)
    setInfoMessage(null)
    setErrorMessage(null)
  }

  // 1. Download Current Week (PNG)
  const handleExportCurrentPng = async () => {
    if (isExporting) return
    setIsExporting(true)
    resetStatus()
    setExportProgress(t.exportLoadingCurrent)

    try {
      const targetWeek =
        schedule.weeks.find((w) => w.weekNumber === activeWeek) ||
        schedule.weeks[0]

      const exportWeek = normalizeWeekSchedule(
        targetWeek,
        schedule.weeksCount,
        schedule.groupName,
        language,
        activeExportTheme,
        viewMode
      )

      await exportWeekAsPng(exportWeek, {
        theme: activeExportTheme,
        view: viewMode,
      })
      setSuccessMessage(t.exportSuccess)
      setTimeout(() => {
        onOpenChange(false)
        setSuccessMessage(null)
      }, 1400)
    } catch (err) {
      console.error("Current week PNG export failed:", err)
      setErrorMessage(t.exportError)
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }

  // 2. Download All Weeks (ZIP)
  const handleExportAllZip = async () => {
    if (isExporting) return
    setIsExporting(true)
    resetStatus()
    setExportProgress(t.exportLoadingAll)

    try {
      const exportSchedule = normalizeScheduleToExport(
        schedule,
        language,
        activeExportTheme,
        viewMode
      )
      await exportAllWeeksAsZip(
        exportSchedule,
        { theme: activeExportTheme, view: viewMode },
        (_curr, _total, msg) => {
          setExportProgress(msg)
        }
      )

      setSuccessMessage(t.exportSuccess)
      setTimeout(() => {
        onOpenChange(false)
        setSuccessMessage(null)
      }, 1400)
    } catch (err) {
      console.error("All weeks ZIP export failed:", err)
      setErrorMessage(t.exportError)
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }

  // 3. Download Full Plan (PDF)
  const handleExportFullPdf = async () => {
    if (isExporting) return
    setIsExporting(true)
    resetStatus()
    setExportProgress(t.exportLoadingPdf)

    try {
      const exportSchedule = normalizeScheduleToExport(
        schedule,
        language,
        activeExportTheme,
        viewMode
      )
      await exportScheduleAsPdf(
        exportSchedule,
        { theme: activeExportTheme, view: viewMode },
        (_curr, _total, msg) => {
          setExportProgress(msg)
        }
      )

      setSuccessMessage(t.exportSuccess)
      setTimeout(() => {
        onOpenChange(false)
        setSuccessMessage(null)
      }, 1400)
    } catch (err) {
      console.error("Full plan PDF export failed:", err)
      setErrorMessage(t.exportError)
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }

  // 4. Share Current Week (PNG File)
  const handleShareCurrentPng = async () => {
    if (isExporting) return
    setIsExporting(true)
    resetStatus()
    setExportProgress(t.exportLoadingShare)

    try {
      const targetWeek =
        schedule.weeks.find((w) => w.weekNumber === activeWeek) ||
        schedule.weeks[0]

      const exportWeek = normalizeWeekSchedule(
        targetWeek,
        schedule.weeksCount,
        schedule.groupName,
        language,
        activeExportTheme,
        viewMode
      )

      const result = await shareScheduleWeekAsPng(exportWeek, {
        theme: activeExportTheme,
        view: viewMode,
      })

      if (result.method === "native-share") {
        setSuccessMessage(t.exportShareSuccess)
        setTimeout(() => {
          onOpenChange(false)
          setSuccessMessage(null)
        }, 1400)
      } else if (result.method === "canceled") {
        // User closed share sheet — no error
        resetStatus()
      } else if (result.method === "fallback-download") {
        if (result.error) {
          setInfoMessage(t.exportShareFallbackError)
        } else {
          setInfoMessage(t.exportShareFallbackUnsupported)
        }
      }
    } catch (err) {
      console.error("Share PNG failed:", err)
      setErrorMessage(t.exportError)
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }

  // 5. Share Full Plan (PDF File)
  const handleShareFullPdf = async () => {
    if (isExporting) return
    setIsExporting(true)
    resetStatus()
    setExportProgress(t.exportLoadingShare)

    try {
      const exportSchedule = normalizeScheduleToExport(
        schedule,
        language,
        activeExportTheme,
        viewMode
      )

      const result = await shareScheduleAsPdf(
        exportSchedule,
        { theme: activeExportTheme, view: viewMode },
        (_curr, _total, msg) => {
          setExportProgress(msg)
        }
      )

      if (result.method === "native-share") {
        setSuccessMessage(t.exportShareSuccess)
        setTimeout(() => {
          onOpenChange(false)
          setSuccessMessage(null)
        }, 1400)
      } else if (result.method === "canceled") {
        resetStatus()
      } else if (result.method === "fallback-download") {
        if (result.error) {
          setInfoMessage(t.exportShareFallbackError)
        } else {
          setInfoMessage(t.exportShareFallbackUnsupported)
        }
      }
    } catch (err) {
      console.error("Share PDF failed:", err)
      setErrorMessage(t.exportError)
    } finally {
      setIsExporting(false)
      setExportProgress(null)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => !isExporting && onOpenChange(val)}
    >
      <DialogContent className="rounded-3xl p-6 text-start sm:max-w-lg">
        <DialogHeader className="space-y-1.5 pb-1">
          <DialogTitle className="text-xl font-bold text-foreground">
            {t.exportTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground sm:text-sm">
            {t.exportSubtitle}
          </DialogDescription>
        </DialogHeader>

        {/* Progress State */}
        {exportProgress && (
          <div className="flex animate-pulse items-center gap-2.5 rounded-2xl border border-primary/20 bg-primary/10 p-3.5 text-xs font-semibold text-primary">
            <IconLoader2 className="h-4 w-4 shrink-0 animate-spin" />
            <span>{exportProgress}</span>
          </div>
        )}

        {/* Success State */}
        {successMessage && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <IconCheck className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Info / Fallback State */}
        {infoMessage && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-teal-500/30 bg-teal-500/10 p-3.5 text-xs font-medium text-teal-700 dark:text-teal-300">
            <IconInfoCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive">
            <IconAlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Direct Share Actions Section */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            {t.exportShareSection}
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {/* Share Current Week PNG */}
            <Card
              onClick={!isExporting ? handleShareCurrentPng : undefined}
              className={`flex items-center gap-3.5 rounded-2xl border p-3.5 text-start transition-all ${
                isExporting
                  ? "cursor-not-allowed border-border/40 opacity-60"
                  : "group cursor-pointer border-border/70 bg-card/90 shadow-xs hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <IconShare className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-foreground">
                  {t.exportSharePngCurrent}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {t.exportPngCurrentFormat}
                </div>
              </div>
            </Card>

            {/* Share Full Plan PDF */}
            <Card
              onClick={!isExporting ? handleShareFullPdf : undefined}
              className={`flex items-center gap-3.5 rounded-2xl border p-3.5 text-start transition-all ${
                isExporting
                  ? "cursor-not-allowed border-border/40 opacity-60"
                  : "group cursor-pointer border-border/70 bg-card/90 shadow-xs hover:border-rose-500/50 hover:bg-rose-500/5 hover:shadow-sm"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 transition-transform group-hover:scale-105 dark:text-rose-400">
                <IconFileTypePdf className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-foreground">
                  {t.exportSharePdfAll}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {t.exportPdfAllFormat}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 2. Download Files Actions Section */}
        <div className="space-y-2 border-t border-border/40 pt-3">
          <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            {t.exportDownloadSection}
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {/* Download Current Week PNG */}
            <Card
              onClick={!isExporting ? handleExportCurrentPng : undefined}
              className={`flex flex-col justify-between rounded-2xl border p-3.5 text-start transition-all ${
                isExporting
                  ? "cursor-not-allowed border-border/40 opacity-60"
                  : "group cursor-pointer border-border/60 bg-muted/20 shadow-xs hover:border-teal-500/50 hover:bg-teal-500/5"
              }`}
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 transition-transform group-hover:scale-105 dark:text-teal-400">
                <IconFileTypePng className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs leading-snug font-bold text-foreground">
                  {t.exportPngCurrent}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {t.exportPngCurrentFormat}
                </div>
              </div>
            </Card>

            {/* Download All Weeks ZIP */}
            <Card
              onClick={!isExporting ? handleExportAllZip : undefined}
              className={`flex flex-col justify-between rounded-2xl border p-3.5 text-start transition-all ${
                isExporting
                  ? "cursor-not-allowed border-border/40 opacity-60"
                  : "group cursor-pointer border-border/60 bg-muted/20 shadow-xs hover:border-amber-500/50 hover:bg-amber-500/5"
              }`}
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 transition-transform group-hover:scale-105 dark:text-amber-400">
                <IconFileZip className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs leading-snug font-bold text-foreground">
                  {t.exportZipAll}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {t.exportZipAllFormat}
                </div>
              </div>
            </Card>

            {/* Download Full Plan PDF */}
            <Card
              onClick={!isExporting ? handleExportFullPdf : undefined}
              className={`flex flex-col justify-between rounded-2xl border p-3.5 text-start transition-all ${
                isExporting
                  ? "cursor-not-allowed border-border/40 opacity-60"
                  : "group cursor-pointer border-border/60 bg-muted/20 shadow-xs hover:border-rose-500/50 hover:bg-rose-500/5"
              }`}
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 transition-transform group-hover:scale-105 dark:text-rose-400">
                <IconFileTypePdf className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs leading-snug font-bold text-foreground">
                  {t.exportPdfAll}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {t.exportPdfAllFormat}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
