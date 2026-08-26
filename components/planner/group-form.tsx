'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { IconArrowLeft, IconArrowRight, IconSparkles, IconUsersGroup } from '@tabler/icons-react';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface GroupFormProps {
  initialGroupName: string;
  onContinue: (groupName: string) => void;
  onBack: () => void;
}

export function GroupForm({ initialGroupName, onContinue, onBack }: GroupFormProps) {
  const { dir, t } = useI18n();
  const [groupName, setGroupName] = useState(initialGroupName);
  const [error, setError] = useState<string | null>(null);

  const ArrowIcon = dir === 'rtl' ? IconArrowLeft : IconArrowRight;
  const BackArrowIcon = dir === 'rtl' ? IconArrowRight : IconArrowLeft;

  const suggestions = [
    t.suggFamily,
    t.suggFriends,
    t.suggRamadan,
    t.suggMosque,
    t.suggStudy,
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = groupName.trim();
    if (!trimmed) {
      setError(t.groupNameLabel);
      return;
    }
    if (trimmed.length > 60) {
      setError('60 chars max');
      return;
    }
    setError(null);
    onContinue(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-xl mx-auto w-full"
    >
      <Card className="border border-border/60 bg-card/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden p-6 sm:p-7 gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 text-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconUsersGroup className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
              {t.createGroupTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {t.createGroupSubtitle}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5 text-start">
            <Label htmlFor="group-name" className="text-sm font-semibold text-foreground">
              {t.groupNameLabel}
            </Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t.groupNamePlaceholder}
              maxLength={60}
              autoFocus
              className="h-11 text-base rounded-xl border-border/80 focus-visible:ring-primary"
            />
            <p className="text-xs text-muted-foreground pt-0.5">
              {t.groupNameHelp}
            </p>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-1.5 text-start pt-1">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <IconSparkles className="h-3.5 w-3.5 text-primary" />
              <span>{t.suggestionsTitle}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setGroupName(suggestion);
                    if (error) setError(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/60 hover:bg-muted text-foreground border border-border/40 transition-all hover:scale-105 active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="rounded-xl px-4 h-10 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <BackArrowIcon className="h-4 w-4" />
              <span>{t.btnBack}</span>
            </Button>

            <Button
              type="submit"
              disabled={!groupName.trim()}
              className="rounded-xl px-6 h-10 text-sm font-semibold gap-2 shadow-md transition-all"
            >
              <span>{t.btnContinue}</span>
              <ArrowIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
