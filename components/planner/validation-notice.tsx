"use client"

import { IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { SchedulerValidationResult } from "@/lib/scheduler/types"

interface ValidationNoticeProps {
  result: SchedulerValidationResult
  /** An error from generation or saving, already in the reader's language. */
  submitError?: string | null
}

/**
 * Shows why the schedule cannot be generated yet, plus non-blocking warnings.
 * The generate button stays disabled while input is invalid, so this is the
 * only place the reader learns what to fix.
 */
export function ValidationNotice({ result, submitError }: ValidationNoticeProps) {
  const { language } = useI18n()
  const pick = (e: { messageAr: string; messageEn: string }) =>
    language === "ar" ? e.messageAr : e.messageEn

  const firstError = result.errors[0]
  const warnings = result.warnings ?? []

  if (!submitError && !firstError && warnings.length === 0) return null

  return (
    <div className="space-y-2" role="status" aria-live="polite">
      {(submitError || firstError) && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
          <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{submitError || pick(firstError!)}</span>
        </div>
      )}
      {warnings.map((w) => (
        <div
          key={w.code}
          className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-medium text-amber-700 dark:text-amber-300"
        >
          <IconInfoCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{pick(w)}</span>
        </div>
      ))}
    </div>
  )
}
