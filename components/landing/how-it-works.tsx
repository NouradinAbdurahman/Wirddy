'use client';

import React from 'react';
import { motion } from 'motion/react';
import { IconAdjustments, IconCalendarCheck, IconUsersGroup } from '@tabler/icons-react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardContent } from '@/components/ui/card';

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      icon: IconUsersGroup,
      title: t.step1Title,
      desc: t.step1Desc,
    },
    {
      icon: IconAdjustments,
      title: t.step2Title,
      desc: t.step2Desc,
    },
    {
      icon: IconCalendarCheck,
      title: t.step3Title,
      desc: t.step3Desc,
    },
  ];

  return (
    <section id="how-it-works" className="py-14 md:py-18">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t.howItWorksTitle}
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            {t.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card className="h-full border border-border/50 bg-card/60 backdrop-blur-sm rounded-2xl p-6 transition-all hover:border-primary/30 hover:shadow-md text-start">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" stroke={1.75} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
