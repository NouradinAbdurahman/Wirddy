import React, { Suspense } from "react"
import { Metadata } from "next"
import { getGroupByPublicId } from "@/lib/groups/service"
import { PublicScheduleClient } from "./client"

interface PageProps {
  params: Promise<{ publicId: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { publicId } = await params
  const group = await getGroupByPublicId(publicId)

  if (!group || group.isExpired) {
    return {
      title: "Schedule Not Found - Wirddy",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const isArabic = group.language === "ar"
  const title = isArabic
    ? `وردي - خطة ختم القرآن: ${group.groupName}`
    : `Wirddy - Quran Schedule: ${group.groupName}`
  const description = isArabic
    ? `جدول تنظيم قراءة وختم القرآن الكريم لمجموعة ${group.groupName} على تطبيق وِردي.`
    : `Quran reading and completion schedule for ${group.groupName} on Wirddy.`

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function PublicGroupSchedulePage({ params }: PageProps) {
  const { publicId } = await params
  const groupData = await getGroupByPublicId(publicId)

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PublicScheduleClient initialData={groupData} publicId={publicId} />
    </Suspense>
  )
}
