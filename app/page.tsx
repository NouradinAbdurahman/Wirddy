"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useI18n } from "@/lib/i18n/context"
import {
  GeneratedSchedule,
  MemberConfig,
  ScheduleInput,
} from "@/lib/scheduler/types"
import { generateQuranSchedule } from "@/lib/scheduler/engine"
import { validateScheduleInput } from "@/lib/scheduler/validator"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ExampleSchedule } from "@/components/landing/example-schedule"
import { Features } from "@/components/landing/features"
import { AddToHomeScreen } from "@/components/landing/add-to-home-screen"
import { GroupForm } from "@/components/planner/group-form"
import { MemberList } from "@/components/planner/member-list"
import { TotalIndicator } from "@/components/planner/total-indicator"
import { WeeksSelector } from "@/components/planner/weeks-selector"
import { GenerateButton } from "@/components/planner/generate-button"
import { ScheduleView } from "@/components/schedule/schedule-view"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"

type AppStep = "landing" | "group_name" | "members" | "schedule"

const STORAGE_STATE_KEY = "wirddy_planner_state_v1"

export default function HomePage() {
  const { language, dir, t, formatNumber } = useI18n()
  const [step, setStep] = useState<AppStep>("landing")
  const [groupName, setGroupName] = useState<string>("")
  const [weeksCount, setWeeksCount] = useState<number>(4)
  const [members, setMembers] = useState<MemberConfig[]>([])
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const ArrowIcon = dir === "rtl" ? IconArrowLeft : IconArrowRight
  const BackArrowIcon = dir === "rtl" ? IconArrowRight : IconArrowLeft

  // Load persisted state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_STATE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.groupName) setGroupName(parsed.groupName)
        if (parsed.weeksCount) setWeeksCount(parsed.weeksCount)
        if (Array.isArray(parsed.members) && parsed.members.length > 0)
          setMembers(parsed.members)
        if (parsed.schedule) {
          setSchedule(parsed.schedule)
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
          groupName,
          weeksCount,
          members,
          schedule,
        })
      )
    } catch {
      // ignore
    }
  }, [groupName, weeksCount, members, schedule])

  const startNewGroup = () => {
    // Reset to a clean fresh 1-member group
    const defaultMembers: MemberConfig[] = [
      {
        id: `m-${Date.now()}-1`,
        name: language === "ar" ? "طارق" : "Tariq",
        knowledgeType: "entire",
        startJuz: 1,
        endJuz: 30,
        weeklyAmount: 5,
      },
    ]
    setGroupName("")
    setSchedule(null)
    setMembers(defaultMembers)
    setStep("group_name")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleGroupNameContinue = (name: string) => {
    setGroupName(name)
    setStep("members")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleAddMember = () => {
    const newId = `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const newMember: MemberConfig = {
      id: newId,
      name: "",
      knowledgeType: "entire",
      startJuz: 1,
      endJuz: 30,
      weeklyAmount: 2,
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
      name: groupName || (language === "ar" ? "مجموعتي" : "My Group"),
      weeksCount,
    },
    members,
  }

  const validationResult = validateScheduleInput(inputPayload)
  const isInputValid = validationResult.isValid && currentTotal === 30

  const handleGenerateSchedule = async () => {
    setValidationError(null)
    const validCheck = validateScheduleInput(inputPayload)
    if (!validCheck.isValid) {
      const err = validCheck.errors[0]
      setValidationError(language === "ar" ? err.messageAr : err.messageEn)
      return
    }

    setIsGenerating(true)
    // Short polished smooth transition (no fake delay longer than 350ms)
    setTimeout(() => {
      try {
        const generated = generateQuranSchedule(inputPayload)
        setSchedule(generated)
        setStep("schedule")
        window.scrollTo({ top: 0, behavior: "smooth" })
      } catch (err: any) {
        setValidationError(err?.message || "Error generating schedule")
      } finally {
        setIsGenerating(false)
      }
    }, 350)
  }

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleGoHome = () => {
    setStep("landing")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* App Header */}
      <Header
        onNewGroup={startNewGroup}
        onShowHowItWorks={scrollToHowItWorks}
        onGoHome={handleGoHome}
        inPlanner={step !== "landing"}
      />

      {/* Main Content Area */}
      <main className="container mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 md:py-10">
        <AnimatePresence mode="wait">
          {/* 1. Landing Page View */}
          {step === "landing" && (
            <motion.div
              key="landing"
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <Hero
                onCreateGroup={startNewGroup}
                onHowItWorks={scrollToHowItWorks}
              />
              <HowItWorks />
              <ExampleSchedule />
              <Features />
              <AddToHomeScreen />

              {/* Final CTA Banner */}
              <section className="py-12 text-center">
                <Card className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-border/60 bg-card/60 p-8 shadow-lg backdrop-blur-md sm:p-12">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-border/60 bg-muted/50 p-2.5 shadow-md sm:h-24 sm:w-24 sm:p-3 dark:bg-muted/20">
                    <img
                      src="/logo-black.png"
                      alt="Wirddy"
                      className="block h-full w-full object-contain dark:hidden"
                      suppressHydrationWarning
                    />
                    <img
                      src="/logo-white.png"
                      alt="Wirddy"
                      className="hidden h-full w-full object-contain dark:block"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {t.ctaGetStarted}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                      {t.tagline}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={startNewGroup}
                    className="mx-auto h-12 gap-2 rounded-xl px-8 text-base font-semibold shadow-md"
                  >
                    <span>{t.ctaCreateGroup}</span>
                    <ArrowIcon className="h-4 w-4" />
                  </Button>
                </Card>
              </section>
            </motion.div>
          )}

          {/* 2. Step 1: Group Name */}
          {step === "group_name" && (
            <motion.div
              key="group_name"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="pt-6 sm:pt-10"
            >
              <GroupForm
                initialGroupName={groupName}
                onContinue={handleGroupNameContinue}
                onBack={() => setStep("landing")}
              />
            </motion.div>
          )}

          {/* 3. Step 2: Member Setup & Total Validation */}
          {step === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-3xl space-y-6"
            >
              {/* Back to Group Name */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("group_name")}
                  className="gap-1.5 rounded-xl px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <BackArrowIcon className="h-4 w-4" />
                  <span>
                    {groupName} ({t.groupNameLabel})
                  </span>
                </Button>
              </div>

              {/* Live Total Indicator - Sticky Top */}
              <div className="sticky top-16 z-20 -mx-2 bg-background/85 px-2 py-2 backdrop-blur-md transition-all">
                <TotalIndicator currentTotal={currentTotal} />
              </div>

              {/* Members List */}
              <MemberList
                members={members}
                onAddMember={handleAddMember}
                onUpdateMember={handleUpdateMember}
                onRemoveMember={handleRemoveMember}
              />

              {/* Weeks Count Selector */}
              <WeeksSelector weeksCount={weeksCount} onChange={setWeeksCount} />

              {/* Validation Error Message if any */}
              {validationError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                  {validationError}
                </div>
              )}

              {/* Generate Schedule Action Button */}
              <GenerateButton
                onGenerate={handleGenerateSchedule}
                isGenerating={isGenerating}
                isValid={isInputValid}
              />
            </motion.div>
          )}

          {/* 4. Step 3: Generated Schedule View */}
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
                onEditPlan={() => {
                  setStep("members")
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                onRegenerate={() => {
                  setStep("members")
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                isRegenerating={isGenerating}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
