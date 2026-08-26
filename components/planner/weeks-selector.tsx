'use client';

import React from 'react';
import { IconCalendar, IconMinus, IconPlus } from '@tabler/icons-react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface WeeksSelectorProps {
  weeksCount: number;
  onChange: (count: number) => void;
}

const PRESET_WEEKS = [1, 2, 4, 5, 10, 20, 30];

export function WeeksSelector({ weeksCount, onChange }: WeeksSelectorProps) {
  const { t, formatNumber } = useI18n();

  const updateWeeks = (delta: number) => {
    const next = Math.max(1, Math.min(52, weeksCount + delta));
    onChange(next);
  };

  return (
    <Card className="border border-border/60 bg-card/70 rounded-2xl shadow-sm text-start">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconCalendar className="h-4 w-4" />
          </div>
          <div>
            <Label className="text-base font-bold text-foreground block">
              {t.weeksTitle}
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.weeksSubtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/40">
          {/* Direct Stepper */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border/70 rounded-xl bg-background p-1 shadow-xs">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => updateWeeks(-1)}
                disabled={weeksCount <= 1}
                className="h-8 w-8 rounded-lg"
              >
                <IconMinus className="h-3.5 w-3.5" />
              </Button>

              <span className="w-12 text-center text-lg font-bold text-foreground">
                {formatNumber(weeksCount)}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => updateWeeks(1)}
                disabled={weeksCount >= 52}
                className="h-8 w-8 rounded-lg"
              >
                <IconPlus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <span className="text-sm font-semibold text-muted-foreground">
              {t.weeksUnit}
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_WEEKS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                  weeksCount === preset
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50'
                }`}
              >
                {formatNumber(preset)}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
