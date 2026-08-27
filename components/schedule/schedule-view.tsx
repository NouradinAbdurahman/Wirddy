"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCircleCheck,
  IconDownload,
  IconLayoutGrid,
  IconLoader2,
  IconRotate,
  IconTable,
  IconUsers,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { GeneratedSchedule } from "@/lib/scheduler/types"
import { ExportViewMode } from "@/lib/export"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MemberScheduleCard } from "./member-schedule-card"
import { ScheduleTableView } from "./schedule-table-view"
import { WeekNav } from "./week-nav"
import { RegenerateDialog } from "./regenerate-dialog"
import { ExportModal } from "./export-modal"

interface ScheduleViewProps {
  schedule: GeneratedSchedule
  onEditPlan: () => void
  onRegenerate: () => void
  isRegenerating?: boolean
}

export function ScheduleView({
  schedule,
  onEditPlan,
  onRegenerate,
  isRegenerating,
}: ScheduleViewProps) {
  const { language, dir, t, formatNumber } = useI18n()
  const [activeWeekNum, setActiveWeekNum] = useState<number>(1)
  const [viewMode, setViewMode] = useState<ExportViewMode>("cards")
  const [showRegenerateDialog, setShowRegenerateDialog] =
    useState<boolean>(false)
  const [showExportModal, setShowExportModal] = useState<boolean>(false)

  const BackArrowIcon = dir === "rtl" ? IconArrowRight : IconArrowLeft

  const currentWeek =
    schedule.weeks.find((w) => w.weekNumber === activeWeekNum) ||
    schedule.weeks[0]

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-16">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col justify-between gap-3 border-b border-border/40 pb-3.5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEditPlan}
            className="h-8.5 gap-1.5 rounded-xl px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <BackArrowIcon className="h-4 w-4" />
            <span>{t.btnEditPlan}</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Switcher: Cards vs Table */}
          <div className="flex items-center rounded-xl border border-border/50 bg-muted/60 p-0.5 dark:bg-muted/40">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                viewMode === "cards"
                  ? "border border-border/60 bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconLayoutGrid className="h-3.5 w-3.5" />
              <span>{t.viewCards}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                viewMode === "table"
                  ? "border border-border/60 bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconTable className="h-3.5 w-3.5" />
              <span>{t.viewTable}</span>
            </button>
          </div>

          {/* Regenerate Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isRegenerating}
            onClick={() => setShowRegenerateDialog(true)}
            className="h-8.5 gap-1.5 rounded-xl border-border/70 px-3 text-xs font-semibold hover:bg-muted"
          >
            {isRegenerating ? (
              <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <IconRotate className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span>{isRegenerating ? t.btnGenerating : t.btnRegenerate}</span>
          </Button>

          {/* Export / Download Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => setShowExportModal(true)}
            className="h-8.5 gap-1.5 rounded-xl px-3.5 text-xs font-semibold shadow-sm"
          >
            <IconDownload className="h-3.5 w-3.5" />
            <span>{t.btnExportImage} / PDF</span>
          </Button>
        </div>
      </div>

      {/* Hero Summary Header Card */}
      <Card className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-5 text-start shadow-sm backdrop-blur-md sm:p-6 dark:bg-card/60">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute end-0 top-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase">
              <img
                src="/logo-black.png"
                alt="Wirddy"
                className="block h-7 w-7 object-contain dark:hidden"
                suppressHydrationWarning
              />
              <img
                src="/logo-white.png"
                alt="Wirddy"
                className="hidden h-7 w-7 object-contain dark:block"
                suppressHydrationWarning
              />
              <span>{t.planTitle}</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {schedule.groupName}
            </h2>
            <div className="text-xs text-muted-foreground sm:text-sm">
              {t.weekLabel} {formatNumber(activeWeekNum)} {t.weekOf}{" "}
              {formatNumber(schedule.weeksCount)}
            </div>
          </div>

          {/* Summary Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 30/30 Completion Indicator Badge */}
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 dark:bg-emerald-500/15">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <IconCircleCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                  {language === "ar" ? "اكتمال الختمة" : "Completion"}
                </div>
                <div className="text-xs font-extrabold text-foreground">
                  {formatNumber(30)} / {formatNumber(30)} {t.juzUnit}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/50 px-3 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconUsers className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-medium text-muted-foreground">
                  {t.memberCount}
                </div>
                <div className="text-xs font-bold text-foreground">
                  {formatNumber(schedule.members.length)} {t.summaryMembers}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Week Navigation */}
      {schedule.weeksCount > 1 && (
        <div className="pt-1">
          <WeekNav
            weeksCount={schedule.weeksCount}
            activeWeek={activeWeekNum}
            onSelectWeek={setActiveWeekNum}
          />
        </div>
      )}

      {/* Member Assignments Display for Active Week (Cards vs Table) */}
      <div className="space-y-3 text-start">
        <div className="flex items-center justify-between px-1">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground sm:text-base">
            <span>
              {t.weekLabel} {formatNumber(activeWeekNum)}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              ({formatNumber(currentWeek.assignments.length)} {t.summaryMembers}
              )
            </span>
          </h3>

          <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <IconCheck className="h-3.5 w-3.5" />
            <span>
              {formatNumber(30)} / {formatNumber(30)} {t.juzUnit}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === "table" ? (
            <ScheduleTableView
              key={`table-${activeWeekNum}`}
              week={currentWeek}
            />
          ) : (
            <motion.div
              key={`cards-${activeWeekNum}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3"
            >
              {currentWeek.assignments.map((assignment, idx) => (
                <MemberScheduleCard
                  key={`${assignment.memberId}-${idx}`}
                  assignment={assignment}
                  index={idx}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation and Export Dialogs */}
      <RegenerateDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
        onConfirm={onRegenerate}
      />

      <ExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        schedule={schedule}
        activeWeek={activeWeekNum}
        viewMode={viewMode}
      />
    </div>
  )
}
