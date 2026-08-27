"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import {
  IconArrowLeft,
  IconArrowRight,
  IconSparkles,
  IconUsersGroup,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface GroupFormProps {
  initialGroupName: string
  onContinue: (groupName: string) => void
  onBack: () => void
}

export function GroupForm({
  initialGroupName,
  onContinue,
  onBack,
}: GroupFormProps) {
  const { dir, t } = useI18n()
  const [groupName, setGroupName] = useState(initialGroupName)
  const [error, setError] = useState<string | null>(null)

  const ArrowIcon = dir === "rtl" ? IconArrowLeft : IconArrowRight
  const BackArrowIcon = dir === "rtl" ? IconArrowRight : IconArrowLeft

  const suggestions = [
    t.suggFamily,
    t.suggFriends,
    t.suggRamadan,
    t.suggMosque,
    t.suggStudy,
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = groupName.trim()
    if (!trimmed) {
      setError(t.groupNameLabel)
      return
    }
    if (trimmed.length > 60) {
      setError("60 chars max")
      return
    }
    setError(null)
    onContinue(trimmed)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto w-full max-w-xl"
    >
      <Card className="gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur-md sm:p-7">
        {/* Header */}
        <div className="flex items-center gap-3 text-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconUsersGroup className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl leading-tight font-bold text-foreground sm:text-2xl">
              {t.createGroupTitle}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {t.createGroupSubtitle}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5 text-start">
            <Label
              htmlFor="group-name"
              className="text-sm font-semibold text-foreground"
            >
              {t.groupNameLabel}
            </Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value)
                if (error) setError(null)
              }}
              placeholder={t.groupNamePlaceholder}
              maxLength={60}
              autoFocus
              className="h-11 rounded-xl border-border/80 text-base focus-visible:ring-primary"
            />
            <p className="pt-0.5 text-xs text-muted-foreground">
              {t.groupNameHelp}
            </p>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-1.5 pt-1 text-start">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <IconSparkles className="h-3.5 w-3.5 text-primary" />
              <span>{t.suggestionsTitle}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setGroupName(suggestion)
                    if (error) setError(null)
                  }}
                  className="rounded-lg border border-border/40 bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:scale-105 hover:bg-muted active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="h-10 gap-1.5 rounded-xl px-4 text-muted-foreground hover:text-foreground"
            >
              <BackArrowIcon className="h-4 w-4" />
              <span>{t.btnBack}</span>
            </Button>

            <Button
              type="submit"
              disabled={!groupName.trim()}
              className="h-10 gap-2 rounded-xl px-6 text-sm font-semibold shadow-md transition-all"
            >
              <span>{t.btnContinue}</span>
              <ArrowIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}
