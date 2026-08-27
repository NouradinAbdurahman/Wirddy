"use client"

import React from "react"
import { motion } from "motion/react"
import {
  IconArrowLeft,
  IconArrowRight,
  IconCalendarStats,
  IconLoader2,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"

interface GenerateButtonProps {
  onGenerate: () => void
  isGenerating: boolean
  isValid: boolean
}

export function GenerateButton({
  onGenerate,
  isGenerating,
  isValid,
}: GenerateButtonProps) {
  const { dir, t } = useI18n()
  const ArrowIcon = dir === "rtl" ? IconArrowLeft : IconArrowRight

  return (
    <div className="w-full pt-2">
      <motion.div
        whileHover={isValid && !isGenerating ? { scale: 1.01 } : {}}
        whileTap={isValid && !isGenerating ? { scale: 0.98 } : {}}
      >
        <Button
          type="button"
          size="lg"
          onClick={onGenerate}
          disabled={!isValid || isGenerating}
          className={`h-14 w-full gap-3 rounded-2xl text-base font-bold shadow-lg transition-all sm:text-lg ${
            isValid
              ? "cursor-pointer bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/95"
              : "cursor-not-allowed opacity-60"
          }`}
        >
          {isGenerating ? (
            <>
              <IconLoader2 className="h-5 w-5 animate-spin" />
              <span>{t.btnGenerating}</span>
            </>
          ) : (
            <>
              <IconCalendarStats className="h-5 w-5" />
              <span>{t.btnGenerate}</span>
              <ArrowIcon className="h-5 w-5" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
