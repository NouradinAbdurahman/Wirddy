"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { IconBookmark, IconTrash } from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { quranService } from "@/lib/quran/service"
import { QuranReader } from "@/components/reader/quran-reader"
import { deleteBookmarkAction } from "@/lib/groups/actions"

export interface BookmarkItem {
  id: string
  surahNumber: number
  ayahNumber: number
  juzNumber: number
  note: string | null
  updatedAt: string
}

interface UserBookmarksWidgetProps {
  bookmarks: BookmarkItem[]
  onBookmarkDeleted?: () => void
}

export function UserBookmarksWidget({
  bookmarks,
  onBookmarkDeleted,
}: UserBookmarksWidgetProps) {
  const { language, t } = useI18n()
  const [activeBookmark, setActiveBookmark] = useState<BookmarkItem | null>(
    null
  )

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteBookmarkAction(id)
    if (onBookmarkDeleted) onBookmarkDeleted()
  }

  if (bookmarks.length === 0) return null

  return (
    <>
      <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <IconBookmark className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-extrabold text-foreground">
            {t.bookmarksTitle}
          </h3>
        </div>

        <div className="space-y-2">
          {bookmarks.slice(0, 5).map((b) => {
            const surah = quranService.getSurah(b.surahNumber)
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setActiveBookmark(b)}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/80 p-3 transition-colors hover:border-primary/40"
              >
                <div>
                  <h4 className="font-serif text-sm font-bold text-foreground">
                    {language === "ar"
                      ? `سورة ${surah?.nameAr} • آية ${b.ayahNumber}`
                      : `Surah ${surah?.nameEn} • Ayah ${b.ayahNumber}`}
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    {language === "ar"
                      ? `الجزء ${b.juzNumber}`
                      : `Juz ${b.juzNumber}`}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(b.id, e)}
                  className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {activeBookmark && (
        <QuranReader
          isModal={true}
          isOpen={!!activeBookmark}
          onClose={() => setActiveBookmark(null)}
          initialSurahNumber={activeBookmark.surahNumber}
          initialAyahNumber={activeBookmark.ayahNumber}
        />
      )}
    </>
  )
}
