"use client"

import React, { useEffect, useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  IconX,
  IconBookmark,
  IconBookmarkFilled,
  IconCopy,
  IconCheck,
  IconShare,
  IconChevronRight,
  IconChevronLeft,
  IconBook,
  IconBook2,
  IconSparkles,
  IconLoader2,
  IconArrowRight,
  IconArrowLeft,
  IconWorld,
  IconShare2,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { QuranDataService } from "@/lib/quran/service"
import { fetchAyah } from "@/lib/quran/api"
import { toArabicNumerals } from "@/lib/dates/calendar"
import { cn } from "@/lib/utils"

const quranService = new QuranDataService()

export interface AyahDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  surahNumber: number
  ayahNumber: number
  arabicText?: string
  translationText?: string
  fontClass?: string
  onNavigateAyah: (surahNumber: number, ayahNumber: number) => void
  onBookmark?: (surahNumber: number, ayahNumber: number) => void
  isBookmarked?: boolean
}

export function AyahDetailsDialog({
  isOpen,
  onClose,
  surahNumber,
  ayahNumber,
  arabicText: propArabicText,
  translationText: propTranslationText,
  fontClass = "font-quran-amiri-quran",
  onNavigateAyah,
  onBookmark,
  isBookmarked = false,
}: AyahDetailsDialogProps) {
  const { language, dir, t, formatNumber } = useI18n()
  const isRTL = dir === "rtl"

  const [arabicText, setArabicText] = useState<string>(propArabicText || "")
  const [translationText, setTranslationText] = useState<string>(propTranslationText || "")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [copiedArabic, setCopiedArabic] = useState<boolean>(false)
  const [copiedTranslation, setCopiedTranslation] = useState<boolean>(false)
  const [shareToast, setShareToast] = useState<boolean>(false)

  // Location Coordinates
  const location = useMemo(() => {
    return quranService.getLocationFromSurahAyah(surahNumber, ayahNumber)
  }, [surahNumber, ayahNumber])

  const surahInfo = useMemo(() => {
    return quranService.getSurah(surahNumber)
  }, [surahNumber])

  // Sync state when props change or load missing data
  useEffect(() => {
    let isCancelled = false

    if (propArabicText && propTranslationText) {
      setArabicText(propArabicText)
      setTranslationText(propTranslationText)
      setIsLoading(false)
      return
    }

    if (propArabicText) {
      setArabicText(propArabicText)
    }

    const loadAyahDetails = async () => {
      try {
        setIsLoading(true)
        const globalNum = location.globalAyahNumber

        // Fetch Arabic if missing
        if (!propArabicText) {
          const arData = await fetchAyah(globalNum, "quran-uthmani")
          if (!isCancelled && arData) {
            setArabicText(arData.text)
          }
        }

        // Fetch Translation if missing
        if (!propTranslationText) {
          const transData = await fetchAyah(globalNum, "en.sahih")
          if (!isCancelled && transData) {
            setTranslationText(transData.text)
          }
        }
      } catch (err) {
        console.error("Failed to load Ayah details:", err)
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadAyahDetails()

    return () => {
      isCancelled = true
    }
  }, [surahNumber, ayahNumber, propArabicText, propTranslationText, location.globalAyahNumber])

  // Navigate to previous Ayah
  const handlePrevAyah = useCallback(() => {
    if (location.globalAyahNumber <= 1) return
    const prevLoc = quranService.getLocationFromGlobalAyah(location.globalAyahNumber - 1)
    onNavigateAyah(prevLoc.surahNumber, prevLoc.ayahNumber)
  }, [location.globalAyahNumber, onNavigateAyah])

  // Navigate to next Ayah
  const handleNextAyah = useCallback(() => {
    if (location.globalAyahNumber >= 6236) return
    const nextLoc = quranService.getLocationFromGlobalAyah(location.globalAyahNumber + 1)
    onNavigateAyah(nextLoc.surahNumber, nextLoc.ayahNumber)
  }, [location.globalAyahNumber, onNavigateAyah])

  // Keyboard navigation & Escape
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        if (isRTL) handleNextAyah()
        else handlePrevAyah()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        if (isRTL) handlePrevAyah()
        else handleNextAyah()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, isRTL, handlePrevAyah, handleNextAyah])

  // Copy Arabic Text
  const handleCopyArabic = () => {
    if (!arabicText) return
    navigator.clipboard.writeText(arabicText)
    setCopiedArabic(true)
    setTimeout(() => setCopiedArabic(false), 2000)
  }

  // Copy Translation Text
  const handleCopyTranslation = () => {
    if (!translationText) return
    navigator.clipboard.writeText(translationText)
    setCopiedTranslation(true)
    setTimeout(() => setCopiedTranslation(false), 2000)
  }

  // Share Ayah
  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined"
      ? `${window.location.origin}/reader?surah=${surahNumber}&ayah=${ayahNumber}`
      : ""
    const shareTitle = `سورة ${surahInfo?.nameAr || surahNumber} - آية ${ayahNumber}`
    const shareContent = `${arabicText}\n\n${translationText ? `"${translationText}"\n\n` : ""}${shareUrl}`

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareContent,
          url: shareUrl,
        })
      } catch {
        // User cancelled or not supported
      }
    } else {
      navigator.clipboard.writeText(shareContent)
      setShareToast(true)
      setTimeout(() => setShareToast(false), 2500)
    }
  }

  if (!isOpen) return null

  const NextIcon = isRTL ? IconChevronLeft : IconChevronRight
  const PrevIcon = isRTL ? IconChevronRight : IconChevronLeft

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 backdrop-blur-xs sm:p-4">
        {/* Backdrop dismiss click area */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={onClose}
          aria-label="Close dialog backdrop"
        />

        {/* Modal / Bottom Sheet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border-t border-border/80 bg-card shadow-2xl sm:max-h-[85vh] sm:rounded-3xl sm:border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header Bar */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-card/95 px-4 backdrop-blur-md sm:px-6">
            {/* Left Location Badges */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-extrabold text-foreground text-sm sm:text-base">
                  سورة {surahInfo?.nameAr}
                </span>
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/10 text-xs font-bold text-primary shrink-0"
                >
                  {language === "ar"
                    ? `آية ${toArabicNumerals(ayahNumber)}`
                    : `Ayah ${ayahNumber}`}
                </Badge>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <span>•</span>
                <span>
                  {language === "ar"
                    ? `الجزء ${toArabicNumerals(location.juzNumber)}`
                    : `Juz ${location.juzNumber}`}
                </span>
                <span>•</span>
                <span>
                  {language === "ar"
                    ? `صفحة ${toArabicNumerals(location.page || 1)}`
                    : `Page ${location.page || 1}`}
                </span>
              </div>
            </div>

            {/* Right Header Navigation & Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Previous Ayah Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevAyah}
                disabled={location.globalAyahNumber <= 1}
                className="h-8 w-8 rounded-xl border-border/80"
                title={t.readerPrevAyah}
                aria-label={t.readerPrevAyah}
              >
                <PrevIcon className="h-4 w-4" />
              </Button>

              {/* Next Ayah Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextAyah}
                disabled={location.globalAyahNumber >= 6236}
                className="h-8 w-8 rounded-xl border-border/80"
                title={t.readerNextAyah}
                aria-label={t.readerNextAyah}
              >
                <NextIcon className="h-4 w-4" />
              </Button>

              {/* Bookmark Button */}
              {onBookmark && (
                <Button
                  variant={isBookmarked ? "secondary" : "outline"}
                  size="icon"
                  onClick={() => onBookmark(surahNumber, ayahNumber)}
                  className="h-8 w-8 rounded-xl border-border/80"
                  title={isBookmarked ? t.readerBookmarkSaved : t.readerBookmarkAyah}
                  aria-label={t.readerBookmarkAyah}
                >
                  {isBookmarked ? (
                    <IconBookmarkFilled className="h-4 w-4 text-primary" />
                  ) : (
                    <IconBookmark className="h-4 w-4 text-foreground" />
                  )}
                </Button>
              )}

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-xl hover:bg-muted"
                title={language === "ar" ? "إغلاق" : "Close"}
                aria-label="Close dialog"
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Share / Copy Toast Alert */}
          {shareToast && (
            <div className="border-b border-primary/30 bg-primary/20 px-4 py-1.5 text-center text-xs font-bold text-primary">
              {t.readerCopied}
            </div>
          )}

          {/* Main Scrollable Content */}
          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6 select-text">
            {/* Arabic Quranic Verse Card */}
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-4">
                <span className="text-primary font-extrabold flex items-center gap-1.5">
                  <IconSparkles className="h-4 w-4" />
                  <span>{surahInfo?.transliteration || surahInfo?.nameEn}</span>
                </span>
                <span>
                  {surahInfo?.revelationType === "Meccan"
                    ? t.readerSurahTypeMeccan
                    : t.readerSurahTypeMedinan}
                </span>
              </div>

              {/* Large Arabic Ayah Calligraphy */}
              <div
                className={cn(
                  "mushaf-page-content text-right text-foreground font-black leading-loose select-text",
                  fontClass
                )}
                style={{ fontSize: "26px", lineHeight: "2.4" }}
                dir="rtl"
              >
                {arabicText ? (
                  <>
                    <span>{arabicText}</span>
                    <span className="ayah-verse-marker ms-2" aria-label={`Ayah ${ayahNumber}`}>
                      {toArabicNumerals(ayahNumber)}
                    </span>
                  </>
                ) : (
                  <div className="flex h-20 items-center justify-center">
                    <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Sahih International English Translation Card */}
            <div
              className="rounded-2xl border border-border/70 bg-background/80 p-4 sm:p-5 space-y-2.5"
              style={{ direction: "ltr" }}
            >
              <div className="flex items-center justify-between text-xs font-extrabold text-primary">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <IconWorld className="h-3.5 w-3.5" />
                  <span>Sahih International Translation</span>
                </span>
                <span className="font-sans text-[11px] text-muted-foreground font-semibold">
                  [{surahNumber}:{ayahNumber}]
                </span>
              </div>

              {isLoading && !translationText ? (
                <div className="flex h-12 items-center justify-center">
                  <IconLoader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : translationText ? (
                <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                  {translationText}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  {language === "ar"
                    ? "الترجمة غير متوفرة حالياً لهذه الآية."
                    : "Translation unavailable for this verse."}
                </p>
              )}
            </div>

            {/* Action Tools Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Copy Arabic */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyArabic}
                className="h-9 flex-1 sm:flex-initial gap-1.5 rounded-xl text-xs font-bold border-border/80 hover:bg-muted"
              >
                {copiedArabic ? (
                  <>
                    <IconCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {t.readerCopied}
                    </span>
                  </>
                ) : (
                  <>
                    <IconCopy className="h-4 w-4" />
                    <span>{t.readerCopyArabic}</span>
                  </>
                )}
              </Button>

              {/* Copy Translation */}
              {translationText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTranslation}
                  className="h-9 flex-1 sm:flex-initial gap-1.5 rounded-xl text-xs font-bold border-border/80 hover:bg-muted"
                >
                  {copiedTranslation ? (
                    <>
                      <IconCheck className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {t.readerCopied}
                      </span>
                    </>
                  ) : (
                    <>
                      <IconCopy className="h-4 w-4" />
                      <span>{t.readerCopyTranslation}</span>
                    </>
                  )}
                </Button>
              )}

              {/* Share Ayah */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-9 flex-1 sm:flex-initial gap-1.5 rounded-xl text-xs font-bold border-border/80 hover:bg-muted"
              >
                <IconShare className="h-4 w-4" />
                <span>{t.readerShareAyah}</span>
              </Button>

              {/* Toggle Bookmark */}
              {onBookmark && (
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={() => onBookmark(surahNumber, ayahNumber)}
                  className={cn(
                    "h-9 flex-1 sm:flex-initial gap-1.5 rounded-xl text-xs font-bold",
                    isBookmarked
                      ? "bg-primary text-primary-foreground"
                      : "border-border/80 hover:bg-muted"
                  )}
                >
                  {isBookmarked ? (
                    <>
                      <IconBookmarkFilled className="h-4 w-4" />
                      <span>{t.readerBookmarkSaved}</span>
                    </>
                  ) : (
                    <>
                      <IconBookmark className="h-4 w-4" />
                      <span>{t.readerBookmarkAyah}</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
