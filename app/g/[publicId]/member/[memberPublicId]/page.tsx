import React, { Suspense } from "react"
import { Metadata } from "next"
import { getGroupByPublicId } from "@/lib/groups/service"
import { MemberScheduleClient } from "./client"

interface PageProps {
  params: Promise<{ publicId: string; memberPublicId: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { publicId, memberPublicId } = await params
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

  const member = group.membersConfig.find(
    (m) => m.publicId === memberPublicId || m.id === memberPublicId
  )

  const memberName = member?.name || "عضو"
  const isArabic = group.language === "ar"

  const title = isArabic
    ? `جدول قراءة ${memberName} - ${group.groupName} | وِردي`
    : `${memberName}'s Schedule - ${group.groupName} | Wirddy`

  const description = isArabic
    ? `الجدول الخاص بـ ${memberName} ضمن ختمة ${group.groupName} على تطبيق وِردي.`
    : `Personal reading schedule for ${memberName} in ${group.groupName} on Wirddy.`

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

export default async function PublicMemberSchedulePage({ params }: PageProps) {
  const { publicId, memberPublicId } = await params
  const groupData = await getGroupByPublicId(publicId)

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MemberScheduleClient
        initialGroupData={groupData}
        groupPublicId={publicId}
        memberPublicId={memberPublicId}
      />
    </Suspense>
  )
}
