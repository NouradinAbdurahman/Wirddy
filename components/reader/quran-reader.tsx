"use client"

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  IconArrowLeft,
  IconArrowRight,
  IconBookmark,
  IconBookmarkFilled,
  IconBook,
  IconBook2,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutSidebarRight,
  IconMinus,
  IconMoon,
  IconPlus,
  IconSearch,
  IconSun,
  IconWorld,
  IconX,
  IconMaximize,
  IconMinimize,
  IconLayoutSidebar,
  IconLayoutColumns,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { fetchPage, fetchPageTranslation } from "@/lib/quran/api"
import { quranService } from "@/lib/quran/service"
import {
  getPageForSurahAyah,
  getSurahStartPage,
  getJuzStartPage,
} from "@/lib/quran/pages-data"
import { saveBookmarkAction } from "@/lib/groups/actions"
import { QuranSearchModal } from "./quran-search-modal"
import { AyahDetailsDialog } from "./ayah-details-dialog"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { toArabicNumerals } from "@/lib/dates/calendar"
import { cn } from "@/lib/utils"

export type QuranFontFamily =
  | "amiri-quran"
  | "scheherazade"
  | "amiri"
  | "indopak"

export type ReaderTheme = "dark" | "light" | "sepia"
export type LineSpacing = "normal" | "relaxed" | "loose"
export type SpreadMode = "auto" | "single" | "two"

interface QuranReaderProps {
  initialPage?: number
  initialSurahNumber?: number
  initialAyahNumber?: number
  endSurahNumber?: number
  endAyahNumber?: number
  title?: string
  assignmentTitle?: string
  isModal?: boolean
  isOpen?: boolean
  onClose?: () => void
  onCompleteAssignment?: () => void
}

export function QuranReader({
  initialPage,
  initialSurahNumber,
  initialAyahNumber,
  endSurahNumber,
  endAyahNumber,
  title,
  assignmentTitle,
  isModal,
  isOpen = true,
  onClose,
  onCompleteAssignment,
}: QuranReaderProps) {
  const { language, dir, t, formatNumber } = useI18n()

  // Determine if reader is acting as an overlay modal or standalone workspace
  const isModalMode = isModal !== undefined ? isModal : onClose !== undefined

  // Calculate canonical initial page
  const resolvedInitialPage = useMemo(() => {
    if (initialPage && initialPage >= 1 && initialPage <= 604) {
      return initialPage
    }
    if (initialSurahNumber) {
      return getPageForSurahAyah(initialSurahNumber, initialAyahNumber || 1)
    }
    return 1
  }, [initialPage, initialSurahNumber, initialAyahNumber])

  const [currentPage, setCurrentPage] = useState<number>(resolvedInitialPage)
  const [activeAyah, setActiveAyah] = useState<{ surah: number; ayah: number } | null>(() => {
    if (initialSurahNumber && initialAyahNumber) {
      return { surah: initialSurahNumber, ayah: initialAyahNumber }
    }
    return null
  })

  const [fontSize, setFontSize] = useState<number>(25)
  const [fontFamily, setFontFamily] = useState<QuranFontFamily>("scheherazade")
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>("dark")
  const [lineSpacing, setLineSpacing] = useState<LineSpacing>("relaxed")
  const [showTranslation, setShowTranslation] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState<boolean>(false)
  const [spreadMode, setSpreadMode] = useState<SpreadMode>("auto")

  const [surahSearchQuery, setSurahSearchQuery] = useState<string>("")
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false)
  const [rightPanelTab, setRightPanelTab] = useState<"surahs" | "juz" | "settings">("surahs")

  const [page1Ayahs, setPage1Ayahs] = useState<any[]>([])
  const [page2Ayahs, setPage2Ayahs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [bookmarkToast, setBookmarkToast] = useState<boolean>(false)
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [isAyahDialogOpen, setIsAyahDialogOpen] = useState<boolean>(false)
  const [slideDirection, setSlideDirection] = useState<"next" | "prev" | "jump" | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(1200)

  const surahListRef = useRef<HTMLDivElement>(null)
  const pageContainerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  const allSurahs = useMemo(() => quranService.getAllSurahs(), [])

  // Measure available workspace width dynamically
  useEffect(() => {
    const updateWidth = () => {
      if (pageContainerRef.current) {
        setContainerWidth(pageContainerRef.current.clientWidth)
      } else if (typeof window !== "undefined") {
        setContainerWidth(window.innerWidth)
      }
    }
    updateWidth()
    const ro = new ResizeObserver(() => updateWidth())
    if (pageContainerRef.current) {
      ro.observe(pageContainerRef.current)
    }
    window.addEventListener("resize", updateWidth)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", updateWidth)
    }
  }, [])

  // Auto-detect two-page spread suitability (>= 1150px available width on desktop)
  const isTwoPageSpread = useMemo(() => {
    if (spreadMode === "single") return false
    if (spreadMode === "two") return true
    if (typeof window !== "undefined" && window.innerWidth < 1024) return false
    return containerWidth >= 1150
  }, [spreadMode, containerWidth])

  // Calculate canonical pages in current spread
  const { firstSpreadPage, secondSpreadPage } = useMemo(() => {
    if (!isTwoPageSpread) {
      return { firstSpreadPage: currentPage, secondSpreadPage: null }
    }
    if (currentPage === 1) {
      return { firstSpreadPage: 1, secondSpreadPage: 2 }
    }
    const base = currentPage % 2 === 0 ? currentPage : currentPage - 1
    const p1 = Math.max(1, base)
    const p2 = p1 + 1 <= 604 ? p1 + 1 : null
    return { firstSpreadPage: p1, secondSpreadPage: p2 }
  }, [isTwoPageSpread, currentPage])

  // Primary Surah & Juz derived from current active page
  const currentSurah = page1Ayahs[0]?.surah?.number || 1
  const currentJuz = page1Ayahs[0]?.juz || 1
  const surahInfo = useMemo(() => quranService.getSurah(currentSurah), [currentSurah])

  // Ayah Click & Dialog Navigation handlers
  const handleAyahClick = (surahNum: number, ayahNum: number) => {
    setActiveAyah({ surah: surahNum, ayah: ayahNum })
    setIsAyahDialogOpen(true)
  }

  const handleNavigateAyahInDialog = useCallback(
    (targetSurah: number, targetAyah: number) => {
      const targetPage = quranService.getPageForSurahAyah(targetSurah, targetAyah)
      if (
        targetPage !== currentPage &&
        (!isTwoPageSpread || (targetPage !== firstSpreadPage && targetPage !== secondSpreadPage))
      ) {
        setSlideDirection(targetPage > currentPage ? "next" : "prev")
        setCurrentPage(targetPage)
      }
      setActiveAyah({ surah: targetSurah, ayah: targetAyah })
    },
    [currentPage, isTwoPageSpread, firstSpreadPage, secondSpreadPage]
  )

  // Load Page Ayahs (Single or Two-page spread) & optional Translation
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    const promises: Promise<any>[] = [
      fetchPage(firstSpreadPage, "quran-uthmani"),
    ]
    if (showTranslation) {
      promises.push(fetchPageTranslation(firstSpreadPage, "en.sahih"))
    }
    if (secondSpreadPage) {
      promises.push(fetchPage(secondSpreadPage, "quran-uthmani"))
      if (showTranslation) {
        promises.push(fetchPageTranslation(secondSpreadPage, "en.sahih"))
      }
    }

    Promise.all(promises)
      .then((results) => {
        if (!isMounted) return
        const p1Data = results[0]
        const p1Trans = showTranslation ? results[1]?.ayahs || [] : []
        if (p1Data?.ayahs) {
          setPage1Ayahs(
            p1Data.ayahs.map((a: any, idx: number) => ({
              ...a,
              translation: p1Trans[idx]?.text || undefined,
            }))
          )
        }

        if (secondSpreadPage) {
          const p2Idx = showTranslation ? 2 : 1
          const p2Data = results[p2Idx]
          const p2Trans = showTranslation ? results[p2Idx + 1]?.ayahs || [] : []
          if (p2Data?.ayahs) {
            setPage2Ayahs(
              p2Data.ayahs.map((a: any, idx: number) => ({
                ...a,
                translation: p2Trans[idx]?.text || undefined,
              }))
            )
          } else {
            setPage2Ayahs([])
          }
        } else {
          setPage2Ayahs([])
        }
      })
      .catch((err) => {
        console.error("Failed to load page text:", err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    // Sync URL query without page reload
    if (typeof window !== "undefined" && !isModalMode) {
      const url = new URL(window.location.href)
      url.searchParams.set("page", currentPage.toString())
      window.history.replaceState({}, "", url.toString())
    }

    return () => {
      isMounted = false
    }
  }, [firstSpreadPage, secondSpreadPage, showTranslation, isModalMode, currentPage])

  // Scroll reader container to top on page navigation
  useEffect(() => {
    if (pageContainerRef.current) {
      pageContainerRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [currentPage])

  // Navigation handlers
  const handleNextPage = useCallback(() => {
    setSlideDirection("next")
    if (isTwoPageSpread) {
      setCurrentPage((p) => {
        const next = p % 2 === 0 ? p + 2 : p + 1
        return Math.min(604, next)
      })
    } else {
      setCurrentPage((p) => Math.min(604, p + 1))
    }
  }, [isTwoPageSpread])

  const handlePrevPage = useCallback(() => {
    setSlideDirection("prev")
    if (isTwoPageSpread) {
      setCurrentPage((p) => {
        const prev = p <= 2 ? 1 : p % 2 === 0 ? p - 2 : p - 3 < 1 ? 1 : p - 3
        return Math.max(1, prev)
      })
    } else {
      setCurrentPage((p) => Math.max(1, p - 1))
    }
  }, [isTwoPageSpread])

  const handleJumpToPage = (pageNum: number) => {
    const clamped = Math.max(1, Math.min(604, Math.floor(pageNum)))
    setSlideDirection(clamped > currentPage ? "next" : clamped < currentPage ? "prev" : "jump")
    setCurrentPage(clamped)
  }

  const handleBookmark = async (surahNum?: number, ayahNum?: number) => {
    const targetSurah = surahNum || currentSurah
    const targetAyah = ayahNum || page1Ayahs[0]?.numberInSurah || 1
    setIsBookmarked(true)
    const gAyah = quranService.getGlobalAyahNumber(targetSurah, targetAyah)
    const loc = quranService.getLocationFromGlobalAyah(gAyah)
    const juz = loc.juzNumber || 1
    await saveBookmarkAction(targetSurah, targetAyah, juz)
    setBookmarkToast(true)
    setTimeout(() => setBookmarkToast(false), 2500)
  }

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      if (dir === "rtl") {
        if (e.key === "ArrowLeft") handleNextPage()
        if (e.key === "ArrowRight") handlePrevPage()
      } else {
        if (e.key === "ArrowRight") handleNextPage()
        if (e.key === "ArrowLeft") handlePrevPage()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dir, handleNextPage, handlePrevPage])

  // Touch Swipe Gestures for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchEndX - touchStartX.current
    touchStartX.current = null

    if (Math.abs(diff) > 50) {
      if (dir === "rtl") {
        if (diff > 0) handlePrevPage()
        else handleNextPage()
      } else {
        if (diff < 0) handleNextPage()
        else handlePrevPage()
      }
    }
  }

  // Filter Surahs list by search
  const filteredSurahs = useMemo(() => {
    if (!surahSearchQuery.trim()) return allSurahs
    const q = surahSearchQuery.trim().toLowerCase()
    return allSurahs.filter(
      (s) =>
        s.nameAr.includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        (s.transliteration && s.transliteration.toLowerCase().includes(q)) ||
        s.number.toString() === q
    )
  }, [allSurahs, surahSearchQuery])

  if (isOpen === false || (isModalMode && !isOpen)) return null

  const isRTL = dir === "rtl"
  const NextIcon = isRTL ? IconChevronLeft : IconChevronRight
  const PrevIcon = isRTL ? IconChevronRight : IconChevronLeft
  const BackArrowIcon = isRTL ? IconArrowRight : IconArrowLeft

  const fontClass =
    fontFamily === "amiri-quran"
      ? "font-quran-amiri-quran"
      : fontFamily === "scheherazade"
      ? "font-quran-scheherazade"
      : fontFamily === "amiri"
      ? "font-quran-amiri"
      : "font-quran-indopak"

  const lineSpacingClass =
    lineSpacing === "loose"
      ? "leading-[3.2]"
      : lineSpacing === "relaxed"
      ? "leading-[2.8]"
      : "leading-[2.4]"

  const themeClass =
    readerTheme === "sepia"
      ? "reader-theme-sepia"
      : readerTheme === "light"
      ? "reader-theme-light"
      : "reader-theme-dark"

  // Render page interior content (Header, Surahs/Bismillahs, continuous Ayah text, Footer)
  const renderPageContent = (
    pageNum: number,
    ayahs: any[]
  ) => {
    const pageSurahNum = ayahs[0]?.surah?.number || 1
    const pageJuzNum = ayahs[0]?.juz || 1
    const pSurahInfo = quranService.getSurah(pageSurahNum)

    return (
      <div key={`mushaf-content-${pageNum}`} className="flex flex-col flex-1 min-w-0">
        {/* Top Page Header Line: Surah Name, Page Number, Juz Number */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between border-b border-border/50 pb-2.5 sm:pb-3 text-xs font-bold text-muted-foreground">
          <span className="text-primary font-extrabold truncate max-w-[130px] sm:max-w-none">
            سورة {pSurahInfo?.nameAr}
          </span>
          <span className="font-sans text-[11px] font-semibold opacity-80">
            {language === "ar"
              ? `صفحة ${toArabicNumerals(pageNum)} من ٦٠٤`
              : `Page ${pageNum} of 604`}
          </span>
          <span className="truncate max-w-[100px] sm:max-w-none">
            {language === "ar"
              ? `الجزء ${toArabicNumerals(pageJuzNum)}`
              : `Juz ${pageJuzNum}`}
          </span>
        </div>

        {/* Assignment Title Badge (if opened from an assignment) */}
        {assignmentTitle && (
          <div className="mb-4 text-center">
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-xs font-bold text-primary">
              {assignmentTitle}
            </Badge>
          </div>
        )}

        {/* Continuous Quran Text Flow */}
        <div
          className={cn(
            "mushaf-page-content flex-1",
            fontClass,
            lineSpacingClass,
            "text-foreground select-text"
          )}
          style={{ fontSize: `${fontSize}px` }}
        >
          {ayahs.map((ayah) => {
            const isNewSurahStart = ayah.numberInSurah === 1
            const ayahSurahNum = ayah.surah?.number || pageSurahNum
            const ayahSurahInfo = quranService.getSurah(ayahSurahNum)

            const isActive =
              activeAyah?.surah === ayahSurahNum &&
              activeAyah?.ayah === ayah.numberInSurah

            const isWithinAssignment =
              initialSurahNumber && initialAyahNumber && endSurahNumber && endAyahNumber
                ? (ayahSurahNum > initialSurahNumber ||
                    (ayahSurahNum === initialSurahNumber && ayah.numberInSurah >= initialAyahNumber)) &&
                  (ayahSurahNum < endSurahNumber ||
                    (ayahSurahNum === endSurahNumber && ayah.numberInSurah <= endAyahNumber))
                : false

            return (
              <React.Fragment key={`${ayahSurahNum}-${ayah.numberInSurah}`}>
                {/* Compact Mushaf Surah Header Banner when a Surah begins on this page */}
                {isNewSurahStart && (
                  <div className="my-4 sm:my-6 block w-full select-none text-center">
                    <div className="mx-auto max-w-lg rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-2.5 sm:p-3 shadow-2xs">
                      <div className="flex items-center justify-between px-2 sm:px-3 text-[10px] sm:text-[11px] font-bold text-muted-foreground">
                        <span>
                          {ayahSurahInfo?.revelationType === "Meccan"
                            ? t.readerSurahTypeMeccan
                            : t.readerSurahTypeMedinan}
                        </span>
                        <span className="font-quran text-base font-black text-foreground sm:text-xl">
                          سُورَةُ {ayahSurahInfo?.nameAr}
                        </span>
                        <span>
                          {formatNumber(ayahSurahInfo?.totalAyahs || 0)} {language === "ar" ? "آياتها" : "Ayahs"}
                        </span>
                      </div>

                      {/* Bismillah Header (Omitted for Surah 9; Surah 1 includes Bismillah as Ayah 1) */}
                      {ayahSurahNum !== 1 && ayahSurahNum !== 9 && (
                        <div className="mt-1.5 sm:mt-2 border-t border-primary/20 pt-1.5 sm:pt-2 font-quran text-lg font-bold text-foreground sm:text-2xl">
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Continuous Inline Ayah Text with Verse Marker */}
                <span
                  onClick={() => handleAyahClick(ayahSurahNum, ayah.numberInSurah)}
                  className={cn(
                    "ayah-inline-hover inline select-text",
                    isActive
                      ? "ayah-inline-active"
                      : isWithinAssignment
                      ? "ayah-inline-highlight font-semibold"
                      : ""
                  )}
                  title={`سورة ${ayahSurahInfo?.nameAr} - آية ${ayah.numberInSurah}`}
                >
                  {ayah.text}
                </span>
                <span className="ayah-verse-marker" aria-label={`Ayah ${ayah.numberInSurah}`}>
                  {toArabicNumerals(ayah.numberInSurah)}
                </span>{" "}
              </React.Fragment>
            )
          })}
        </div>

        {/* Bottom Page Footer Number */}
        <div className="mt-6 sm:mt-8 border-t border-border/50 pt-2.5 sm:pt-3 text-center text-xs font-bold text-muted-foreground">
          <span className="font-sans text-xs font-extrabold text-foreground">
            {toArabicNumerals(pageNum)}
          </span>
        </div>

        {/* Optional English Translation Section below page */}
        {showTranslation && (
          <div className="mt-6 rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 space-y-3" style={{ direction: "ltr" }}>
            <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">
              English Translation (Sahih International) — Page {pageNum}
            </h4>
            <div className="space-y-2 text-xs font-medium text-muted-foreground leading-relaxed sm:text-sm">
              {ayahs.map((ayah) => (
                <p key={`trans-${ayah.surah?.number}-${ayah.numberInSurah}`}>
                  <span className="font-bold text-foreground">
                    [{ayah.surah?.number}:{ayah.numberInSurah}]
                  </span>{" "}
                  {ayah.translation || ""}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const readerMainContent = (
    <div
      className={cn("flex flex-1 flex-col overflow-hidden min-w-0 select-text", themeClass)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Top Workspace Toolbar */}
      <div className="sticky top-0 z-20 flex h-14 w-full shrink-0 items-center justify-between gap-2 border-b border-border/70 reader-toolbar-bg px-3 backdrop-blur-md sm:px-6">
        {/* Left: Back / Close & Desktop Surah / Juz Quick Dropdowns */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {isModal && onClose ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-xl"
              onClick={onClose}
              aria-label="Close"
            >
              <IconX className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 rounded-xl px-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  <BackArrowIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.navDashboard}</span>
                </Button>
              </Link>

              {/* Sidebar Collapse Toggle Button on Desktop */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
                className="hidden lg:flex h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                title={t.readerToggleSidebar}
              >
                <IconLayoutSidebar className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Mobile Center Pill: Tap to open Surah/Juz navigator drawer */}
          <button
            type="button"
            onClick={() => {
              setRightPanelTab("surahs")
              setIsRightPanelOpen(true)
            }}
            className="flex sm:hidden items-center gap-1.5 rounded-xl border border-border/80 bg-background/90 px-2.5 py-1 text-xs font-extrabold text-foreground shadow-2xs"
          >
            <span className="text-primary truncate max-w-[110px]">
              سورة {surahInfo?.nameAr}
            </span>
            <span className="opacity-50">•</span>
            <span className="font-sans text-[11px] font-semibold text-muted-foreground">
              {language === "ar" ? `ص ${toArabicNumerals(currentPage)}` : `p. ${currentPage}`}
            </span>
          </button>

          {/* Desktop Surah Dropdown Jump */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-4 w-px bg-border/60" />
            <select
              value={currentSurah}
              onChange={(e) => {
                const sNum = Number(e.target.value)
                const startPage = getSurahStartPage(sNum)
                handleJumpToPage(startPage)
              }}
              className="h-8 max-w-[140px] md:max-w-[180px] rounded-xl border border-border/80 bg-background px-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {allSurahs.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. سورة {s.nameAr}
                </option>
              ))}
            </select>

            {/* Desktop Juz Dropdown Jump */}
            <select
              value={currentJuz}
              onChange={(e) => {
                const jNum = Number(e.target.value)
                const startPage = getJuzStartPage(jNum)
                handleJumpToPage(startPage)
              }}
              className="h-8 rounded-xl border border-border/80 bg-background px-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                <option key={j} value={j}>
                  {language === "ar" ? `الجزء ${toArabicNumerals(j)}` : `Juz ${j}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Spread Mode Toggle on Desktop */}
          <Button
            variant={isTwoPageSpread ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              if (spreadMode === "auto") setSpreadMode("two")
              else if (spreadMode === "two") setSpreadMode("single")
              else setSpreadMode("auto")
            }}
            className="hidden md:inline-flex h-8 gap-1.5 rounded-xl text-xs font-bold"
            title={
              spreadMode === "two"
                ? t.readerTwoPageSpread
                : spreadMode === "single"
                ? t.readerSinglePage
                : t.readerAutoSpread
            }
          >
            <IconLayoutColumns className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">
              {isTwoPageSpread ? t.readerTwoPageSpread : t.readerSinglePage}
            </span>
          </Button>

          {/* Desktop Translation Toggle */}
          <Button
            variant={showTranslation ? "default" : "outline"}
            size="sm"
            onClick={() => setShowTranslation(!showTranslation)}
            className="hidden sm:inline-flex h-8 gap-1.5 rounded-xl text-xs font-bold"
            title={t.readerShowTranslation}
          >
            <IconWorld className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t.readerTranslation}</span>
          </Button>

          {/* Search Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSearch(true)}
            className="h-8 w-8 rounded-xl"
            title={t.navSearch}
          >
            <IconSearch className="h-4 w-4 text-foreground" />
          </Button>

          {/* Desktop Bookmark Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleBookmark(activeAyah?.surah, activeAyah?.ayah)}
            className="hidden sm:inline-flex h-8 w-8 rounded-xl"
            title={t.readerBookmarkSaved}
          >
            {isBookmarked ? (
              <IconBookmarkFilled className="h-4 w-4 text-primary" />
            ) : (
              <IconBookmark className="h-4 w-4 text-foreground" />
            )}
          </Button>

          {/* Fullscreen / Focus Mode Toggle */}
          {!isModal && (
            <Button
              variant={isFullscreen ? "secondary" : "outline"}
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex h-8 w-8 rounded-xl"
              title={isFullscreen ? t.readerExitFullscreen : t.readerFullscreen}
            >
              {isFullscreen ? (
                <IconMinimize className="h-4 w-4" />
              ) : (
                <IconMaximize className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Right Tools Drawer Toggle */}
          <Button
            variant={isRightPanelOpen ? "secondary" : "outline"}
            size="icon"
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className="h-8 w-8 rounded-xl"
            title={t.readerSettings}
          >
            <IconLayoutSidebarRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bookmark Toast Alert */}
      {bookmarkToast && (
        <div className="border-b border-primary/30 bg-primary/20 px-4 py-1.5 text-center text-xs font-bold text-primary">
          {t.readerBookmarkSaved}
        </div>
      )}

      {/* 2. Main Center Mushaf Page Surface (Physical Horizontal Slide Transition) */}
      <div
        ref={pageContainerRef}
        className="flex-1 overflow-y-auto px-2 py-3 sm:px-6 sm:py-8 lg:px-10 pb-40 sm:pb-36"
      >
        {isLoading && page1Ayahs.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="text-xs font-bold text-muted-foreground">
              {language === "ar"
                ? `جاري تحميل صفحة ${toArabicNumerals(currentPage)} من ٦٠٤...`
                : `Loading page ${currentPage} of 604...`}
            </p>
          </div>
        ) : (
          <motion.div
            key={
              isTwoPageSpread && secondSpreadPage
                ? `spread-${firstSpreadPage}-${secondSpreadPage}`
                : `page-${currentPage}`
            }
            initial={{
              x:
                slideDirection === "next"
                  ? dir === "rtl"
                    ? 50
                    : -50
                  : slideDirection === "prev"
                  ? dir === "rtl"
                    ? -50
                    : 50
                  : 0,
            }}
            animate={{ x: 0 }}
            transition={{
              duration: 0.22,
              ease: [0.25, 1, 0.5, 1],
            }}
            className={cn(
              "w-full mx-auto mushaf-page-slide",
              isTwoPageSpread && secondSpreadPage ? "max-w-[1400px]" : "max-w-3xl"
            )}
          >
            {isTwoPageSpread && secondSpreadPage ? (
              /* ONE SHARED OPEN MUSHAF SPREAD SURFACE */
              <div className="mushaf-spread-surface">
                {/* Right Page Content Pane in RTL (firstSpreadPage) */}
                <div className="mushaf-spread-pane">
                  {renderPageContent(firstSpreadPage, page1Ayahs)}
                </div>

                {/* Subtle Center Book Gutter */}
                <div className="mushaf-spread-gutter" aria-hidden="true" />

                {/* Left Page Content Pane in RTL (secondSpreadPage) */}
                <div className="mushaf-spread-pane">
                  {renderPageContent(secondSpreadPage, page2Ayahs)}
                </div>
              </div>
            ) : (
              /* SINGLE PAGE SURFACE */
              <div className="mushaf-page-surface max-w-3xl mx-auto p-4 sm:p-7 md:p-10">
                {renderPageContent(currentPage, page1Ayahs)}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* 3. Sticky Bottom Page Navigation Bar */}
      <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-2 border-t border-border/80 reader-toolbar-bg px-3 py-2 backdrop-blur-md sm:px-6">
        {/* Previous Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="h-8 gap-1.5 rounded-xl text-xs font-bold"
        >
          <PrevIcon className="h-4 w-4" />
          <span className="hidden xs:inline">{t.readerPrevPage}</span>
        </Button>

        {/* Central Page Indicator & Fast Jump Slider/Input */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-extrabold text-foreground">
            {isTwoPageSpread && secondSpreadPage
              ? language === "ar"
                ? `الصفحتان ${toArabicNumerals(firstSpreadPage)}–${toArabicNumerals(secondSpreadPage)} من ٦٠٤`
                : `Pages ${firstSpreadPage}–${secondSpreadPage} of 604`
              : language === "ar"
              ? `صفحة ${toArabicNumerals(currentPage)} من ٦٠٤`
              : `Page ${currentPage} of 604`}
          </span>

          <input
            type="number"
            min={1}
            max={604}
            value={currentPage}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val) && val >= 1 && val <= 604) {
                handleJumpToPage(val)
              }
            }}
            className="h-7 w-12 sm:w-14 rounded-lg border border-border/80 bg-background px-1 text-center text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            aria-label="Direct page number input"
          />
        </div>

        {/* Right action: Next Page & Mark Complete */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onCompleteAssignment && (
            <Button
              size="sm"
              onClick={() => {
                onCompleteAssignment()
                if (onClose) onClose()
              }}
              className="h-8 gap-1.5 bg-primary px-2.5 sm:px-3 text-xs font-extrabold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <IconCheck className="h-4 w-4" />
              <span>{t.readerMarkAssignmentDone}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= 604}
            className="h-8 gap-1.5 rounded-xl text-xs font-bold"
          >
            <span className="hidden xs:inline">{t.readerNextPage}</span>
            <NextIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quran Search Modal */}
      <QuranSearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectAyah={(sNum, aNum) => {
          const targetPage = getPageForSurahAyah(sNum, aNum)
          handleJumpToPage(targetPage)
          setActiveAyah({ surah: sNum, ayah: aNum })
          setShowSearch(false)
        }}
      />

      {/* Ayah Details & Study Dialog */}
      {activeAyah && (
        <AyahDetailsDialog
          isOpen={isAyahDialogOpen}
          onClose={() => setIsAyahDialogOpen(false)}
          surahNumber={activeAyah.surah}
          ayahNumber={activeAyah.ayah}
          arabicText={
            [...page1Ayahs, ...page2Ayahs].find(
              (a) =>
                (a.surah?.number || currentSurah) === activeAyah.surah &&
                a.numberInSurah === activeAyah.ayah
            )?.text
          }
          translationText={
            [...page1Ayahs, ...page2Ayahs].find(
              (a) =>
                (a.surah?.number || currentSurah) === activeAyah.surah &&
                a.numberInSurah === activeAyah.ayah
            )?.translation
          }
          fontClass={fontClass}
          onNavigateAyah={handleNavigateAyahInDialog}
          onBookmark={handleBookmark}
          isBookmarked={isBookmarked}
        />
      )}
    </div>
  )

  const readerRightPanel = (
    <aside
      className={cn(
        "flex flex-col border-border/70 bg-card/90 transition-all duration-300",
        dir === "rtl" ? "border-r" : "border-l",
        "w-80 shrink-0 h-full overflow-hidden"
      )}
    >
      {/* Right Panel Tabs Header */}
      <div className="flex border-b border-border/60 bg-muted/40 p-1.5">
        <button
          onClick={() => setRightPanelTab("surahs")}
          className={cn(
            "flex-1 rounded-xl py-1.5 text-xs font-bold transition-all",
            rightPanelTab === "surahs"
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t.readerSurahList}
        </button>
        <button
          onClick={() => setRightPanelTab("juz")}
          className={cn(
            "flex-1 rounded-xl py-1.5 text-xs font-bold transition-all",
            rightPanelTab === "juz"
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t.readerJuzNav}
        </button>
        <button
          onClick={() => setRightPanelTab("settings")}
          className={cn(
            "flex-1 rounded-xl py-1.5 text-xs font-bold transition-all",
            rightPanelTab === "settings"
              ? "bg-background text-primary shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t.readerSettings}
        </button>
      </div>

      {/* 1. Surahs List Tab */}
      {rightPanelTab === "surahs" && (
        <div className="flex flex-1 flex-col overflow-hidden p-3">
          <Input
            placeholder={t.readerSearchSurahs}
            value={surahSearchQuery}
            onChange={(e) => setSurahSearchQuery(e.target.value)}
            className="mb-2 h-9 rounded-xl border-border/80 bg-background text-xs"
          />
          <div ref={surahListRef} className="flex-1 overflow-y-auto space-y-1 pe-1">
            {filteredSurahs.map((s) => {
              const isSelected = s.number === currentSurah
              const startPage = getSurahStartPage(s.number)
              return (
                <button
                  key={s.number}
                  onClick={() => {
                    handleJumpToPage(startPage)
                    if (typeof window !== "undefined" && window.innerWidth < 1280) {
                      setIsRightPanelOpen(false)
                    }
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-all",
                    isSelected
                      ? "bg-primary/15 font-bold text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted text-[10px] font-bold">
                      {toArabicNumerals(s.number)}
                    </span>
                    <span className="font-bold text-foreground">
                      سورة {s.nameAr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>
                      {s.revelationType === "Meccan"
                        ? t.readerSurahTypeMeccan
                        : t.readerSurahTypeMedinan}
                    </span>
                    <span>•</span>
                    <span>
                      {language === "ar" ? `ص ${toArabicNumerals(startPage)}` : `p. ${startPage}`}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. Juz Navigation Tab */}
      {rightPanelTab === "juz" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="mb-2 text-xs font-bold text-muted-foreground">
            {language === "ar"
              ? `الجزء ${toArabicNumerals(currentJuz)} من ٣٠`
              : `Juz ${currentJuz} of 30`}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
              const isSelected = j === currentJuz
              const startPage = getJuzStartPage(j)
              return (
                <button
                  key={j}
                  onClick={() => {
                    handleJumpToPage(startPage)
                    if (typeof window !== "undefined" && window.innerWidth < 1280) {
                      setIsRightPanelOpen(false)
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl p-2 text-xs font-extrabold transition-all border",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border/60 bg-muted/30 text-foreground hover:bg-muted"
                  )}
                >
                  <span>{toArabicNumerals(j)}</span>
                  <span className="text-[9px] opacity-70 font-sans">
                    {startPage}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. Settings Tab */}
      {rightPanelTab === "settings" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Display Mode (Spread preference) */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-foreground">
              {language === "ar" ? "طريقة العرض" : "Display Spread"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSpreadMode("auto")}
                className={cn(
                  "rounded-xl border p-2 text-center text-xs font-bold transition-all",
                  spreadMode === "auto"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                    : "border-border/70 hover:bg-muted"
                )}
              >
                {t.readerAutoSpread}
              </button>
              <button
                type="button"
                onClick={() => setSpreadMode("single")}
                className={cn(
                  "rounded-xl border p-2 text-center text-xs font-bold transition-all",
                  spreadMode === "single"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                    : "border-border/70 hover:bg-muted"
                )}
              >
                {t.readerSinglePage}
              </button>
              <button
                type="button"
                onClick={() => setSpreadMode("two")}
                className={cn(
                  "rounded-xl border p-2 text-center text-xs font-bold transition-all",
                  spreadMode === "two"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                    : "border-border/70 hover:bg-muted"
                )}
              >
                {t.readerTwoPageSpread}
              </button>
            </div>
          </div>

          {/* Font Size Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-foreground">
              <span>{t.readerFontSize}</span>
              <span className="font-sans font-bold text-primary">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-xl"
                onClick={() => setFontSize((s) => Math.max(18, s - 2))}
              >
                <IconMinus className="h-3.5 w-3.5" />
              </Button>
              <input
                type="range"
                min={18}
                max={40}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-xl"
                onClick={() => setFontSize((s) => Math.min(40, s + 2))}
              >
                <IconPlus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Font Style Selection */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-foreground">
              {t.readerFont}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFontFamily("scheherazade")}
                className={cn(
                  "rounded-xl border p-2.5 text-center text-xs font-bold transition-all",
                  fontFamily === "scheherazade"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                    : "border-border/70 hover:bg-muted"
                )}
              >
                {t.readerFontScheherazade}
              </button>
              <button
                type="button"
                onClick={() => setFontFamily("amiri-quran")}
                className={cn(
                  "rounded-xl border p-2.5 text-center text-xs font-bold transition-all",
                  fontFamily === "amiri-quran"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                    : "border-border/70 hover:bg-muted"
                )}
              >
                {t.readerFontAmiriQuran}
              </button>
              <button
                type="button"
                onClick={() => setFontFamily("amiri")}
                className={cn(
                  "rounded-xl border p-2.5 text-center text-xs font-bold transition-all",
                  fontFamily === "amiri"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                    : "border-border/70 hover:bg-muted"
                )}
              >
                {t.readerFontAmiri}
              </button>
              <button
                type="button"
                onClick={() => setFontFamily("indopak")}
                className={cn(
                  "rounded-xl border p-2.5 text-center text-xs font-bold transition-all",
                  fontFamily === "indopak"
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                    : "border-border/70 hover:bg-muted"
                )}
              >
                {t.readerFontIndoPak}
              </button>
            </div>
          </div>

          {/* Reading Theme */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-foreground">
              {t.readerTheme}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReaderTheme("dark")}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-bold transition-all bg-neutral-900 text-white",
                  readerTheme === "dark" ? "border-primary ring-2 ring-primary" : "border-neutral-700"
                )}
              >
                <IconMoon className="h-4 w-4" />
                <span>{t.readerThemeDark}</span>
              </button>
              <button
                type="button"
                onClick={() => setReaderTheme("sepia")}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-bold transition-all bg-[#fbf7ee] text-[#382d1d]",
                  readerTheme === "sepia" ? "border-primary ring-2 ring-primary" : "border-[#e5d8be]"
                )}
              >
                <IconSun className="h-4 w-4 text-amber-600" />
                <span>{t.readerThemeSepia}</span>
              </button>
              <button
                type="button"
                onClick={() => setReaderTheme("light")}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-bold transition-all bg-white text-slate-900",
                  readerTheme === "light" ? "border-primary ring-2 ring-primary" : "border-slate-200"
                )}
              >
                <IconSun className="h-4 w-4 text-amber-500" />
                <span>{t.readerThemeLight}</span>
              </button>
            </div>
          </div>

          {/* Line Spacing */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-foreground">
              {t.readerLineHeight}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLineSpacing("normal")}
                className={cn(
                  "rounded-xl border p-2 text-center text-xs font-bold",
                  lineSpacing === "normal"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/70 hover:bg-muted"
                )}
              >
                {language === "ar" ? "مضغوط" : "Compact"}
              </button>
              <button
                type="button"
                onClick={() => setLineSpacing("relaxed")}
                className={cn(
                  "rounded-xl border p-2 text-center text-xs font-bold",
                  lineSpacing === "relaxed"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/70 hover:bg-muted"
                )}
              >
                {language === "ar" ? "متوسط" : "Relaxed"}
              </button>
              <button
                type="button"
                onClick={() => setLineSpacing("loose")}
                className={cn(
                  "rounded-xl border p-2 text-center text-xs font-bold",
                  lineSpacing === "loose"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/70 hover:bg-muted"
                )}
              >
                {language === "ar" ? "متباعد" : "Loose"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )

  // Modal Render Mode
  if (isModalMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 backdrop-blur-md sm:p-4">
        <div className="flex h-full max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
          {readerMainContent}
          {isRightPanelOpen && (
            <div className="hidden lg:block h-full">
              {readerRightPanel}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Full Desktop Workspace Render Mode
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* 1. Left Column: App Sidebar (Desktop, collapsible) */}
      {!isFullscreen && (
        <div
          className={cn(
            "hidden lg:block shrink-0 transition-all duration-300",
            isLeftSidebarCollapsed ? "w-0 overflow-hidden" : "w-60"
          )}
        >
          <AppSidebar
            activeKey="reader"
            currentReadingPortion={{
              surahName: surahInfo?.nameAr || "",
              ayahRange:
                isTwoPageSpread && secondSpreadPage
                  ? `صفحة ${firstSpreadPage}–${secondSpreadPage}`
                  : `صفحة ${currentPage}`,
              juzNumber: currentJuz,
            }}
          />
        </div>
      )}

      {/* 2. Center Column: Main Mushaf Reading Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {readerMainContent}
      </div>

      {/* 3. Right Column: Tools Panel (Desktop) */}
      {!isFullscreen && isRightPanelOpen && (
        <div className="hidden xl:block h-full">
          {readerRightPanel}
        </div>
      )}

      {/* Slide-over Drawer for Tablet / Mobile when Right Panel is toggled */}
      {isRightPanelOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/70 backdrop-blur-xs xl:hidden">
          <div
            className={cn(
              "relative flex h-full w-80 max-w-[85vw] flex-col bg-background shadow-2xl transition-all overflow-y-auto",
              dir === "rtl" ? "ms-auto" : "me-auto"
            )}
          >
            <div className="absolute end-2 top-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRightPanelOpen(false)}
                className="h-7 w-7 rounded-full hover:bg-muted"
                aria-label="Close"
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>
            {readerRightPanel}
          </div>
          <div
            className="flex-1 cursor-pointer"
            onClick={() => setIsRightPanelOpen(false)}
            aria-label="Close backdrop"
          />
        </div>
      )}
    </div>
  )
}
