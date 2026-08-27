export type ExportLanguage = "ar" | "en"
export type ExportDirection = "rtl" | "ltr"
export type ExportTheme = "light" | "dark"
export type ExportViewMode = "cards" | "table"

export interface ExportQuranLocation {
  juzNumber: number
  surahNumber: number
  surahNameArabic: string
  surahNameEnglish: string
  ayahNumber: number
}

export interface ExportMember {
  name: string
  amountInJuz: number
  start: ExportQuranLocation
  end: ExportQuranLocation
}

export interface ExportWeek {
  weekNumber: number
  totalWeeks: number
  groupName: string
  language: ExportLanguage
  direction: ExportDirection
  theme: ExportTheme
  view?: ExportViewMode
  members: ExportMember[]
}

export interface ExportSchedule {
  groupName: string
  totalWeeks: number
  language: ExportLanguage
  direction: ExportDirection
  theme: ExportTheme
  view?: ExportViewMode
  weeks: ExportWeek[]
}

export interface ExportRenderOptions {
  pixelRatio?: number
  theme?: ExportTheme
  view?: ExportViewMode
  language?: ExportLanguage
  direction?: ExportDirection
}

export interface ExportProgressCallback {
  (current: number, total: number, message: string): void
}
