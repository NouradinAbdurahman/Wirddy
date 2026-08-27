"use client"

import React from "react"
import { motion } from "motion/react"
import {
  IconArrowsShuffle,
  IconArrowsSplit,
  IconChartDots,
  IconSparkles,
  IconSwitchHorizontal,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { RotationStyle } from "@/lib/scheduler/types"

interface RotationSelectorProps {
  value: RotationStyle
  onChange: (val: RotationStyle) => void
}

export function RotationSelector({ value, onChange }: RotationSelectorProps) {
  const { t, dir } = useI18n()

  const options: Array<{
    id: RotationStyle
    title: string
    desc: string
    icon: React.ElementType
    badgeColor: string
  }> = [
    {
      id: "large",
      title: t.rotationLarge,
      desc: t.rotationLargeDesc,
      icon: IconArrowsSplit,
      badgeColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "medium",
      title: t.rotationMedium,
      desc: t.rotationMediumDesc,
      icon: IconSwitchHorizontal,
      badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "small",
      title: t.rotationSmall,
      desc: t.rotationSmallDesc,
      icon: IconChartDots,
      badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      id: "random",
      title: t.rotationRandom,
      desc: t.rotationRandomDesc,
      icon: IconArrowsShuffle,
      badgeColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
  ]

  return (
    <div className="space-y-3 text-start">
      <div>
        <label className="text-sm font-bold text-foreground">
          {t.rotationStyleTitle}
        </label>
        <p className="text-xs text-muted-foreground">{t.rotationStyleDesc}</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {options.map((opt) => {
          const isSelected = value === opt.id
          const Icon = opt.icon

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`relative flex flex-col justify-between rounded-2xl border p-3.5 text-start transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-xs dark:bg-primary/10"
                  : "border-border/60 bg-card/60 hover:border-border hover:bg-card dark:bg-card/40"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeRotationStyle"
                  className="absolute inset-0 rounded-2xl border-2 border-primary"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}

              <div className="relative z-10 flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${opt.badgeColor}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-foreground sm:text-sm">
                    {opt.title}
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {opt.desc}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
