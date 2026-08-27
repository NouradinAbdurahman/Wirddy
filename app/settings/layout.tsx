import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "الإعدادات | Settings - Wirddy",
  robots: {
    index: false,
    follow: false,
  },
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
