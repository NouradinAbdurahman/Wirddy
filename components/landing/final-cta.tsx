"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconArrowRight,
  IconLayoutDashboard,
  IconSparkles,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface FinalCtaProps {
  onCreateGroup: () => void
}

export function FinalCta({ onCreateGroup }: FinalCtaProps) {
  const { language, dir, t } = useI18n()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const ArrowIcon = dir === "rtl" ? IconArrowLeft : IconArrowRight

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <section className="py-10 text-center">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <Card className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/80 to-background p-8 shadow-xl backdrop-blur-md sm:p-12">
          <div className="mx-auto max-w-xl space-y-3 pb-6">
            <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {t.finalCtaTitle}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t.finalCtaDesc}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            {isAuthenticated ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full gap-2 rounded-xl px-8 text-base font-semibold shadow-md sm:w-auto"
                >
                  <IconLayoutDashboard className="h-5 w-5" />
                  <span>{t.heroCtaDashboard}</span>
                  <ArrowIcon className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full gap-2 rounded-xl px-8 text-base font-semibold shadow-md sm:w-auto"
                >
                  <span>{t.finalCtaPrimary}</span>
                  <ArrowIcon className="h-4 w-4" />
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={onCreateGroup}
              className="h-12 w-full rounded-xl border-border/80 px-6 text-base font-medium transition-colors hover:bg-muted/70 sm:w-auto"
            >
              {t.finalCtaGuest}
            </Button>
          </div>

          <p className="mt-5 text-xs font-semibold text-muted-foreground/80">
            {t.finalCtaTrust}
          </p>
        </Card>
      </div>
    </section>
  )
}
