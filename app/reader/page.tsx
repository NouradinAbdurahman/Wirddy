"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { QuranReader } from "@/components/reader/quran-reader"
import { getJuzStartPage, getPageForSurahAyah } from "@/lib/quran/pages-data"

function ReaderPageContent() {
  const searchParams = useSearchParams()
  const pageParam = searchParams.get("page")
  const surahParam = searchParams.get("surah")
  const ayahParam = searchParams.get("ayah")
  const juzParam = searchParams.get("juz")
  const startAyahParam = searchParams.get("start")
  const endAyahParam = searchParams.get("end")

  let targetPage: number | undefined = undefined

  if (pageParam) {
    const p = parseInt(pageParam, 10)
    if (!isNaN(p) && p >= 1 && p <= 604) {
      targetPage = p
    }
  } else if (juzParam) {
    const j = parseInt(juzParam, 10)
    if (!isNaN(j) && j >= 1 && j <= 30) {
      targetPage = getJuzStartPage(j)
    }
  } else if (surahParam) {
    const s = parseInt(surahParam, 10)
    const a = ayahParam ? parseInt(ayahParam, 10) : startAyahParam ? parseInt(startAyahParam, 10) : 1
    if (!isNaN(s) && s >= 1 && s <= 114) {
      targetPage = getPageForSurahAyah(s, isNaN(a) ? 1 : a)
    }
  }

  const initialSurah = surahParam ? parseInt(surahParam, 10) : undefined
  const initialAyah = ayahParam ? parseInt(ayahParam, 10) : startAyahParam ? parseInt(startAyahParam, 10) : undefined
  const endAyah = endAyahParam ? parseInt(endAyahParam, 10) : undefined

  return (
    <QuranReader
      initialPage={targetPage}
      initialSurahNumber={initialSurah}
      initialAyahNumber={initialAyah}
      endSurahNumber={initialSurah}
      endAyahNumber={endAyah}
      isModal={false}
    />
  )
}

export default function ReaderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ReaderPageContent />
    </Suspense>
  )
}
