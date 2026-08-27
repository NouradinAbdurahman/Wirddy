"use client"

import React from "react"
import {
  IconBrandWhatsapp,
  IconFileTypePdf,
  IconFileTypePng,
  IconFileTypeZip,
  IconLink,
  IconQrcode,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ShareExport() {
  const { language, t } = useI18n()

  const formats = [
    {
      icon: IconFileTypePng,
      title: t.exportPngTitle,
      desc: t.exportPngDesc,
      badge: "PNG",
    },
    {
      icon: IconFileTypePdf,
      title: t.exportPdfTitle,
      desc: t.exportPdfDesc,
      badge: "PDF",
    },
    {
      icon: IconFileTypeZip,
      title: t.exportZipTitle,
      desc: t.exportZipDesc,
      badge: "ZIP",
    },
    {
      icon: IconLink,
      title: t.exportLinksTitle,
      desc: t.exportLinksDesc,
      badge: "LINK",
    },
    {
      icon: IconQrcode,
      title: t.exportQrTitle,
      desc: t.exportQrDesc,
      badge: "QR",
    },
    {
      icon: IconBrandWhatsapp,
      title: t.exportWhatsappTitle,
      desc: t.exportWhatsappDesc,
      badge: "SHARE",
    },
  ]

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t.shareExportTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.shareExportSubtitle}
          </p>
        </div>

        {/* 6 Export Capabilities Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {formats.map((f, idx) => {
            const Icon = f.icon
            return (
              <Card
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-black tracking-wide text-muted-foreground">
                    {f.badge}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-foreground">
                    {f.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
