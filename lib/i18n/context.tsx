"use client"

import React, { createContext, useContext, useEffect } from "react"
import { Language, translations, Translations } from "./dictionary"
import { useStorageValue, writeStorageValue } from "@/hooks/use-storage-value"

interface I18nContextType {
  language: Language
  dir: "rtl" | "ltr"
  t: Translations
  setLanguage: (lang: Language) => void
  formatNumber: (num: number) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = "wirddy_language"

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // The language lives in localStorage so it survives reloads and stays in
  // sync across tabs. Server rendering uses the Arabic default.
  const stored = useStorageValue(STORAGE_KEY)
  const language: Language = stored === "en" ? "en" : "ar"

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  const setLanguage = (lang: Language) => {
    writeStorageValue(STORAGE_KEY, lang)
  }

  const formatNumber = (num: number): string => {
    if (language === "ar") {
      return num
        .toString()
        .replace(/\d/g, (d) => ARABIC_DIGITS[parseInt(d, 10)])
    }
    return num.toString()
  }

  const value: I18nContextType = {
    language,
    dir: language === "ar" ? "rtl" : "ltr",
    t: translations[language],
    setLanguage,
    formatNumber,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
