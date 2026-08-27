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
  IconSettings,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { GeneratedSchedule } from "@/lib/scheduler/types"
import {
  ExportBrandingOptions,
  ExportTheme,
  ExportViewMode,
  exportAllWeeksAsZip,
  exportScheduleAsPdf,
  exportWeekAsPng,
  normalizeScheduleToExport,
  normalizeWeekSchedule,
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

  // Branding Customization Toggles
  const [showLogo, setShowLogo] = useState(true)
  const [showQr, setShowQr] = useState(true)
  const [showGroupName, setShowGroupName] = useState(true)
  const [showDate, setShowDate] = useState(true)

  const activeExportTheme: ExportTheme =
    theme === "light" || resolvedTheme === "light" ? "light" : "dark"

  const branding: ExportBrandingOptions = {
    showLogo,
    showQr,
    showGroupName,
    showDate,
  }

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
        viewMode,
        branding
      )

      await exportWeekAsPng(exportWeek, {
        theme: activeExportTheme,
        view: viewMode,
        branding,
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
        viewMode,
        branding
      )
      await exportAllWeeksAsZip(
        exportSchedule,
        { theme: activeExportTheme, view: viewMode, branding },
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
        viewMode,
        branding
      )

      await exportScheduleAsPdf(
        exportSchedule,
        { theme: activeExportTheme, view: viewMode, branding },
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

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => !isExporting && onOpenChange(val)}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-full overflow-y-auto overscroll-contain rounded-3xl p-5 text-start sm:max-h-[88vh] sm:max-w-2xl sm:p-7">
        <DialogHeader className="space-y-1.5 pb-1">
          <DialogTitle className="text-xl font-bold text-foreground sm:text-2xl">
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

        {/* Branding Options Section */}
        <div className="space-y-2.5 rounded-2xl border border-border/60 bg-muted/20 p-4 text-start">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <IconSettings className="h-4 w-4 text-primary" />
            <span>{t.exportOptionsTitle}</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/40 bg-card/60 px-3.5 py-2.5 transition-colors hover:bg-card">
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
                className="h-4 w-4 rounded text-primary accent-primary"
              />
              <span className="font-medium text-foreground">
                {t.optShowLogo}
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/40 bg-card/60 px-3.5 py-2.5 transition-colors hover:bg-card">
              <input
                type="checkbox"
                checked={showQr}
                onChange={(e) => setShowQr(e.target.checked)}
                className="h-4 w-4 rounded text-primary accent-primary"
              />
              <span className="font-medium text-foreground">{t.optShowQr}</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/40 bg-card/60 px-3.5 py-2.5 transition-colors hover:bg-card">
              <input
                type="checkbox"
                checked={showGroupName}
                onChange={(e) => setShowGroupName(e.target.checked)}
                className="h-4 w-4 rounded text-primary accent-primary"
              />
              <span className="font-medium text-foreground">
                {t.optShowGroupName}
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/40 bg-card/60 px-3.5 py-2.5 transition-colors hover:bg-card">
              <input
                type="checkbox"
                checked={showDate}
                onChange={(e) => setShowDate(e.target.checked)}
                className="h-4 w-4 rounded text-primary accent-primary"
              />
              <span className="font-medium text-foreground">
                {t.optShowDate}
              </span>
            </label>
          </div>
        </div>

        {/* Download Files Actions Section */}
        <div className="space-y-2.5 border-t border-border/40 pt-4">
          <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            {t.exportDownloadSection}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Download Current Week PNG */}
            <Card
              onClick={!isExporting ? handleExportCurrentPng : undefined}
              className={`flex flex-col justify-between rounded-2xl border p-4 text-start transition-all ${
                isExporting
                  ? "cursor-not-allowed border-border/40 opacity-60"
                  : "group cursor-pointer border-border/60 bg-muted/20 shadow-xs hover:border-teal-500/50 hover:bg-teal-500/5"
              }`}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 transition-transform group-hover:scale-105 dark:text-teal-400">
                <IconFileTypePng className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground sm:text-sm">
                  {t.exportPngCurrent}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {t.exportPngCurrentFormat}
                </div>
              </div>
            </Card>

            {/* Download All Weeks ZIP */}
            <Card
              onClick={!isExporting ? handleExportAllZip : undefined}
              className={`flex flex-col justify-between rounded-2xl border p-4 text-start transition-all ${
                isExporting
                  ? "cursor-not-allowed border-border/40 opacity-60"
                  : "group cursor-pointer border-border/60 bg-muted/20 shadow-xs hover:border-amber-500/50 hover:bg-amber-500/5"
              }`}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition-transform group-hover:scale-105 dark:text-amber-400">
                <IconFileZip className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground sm:text-sm">
                  {t.exportZipAll}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {t.exportZipAllFormat}
                </div>
              </div>
            </Card>

            {/* Download Full Plan PDF */}
            <Card
              onClick={!isExporting ? handleExportFullPdf : undefined}
              className={`flex flex-col justify-between rounded-2xl border p-4 text-start transition-all ${
                isExporting
                  ? "cursor-not-allowed border-border/40 opacity-60"
                  : "group cursor-pointer border-border/60 bg-muted/20 shadow-xs hover:border-rose-500/50 hover:bg-rose-500/5"
              }`}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 transition-transform group-hover:scale-105 dark:text-rose-400">
                <IconFileTypePdf className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground sm:text-sm">
                  {t.exportPdfAll}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
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
