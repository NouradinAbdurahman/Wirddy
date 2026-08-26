'use client';

import React from 'react';
import { motion } from 'motion/react';
import { IconAlertTriangle, IconMinus, IconPlus, IconTrash, IconUser } from '@tabler/icons-react';
import { useI18n } from '@/lib/i18n/context';
import { KnowledgeType, MemberConfig } from '@/lib/scheduler/types';
import { SURAHS } from '@/lib/quran/data';
import { resolveSurahToJuzRange } from '@/lib/quran/resolver';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MemberCardProps {
  member: MemberConfig;
  index: number;
  onUpdate: (updated: MemberConfig) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function MemberCard({ member, index, onUpdate, onRemove, canRemove }: MemberCardProps) {
  const { language, t, formatNumber } = useI18n();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...member, name: e.target.value });
  };

  const handleKnowledgeTypeChange = (type: KnowledgeType) => {
    if (type === 'entire') {
      onUpdate({
        ...member,
        knowledgeType: 'entire',
        startJuz: 1,
        endJuz: 30,
        startSurah: undefined,
        endSurah: undefined,
      });
    } else if (type === 'juz_range') {
      onUpdate({
        ...member,
        knowledgeType: 'juz_range',
        startJuz: member.startJuz || 1,
        endJuz: member.endJuz || 30,
        startSurah: undefined,
        endSurah: undefined,
      });
    } else if (type === 'surah_range') {
      const sSurah = member.startSurah || 1;
      const eSurah = member.endSurah || 114;
      const juzSpan = resolveSurahToJuzRange(sSurah, eSurah);
      onUpdate({
        ...member,
        knowledgeType: 'surah_range',
        startSurah: sSurah,
        endSurah: eSurah,
        startJuz: juzSpan.startJuz,
        endJuz: juzSpan.endJuz,
      });
    }
  };

  const handleStartJuzChange = (val: string | null) => {
    if (!val) return;
    const s = parseInt(val, 10);
    const currentEnd = member.endJuz || 30;
    const newEnd = Math.max(s, currentEnd);
    onUpdate({ ...member, startJuz: s, endJuz: newEnd });
  };

  const handleEndJuzChange = (val: string | null) => {
    if (!val) return;
    const e = parseInt(val, 10);
    const currentStart = member.startJuz || 1;
    const newStart = Math.min(e, currentStart);
    onUpdate({ ...member, startJuz: newStart, endJuz: e });
  };

  const handleStartSurahChange = (val: string | null) => {
    if (!val) return;
    const s = parseInt(val, 10);
    const currentEnd = member.endSurah || 114;
    const newEnd = Math.max(s, currentEnd);
    const juzSpan = resolveSurahToJuzRange(s, newEnd);
    onUpdate({
      ...member,
      startSurah: s,
      endSurah: newEnd,
      startJuz: juzSpan.startJuz,
      endJuz: juzSpan.endJuz,
    });
  };

  const handleEndSurahChange = (val: string | null) => {
    if (!val) return;
    const e = parseInt(val, 10);
    const currentStart = member.startSurah || 1;
    const newStart = Math.min(e, currentStart);
    const juzSpan = resolveSurahToJuzRange(newStart, e);
    onUpdate({
      ...member,
      startSurah: newStart,
      endSurah: e,
      startJuz: juzSpan.startJuz,
      endJuz: juzSpan.endJuz,
    });
  };

  const updateAmount = (delta: number) => {
    const next = Math.max(1, Math.min(30, member.weeklyAmount + delta));
    onUpdate({ ...member, weeklyAmount: next });
  };

  const knownSpan = (member.endJuz || 30) - (member.startJuz || 1) + 1;
  const isAmountExceeding = member.weeklyAmount > knownSpan;

  const getKnowledgeDescription = () => {
    if (member.knowledgeType === 'entire') {
      return language === 'ar' ? 'القرآن كاملًا (الجزء ١ إلى ٣٠)' : 'Entire Quran (Juz 1 to 30)';
    }
    if (member.knowledgeType === 'juz_range') {
      return language === 'ar'
        ? `من الجزء ${formatNumber(member.startJuz)} إلى الجزء ${formatNumber(member.endJuz)}`
        : `Juz ${member.startJuz} to Juz ${member.endJuz}`;
    }
    if (member.knowledgeType === 'surah_range' && member.startSurah && member.endSurah) {
      const s1 = SURAHS.find((s) => s.number === member.startSurah);
      const s2 = SURAHS.find((s) => s.number === member.endSurah);
      return language === 'ar'
        ? `من سورة ${s1?.nameAr} إلى سورة ${s2?.nameAr} (الجزء ${formatNumber(member.startJuz)} - ${formatNumber(member.endJuz)})`
        : `Surah ${s1?.transliteration} to ${s2?.transliteration} (Juz ${member.startJuz} - ${member.endJuz})`;
    }
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full"
    >
      <Card className="border border-border/60 bg-card/70 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:border-border transition-all overflow-hidden text-start">
        <CardContent className="p-5 sm:p-6 space-y-5">
          {/* Card Header: Member Name & Remove Button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <IconUser className="h-4 w-4" />
              </div>
              <div className="flex-1 max-w-sm">
                <Input
                  value={member.name}
                  onChange={handleNameChange}
                  placeholder={`${t.memberNameLabel} ${formatNumber(index + 1)}`}
                  maxLength={60}
                  className="h-10 text-sm font-semibold rounded-xl border-border/60 focus-visible:ring-primary"
                />
              </div>
            </div>

            {canRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title={t.removeMember}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-border/40">
            {/* Knowledge Range Configuration */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t.knowledgeLabel}
                </Label>
              </div>

              {/* Knowledge Type Selector */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/40 text-xs">
                <button
                  type="button"
                  onClick={() => handleKnowledgeTypeChange('entire')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                    member.knowledgeType === 'entire'
                      ? 'bg-background shadow-xs text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {language === 'ar' ? 'القرآن كاملًا' : 'Entire Quran'}
                </button>
                <button
                  type="button"
                  onClick={() => handleKnowledgeTypeChange('juz_range')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                    member.knowledgeType === 'juz_range'
                      ? 'bg-background shadow-xs text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {language === 'ar' ? 'أجزاء محددة' : 'Juz Range'}
                </button>
                <button
                  type="button"
                  onClick={() => handleKnowledgeTypeChange('surah_range')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                    member.knowledgeType === 'surah_range'
                      ? 'bg-background shadow-xs text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {language === 'ar' ? 'سور محددة' : 'Surah Range'}
                </button>
              </div>

              {/* Juz Range Pickers */}
              {member.knowledgeType === 'juz_range' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">
                      {t.startJuzLabel}
                    </Label>
                    <Select
                      value={member.startJuz.toString()}
                      onValueChange={handleStartJuzChange}
                    >
                      <SelectTrigger className="h-9 text-xs rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                          <SelectItem key={j} value={j.toString()}>
                            {t.juzLabel} {formatNumber(j)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">
                      {t.endJuzLabel}
                    </Label>
                    <Select
                      value={member.endJuz.toString()}
                      onValueChange={handleEndJuzChange}
                    >
                      <SelectTrigger className="h-9 text-xs rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                          <SelectItem key={j} value={j.toString()}>
                            {t.juzLabel} {formatNumber(j)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Surah Range Pickers */}
              {member.knowledgeType === 'surah_range' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">
                      {t.startSurahLabel}
                    </Label>
                    <Select
                      value={(member.startSurah || 1).toString()}
                      onValueChange={handleStartSurahChange}
                    >
                      <SelectTrigger className="h-9 text-xs rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {SURAHS.map((s) => (
                          <SelectItem key={s.number} value={s.number.toString()}>
                            {formatNumber(s.number)}. {language === 'ar' ? s.nameAr : s.transliteration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">
                      {t.endSurahLabel}
                    </Label>
                    <Select
                      value={(member.endSurah || 114).toString()}
                      onValueChange={handleEndSurahChange}
                    >
                      <SelectTrigger className="h-9 text-xs rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {SURAHS.map((s) => (
                          <SelectItem key={s.number} value={s.number.toString()}>
                            {formatNumber(s.number)}. {language === 'ar' ? s.nameAr : s.transliteration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="text-[11px] text-muted-foreground px-1">
                {getKnowledgeDescription()}
              </div>
            </div>

            {/* Weekly Reading Amount Configuration */}
            <div className="space-y-2.5 flex flex-col justify-between">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  {t.weeklyAmountLabel}
                </Label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-border/70 rounded-xl bg-background p-1 shadow-xs">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => updateAmount(-1)}
                      disabled={member.weeklyAmount <= 1}
                      className="h-8 w-8 rounded-lg"
                    >
                      <IconMinus className="h-3.5 w-3.5" />
                    </Button>

                    <span className="w-12 text-center text-base font-bold text-foreground">
                      {formatNumber(member.weeklyAmount)}
                    </span>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => updateAmount(1)}
                      disabled={member.weeklyAmount >= 30}
                      className="h-8 w-8 rounded-lg"
                    >
                      <IconPlus className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Badge variant="secondary" className="text-xs font-semibold px-3 py-1.5 rounded-xl">
                    {formatNumber(member.weeklyAmount)} {t.weeklyAmountUnit}
                  </Badge>
                </div>
              </div>

              {/* Warning if amount exceeds known range */}
              {isAmountExceeding && (
                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <IconAlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    {language === 'ar'
                      ? `المقدار (${formatNumber(member.weeklyAmount)}) يتجاوز نطاق المعرفة (${formatNumber(knownSpan)} أجزاء)`
                      : `Amount (${member.weeklyAmount}) exceeds known span (${knownSpan} Juz)`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
