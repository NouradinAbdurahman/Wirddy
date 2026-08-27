"use client"

import React, { useEffect, useState } from "react"
import QRCode from "qrcode"
import {
  IconCheck,
  IconCopy,
  IconKey,
  IconLink,
  IconLoader2,
  IconQrcode,
  IconShare,
  IconX,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { GeneratedSchedule, ScheduleInput } from "@/lib/scheduler/types"
import { saveScheduleAction } from "@/lib/groups/actions"
import { SavedGroupResult } from "@/lib/groups/service"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SaveShareDialogProps {
  isOpen: boolean
  onClose: () => void
  schedule: GeneratedSchedule
  scheduleInput?: ScheduleInput
  savedData?: SavedGroupResult | null
  onSaveSuccess?: (data: SavedGroupResult) => void
}

export function SaveShareDialog({
  isOpen,
  onClose,
  schedule,
  scheduleInput,
  savedData: initialSavedData,
  onSaveSuccess,
}: SaveShareDialogProps) {
  const { language, dir, t } = useI18n()
  const [isSaving, setIsSaving] = useState(false)
  const [savedData, setSavedData] = useState<SavedGroupResult | null>(
    initialSavedData || null
  )
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copiedPublic, setCopiedPublic] = useState(false)
  const [copiedEdit, setCopiedEdit] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [qrSvg, setQrSvg] = useState<string | null>(null)

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://wirddy.app"

  const publicUrl = savedData ? `${origin}/g/${savedData.publicId}` : ""
  const editUrl = savedData
    ? `${origin}/g/${savedData.publicId}?edit=${savedData.editToken}`
    : ""

  // Automatically save if not already saved when dialog opens
  useEffect(() => {
    if (isOpen && !savedData && !isSaving && !errorMsg) {
      handleSave()
    }
  }, [isOpen])

  // Generate QR code whenever publicUrl changes
  useEffect(() => {
    if (publicUrl) {
      QRCode.toString(publicUrl, {
        type: "svg",
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((svg) => setQrSvg(svg))
        .catch((err) => console.error("Error generating QR code:", err))
    }
  }, [publicUrl])

  const handleSave = async () => {
    setIsSaving(true)
    setErrorMsg(null)

    try {
      const input: ScheduleInput = scheduleInput || {
        group: {
          name: schedule.groupName,
          weeksCount: schedule.weeksCount,
        },
        members: schedule.members,
      }

      const res = await saveScheduleAction(input, schedule, language)
      if (res.success && res.data) {
        setSavedData(res.data)
        if (onSaveSuccess) onSaveSuccess(res.data)
      } else {
        setErrorMsg(res.error || t.saveOfflineWarning)
      }
    } catch {
      setErrorMsg(t.saveOfflineWarning)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyPublic = async () => {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopiedPublic(true)
      setTimeout(() => setCopiedPublic(false), 2500)
    } catch {
      // fallback
    }
  }

  const handleCopyEdit = async () => {
    if (!editUrl) return
    try {
      await navigator.clipboard.writeText(editUrl)
      setCopiedEdit(true)
      setTimeout(() => setCopiedEdit(false), 2500)
    } catch {
      // fallback
    }
  }

  const handleNativeShare = async () => {
    if (!publicUrl) return
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Wirddy - ${schedule.groupName}`,
          text:
            language === "ar"
              ? `جدول قراءة القرآن لمجموعة ${schedule.groupName} على تطبيق وِردي:`
              : `Quran reading schedule for ${schedule.groupName} on Wirddy:`,
          url: publicUrl,
        })
      } catch {
        // cancelled or failed
      }
    } else {
      handleCopyPublic()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-border/80 bg-background/95 p-6 shadow-2xl backdrop-blur-xl sm:p-7"
        dir={dir}
      >
        <DialogHeader className="text-start">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <IconShare className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {t.saveModalTitle}
              </DialogTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t.saveModalSubtitle}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Loading State */}
        {isSaving && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <IconLoader2 className="h-9 w-9 animate-spin text-primary" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              {t.savingSchedule}
            </p>
          </div>
        )}

        {/* Error / Offline State */}
        {!isSaving && errorMsg && (
          <div className="space-y-4 py-2">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-start">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                {errorMsg}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-xs"
              >
                {t.cancel}
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="rounded-xl text-xs"
              >
                {language === "ar" ? "إعادة المحاولة" : "Try Again"}
              </Button>
            </div>
          </div>
        )}

        {/* Saved Success Content */}
        {!isSaving && savedData && (
          <div className="space-y-5 pt-2">
            {/* Success Banner */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-start">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <IconCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  {t.scheduleSavedSuccess}
                </div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  {t.scheduleSavedDesc}
                </div>
              </div>
            </div>

            {/* Public Link Card */}
            <div className="space-y-2 text-start">
              <label className="text-xs font-bold text-foreground">
                {t.publicShareLink}
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/40 p-2 text-xs">
                <IconLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="w-full bg-transparent font-mono text-xs text-foreground outline-hidden select-all"
                />
                <Button
                  type="button"
                  size="sm"
                  variant={copiedPublic ? "default" : "secondary"}
                  onClick={handleCopyPublic}
                  className="h-8 flex-shrink-0 gap-1.5 rounded-xl px-3 text-xs font-semibold"
                >
                  {copiedPublic ? (
                    <>
                      <IconCheck className="h-3.5 w-3.5" />
                      <span>{t.linkCopied}</span>
                    </>
                  ) : (
                    <>
                      <IconCopy className="h-3.5 w-3.5" />
                      <span>{t.copyPublicLink}</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Action Buttons: Native Share & QR Toggle */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  onClick={handleNativeShare}
                  className="h-9 flex-1 gap-1.5 rounded-xl text-xs font-semibold shadow-xs"
                >
                  <IconShare className="h-4 w-4" />
                  <span>{t.shareGroupLink}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowQr(!showQr)}
                  className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
                >
                  <IconQrcode className="h-4 w-4" />
                  <span>{showQr ? t.btnHideQrCode : t.btnShowQrCode}</span>
                </Button>
              </div>
            </div>

            {/* Collapsible QR Code */}
            {showQr && qrSvg && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted/30 p-4 text-center">
                <div
                  className="h-44 w-44 rounded-xl bg-white p-2 shadow-xs"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <p className="mt-2.5 text-xs text-muted-foreground">
                  {t.qrCodeDesc}
                </p>
              </div>
            )}

            {/* Secret Edit Link Callout */}
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 text-start">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <IconKey className="h-4 w-4 text-amber-500" />
                <span>{t.secretEditLinkTitle}</span>
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
                {t.secretEditLinkDesc}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={copiedEdit ? "default" : "outline"}
                  onClick={handleCopyEdit}
                  className="h-8 gap-1.5 rounded-xl px-3 text-xs font-semibold"
                >
                  {copiedEdit ? (
                    <>
                      <IconCheck className="h-3.5 w-3.5" />
                      <span>{t.editLinkCopied}</span>
                    </>
                  ) : (
                    <>
                      <IconCopy className="h-3.5 w-3.5" />
                      <span>{t.copyEditLink}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
