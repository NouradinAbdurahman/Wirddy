"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  IconHistory,
  IconRotateClockwise2,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconCalendar,
  IconUsers,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  fetchScheduleHistoryAction,
  restoreScheduleVersionAction,
} from "@/lib/groups/actions"
import { ScheduleHistoryRecord } from "@/lib/groups/service"

interface VersionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  groupPublicId: string
  rawEditToken?: string
  onVersionRestored?: () => void
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  groupPublicId,
  rawEditToken,
  onVersionRestored,
}: VersionHistoryModalProps) {
  const { language, dir, t, formatNumber } = useI18n()
  const [history, setHistory] = useState<ScheduleHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && groupPublicId) {
      setIsLoading(true)
      setError(null)
      fetchScheduleHistoryAction(groupPublicId, rawEditToken).then((res) => {
        setIsLoading(false)
        if (res.success && res.data) {
          setHistory(res.data)
        } else {
          setError(res.error || "Failed to load version history.")
        }
      })
    }
  }, [isOpen, groupPublicId, rawEditToken])

  const handleRestore = async (record: ScheduleHistoryRecord) => {
    const confirmMsg =
      language === "ar"
        ? `هل أنت متأكد من استعادة هذه النسخة (${record.description})؟`
        : `Are you sure you want to restore this version (${record.description})?`

    if (!window.confirm(confirmMsg)) return

    setRestoringId(record.id)
    try {
      const res = await restoreScheduleVersionAction(
        record.id,
        groupPublicId,
        rawEditToken,
        language
      )
      if (res.success) {
        if (onVersionRestored) onVersionRestored()
        onClose()
      } else {
        alert(res.error || "Failed to restore version.")
      }
    } finally {
      setRestoringId(null)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <IconHistory className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  {t.historyTitle ||
                    (language === "ar" ? "سجل التعديلات" : "Version History")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === "ar"
                    ? "عرض واستعادة النسخ السابقة من هذا الجدول"
                    : "View and restore previous schedule revisions"}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>

          {/* Body List */}
          <div className="flex-1 space-y-3 overflow-y-auto py-4">
            {isLoading ? (
              <div className="py-12 text-center text-xs font-semibold text-muted-foreground">
                {language === "ar"
                  ? "جاري تحميل سجل التعديلات..."
                  : "Loading version history..."}
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
                <IconAlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-xs font-semibold text-muted-foreground">
                {language === "ar"
                  ? "لا توجد تعديلات مسجلة بعد."
                  : "No revisions recorded yet."}
              </div>
            ) : (
              history.map((h, idx) => {
                const date = new Date(h.createdAt)
                const formattedDate = date.toLocaleDateString(
                  language === "ar" ? "ar-SA" : "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )

                const isCurrent = idx === 0
                const weeksCount =
                  h.snapshot?.input?.group?.weeksCount ||
                  h.snapshot?.schedule?.weeksCount
                const membersCount =
                  h.snapshot?.input?.members?.length ||
                  h.snapshot?.schedule?.members?.length

                return (
                  <div
                    key={h.id}
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-extrabold text-foreground">
                          {h.description}
                        </span>
                        {isCurrent && (
                          <Badge className="bg-emerald-500/15 text-[10px] text-emerald-600 dark:text-emerald-400">
                            {language === "ar" ? "النسخة الحالية" : "Current"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>{formattedDate}</span>
                        {weeksCount && (
                          <span>
                            • {formatNumber(weeksCount)}{" "}
                            {language === "ar" ? "أسابيع" : "weeks"}
                          </span>
                        )}
                        {membersCount && (
                          <span>
                            • {formatNumber(membersCount)}{" "}
                            {language === "ar" ? "أعضاء" : "members"}
                          </span>
                        )}
                      </div>
                    </div>

                    {!isCurrent && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(h)}
                        disabled={restoringId === h.id}
                        className="h-8 shrink-0 gap-1.5 self-end rounded-xl text-xs font-bold sm:self-auto"
                      >
                        <IconRotateClockwise2 className="h-3.5 w-3.5" />
                        <span>
                          {restoringId === h.id
                            ? language === "ar"
                              ? "جاري الاستعادة..."
                              : "Restoring..."
                            : language === "ar"
                              ? "استعادة"
                              : "Restore"}
                        </span>
                      </Button>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-border/60 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 rounded-xl px-4 text-xs font-bold"
            >
              {language === "ar" ? "إغلاق" : "Close"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
