"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  IconBrandWhatsapp,
  IconCheck,
  IconCopy,
  IconQrcode,
  IconShare,
  IconX,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  memberName: string
  groupName: string
  groupPublicId: string
  memberPublicId: string
}

export function InviteMemberModal({
  isOpen,
  onClose,
  memberName,
  groupName,
  groupPublicId,
  memberPublicId,
}: InviteMemberModalProps) {
  const { language, t } = useI18n()
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)

  if (!isOpen) return null

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://wirddy.vercel.app"
  const memberUrl = `${origin}/g/${groupPublicId}/member/${memberPublicId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(memberUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const text =
      language === "ar"
        ? `السلام عليكم ورحمة الله،\nأهلاً ${memberName}، هذا رابط وردك القرآني في مجموعة "${groupName}":\n${memberUrl}`
        : `Peace be upon you,\nHello ${memberName}, here is your Quran reading schedule for "${groupName}":\n${memberUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ورد ${memberName} - ${groupName}`,
          text:
            language === "ar"
              ? `جدول قراءة القرآن الخاص بـ ${memberName} في مجموعة ${groupName}`
              : `Quran schedule for ${memberName} in ${groupName}`,
          url: memberUrl,
        })
      } catch {
        // User cancelled
      }
    } else {
      handleCopy()
    }
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(memberUrl)}`

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                {t.inviteMemberTitle}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {memberName} • {groupName}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-muted"
              onClick={onClose}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4 py-4">
            {/* Direct Member URL Link Copy */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-3">
              <span className="text-[11px] font-bold text-muted-foreground">
                {t.inviteCopyLink}
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  readOnly
                  value={memberUrl}
                  className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground select-all"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-8 shrink-0 gap-1 rounded-lg text-xs font-bold"
                >
                  {copied ? (
                    <>
                      <IconCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <IconCopy className="h-3.5 w-3.5" />
                      <span>{t.copyPublicLink}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Sharing Options */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                onClick={handleWhatsApp}
                className="h-10 gap-2 rounded-xl border-emerald-500/40 text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
              >
                <IconBrandWhatsapp className="h-4 w-4" />
                <span>{t.inviteWhatsApp}</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleNativeShare}
                className="h-10 gap-2 rounded-xl text-xs font-bold hover:bg-muted"
              >
                <IconShare className="h-4 w-4" />
                <span>{t.actionShare}</span>
              </Button>
            </div>

            {/* QR Toggle */}
            <div className="pt-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQr(!showQr)}
                className="gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                <IconQrcode className="h-4 w-4" />
                <span>{showQr ? t.btnHideQrCode : t.btnShowQrCode}</span>
              </Button>

              {showQr && (
                <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-border bg-white p-4 shadow-sm">
                  <img
                    src={qrImageUrl}
                    alt={`QR Code for ${memberName}`}
                    className="h-40 w-40 object-contain"
                  />
                  <p className="mt-2 text-[11px] font-medium text-neutral-600">
                    {t.scanToOpenMySchedule}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
