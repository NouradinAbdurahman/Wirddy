"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  IconSpeakerphone,
  IconPlus,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  createAnnouncementAction,
  getAnnouncementsAction,
} from "@/lib/groups/actions"

export interface AnnouncementItem {
  id: string
  title: string
  content: string
  createdAt: string
}

interface AnnouncementsWidgetProps {
  groupPublicId: string
  announcements: AnnouncementItem[]
  isOwner?: boolean
  onAnnouncementsUpdated?: () => void
}

export function AnnouncementsWidget({
  groupPublicId,
  announcements,
  isOwner = false,
  onAnnouncementsUpdated,
}: AnnouncementsWidgetProps) {
  const { language, t } = useI18n()
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await createAnnouncementAction(groupPublicId, title, content)
      if (res.success) {
        setTitle("")
        setContent("")
        setIsCreating(false)
        if (onAnnouncementsUpdated) onAnnouncementsUpdated()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (announcements.length === 0 && !isOwner) return null

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <IconSpeakerphone className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-extrabold text-foreground">
            {t.announcementsTitle}
          </h3>
        </div>

        {isOwner && !isCreating && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreating(true)}
            className="h-8 gap-1 rounded-xl text-xs font-bold"
          >
            <IconPlus className="h-3.5 w-3.5" />
            <span>{t.announcementCreate}</span>
          </Button>
        )}
      </div>

      {/* Creation form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="space-y-3 rounded-xl border border-border bg-background/90 p-4"
        >
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.announcementTitlePlaceholder}
            className="text-xs font-bold"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.announcementContentPlaceholder}
            className="min-h-[70px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            required
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(false)}
              className="text-xs"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-bold"
            >
              {t.announcementPostBtn}
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {announcements.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {t.announcementsEmpty}
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {announcements.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-border/60 bg-background/80 p-3.5 shadow-sm"
            >
              <h4 className="text-xs font-extrabold text-foreground">
                {a.title}
              </h4>
              <p className="mt-1 text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {a.content}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
