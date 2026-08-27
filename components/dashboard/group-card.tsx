"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  IconArchive,
  IconArrowBackUp,
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconEdit,
  IconEye,
  IconFlame,
  IconHistory,
  IconMoon,
  IconRefresh,
  IconShare,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserGroupSummary } from "@/lib/groups/service"
import {
  archiveGroupAction,
  deleteGroupAction,
  duplicateGroupAction,
  startNewKhatmahAction,
} from "@/lib/groups/actions"
import { VersionHistoryModal } from "@/components/schedule/version-history-modal"

interface GroupCardProps {
  group: UserGroupSummary
  onRefresh?: () => void
  onOpenExport?: (groupPublicId: string) => void
  onOpenShare?: (groupPublicId: string) => void
}

export function GroupCard({
  group,
  onRefresh,
  onOpenExport,
  onOpenShare,
}: GroupCardProps) {
  const { language, t } = useI18n()
  const [isActionLoading, setIsActionLoading] = useState(false)

  const handleDuplicate = async () => {
    setIsActionLoading(true)
    try {
      const res = await duplicateGroupAction(group.publicId, language)
      if (res.success && res.data) {
        if (onRefresh) onRefresh()
      }
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleNewKhatmah = async () => {
    setIsActionLoading(true)
    try {
      const res = await startNewKhatmahAction(group.publicId, language)
      if (res.success && res.data) {
        if (onRefresh) onRefresh()
      }
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleToggleArchive = async () => {
    setIsActionLoading(true)
    try {
      await archiveGroupAction(group.publicId, !group.isArchived)
      if (onRefresh) onRefresh()
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(t.confirmDelete)) return
    setIsActionLoading(true)
    try {
      await deleteGroupAction(group.publicId)
      if (onRefresh) onRefresh()
    } finally {
      setIsActionLoading(false)
    }
  }

  const isRamadan = group.occasionType === "ramadan"
  const [showHistory, setShowHistory] = useState(false)

  const isOwner = group.isOwner || group.userRole === "owner"
  const targetUrl =
    !isOwner && group.memberPublicId
      ? `/g/${group.publicId}/member/${group.memberPublicId}`
      : `/g/${group.publicId}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all hover:shadow-md sm:p-6 ${
        group.isArchived
          ? "border-border/40 bg-muted/20 opacity-70"
          : "border-border/80 shadow-sm hover:border-primary/40"
      }`}
    >
      <div>
        {/* Header Badges & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Role Badge: Owner vs Member */}
            <Badge
              variant="secondary"
              className={`text-[10px] font-bold ${
                isOwner
                  ? "border border-primary/30 bg-primary/10 text-primary"
                  : "border border-border bg-muted text-muted-foreground"
              }`}
            >
              {isOwner
                ? language === "ar"
                  ? "مالك"
                  : "Owner"
                : language === "ar"
                  ? "عضو"
                  : "Member"}
            </Badge>

            {isRamadan && (
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
              >
                <IconMoon className="me-1 h-3 w-3" />
                {group.islamicYear
                  ? language === "ar"
                    ? `رمضان ${group.islamicYear}`
                    : `Ramadan ${group.islamicYear}`
                  : t.tabRamadan}
              </Badge>
            )}
            {group.isArchived ? (
              <Badge variant="secondary" className="text-[10px] font-bold">
                {t.tabArchived}
              </Badge>
            ) : group.status === "completed" ? (
              <Badge
                variant="outline"
                className="border-emerald-600/30 text-[10px] font-bold text-emerald-600"
              >
                {t.tabCompleted}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-primary/30 text-[10px] font-bold text-primary"
              >
                {t.tabActive}
              </Badge>
            )}
          </div>

          {/* Overflow Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Group options"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none"
            >
              <IconDotsVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1 text-start">
              <Link href={targetUrl}>
                <DropdownMenuItem className="cursor-pointer gap-2 text-xs font-semibold">
                  <IconEye className="h-4 w-4" />
                  <span>
                    {!isOwner && group.memberPublicId
                      ? language === "ar"
                        ? "جدولي الشخصي"
                        : "My Personal Schedule"
                      : t.actionOpen}
                  </span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={() => onOpenShare?.(group.publicId)}
                className="cursor-pointer gap-2 text-xs font-semibold"
              >
                <IconShare className="h-4 w-4" />
                <span>{t.actionShare}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onOpenExport?.(group.publicId)}
                className="cursor-pointer gap-2 text-xs font-semibold"
              >
                <IconDownload className="h-4 w-4" />
                <span>{t.actionDownload}</span>
              </DropdownMenuItem>

              {/* Organizer-only actions */}
              {isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowHistory(true)}
                    className="cursor-pointer gap-2 text-xs font-semibold"
                  >
                    <IconHistory className="h-4 w-4" />
                    <span>
                      {language === "ar" ? "سجل التعديلات" : "Version History"}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDuplicate}
                    className="cursor-pointer gap-2 text-xs font-semibold"
                  >
                    <IconCopy className="h-4 w-4" />
                    <span>{t.actionDuplicate}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleNewKhatmah}
                    className="cursor-pointer gap-2 text-xs font-bold text-primary"
                  >
                    <IconRefresh className="h-4 w-4" />
                    <span>{t.actionNewKhatmah}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleToggleArchive}
                    className="cursor-pointer gap-2 text-xs font-semibold"
                  >
                    {group.isArchived ? (
                      <>
                        <IconArrowBackUp className="h-4 w-4" />
                        <span>{t.actionRestore}</span>
                      </>
                    ) : (
                      <>
                        <IconArchive className="h-4 w-4" />
                        <span>{t.actionArchive}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="cursor-pointer gap-2 text-xs font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <IconTrash className="h-4 w-4" />
                    <span>{t.actionDelete}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Group Name & Description */}
        <Link href={targetUrl} className="mt-3.5 block group-hover:underline">
          <h3 className="truncate text-lg font-extrabold text-foreground">
            {group.groupName}
          </h3>
          {group.title && (
            <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
              {group.title}
            </p>
          )}
        </Link>
        <VersionHistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          groupPublicId={group.publicId}
          onVersionRestored={onRefresh}
        />
        {group.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {group.description}
          </p>
        )}

        {/* Metadata stats */}
        <div className="mt-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <IconUsers className="h-4 w-4 text-primary" />
            <span>
              {language === "ar"
                ? `${group.membersCount} أعضاء`
                : `${group.membersCount} members`}
            </span>
          </div>
          <div>
            <span>
              {language === "ar"
                ? `${group.weeksCount} أسابيع`
                : `${group.weeksCount} weeks`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Progress & Action */}
      <div className="mt-5 border-t border-border/60 pt-3">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/g/${group.publicId}`} className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full rounded-xl text-xs font-bold transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {t.actionOpen}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
