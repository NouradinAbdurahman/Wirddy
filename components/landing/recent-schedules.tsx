"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  IconCalendarEvent,
  IconClock,
  IconHistory,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import {
  clearRecentSchedules,
  getRecentSchedules,
  RecentScheduleItem,
  removeRecentSchedule,
} from "@/lib/storage/recent-schedules"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RecentSchedulesProps {
  onOpenLocal?: (groupName: string) => void
}

export function RecentSchedules({ onOpenLocal }: RecentSchedulesProps) {
  const { language, t, formatNumber } = useI18n()
  const [items, setItems] = useState<RecentScheduleItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setItems(getRecentSchedules())
    setIsLoaded(true)
  }, [])

  if (!isLoaded || items.length === 0) {
    return null
  }

  const handleRemove = (identifier: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    removeRecentSchedule(identifier)
    setItems(getRecentSchedules())
  }

  const handleClearAll = () => {
    clearRecentSchedules()
    setItems([])
  }

  const formatLastUsed = (isoDate: string) => {
    try {
      const d = new Date(isoDate)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return t.lastUsedToday
      if (diffDays === 1) return t.lastUsedYesterday
      return d.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
        month: "short",
        day: "numeric",
      })
    } catch {
      return t.lastUsedToday
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl py-6 text-start">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconHistory className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground sm:text-lg">
              {t.recentSchedulesTitle}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t.recentSchedulesSubtitle}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-8 gap-1.5 rounded-xl px-2.5 text-xs text-muted-foreground hover:text-destructive"
        >
          <IconTrash className="h-3.5 w-3.5" />
          <span>{t.btnClearAll}</span>
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, idx) => {
            const identifier = item.publicId
              ? `recent-pub-${item.publicId}`
              : `recent-item-${idx}-${item.groupName}`
            const targetUrl = item.publicId
              ? item.editToken
                ? `/g/${item.publicId}?edit=${item.editToken}`
                : `/g/${item.publicId}`
              : "#"

            return (
              <motion.div
                key={identifier}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="line-clamp-1 text-sm font-bold text-foreground">
                        {item.groupName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconCalendarEvent className="h-3 w-3 text-primary" />
                          {formatNumber(item.weeksCount)} {t.weekUnit}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <IconClock className="h-3 w-3" />
                          {formatLastUsed(item.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleRemove(identifier, e)}
                      className="rounded-lg p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-destructive"
                      aria-label={t.btnRemoveRecent}
                    >
                      <IconX className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    {item.publicId ? (
                      <Link
                        href={targetUrl}
                        className="inline-flex h-7.5 items-center rounded-xl bg-primary/10 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        {t.btnOpenRecent}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenLocal && onOpenLocal(item.groupName)
                        }
                        className="inline-flex h-7.5 items-center rounded-xl bg-primary/10 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        {t.btnOpenRecent}
                      </button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </section>
  )
}
