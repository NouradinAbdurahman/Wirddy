'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconCheck, IconRotate } from '@tabler/icons-react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ExampleSchedule() {
  const { language, t, formatNumber } = useI18n();
  const [activeWeek, setActiveWeek] = useState<number>(1);

  // Sample rotating data for 3 weeks
  const sampleWeeks = [
    {
      weekNumber: 1,
      assignments: [
        {
          name: language === 'ar' ? 'طارق' : 'Tariq',
          amount: 5,
          startJuz: 1,
          startAyah: language === 'ar' ? 'الفاتحة ١' : 'Al-Fatihah 1',
          endJuz: 5,
          endAyah: language === 'ar' ? 'النساء ١٤٧' : 'An-Nisa 147',
        },
        {
          name: language === 'ar' ? 'بلال' : 'Bilal',
          amount: 2,
          startJuz: 6,
          startAyah: language === 'ar' ? 'النساء ١٤٨' : 'An-Nisa 148',
          endJuz: 7,
          endAyah: language === 'ar' ? 'الأنعام ١١٠' : 'Al-An\'am 110',
        },
        {
          name: language === 'ar' ? 'خديجة' : 'Khadijah',
          amount: 5,
          startJuz: 8,
          startAyah: language === 'ar' ? 'الأنعام ١١١' : 'Al-An\'am 111',
          endJuz: 12,
          endAyah: language === 'ar' ? 'يوسف ٥٢' : 'Yusuf 52',
        },
        {
          name: language === 'ar' ? 'سمية (جزء ٢٦-٣٠)' : 'Sumayyah (Juz 26-30)',
          amount: 2,
          startJuz: 26,
          startAyah: language === 'ar' ? 'الأحقاف ١' : 'Al-Ahqaf 1',
          endJuz: 27,
          endAyah: language === 'ar' ? 'الحديد ٢٩' : 'Al-Hadid 29',
        },
      ],
    },
    {
      weekNumber: 2,
      assignments: [
        {
          name: language === 'ar' ? 'طارق' : 'Tariq',
          amount: 5,
          startJuz: 6,
          startAyah: language === 'ar' ? 'النساء ١٤٨' : 'An-Nisa 148',
          endJuz: 10,
          endAyah: language === 'ar' ? 'التوبة ٩٢' : 'At-Tawbah 92',
        },
        {
          name: language === 'ar' ? 'بلال' : 'Bilal',
          amount: 2,
          startJuz: 11,
          startAyah: language === 'ar' ? 'التوبة ٩٣' : 'At-Tawbah 93',
          endJuz: 12,
          endAyah: language === 'ar' ? 'يوسف ٥٢' : 'Yusuf 52',
        },
        {
          name: language === 'ar' ? 'خديجة' : 'Khadijah',
          amount: 5,
          startJuz: 13,
          startAyah: language === 'ar' ? 'يوسف ٥٣' : 'Yusuf 53',
          endJuz: 17,
          endAyah: language === 'ar' ? 'الحج ٧٨' : 'Al-Hajj 78',
        },
        {
          name: language === 'ar' ? 'سمية (جزء ٢٦-٣٠)' : 'Sumayyah (Juz 26-30)',
          amount: 2,
          startJuz: 28,
          startAyah: language === 'ar' ? 'المجادلة ١' : 'Al-Mujadila 1',
          endJuz: 29,
          endAyah: language === 'ar' ? 'المرسلات ٥٠' : 'Al-Mursalat 50',
        },
      ],
    },
    {
      weekNumber: 3,
      assignments: [
        {
          name: language === 'ar' ? 'طارق' : 'Tariq',
          amount: 5,
          startJuz: 11,
          startAyah: language === 'ar' ? 'التوبة ٩٣' : 'At-Tawbah 93',
          endJuz: 15,
          endAyah: language === 'ar' ? 'الكهف ٧٤' : 'Al-Kahf 74',
        },
        {
          name: language === 'ar' ? 'بلال' : 'Bilal',
          amount: 2,
          startJuz: 16,
          startAyah: language === 'ar' ? 'الكهف ٧٥' : 'Al-Kahf 75',
          endJuz: 17,
          endAyah: language === 'ar' ? 'الحج ٧٨' : 'Al-Hajj 78',
        },
        {
          name: language === 'ar' ? 'خديجة' : 'Khadijah',
          amount: 5,
          startJuz: 18,
          startAyah: language === 'ar' ? 'المؤمنون ١' : 'Al-Mu\'minun 1',
          endJuz: 22,
          endAyah: language === 'ar' ? 'يس ٢٧' : 'Ya-Sin 27',
        },
        {
          name: language === 'ar' ? 'سمية (جزء ٢٦-٣٠)' : 'Sumayyah (Juz 26-30)',
          amount: 2,
          startJuz: 29,
          startAyah: language === 'ar' ? 'الملك ١' : 'Al-Mulk 1',
          endJuz: 30,
          endAyah: language === 'ar' ? 'الناس ٦' : 'An-Nas 6',
        },
      ],
    },
  ];

  const currentWeekData = sampleWeeks.find((w) => w.weekNumber === activeWeek) || sampleWeeks[0];

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t.exampleTitle}
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            {t.exampleSubtitle}
          </p>
        </div>

        {/* Week Switcher Buttons */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((week) => (
            <Button
              key={week}
              variant={activeWeek === week ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveWeek(week)}
              className="rounded-xl px-4 h-9 text-xs font-semibold transition-all"
            >
              <span>
                {t.weekLabel} {formatNumber(week)}
              </span>
              {activeWeek === week && <IconCheck className="h-3.5 w-3.5 ms-1.5" />}
            </Button>
          ))}
        </div>

        {/* Schedule Display */}
        <div className="max-w-4xl mx-auto">
          <Card className="border border-border/60 bg-card/50 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border/40 gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  {t.appName}
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {language === 'ar' ? 'مجموعة عائلة النور' : 'Al-Noor Family Circle'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs px-3 py-1 font-medium">
                  {t.weekLabel} {formatNumber(activeWeek)} {t.weekOf} {formatNumber(3)}
                </Badge>
                <Badge variant="outline" className="text-xs px-2.5 py-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
                  <IconCheck className="h-3 w-3 me-1 inline" />
                  <span>{formatNumber(30)} / {formatNumber(30)} {t.juzUnit}</span>
                </Badge>
              </div>
            </div>

            {/* Assignments Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWeek}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5"
              >
                {currentWeekData.assignments.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-card/90 dark:bg-card/70 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all text-start"
                  >
                    <div className="flex items-start justify-between gap-2.5 border-b border-border/40 pb-3 mb-3">
                      <span className="font-extrabold text-base text-foreground break-words">
                        {item.name}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-muted/60 dark:bg-muted/40 border border-border/50 text-muted-foreground shrink-0">
                        {formatNumber(item.amount)} {t.juzUnit}
                      </span>
                    </div>

                    {/* Symmetrical Paired Start & End Section */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Start */}
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-primary">
                          {t.startLabel}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
                          {t.juzLabel} {formatNumber(item.startJuz)}
                        </span>
                        <span className="text-sm font-extrabold text-foreground pt-0.5 break-words">
                          {language === 'ar' ? `سورة ${item.startAyah}` : item.startAyah}
                        </span>
                      </div>

                      {/* End */}
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-primary">
                          {t.endLabel}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
                          {t.juzLabel} {formatNumber(item.endJuz)}
                        </span>
                        <span className="text-sm font-extrabold text-foreground pt-0.5 break-words">
                          {language === 'ar' ? `سورة ${item.endAyah}` : item.endAyah}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </section>
  );
}
