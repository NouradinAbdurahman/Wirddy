"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  IconArrowLeft,
  IconArrowRight,
  IconClockOff,
  IconFileOff,
  IconPlus,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { LoadedPublicGroup } from "@/lib/groups/service"
import {
  deleteGroupAction,
  updateAndRegenerateAction,
  verifyEditTokenAction,
} from "@/lib/groups/actions"
import {
  GeneratedSchedule,
  MemberConfig,
  ScheduleInput,
} from "@/lib/scheduler/types"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ScheduleView } from "@/components/schedule/schedule-view"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MemberList } from "@/components/planner/member-list"
import { WeeksSelector } from "@/components/planner/weeks-selector"
import { TotalIndicator } from "@/components/planner/total-indicator"
import { GenerateButton } from "@/components/planner/generate-button"
import { validateScheduleInput } from "@/lib/scheduler/validator"

interface PublicScheduleClientProps {
  initialData: LoadedPublicGroup | null
  publicId: string
}

export function PublicScheduleClient({
  initialData,
  publicId,
}: PublicScheduleClientProps) {
  const { language, dir, t } = useI18n()
  const searchParams = useSearchParams()
  const editToken = searchParams.get("edit") || ""

  const [groupData, setGroupData] = useState<LoadedPublicGroup | null>(
    initialData
  )
  const [isEditor, setIsEditor] = useState<boolean>(false)
  const [isVerifyingEdit, setIsVerifyingEdit] = useState<boolean>(
    Boolean(editToken)
  )
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // Edit form state
  const [groupName, setGroupName] = useState<string>(
    initialData?.groupName || ""
  )
  const [weeksCount, setWeeksCount] = useState<number>(
    initialData?.schedule.weeksCount || 4
  )
  const [members, setMembers] = useState<MemberConfig[]>(
    initialData?.membersConfig || []
  )
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
  const [editError, setEditError] = useState<string | null>(null)

  const BackArrowIcon = dir === "rtl" ? IconArrowRight : IconArrowLeft

  // Verify edit token if provided in query string
  useEffect(() => {
    if (editToken && publicId) {
      verifyEditTokenAction(publicId, editToken).then((res) => {
        setIsEditor(Boolean(res.success && res.data))
        setIsVerifyingEdit(false)
      })
    } else {
      setIsEditor(false)
      setIsVerifyingEdit(false)
    }
  }, [editToken, publicId])

  // Not Found State
  if (!groupData) {
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

  // Expired State
  if (groupData.isExpired) {
    return (
      <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <Header />
        <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <Card className="max-w-md rounded-3xl border border-amber-500/30 bg-amber-500/5 p-8 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <IconClockOff className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-foreground">
              {t.scheduleExpiredTitle}
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t.scheduleExpiredDesc}
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

  // Handle Edit / Regenerate
  const handleSaveAndRegenerate = async () => {
    const input: ScheduleInput = {
      group: { name: groupName, weeksCount },
      members,
    }

    const validation = validateScheduleInput(input)
    if (!validation.isValid) {
      setEditError(
        language === "ar"
          ? validation.errors[0]?.messageAr || "بيانات الخطة غير صالحة."
          : validation.errors[0]?.messageEn || "Invalid schedule configuration."
      )
      return
    }

    setIsRegenerating(true)
    setEditError(null)

    try {
      const res = await updateAndRegenerateAction(
        publicId,
        editToken,
        input,
        language
      )
      if (res.success && res.data) {
        setGroupData(res.data)
        setIsEditing(false)
      } else {
        setEditError(res.error || "Failed to update schedule.")
      }
    } catch (err: any) {
      setEditError(err.message || "Failed to update schedule.")
    } finally {
      setIsRegenerating(false)
    }
  }

  const totalWeeklyJuz = members.reduce(
    (sum, m) => sum + (m.weeklyAmount || 0),
    0
  )
  const isInputValid =
    totalWeeklyJuz === 30 && members.length > 0 && groupName.trim().length > 0

  const handleAddMember = () => {
    const newMember: MemberConfig = {
      id: `m-${Date.now()}-${members.length + 1}`,
      name: `${language === "ar" ? "عضو" : "Member"} ${members.length + 1}`,
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 5,
    }
    setMembers([...members, newMember])
  }

  const handleUpdateMember = (index: number, updated: MemberConfig) => {
    const next = [...members]
    next[index] = updated
    setMembers(next)
  }

  const handleRemoveMember = (index: number) => {
    if (members.length <= 1) return
    const next = members.filter((_, idx) => idx !== index)
    setMembers(next)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6">
        {/* Editor Edit Form Mode */}
        {isEditing && isEditor ? (
          <div className="mx-auto w-full max-w-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="h-8.5 gap-1.5 rounded-xl px-3 text-xs font-semibold"
              >
                <BackArrowIcon className="h-4 w-4" />
                <span>{t.cancel}</span>
              </Button>

              <div className="text-xs font-bold text-primary">
                {t.editorBadge}
              </div>
            </div>

            {editError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
                {editError}
              </div>
            )}

            {/* Weeks Selector */}
            <WeeksSelector weeksCount={weeksCount} onChange={setWeeksCount} />

            {/* Total Juz Indicator */}
            <TotalIndicator currentTotal={totalWeeklyJuz} />

            {/* Member List */}
            <MemberList
              members={members}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onRemoveMember={handleRemoveMember}
            />

            {/* Save Changes Button */}
            <GenerateButton
              onGenerate={handleSaveAndRegenerate}
              isGenerating={isRegenerating}
              isValid={isInputValid}
            />
          </div>
        ) : (
          /* Normal Schedule View */
          <ScheduleView
            schedule={groupData.schedule}
            scheduleInput={{
              group: {
                name: groupData.groupName,
                weeksCount: groupData.schedule.weeksCount,
              },
              members: groupData.membersConfig,
            }}
            onEditPlan={isEditor ? () => setIsEditing(true) : undefined}
            onRegenerate={isEditor ? () => setIsEditing(true) : undefined}
            isRegenerating={isRegenerating}
            isViewOnly={!isEditor}
            savedData={{
              publicId: groupData.publicId,
              editToken: editToken || "",
              groupName: groupData.groupName,
              expiresAt: groupData.expiresAt,
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
