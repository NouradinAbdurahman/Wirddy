import { DailyPortion, OccasionType } from "../scheduler/types"

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
  memberPublicId?: string
  amountInJuz: number
  start: ExportQuranLocation
  end: ExportQuranLocation
  dailyBreakdown?: DailyPortion[]
}

export interface ExportBrandingOptions {
  showLogo?: boolean
  showQr?: boolean
  showGroupName?: boolean
  showDate?: boolean
  qrUrl?: string
}

export interface ExportWeek {
  weekNumber: number
  totalWeeks: number
  groupName: string
  title?: string
  description?: string
  dateRangeText?: string
  occasionType?: OccasionType
  islamicYear?: number
  language: ExportLanguage
  direction: ExportDirection
  theme: ExportTheme
  view?: ExportViewMode
  branding?: ExportBrandingOptions
  members: ExportMember[]
}

export interface ExportSchedule {
  groupName: string
  title?: string
  description?: string
  totalWeeks: number
  startDate?: string
  usesDates?: boolean
  occasionType?: OccasionType
  islamicYear?: number
  dailyDivisionEnabled?: boolean
  language: ExportLanguage
  direction: ExportDirection
  theme: ExportTheme
  view?: ExportViewMode
  branding?: ExportBrandingOptions
  weeks: ExportWeek[]
}

export interface ExportRenderOptions {
  pixelRatio?: number
  theme?: ExportTheme
  view?: ExportViewMode
  language?: ExportLanguage
  direction?: ExportDirection
  branding?: ExportBrandingOptions
}

export interface ExportProgressCallback {
  (current: number, total: number, message: string): void
}
