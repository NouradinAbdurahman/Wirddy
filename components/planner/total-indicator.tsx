'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '@/lib/i18n/context';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TotalIndicatorProps {
  currentTotal: number;
}

export function TotalIndicator({ currentTotal }: TotalIndicatorProps) {
  const { language, t, formatNumber } = useI18n();
  const isExact = currentTotal === 30;
  const isLess = currentTotal < 30;
  const isMore = currentTotal > 30;

  const percentage = Math.min(100, Math.round((currentTotal / 30) * 100));

  return (
    <div className="w-full">
      <Card
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 shadow-sm backdrop-blur-md ${
          isExact
            ? 'border-emerald-500/40 bg-card/95 dark:bg-card/90 shadow-emerald-500/5'
            : isMore
            ? 'border-destructive/40 bg-card/95 dark:bg-card/90 shadow-destructive/5'
            : 'border-border/60 bg-card/95 dark:bg-card/90'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden transition-colors ${
                isExact
                  ? 'bg-emerald-500/20'
                  : isMore
                  ? 'bg-destructive/20'
                  : 'bg-muted/40 border border-border/40'
              }`}
            >
              <img
                src="/logo-black.png"
                alt="Wirddy"
                className="h-7 w-7 object-contain block dark:hidden"
                suppressHydrationWarning
              />
              <img
                src="/logo-white.png"
                alt="Wirddy"
                className="h-7 w-7 object-contain hidden dark:block"
                suppressHydrationWarning
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t.totalLabel}
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className={`text-2xl font-bold tracking-tight ${
                    isExact
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isMore
                      ? 'text-destructive'
                      : 'text-foreground'
                  }`}
                >
                  {formatNumber(currentTotal)}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  / {formatNumber(30)} {t.juzUnit}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Status Feedback */}
          <div className="sm:text-end">
            <AnimatePresence mode="wait">
              {isExact && (
                <motion.div
                  key="exact"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400"
                >
                  {t.totalSuccess}
                </motion.div>
              )}

              {isLess && (
                <motion.div
                  key="less"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-medium text-muted-foreground"
                >
                  {language === 'ar'
                    ? `مجموع القراءة هو ${formatNumber(currentTotal)} جزءًا. يتبقى ${formatNumber(30 - currentTotal)} جزءًا ليكتمل الورد.`
                    : `Current total is ${currentTotal} Juz. Add ${30 - currentTotal} more Juz to reach 30.`}
                </motion.div>
              )}

              {isMore && (
                <motion.div
                  key="more"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-medium text-destructive"
                >
                  {language === 'ar'
                    ? `مجموع القراءة هو ${formatNumber(currentTotal)} جزءًا. يتجاوز الـ ٣٠ بمقدار ${formatNumber(currentTotal - 30)} جزءًا.`
                    : `Current total is ${currentTotal} Juz. Exceeds 30 by ${currentTotal - 30} Juz.`}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3.5">
          <Progress
            value={percentage}
            className={`h-2 rounded-full ${
              isExact
                ? '[&>div]:bg-emerald-500'
                : isMore
                ? '[&>div]:bg-destructive'
                : '[&>div]:bg-primary'
            }`}
          />
        </div>
      </Card>
    </div>
  );
}
