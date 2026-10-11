"use client"

import React from "react"
import {
  IconArrowLeft,
  IconArrowRight,
  IconUsersGroup,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import {
  CustomQuranRange,
  MemberConfig,
  OccasionType,
  RangeType,
  RecurrenceConfig,
  RotationStyle,
  ScheduleInput,
} from "@/lib/scheduler/types"
import { validateScheduleInput } from "@/lib/scheduler/validator"
import { RangeSelector } from "@/components/planner/range-selector"
import { RotationSelector } from "@/components/planner/rotation-selector"
import { MemberList } from "@/components/planner/member-list"
import { TotalIndicator } from "@/components/planner/total-indicator"
import { WeeksSelector } from "@/components/planner/weeks-selector"
import { GenerateButton } from "@/components/planner/generate-button"
import { ValidationNotice } from "@/components/planner/validation-notice"
import { AdvancedOptions } from "@/components/planner/advanced-options"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export interface PlannerStepProps {
  inputPayload: ScheduleInput
  groupName: string
  setGroupName: (v: string) => void
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  usesDates: boolean
  setUsesDates: (v: boolean) => void
  startDate: string
  setStartDate: (v: string) => void
  occasionType: OccasionType
  setOccasionType: (v: OccasionType) => void
  islamicYear: number
  setIslamicYear: (v: number) => void
  dailyDivisionEnabled: boolean
  setDailyDivisionEnabled: (v: boolean) => void
  recurrence: RecurrenceConfig
  setRecurrence: (v: RecurrenceConfig) => void
  rangeType: RangeType
  setRangeType: (v: RangeType) => void
  startJuz: number
  setStartJuz: (v: number) => void
  customRange: CustomQuranRange
  setCustomRange: (v: CustomQuranRange) => void
  members: MemberConfig[]
  onAddMember: () => void
  onUpdateMember: (index: number, updated: MemberConfig) => void
  onRemoveMember: (index: number) => void
  rotationStyle: RotationStyle
  setRotationStyle: (v: RotationStyle) => void
  weeksCount: number
  setWeeksCount: (v: number) => void
  submitError: string | null
  onClearError: () => void
  onGenerate: () => void
  isGenerating: boolean
  onBack: () => void
}

/**
 * The plan form. It lives in its own module, loaded when a visitor opens
 * the planner, so the landing page does not ship the validator and the
 * Quran dataset it depends on.
 */
export function PlannerStep({
  inputPayload,
  groupName,
  setGroupName,
  title,
  setTitle,
  description,
  setDescription,
  usesDates,
  setUsesDates,
  startDate,
  setStartDate,
  occasionType,
  setOccasionType,
  islamicYear,
  setIslamicYear,
  dailyDivisionEnabled,
  setDailyDivisionEnabled,
  recurrence,
  setRecurrence,
  rangeType,
  setRangeType,
  startJuz,
  setStartJuz,
  customRange,
  setCustomRange,
  members,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  rotationStyle,
  setRotationStyle,
  weeksCount,
  setWeeksCount,
  submitError,
  onClearError,
  onGenerate,
  isGenerating,
  onBack,
}: PlannerStepProps) {
  const { dir, t } = useI18n()
  const BackArrowIcon = dir === "rtl" ? IconArrowRight : IconArrowLeft
  const suggestions = [
    t.suggFamily,
    t.suggFriends,
    t.suggRamadan,
    t.suggMosque,
    t.suggStudy,
  ]

  const currentTotal = members.reduce(
    (sum, m) => sum + (m.weeklyAmount || 0),
    0
  )
  const validationResult = validateScheduleInput(inputPayload)
  const isInputValid =
    validationResult.isValid &&
    (rangeType === "custom" || currentTotal === 30) &&
    groupName.trim().length > 0

  return (
    <>
      {/* Back to Home Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 rounded-xl px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <BackArrowIcon className="h-4 w-4" />
          <span>{t.btnBack}</span>
        </Button>

        <div className="text-xs font-bold text-primary">{t.formTitle}</div>
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
              if (submitError) onClearError()
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
          onAddMember={onAddMember}
          onUpdateMember={onUpdateMember}
          onRemoveMember={onRemoveMember}
          totalIndicator={
            rangeType === "full" ? (
              <TotalIndicator currentTotal={currentTotal} />
            ) : null
          }
        />
      </Card>

      {/* Section 4: Rotation Style */}
      <Card className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
        <RotationSelector value={rotationStyle} onChange={setRotationStyle} />
      </Card>

      {/* Section 5: Weeks Duration */}
      <Card className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
        <WeeksSelector weeksCount={weeksCount} onChange={setWeeksCount} />
      </Card>

      {/* Validation errors and warnings */}
      <ValidationNotice result={validationResult} submitError={submitError} />

      {/* Generate Button */}
      <GenerateButton
        onGenerate={onGenerate}
        isGenerating={isGenerating}
        isValid={isInputValid}
      />
    </>
  )
}
