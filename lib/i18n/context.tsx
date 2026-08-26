'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations, Translations } from './dictionary';

interface I18nContextType {
  language: Language;
  dir: 'rtl' | 'ltr';
  t: Translations;
  setLanguage: (lang: Language) => void;
  formatNumber: (num: number) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'wirddy_language';

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === 'ar' || stored === 'en') {
        setLanguageState(stored);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
      try {
        localStorage.setItem(STORAGE_KEY, language);
      } catch {
        // ignore
      }
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const formatNumber = (num: number): string => {
    if (language === 'ar') {
      return num
        .toString()
        .replace(/\d/g, (d) => ARABIC_DIGITS[parseInt(d, 10)]);
    }
    return num.toString();
  };

  const value: I18nContextType = {
    language,
    dir: language === 'ar' ? 'rtl' : 'ltr',
    t: translations[language],
    setLanguage,
    formatNumber,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
