'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconPlus, IconUserPlus, IconUsers } from '@tabler/icons-react';
import { useI18n } from '@/lib/i18n/context';
import { MemberConfig } from '@/lib/scheduler/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemberCard } from './member-card';

interface MemberListProps {
  members: MemberConfig[];
  onAddMember: () => void;
  onUpdateMember: (index: number, member: MemberConfig) => void;
  onRemoveMember: (index: number) => void;
}

export function MemberList({
  members,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
}: MemberListProps) {
  const { t, formatNumber } = useI18n();

  return (
    <div className="space-y-5">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">
              {t.membersTitle}
            </h2>
            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
              {formatNumber(members.length)} {t.memberCount}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t.membersSubtitle}
          </p>
        </div>

        <Button
          type="button"
          onClick={onAddMember}
          size="sm"
          className="rounded-xl h-10 px-4 font-semibold gap-1.5 shadow-sm transition-all self-start sm:self-auto"
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
          className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/70 bg-card/40 flex flex-col items-center justify-center space-y-4"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <IconUserPlus className="h-7 w-7" stroke={1.5} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {t.noMembersTitle}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {t.noMembersDesc}
            </p>
          </div>
          <Button
            type="button"
            onClick={onAddMember}
            className="rounded-xl px-5 h-10 gap-1.5 shadow-sm font-semibold"
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
        </div>
      )}
    </div>
  );
}
