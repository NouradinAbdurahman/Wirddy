"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  IconSearch,
  IconX,
  IconBook,
  IconArrowRight,
  IconArrowLeft,
  IconLoader2,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { searchQuran, QuranSearchResult } from "@/lib/quran/search"

interface QuranSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectAyah: (surahNumber: number, ayahNumber: number) => void
}

export function QuranSearchModal({
  isOpen,
  onClose,
  onSelectAyah,
}: QuranSearchModalProps) {
  const { language, dir, t, formatNumber } = useI18n()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<QuranSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timeout = setTimeout(() => {
      searchQuran(query).then((res) => {
        setResults(res)
        setIsSearching(false)
      })
    }, 250)

    return () => clearTimeout(timeout)
  }, [query])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 p-4 pt-16 backdrop-blur-sm sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="relative flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-2xl"
        >
          {/* Search Input Header */}
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <IconSearch className="h-5 w-5 shrink-0 text-primary" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                language === "ar"
                  ? "ابحث عن سورة، آية، أو كلمة (مثال: الفاتحة، 2:255، الحمد)..."
                  : "Search Surah, Ayah, or keyword (e.g. Al-Baqarah, 2:255)..."
              }
              autoFocus
              className="h-10 border-0 bg-transparent px-0 text-sm font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuery("")}
                className="h-7 w-7 rounded-full text-muted-foreground"
              >
                <IconX className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>

          {/* Results List */}
          <div className="flex-1 space-y-2 overflow-y-auto py-3">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-xs font-semibold text-muted-foreground">
                <IconLoader2 className="h-5 w-5 animate-spin text-primary" />
                <span>
                  {language === "ar"
                    ? "جاري البحث في المصحف..."
                    : "Searching Quran..."}
                </span>
              </div>
            ) : query.trim() && results.length === 0 ? (
              <div className="py-12 text-center text-xs font-semibold text-muted-foreground">
                {language === "ar"
                  ? "لم يتم العثور على نتائج تطابق بحثك."
                  : "No matching results found."}
              </div>
            ) : !query.trim() ? (
              <div className="space-y-1 py-12 text-center text-xs font-semibold text-muted-foreground">
                <p>
                  {language === "ar"
                    ? "اكتب اسم السورة أو رقم الآية أو كلمة للبحث"
                    : "Type a Surah name, Ayah number, or keyword"}
                </p>
                <p className="text-[11px] text-muted-foreground/70">
                  {language === "ar"
                    ? "أمثلة: 2:255 ، الملك ، قل هو الله"
                    : "Examples: 2:255, Al-Mulk, Al-Hamd"}
                </p>
              </div>
            ) : (
              results.map((res, idx) => (
                <div
                  key={`${res.surahNumber}-${res.ayahNumber}-${idx}`}
                  onClick={() => {
                    onSelectAyah(res.surahNumber, res.ayahNumber)
                    onClose()
                  }}
                  className="flex cursor-pointer flex-col gap-1.5 rounded-2xl border border-border/60 bg-card p-3.5 transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-foreground">
                        {language === "ar"
                          ? `سورة ${res.surahNameAr}`
                          : res.surahNameEn}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold"
                      >
                        {language === "ar"
                          ? `الآية ${formatNumber(res.ayahNumber)}`
                          : `Ayah ${res.ayahNumber}`}
                      </Badge>
                    </div>

                    <span className="text-[11px] font-bold text-muted-foreground">
                      {language === "ar"
                        ? `الجزء ${formatNumber(res.juzNumber)}`
                        : `Juz ${res.juzNumber}`}
                    </span>
                  </div>

                  <p className="line-clamp-2 font-serif text-sm leading-relaxed text-foreground/90">
                    {res.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
