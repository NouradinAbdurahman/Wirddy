'use client';

import React from 'react';
import { motion } from 'motion/react';
import { IconArrowLeft, IconArrowRight, IconCalendarStats, IconLoader2 } from '@tabler/icons-react';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';

interface GenerateButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
  isValid: boolean;
}

export function GenerateButton({ onGenerate, isGenerating, isValid }: GenerateButtonProps) {
  const { dir, t } = useI18n();
  const ArrowIcon = dir === 'rtl' ? IconArrowLeft : IconArrowRight;

  return (
    <div className="w-full pt-2">
      <motion.div whileHover={isValid && !isGenerating ? { scale: 1.01 } : {}} whileTap={isValid && !isGenerating ? { scale: 0.98 } : {}}>
        <Button
          type="button"
          size="lg"
          onClick={onGenerate}
          disabled={!isValid || isGenerating}
          className={`w-full h-14 text-base sm:text-lg font-bold rounded-2xl shadow-lg transition-all gap-3 ${
            isValid
              ? 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-primary/25 cursor-pointer'
              : 'opacity-60 cursor-not-allowed'
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
  );
}
