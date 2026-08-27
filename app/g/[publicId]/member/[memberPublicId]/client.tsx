"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconArrowRight, IconFileOff, IconPlus } from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { LoadedPublicGroup } from "@/lib/groups/service"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PersonalMemberView } from "@/components/schedule/personal-member-view"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { renderMemberPersonalSchedulePngBlob } from "@/lib/export/render-week"
import { exportMemberScheduleAsPdf } from "@/lib/export/render-pdf"
import { triggerBrowserDownload } from "@/lib/export/download"
import { sanitizeFilename } from "@/lib/export/filenames"

interface MemberScheduleClientProps {
  initialGroupData: LoadedPublicGroup | null
  groupPublicId: string
  memberPublicId: string
}

export function MemberScheduleClient({
  initialGroupData,
  groupPublicId,
  memberPublicId,
}: MemberScheduleClientProps) {
  const router = useRouter()
  const { language, t } = useI18n()

  if (!initialGroupData || initialGroupData.isExpired) {
    return (
      <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <Header />
        <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <Card className="max-w-md rounded-3xl border border-border/70 p-8 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <IconFileOff className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-foreground">
              {t.scheduleNotFoundTitle}
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t.scheduleNotFoundDesc}
            </p>
            <div className="mt-6">
              <Link href="/">
                <Button className="h-10 w-full gap-2 rounded-xl text-xs font-bold">
                  <IconPlus className="h-4 w-4" />
                  <span>{t.btnCreateNewSchedule}</span>
                </Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const member =
    initialGroupData.membersConfig.find(
      (m) => m.publicId === memberPublicId || m.id === memberPublicId
    ) || initialGroupData.membersConfig[0]

  const handleSelectMember = (selectedId: string) => {
    const selected = initialGroupData.membersConfig.find(
      (m) => m.id === selectedId
    )
    if (selected) {
      const pId = selected.publicId || selected.id
      router.push(`/g/${groupPublicId}/member/${pId}`)
    }
  }

  const handleBackToGroup = () => {
    router.push(`/g/${groupPublicId}`)
  }

  const handleExportPng = async () => {
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://wirddy.app"
      const memberQrUrl = `${origin}/g/${groupPublicId}/member/${member.publicId || member.id}`

      const blob = await renderMemberPersonalSchedulePngBlob(
        member,
        initialGroupData.schedule,
        { theme: "dark", language },
        memberQrUrl
      )
      const safeName = sanitizeFilename(member.name)
      const safeGroup = sanitizeFilename(initialGroupData.groupName)
      await triggerBrowserDownload(blob, `${safeName} - ${safeGroup}.png`)
    } catch (err) {
      console.error("Failed to export member PNG:", err)
    }
  }

  const handleExportPdf = async () => {
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://wirddy.app"
      const memberQrUrl = `${origin}/g/${groupPublicId}/member/${member.publicId || member.id}`

      await exportMemberScheduleAsPdf(
        member,
        initialGroupData.schedule,
        { theme: "dark", language },
        memberQrUrl
      )
    } catch (err) {
      console.error("Failed to export member PDF:", err)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <PersonalMemberView
            groupPublicId={groupPublicId}
            groupName={initialGroupData.groupName}
            title={initialGroupData.title}
            description={initialGroupData.description}
            member={member}
            allMembers={initialGroupData.membersConfig}
            schedule={initialGroupData.schedule}
            onSelectMember={handleSelectMember}
            onBackToGroup={handleBackToGroup}
            onExportPng={handleExportPng}
            onExportPdf={handleExportPdf}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
