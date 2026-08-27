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
  CustomQuranRange,
  GeneratedSchedule,
  MemberConfig,
  OccasionType,
  RangeType,
  RotationStyle,
  ScheduleInput,
} from "@/lib/scheduler/types"
import { saveRecentSchedule } from "@/lib/storage/recent-schedules"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ScheduleView } from "@/components/schedule/schedule-view"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MemberList } from "@/components/planner/member-list"
import { RangeSelector } from "@/components/planner/range-selector"
import { RotationSelector } from "@/components/planner/rotation-selector"
import { WeeksSelector } from "@/components/planner/weeks-selector"
import { TotalIndicator } from "@/components/planner/total-indicator"
import { GenerateButton } from "@/components/planner/generate-button"
import { AdvancedOptions } from "@/components/planner/advanced-options"
import { validateScheduleInput } from "@/lib/scheduler/validator"
import { getCurrentHijriYear } from "@/lib/dates/ramadan"

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
  const [title, setTitle] = useState<string>(initialData?.title || "")
  const [description, setDescription] = useState<string>(
    initialData?.description || ""
  )
  const [weeksCount, setWeeksCount] = useState<number>(
    initialData?.schedule.weeksCount || 4
  )
  const [rotationStyle, setRotationStyle] = useState<RotationStyle>(
    initialData?.rotationStyle || "medium"
  )
  const [rangeType, setRangeType] = useState<RangeType>(
    initialData?.rangeType || "full"
  )
  const [startJuz, setStartJuz] = useState<number>(initialData?.startJuz || 1)
  const [customRange, setCustomRange] = useState<CustomQuranRange>(
    initialData?.customRange || {
      startSurah: 2,
      startAyah: 1,
      endSurah: 4,
      endAyah: 147,
    }
  )
  const [usesDates, setUsesDates] = useState<boolean>(
    initialData?.usesDates || false
  )
  const [startDate, setStartDate] = useState<string>(
    initialData?.startDate || ""
  )
  const [occasionType, setOccasionType] = useState<OccasionType>(
    initialData?.occasionType || "normal"
  )
  const [islamicYear, setIslamicYear] = useState<number>(
    initialData?.islamicYear || getCurrentHijriYear()
  )
  const [dailyDivisionEnabled, setDailyDivisionEnabled] = useState<boolean>(
    initialData?.dailyDivisionEnabled || false
  )
  const [members, setMembers] = useState<MemberConfig[]>(
    initialData?.membersConfig || []
  )
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
  const [editError, setEditError] = useState<string | null>(null)

  const BackArrowIcon = dir === "rtl" ? IconArrowRight : IconArrowLeft

  // Save to device-local history and offline cache on mount if valid
  useEffect(() => {
    if (groupData && !groupData.isExpired) {
      try {
        localStorage.setItem(
          `wirddy_cached_group_${publicId}`,
          JSON.stringify(groupData)
        )
      } catch {
        // ignore
      }

      saveRecentSchedule({
        publicId: groupData.publicId,
        editToken: editToken || undefined,
        groupName: groupData.groupName,
        title: groupData.title,
        description: groupData.description,
        weeksCount: groupData.schedule.weeksCount,
        totalJuz: 30,
        startDate: groupData.startDate,
        usesDates: groupData.usesDates,
        occasionType: groupData.occasionType,
        islamicYear: groupData.islamicYear,
        dailyDivisionEnabled: groupData.dailyDivisionEnabled,
        rotationStyle: groupData.rotationStyle,
        rangeType: groupData.rangeType,
        updatedAt: new Date().toISOString(),
      })
    } else if (!groupData && publicId && typeof window !== "undefined") {
      // Attempt to load from client-side offline cached snapshot
      try {
        const raw = localStorage.getItem(`wirddy_cached_group_${publicId}`)
        if (raw) {
          const cached = JSON.parse(raw)
          if (cached && cached.publicId === publicId) {
            setGroupData(cached)
            setGroupName(cached.groupName || "")
            setTitle(cached.title || "")
            setDescription(cached.description || "")
            setWeeksCount(cached.schedule?.weeksCount || 4)
            setMembers(cached.membersConfig || [])
          }
        }
      } catch {
        // ignore
      }
    }
  }, [groupData, editToken, publicId])

  // Verify edit token if provided in query string
  useEffect(() => {
    if (editToken && publicId) {
      verifyEditTokenAction(publicId, editToken).then((res: any) => {
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

  const currentTotal = members.reduce(
    (sum, m) => sum + (m.weeklyAmount || 0),
    0
  )

  const inputPayload: ScheduleInput = {
    group: {
      name: groupName.trim() || groupData.groupName,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      weeksCount,
      rotationStyle,
      rangeType,
      startJuz: rangeType === "full" ? startJuz : undefined,
      customRange: rangeType === "custom" ? customRange : undefined,
      startDate: usesDates && startDate ? startDate : undefined,
      usesDates,
      occasionType,
      islamicYear: occasionType === "ramadan" ? islamicYear : undefined,
      dailyDivisionEnabled,
    },
    members,
  }

  const validationResult = validateScheduleInput(inputPayload)
  const isInputValid =
    validationResult.isValid &&
    (rangeType === "custom" || currentTotal === 30) &&
    groupName.trim().length > 0

  const handleAddMember = () => {
    const newId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const newMember: MemberConfig = {
      id: newId,
      name: `${language === "ar" ? "عضو" : "Member"} ${members.length + 1}`,
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 5,
    }
    setMembers((prev) => [...prev, newMember])
  }

  const handleUpdateMember = (index: number, updated: MemberConfig) => {
    setMembers((prev) => {
      const next = [...prev]
      next[index] = updated
      return next
    })
    setEditError(null)
  }

  const handleRemoveMember = (index: number) => {
    if (members.length <= 1) return
    setMembers((prev) => prev.filter((_, i) => i !== index))
    setEditError(null)
  }

  const handleSaveAndRegenerate = async () => {
    setEditError(null)
    const validCheck = validateScheduleInput(inputPayload)
    if (!validCheck.isValid) {
      const err = validCheck.errors[0]
      setEditError(language === "ar" ? err.messageAr : err.messageEn)
      return
    }

    setIsRegenerating(true)
    try {
      const res = await updateAndRegenerateAction(
        publicId,
        editToken,
        inputPayload,
        language
      )
      if (res.success && res.data) {
        setGroupData(res.data)
        setIsEditing(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        setEditError(res.error || "Failed to update schedule.")
      }
    } catch {
      setEditError("Failed to update schedule.")
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <Header />

      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6 print:m-0 print:w-full print:max-w-none print:p-0">
        {/* Editor Mode Banner */}
        {isEditor && !isEditing && (
          <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:px-5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
              <span className="flex h-2 w-2 rounded-full bg-amber-500" />
              <span>{t.editorBadge}</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="h-8 rounded-xl border-amber-500/40 bg-card text-xs font-semibold hover:bg-amber-500/10"
            >
              {t.btnEditPlan}
            </Button>
          </div>
        )}

        {/* Editing Plan Form */}
        {isEditing ? (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="gap-1.5 rounded-xl px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <BackArrowIcon className="h-4 w-4" />
                <span>{t.cancel}</span>
              </Button>
              <div className="text-xs font-bold text-primary">
                {t.btnEditPlan}
              </div>
            </div>

            {/* Section 1: Group Name */}
            <Card className="space-y-3 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
              <label className="text-sm font-bold text-foreground">
                {t.groupNameLabel}
              </label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={60}
                className="h-10 rounded-xl text-sm font-medium"
              />
            </Card>

            {/* Advanced Options (Title, Description, Ramadan, Dates, Daily Division) */}
            <AdvancedOptions
              title={title}
              onTitleChange={setTitle}
              description={description}
              onDescriptionChange={setDescription}
              usesDates={usesDates}
              onUsesDatesChange={setUsesDates}
              startDate={startDate}
              onStartDateChange={setStartDate}
              occasionType={occasionType}
              onOccasionTypeChange={setOccasionType}
              islamicYear={islamicYear}
              onIslamicYearChange={setIslamicYear}
              dailyDivisionEnabled={dailyDivisionEnabled}
              onDailyDivisionEnabledChange={setDailyDivisionEnabled}
            />

            {/* Section 2: Quran Range & Starting Point */}
            <Card className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
              <RangeSelector
                rangeType={rangeType}
                onRangeTypeChange={setRangeType}
                startJuz={startJuz}
                onStartJuzChange={setStartJuz}
                customRange={customRange}
                onCustomRangeChange={setCustomRange}
              />
            </Card>

            {/* Section 3: Members */}
            <Card className="space-y-6 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
              <MemberList
                members={members}
                onAddMember={handleAddMember}
                onUpdateMember={handleUpdateMember}
                onRemoveMember={handleRemoveMember}
                totalIndicator={
                  rangeType === "full" ? (
                    <TotalIndicator currentTotal={currentTotal} />
                  ) : null
                }
              />
            </Card>

            {/* Section 4: Rotation Style */}
            <Card className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
              <RotationSelector
                value={rotationStyle}
                onChange={setRotationStyle}
              />
            </Card>

            {/* Section 5: Duration */}
            <Card className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
              <WeeksSelector weeksCount={weeksCount} onChange={setWeeksCount} />
            </Card>

            {editError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
                {editError}
              </div>
            )}

            <GenerateButton
              onGenerate={handleSaveAndRegenerate}
              isGenerating={isRegenerating}
              isValid={isInputValid}
            />
          </div>
        ) : (
          <ScheduleView
            schedule={groupData.schedule}
            scheduleInput={{
              group: {
                name: groupData.groupName,
                title: groupData.title,
                description: groupData.description,
                weeksCount: groupData.schedule.weeksCount,
                rotationStyle: groupData.rotationStyle,
                rangeType: groupData.rangeType,
                startJuz: groupData.startJuz,
                customRange: groupData.customRange,
                startDate: groupData.startDate,
                usesDates: groupData.usesDates,
                occasionType: groupData.occasionType,
                islamicYear: groupData.islamicYear,
                dailyDivisionEnabled: groupData.dailyDivisionEnabled,
              },
              members: groupData.membersConfig,
            }}
            onEditPlan={isEditor ? () => setIsEditing(true) : undefined}
            onRegenerate={isEditor ? handleSaveAndRegenerate : undefined}
            isRegenerating={isRegenerating}
            isViewOnly={!isEditor}
            savedData={{
              publicId: groupData.publicId,
              editToken,
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
