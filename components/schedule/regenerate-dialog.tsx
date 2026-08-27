"use client"

import React from "react"
import { IconAlertTriangle, IconRotate } from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface RegenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function RegenerateDialog({
  open,
  onOpenChange,
  onConfirm,
}: RegenerateDialogProps) {
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 text-start sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <IconAlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            {t.regenerateTitle}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {t.regenerateWarning}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-xl"
          >
            {t.cancel}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false)
              onConfirm()
            }}
            className="h-11 gap-1.5 rounded-xl font-semibold"
          >
            <IconRotate className="h-4 w-4" />
            <span>{t.regenerateConfirm}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
