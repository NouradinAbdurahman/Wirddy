"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useI18n } from "@/lib/i18n/context"
import {
  CustomQuranRange,
  GeneratedSchedule,
  MemberConfig,
  RangeType,
  RecurrenceConfig,
  RotationStyle,
  ScheduleInput,
} from "@/lib/scheduler/types"
import { generateQuranSchedule } from "@/lib/scheduler/engine"
import { validateScheduleInput } from "@/lib/scheduler/validator"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/landing/hero"
import { RecentSchedules } from "@/components/landing/recent-schedules"
import { HowItWorks } from "@/components/landing/how-it-works"
import { DashboardPreview } from "@/components/landing/dashboard-preview"
import { QuranReaderPreview } from "@/components/landing/quran-reader-preview"
import { SmartScheduling } from "@/components/landing/smart-scheduling"
import { ExampleSchedule } from "@/components/landing/example-schedule"
import { StayOnTrack } from "@/components/landing/stay-on-track"
import { GroupCollaboration } from "@/components/landing/group-collaboration"
import { ShareExport } from "@/components/landing/share-export"
import { AddToHomeScreen } from "@/components/landing/add-to-home-screen"
import { WhyWirddy } from "@/components/landing/why-wirddy"
import { FinalCta } from "@/components/landing/final-cta"
import { RangeSelector } from "@/components/planner/range-selector"
import { RotationSelector } from "@/components/planner/rotation-selector"
import { MemberList } from "@/components/planner/member-list"
import { TotalIndicator } from "@/components/planner/total-indicator"
import { WeeksSelector } from "@/components/planner/weeks-selector"
import { GenerateButton } from "@/components/planner/generate-button"
import { AdvancedOptions } from "@/components/planner/advanced-options"
import { ScheduleView } from "@/components/schedule/schedule-view"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  IconArrowLeft,
  IconArrowRight,
  IconSparkles,
  IconUsersGroup,
} from "@tabler/icons-react"
import { saveRecentSchedule } from "@/lib/storage/recent-schedules"
import { getCurrentHijriYear } from "@/lib/dates/ramadan"
import { OccasionType } from "@/lib/scheduler/types"

type AppStep = "landing" | "planner" | "schedule"

const STORAGE_STATE_KEY = "wirddy_planner_state_v3"

export default function HomePage() {
  const { language, dir, t, formatNumber } = useI18n()
  const [step, setStep] = useState<AppStep>("landing")
  const [groupName, setGroupName] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [weeksCount, setWeeksCount] = useState<number>(4)
  const [rotationStyle, setRotationStyle] = useState<RotationStyle>("medium")
  const [rangeType, setRangeType] = useState<RangeType>("full")
  const [startJuz, setStartJuz] = useState<number>(1)
  const [customRange, setCustomRange] = useState<CustomQuranRange>({
    startSurah: 2,
    startAyah: 1,
    endSurah: 4,
    endAyah: 147,
  })
  const [usesDates, setUsesDates] = useState<boolean>(false)
  const [startDate, setStartDate] = useState<string>("")
  const [occasionType, setOccasionType] = useState<OccasionType>("normal")
  const [islamicYear, setIslamicYear] = useState<number>(getCurrentHijriYear())
  const [dailyDivisionEnabled, setDailyDivisionEnabled] =
    useState<boolean>(false)
  const [recurrence, setRecurrence] = useState<RecurrenceConfig>({
    frequency: "none",
  })
  const [members, setMembers] = useState<MemberConfig[]>([])
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const ArrowIcon = dir === "rtl" ? IconArrowLeft : IconArrowRight
  const BackArrowIcon = dir === "rtl" ? IconArrowRight : IconArrowLeft

  const suggestions = [
    t.suggFamily,
    t.suggFriends,
    t.suggRamadan,
    t.suggMosque,
    t.suggStudy,
  ]

  // Load persisted state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_STATE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.groupName) setGroupName(parsed.groupName)
        if (parsed.title) setTitle(parsed.title)
        if (parsed.description) setDescription(parsed.description)
        if (parsed.weeksCount) setWeeksCount(parsed.weeksCount)
        if (parsed.rotationStyle) setRotationStyle(parsed.rotationStyle)
        if (parsed.rangeType) setRangeType(parsed.rangeType)
        if (parsed.startJuz) setStartJuz(parsed.startJuz)
        if (parsed.customRange) setCustomRange(parsed.customRange)
        if (typeof parsed.usesDates === "boolean")
          setUsesDates(parsed.usesDates)
        if (parsed.startDate) setStartDate(parsed.startDate)
        if (parsed.occasionType) setOccasionType(parsed.occasionType)
        if (parsed.islamicYear) setIslamicYear(parsed.islamicYear)
        if (typeof parsed.dailyDivisionEnabled === "boolean")
          setDailyDivisionEnabled(parsed.dailyDivisionEnabled)
        if (Array.isArray(parsed.members) && parsed.members.length > 0)
          setMembers(parsed.members)
        if (parsed.schedule) {
          setSchedule(parsed.schedule)
        }
        if (
          parsed.step === "landing" ||
          parsed.step === "planner" ||
          parsed.step === "schedule"
        ) {
          setStep(parsed.step)
        } else if (parsed.schedule) {
          // Legacy saved state from before `step` was persisted.
          setStep("schedule")
        }
      }
    } catch (err) {
      console.error("Error loading stored plan:", err)
    }
  }, [])

  // Save state on change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_STATE_KEY,
        JSON.stringify({
          step,
          groupName,
          title,
          description,
          weeksCount,
          rotationStyle,
          rangeType,
          startJuz,
          customRange,
          usesDates,
          startDate,
          occasionType,
          islamicYear,
          dailyDivisionEnabled,
          members,
          schedule,
        })
      )
    } catch {
      // ignore
    }
  }, [
    step,
    groupName,
    title,
    description,
    weeksCount,
    rotationStyle,
    rangeType,
    startJuz,
    customRange,
    usesDates,
    startDate,
    occasionType,
    islamicYear,
    dailyDivisionEnabled,
    members,
    schedule,
  ])

  const startNewGroup = () => {
    const defaultMembers: MemberConfig[] = [
      {
        id: `m-${Date.now()}-1`,
        name: language === "ar" ? "طارق" : "Tariq",
        knowledgeType: "entire",
        startJuz: 1,
        endJuz: 30,
        weeklyAmount: 10,
      },
      {
        id: `m-${Date.now()}-2`,
        name: language === "ar" ? "زينب" : "Zainab",
        knowledgeType: "entire",
        startJuz: 1,
        endJuz: 30,
        weeklyAmount: 10,
      },
      {
        id: `m-${Date.now()}-3`,
        name: language === "ar" ? "بلال" : "Bilal",
        knowledgeType: "entire",
        startJuz: 1,
        endJuz: 30,
        weeklyAmount: 10,
      },
    ]
    setGroupName(language === "ar" ? "ختمة العائلة" : "Family Completion")
    setSchedule(null)
    setMembers(defaultMembers)
    setStep("planner")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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
    setValidationError(null)
  }

  const handleRemoveMember = (index: number) => {
    if (members.length <= 1) return
    setMembers((prev) => prev.filter((_, i) => i !== index))
    setValidationError(null)
  }

  // Calculate live sum
  const currentTotal = members.reduce(
    (sum, m) => sum + (m.weeklyAmount || 0),
    0
  )

  const inputPayload: ScheduleInput = {
    group: {
      name: groupName.trim() || (language === "ar" ? "مجموعتي" : "My Group"),
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
      recurrence: recurrence.frequency !== "none" ? recurrence : undefined,
    },
    members,
  }

  const validationResult = validateScheduleInput(inputPayload)
  const isInputValid =
    validationResult.isValid &&
    (rangeType === "custom" || currentTotal === 30) &&
    groupName.trim().length > 0

  const handleGenerateSchedule = async () => {
    setValidationError(null)
    const validCheck = validateScheduleInput(inputPayload)
    if (!validCheck.isValid) {
      const err = validCheck.errors[0]
      setValidationError(language === "ar" ? err.messageAr : err.messageEn)
      return
    }

    setIsGenerating(true)
    setTimeout(() => {
      try {
        const generated = generateQuranSchedule(inputPayload)
        setSchedule(generated)
        setStep("schedule")

        // Track in device-local recent schedules
        saveRecentSchedule({
          groupName: inputPayload.group.name,
          title: inputPayload.group.title,
          description: inputPayload.group.description,
          weeksCount: inputPayload.group.weeksCount,
          totalJuz: 30,
          startDate: inputPayload.group.startDate,
          usesDates: inputPayload.group.usesDates,
          occasionType: inputPayload.group.occasionType,
          islamicYear: inputPayload.group.islamicYear,
          dailyDivisionEnabled: inputPayload.group.dailyDivisionEnabled,
          rotationStyle: inputPayload.group.rotationStyle,
          rangeType: inputPayload.group.rangeType,
          updatedAt: new Date().toISOString(),
        })

        window.scrollTo({ top: 0, behavior: "smooth" })
      } catch (err: any) {
        setValidationError(err?.message || "Error generating schedule")
      } finally {
        setIsGenerating(false)
      }
    }, 250)
  }

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <Header
        onLogoClick={() => {
          setStep("landing")
          window.scrollTo({ top: 0, behavior: "smooth" })
        }}
      />

      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6 print:m-0 print:w-full print:max-w-none print:p-0">
        <AnimatePresence mode="wait">
          {/* 1. Modernized Full-Platform Landing Page */}
          {step === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-12 sm:space-y-20"
            >
              {/* 1. Hero Section */}
              <Hero
                onCreateGroup={startNewGroup}
                onHowItWorks={scrollToHowItWorks}
              />

              {/* 2. Recent Local Schedules History */}
              <RecentSchedules
                onOpenLocal={() => {
                  if (schedule) setStep("schedule")
                  else setStep("planner")
                }}
              />

              {/* 3. How Wirddy Works (4 Steps Journey) */}
              <div id="how-it-works">
                <HowItWorks />
              </div>

              {/* 4. Personal Dashboard Showcase */}
              <DashboardPreview />

              {/* 5. Read Quran Inside Wirddy (Quran Reader Showcase) */}
              <QuranReaderPreview />

              {/* 6. Smart Quran Scheduling */}
              <SmartScheduling />

              {/* 7. Weekly Schedule Interactive Preview */}
              <ExampleSchedule onTryTemplate={startNewGroup} />

              {/* 8. Stay on Track (Progress, Notifications & Reminders) */}
              <StayOnTrack />

              {/* 9. Group Collaboration & Account Linking */}
              <GroupCollaboration />

              {/* 10. Unified Multi-Format Export & Sharing */}
              <ShareExport />

              {/* 11. Use Wirddy Like an App (PWA & Offline) */}
              <AddToHomeScreen />

              {/* 12. Why Groups Choose Wirddy (6 Summary Points) */}
              <WhyWirddy />

              {/* 13. Final Khatmah CTA */}
              <FinalCta onCreateGroup={startNewGroup} />
            </motion.div>
          )}

          {/* 2. Unified 5-Section Planner Form */}
          {step === "planner" && (
            <motion.div
              key="planner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-3xl space-y-6"
            >
              {/* Back to Home Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("landing")}
                  className="gap-1.5 rounded-xl px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <BackArrowIcon className="h-4 w-4" />
                  <span>{t.btnBack}</span>
                </Button>

                <div className="text-xs font-bold text-primary">
                  {t.formTitle}
                </div>
              </div>

              {/* Section 1: Group Name */}
              <Card className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <IconUsersGroup className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground sm:text-base">
                      {t.sectionGroup}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t.createGroupSubtitle}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    value={groupName}
                    onChange={(e) => {
                      setGroupName(e.target.value)
                      if (validationError) setValidationError(null)
                    }}
                    placeholder={t.groupNamePlaceholder}
                    maxLength={60}
                    className="h-10 rounded-xl text-sm font-medium"
                  />

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {t.suggestionsTitle}:
                    </span>
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setGroupName(s)}
                        className="rounded-lg border border-border/40 bg-muted/50 px-2.5 py-1 text-[11px] font-semibold text-foreground transition-all hover:bg-muted"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
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
                recurrence={recurrence}
                onRecurrenceChange={setRecurrence}
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

              {/* Section 3: Members & Knowledge Restrictions */}
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

              {/* Section 5: Weeks Duration */}
              <Card className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
                <WeeksSelector
                  weeksCount={weeksCount}
                  onChange={setWeeksCount}
                />
              </Card>

              {/* Validation Error Message */}
              {validationError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
                  {validationError}
                </div>
              )}

              {/* Generate Button */}
              <GenerateButton
                onGenerate={handleGenerateSchedule}
                isGenerating={isGenerating}
                isValid={isInputValid}
              />
            </motion.div>
          )}

          {/* 3. Generated Schedule View */}
          {step === "schedule" && schedule && (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ScheduleView
                schedule={schedule}
                scheduleInput={inputPayload}
                onEditPlan={() => {
                  setStep("planner")
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                onRegenerate={() => {
                  handleGenerateSchedule()
                }}
                isRegenerating={isGenerating}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
