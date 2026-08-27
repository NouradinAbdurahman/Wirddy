"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  IconBookmark,
  IconBookmarkFilled,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconMinus,
  IconPlus,
  IconX,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { fetchSurah } from "@/lib/quran/api"
import { quranService } from "@/lib/quran/service"
import { saveBookmarkAction } from "@/lib/groups/actions"

interface QuranReaderProps {
  initialSurahNumber?: number
  initialAyahNumber?: number
  endSurahNumber?: number
  endAyahNumber?: number
  title?: string
  assignmentTitle?: string
  isOpen: boolean
  onClose: () => void
  onCompleteAssignment?: () => void
}

export function QuranReader({
  initialSurahNumber = 1,
  initialAyahNumber = 1,
  endSurahNumber,
  endAyahNumber,
  title,
  assignmentTitle,
  isOpen,
  onClose,
  onCompleteAssignment,
}: QuranReaderProps) {
  const { language, dir, t } = useI18n()
  const [currentSurah, setCurrentSurah] = useState<number>(initialSurahNumber)
  const [currentAyah, setCurrentAyah] = useState<number>(initialAyahNumber)
  const [fontSize, setFontSize] = useState<number>(24)
  const [ayahs, setAyahs] = useState<
    Array<{ numberInSurah: number; text: string }>
  >([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [bookmarkToast, setBookmarkToast] = useState<boolean>(false)

  const surahInfo = quranService.getSurah(currentSurah)

  // Load Surah Ayahs
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    fetchSurah(currentSurah)
      .then((data) => {
        if (isMounted && data?.ayahs) {
          setAyahs(
            data.ayahs.map((a) => ({
              numberInSurah: a.numberInSurah,
              text: a.text,
            }))
          )
        }
      })
      .catch((err) => {
        console.error("Failed to load Surah text:", err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [currentSurah])

  // Scroll to initial Ayah once loaded
  useEffect(() => {
    if (!isLoading && ayahs.length > 0) {
      const el = document.getElementById(`ayah-${currentAyah}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [isLoading, currentAyah, ayahs.length])

  const handleNextSurah = () => {
    if (currentSurah < 114) {
      setCurrentSurah((prev) => prev + 1)
      setCurrentAyah(1)
    }
  }

  const handlePrevSurah = () => {
    if (currentSurah > 1) {
      setCurrentSurah((prev) => prev - 1)
      setCurrentAyah(1)
    }
  }

  const handleBookmark = async () => {
    setIsBookmarked(true)
    const globalAyah = quranService.getGlobalAyahNumber(
      currentSurah,
      currentAyah
    )
    const loc = quranService.getLocationFromGlobalAyah(globalAyah)
    const juz = loc.juzNumber || 1
    await saveBookmarkAction(currentSurah, currentAyah, juz)
    setBookmarkToast(true)
    setTimeout(() => setBookmarkToast(false), 2500)
  }

  if (!isOpen) return null

  const isRTL = dir === "rtl"
  const NextIcon = isRTL ? IconChevronLeft : IconChevronRight
  const PrevIcon = isRTL ? IconChevronRight : IconChevronLeft

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
                {currentSurah}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-foreground sm:text-base">
                  {language === "ar"
                    ? `سورة ${surahInfo?.nameAr || ""}`
                    : `Surah ${surahInfo?.nameEn || ""}`}
                </h3>
                {assignmentTitle && (
                  <p className="max-w-[200px] truncate text-[11px] font-medium text-muted-foreground sm:max-w-md">
                    {assignmentTitle}
                  </p>
                )}
              </div>
            </div>

            {/* Controls: Font size, Bookmark, Close */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded"
                  onClick={() => setFontSize((s) => Math.max(16, s - 2))}
                  aria-label="Decrease font size"
                >
                  <IconMinus className="h-3.5 w-3.5" />
                </Button>
                <span className="px-1 text-[11px] font-bold text-muted-foreground">
                  {fontSize}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded"
                  onClick={() => setFontSize((s) => Math.min(42, s + 2))}
                  aria-label="Increase font size"
                >
                  <IconPlus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={handleBookmark}
                title={t.readerBookmarkSaved}
              >
                {isBookmarked ? (
                  <IconBookmarkFilled className="h-4 w-4 text-primary" />
                ) : (
                  <IconBookmark className="h-4 w-4 text-foreground" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted"
                onClick={onClose}
                aria-label="Close reader"
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bookmark Toast Alert */}
          {bookmarkToast && (
            <div className="border-b border-primary/30 bg-primary/20 px-4 py-1.5 text-center text-xs font-bold text-primary">
              {t.readerBookmarkSaved}
            </div>
          )}

          {/* Quran Text Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-10">
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-xs font-semibold text-muted-foreground">
                  {language === "ar"
                    ? "جاري تحميل الآيات..."
                    : "Loading Ayahs..."}
                </p>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {/* Surah Header Card */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                  <h2 className="font-serif text-xl font-bold text-primary sm:text-2xl">
                    سورة {surahInfo?.nameAr}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {surahInfo?.revelationType === "Meccan" ? "مكية" : "مدنية"}{" "}
                    • {surahInfo?.totalAyahs} آية
                  </p>
                  {currentSurah !== 1 && currentSurah !== 9 && (
                    <p className="mt-3 font-serif text-lg font-semibold text-foreground/90">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  )}
                </div>

                {/* Ayah Flow Text */}
                <div
                  className="text-justify font-serif leading-[2.6] text-foreground"
                  style={{ fontSize: `${fontSize}px`, direction: "rtl" }}
                >
                  {ayahs.map((ayah) => {
                    const isWithinAssignment =
                      endSurahNumber && endAyahNumber
                        ? (currentSurah > initialSurahNumber ||
                            ayah.numberInSurah >= initialAyahNumber) &&
                          (currentSurah < endSurahNumber ||
                            ayah.numberInSurah <= endAyahNumber)
                        : true

                    return (
                      <span
                        key={ayah.numberInSurah}
                        id={`ayah-${ayah.numberInSurah}`}
                        className={`rounded px-1 py-0.5 transition-colors ${
                          isWithinAssignment
                            ? "bg-primary/10 font-semibold text-foreground"
                            : "text-foreground/80"
                        }`}
                      >
                        {ayah.text}{" "}
                        <span className="mx-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 bg-card align-middle font-sans text-[13px] font-bold text-primary select-none">
                          {ayah.numberInSurah}
                        </span>{" "}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar: Navigation & Action */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevSurah}
                disabled={currentSurah <= 1}
                className="gap-1.5 text-xs font-bold"
              >
                <PrevIcon className="h-4 w-4" />
                <span>{t.readerPrevPortion}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextSurah}
                disabled={currentSurah >= 114}
                className="gap-1.5 text-xs font-bold"
              >
                <span>{t.readerNextPortion}</span>
                <NextIcon className="h-4 w-4" />
              </Button>
            </div>

            {onCompleteAssignment && (
              <Button
                size="sm"
                onClick={() => {
                  onCompleteAssignment()
                  onClose()
                }}
                className="gap-1.5 bg-primary text-xs font-extrabold text-primary-foreground hover:bg-primary/90"
              >
                <IconCheck className="h-4 w-4" />
                <span>{t.readerMarkAssignmentDone}</span>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
