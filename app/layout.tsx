import type { Metadata, Viewport } from "next"
import { Cairo, Inter, Amiri, Amiri_Quran, Scheherazade_New } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { I18nProvider } from "@/lib/i18n/context"
import { PwaRegistrar } from "@/components/pwa/pwa-registrar"
import { cn } from "@/lib/utils"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-quran-amiri",
  display: "swap",
})

const amiriQuran = Amiri_Quran({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-quran-amiri-quran",
  display: "swap",
})

const scheherazadeNew = Scheherazade_New({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-quran-scheherazade",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://wirddy.vercel.app"),
  title: "وِردي | Wirddy — Quran Group Reading & Scheduling",
  description:
    "أنشئ جدولًا متوازنًا لقراءة القرآن مع مجموعتك، واعرف وردك اليومي، واقرأ في المصحف الإلكتروني، وتابع تقدمك حتى الختام. Organize Quran reading for your group, create rotating schedules, read inside the Quran Reader, track progress, and complete the Quran together.",
  applicationName: "Wirddy - وِردي",
  keywords: [
    "Quran",
    "Wirddy",
    "وِردي",
    "Quran reading planner",
    "Quran Group Reading",
    "Quran Reader",
    "ختمة القرآن",
    "توزيع ورد القرآن",
    "مصحف وِردي",
    "تتبع قراءة القرآن",
    "Ramadan Quran group",
    "PWA",
  ],
  authors: [{ name: "Wirddy" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wirddy - وِردي",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "وِردي | Wirddy — Quran Group Reading & Scheduling",
    description:
      "أنشئ جدولًا متوازنًا لقراءة القرآن مع مجموعتك، واعرف وردك اليومي، واقرأ في المصحف الإلكتروني، وتابع تقدمك حتى الختام. Organize Quran reading for your group, create rotating schedules, read inside the Quran Reader, track progress, and complete the Quran together.",
    siteName: "Wirddy",
    locale: "ar_SA",
    type: "website",
    images: [
      {
        url: "/wirddy-og-image.png",
        width: 1200,
        height: 630,
        alt: "Wirddy — Quran Completion Planner for Groups",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wirddy | وِردي — خطة ختم القرآن الكريم",
    description:
      "طريقة بسيطة لتنظيم ورد القرآن وتقسيمه بين أفراد المجموعة. A simple way for families and friends to divide the Quran and complete it together.",
    images: ["/wirddy-og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/favicon.png"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={cn(
        "font-sans antialiased",
        cairo.variable,
        inter.variable,
        amiri.variable,
        amiriQuran.variable,
        scheherazadeNew.variable
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <TooltipProvider>
              <PwaRegistrar />
              {children}
            </TooltipProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
