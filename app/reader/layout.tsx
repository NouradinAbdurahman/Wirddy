import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "المصحف الشريف | وِردي — Quran Reader Workspace",
  description:
    "اقرأ القرآن الكريم برسم العثماني الأصيل مع تتبع الورد اليومي وفهرس السور والأجزاء وتفسير وترجمة الآيات.",
}

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
