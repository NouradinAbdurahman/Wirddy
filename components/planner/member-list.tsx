"use client"

import React from "react"
import { motion, AnimatePresence } from "motion/react"
import { IconPlus, IconUserPlus, IconUsers } from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { MemberConfig } from "@/lib/scheduler/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MemberCard } from "./member-card"

interface MemberListProps {
  members: MemberConfig[]
  onAddMember: () => void
  onUpdateMember: (index: number, member: MemberConfig) => void
  onRemoveMember: (index: number) => void
}

export function MemberList({
  members,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
}: MemberListProps) {
  const { t, formatNumber } = useI18n()

  return (
    <div className="space-y-5">
      {/* Header & Add Button */}
      <div className="flex flex-col justify-between gap-3 text-start sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">
              {t.membersTitle}
            </h2>
            <Badge
              variant="secondary"
              className="px-2.5 py-0.5 text-xs font-semibold"
            >
              {formatNumber(members.length)} {t.memberCount}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {t.membersSubtitle}
          </p>
        </div>

        <Button
          type="button"
          onClick={onAddMember}
          size="sm"
          className="h-10 gap-1.5 self-start rounded-xl px-4 font-semibold shadow-sm transition-all sm:self-auto"
        >
          <IconPlus className="h-4 w-4" />
          <span>{t.addMemberBtn}</span>
        </Button>
      </div>

      {/* Member Cards List or Empty State */}
      {members.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-border/70 bg-card/40 p-8 text-center sm:p-12"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <IconUserPlus className="h-7 w-7" stroke={1.5} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {t.noMembersTitle}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {t.noMembersDesc}
            </p>
          </div>
          <Button
            type="button"
            onClick={onAddMember}
            className="h-10 gap-1.5 rounded-xl px-5 font-semibold shadow-sm"
          >
            <IconPlus className="h-4 w-4" />
            <span>{t.addMemberBtn}</span>
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {members.map((member, index) => (
              <MemberCard
                key={member.id}
                member={member}
                index={index}
                onUpdate={(updated) => onUpdateMember(index, updated)}
                onRemove={() => onRemoveMember(index)}
                canRemove={members.length > 1}
              />
            ))}
          </AnimatePresence>

          {/* Bottom Add Member button — visible after members exist so user doesn't scroll up */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Button
              type="button"
              onClick={onAddMember}
              variant="outline"
              className="h-11 w-full gap-2 rounded-2xl border-dashed border-border/70 font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            >
              <IconPlus className="h-4 w-4" />
              <span>{t.addMemberBtn}</span>
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
