"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  IconArrowLeft,
  IconArrowRight,
  IconBell,
  IconBook,
  IconDatabase,
  IconDownload,
  IconLanguage,
  IconLogout,
  IconMoon,
  IconPalette,
  IconSun,
  IconTrash,
  IconUser,
} from "@tabler/icons-react"
import { useI18n } from "@/lib/i18n/context"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { extractUserProfile, UserProfileInfo } from "@/lib/auth/user"
import {
  deleteAccountAction,
  exportUserDataAction,
  getNotificationPreferencesAction,
  saveNotificationPreferencesAction,
} from "@/lib/groups/actions"

export default function SettingsPage() {
  const { language, setLanguage, dir, t } = useI18n()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [user, setUser] = useState<UserProfileInfo | null>(null)
  const [notifDaily, setNotifDaily] = useState(true)
  const [notifTime, setNotifTime] = useState("20:00")
  const [notifIncomplete, setNotifIncomplete] = useState(true)
  const [notifAlerts, setNotifAlerts] = useState(true)
  const [pushStatus, setPushStatus] = useState<
    "default" | "granted" | "denied"
  >("default")
  const [isSavingNotifs, setIsSavingNotifs] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(extractUserProfile(session.user))
        getNotificationPreferencesAction().then((res) => {
          if (res.success && res.data) {
            setNotifDaily(!!res.data.daily_reminder_enabled)
            setNotifTime(res.data.reminder_time || "20:00")
            setNotifIncomplete(!!res.data.incomplete_reminder_enabled)
            setNotifAlerts(!!res.data.group_announcements_enabled)
          }
        })
      }
    })

    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission as any)
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient()
    if (supabase) {
      await supabase.auth.signOut()
      window.location.href = "/"
    }
  }

  const handleSaveNotifications = async () => {
    setIsSavingNotifs(true)
    try {
      await saveNotificationPreferencesAction({
        dailyReminderEnabled: notifDaily,
        reminderTime: notifTime,
        incompleteReminderEnabled: notifIncomplete,
        groupAnnouncementsEnabled: notifAlerts,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } finally {
      setIsSavingNotifs(false)
    }
  }

  const handleRequestPush = async () => {
    const { registerPushNotifications } =
      await import("@/lib/notifications/client")
    const res = await registerPushNotifications()
    setPushStatus(res.permission as any)
  }

  const handleTestNotification = async () => {
    const { sendTestNotificationAction } = await import("@/lib/groups/actions")
    await sendTestNotificationAction()
    alert(
      language === "ar"
        ? "تم إرسال التنبيه التجريبي بنجاح!"
        : "Test notification sent successfully!"
    )
  }

  const handleExportData = async () => {
    const res = await exportUserDataAction()
    if (res.success && res.data) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `wirddy-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm(t.deleteAccountConfirm)) return
    await deleteAccountAction()
    const supabase = getSupabaseBrowserClient()
    if (supabase) await supabase.auth.signOut()
    window.location.href = "/"
  }

  const BackIcon = dir === "rtl" ? IconArrowRight : IconArrowLeft

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="container mx-auto max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-5">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
              <BackIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">
              {t.settingsTitle}
            </h1>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Account Card */}
          {user && (
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <IconUser className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-extrabold text-foreground">
                  {t.settingsAccount}
                </h3>
              </div>

              <div className="flex items-center gap-4">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-border/80"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                    {(user.firstName[0] || "U").toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-base font-extrabold text-foreground">
                    {user.fullName}
                  </h4>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-9 gap-1.5 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10"
                >
                  <IconLogout className="h-4 w-4" />
                  <span>{t.authSignOut}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Appearance & Language */}
          <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <IconPalette className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-extrabold text-foreground">
                {t.settingsAppearance} & {t.settingsLanguage}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-border/70 p-3.5">
                <span className="text-xs font-bold text-foreground">
                  {language === "ar" ? "اللغة الحالية" : "Language"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                  className="h-8 text-xs font-bold"
                >
                  <IconLanguage className="me-1 h-3.5 w-3.5" />
                  <span>{language === "ar" ? "English" : "العربية"}</span>
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/70 p-3.5">
                <span className="text-xs font-bold text-foreground">
                  {language === "ar" ? "الوضع" : "Theme"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTheme(
                      theme === "dark" || resolvedTheme === "dark"
                        ? "light"
                        : "dark"
                    )
                  }
                  className="h-8 text-xs font-bold"
                >
                  {theme === "dark" || resolvedTheme === "dark" ? (
                    <>
                      <IconSun className="me-1 h-3.5 w-3.5" />
                      <span>فاتح</span>
                    </>
                  ) : (
                    <>
                      <IconMoon className="me-1 h-3.5 w-3.5" />
                      <span>داكن</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconBell className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-extrabold text-foreground">
                  {t.settingsNotifications}
                </h3>
              </div>

              {pushStatus !== "granted" && (
                <Button
                  size="sm"
                  onClick={handleRequestPush}
                  className="h-8 text-xs font-bold"
                >
                  {t.notifEnableBtn}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-border/70 p-3 hover:bg-muted/40">
                <span className="text-xs font-semibold text-foreground">
                  {t.notifDailyReminder}
                </span>
                <input
                  type="checkbox"
                  checked={notifDaily}
                  onChange={(e) => setNotifDaily(e.target.checked)}
                  className="h-4 w-4 rounded text-primary"
                />
              </label>

              {notifDaily && (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-border/70 p-3">
                  <span className="text-xs font-semibold text-foreground">
                    {t.notifReminderTime}
                  </span>
                  <Input
                    type="time"
                    value={notifTime}
                    onChange={(e) => setNotifTime(e.target.value)}
                    className="h-8 w-28 text-xs font-bold"
                  />
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-border/70 p-3 hover:bg-muted/40">
                <span className="text-xs font-semibold text-foreground">
                  {t.notifIncompleteReminder}
                </span>
                <input
                  type="checkbox"
                  checked={notifIncomplete}
                  onChange={(e) => setNotifIncomplete(e.target.checked)}
                  className="h-4 w-4 rounded text-primary"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-border/70 p-3 hover:bg-muted/40">
                <span className="text-xs font-semibold text-foreground">
                  {t.notifGroupAlerts}
                </span>
                <input
                  type="checkbox"
                  checked={notifAlerts}
                  onChange={(e) => setNotifAlerts(e.target.checked)}
                  className="h-4 w-4 rounded text-primary"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              {pushStatus === "granted" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                  className="h-8 rounded-xl text-xs font-bold"
                >
                  <IconBell className="me-1 h-3.5 w-3.5" />
                  <span>
                    {language === "ar"
                      ? "إرسال تنبيه تجريبي"
                      : "Send Test Push"}
                  </span>
                </Button>
              )}
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600">
                  تم حفظ التفضيلات
                </span>
              )}
              <Button
                size="sm"
                onClick={handleSaveNotifications}
                disabled={isSavingNotifs}
                className="ms-auto h-8 rounded-xl text-xs font-bold"
              >
                {language === "ar" ? "حفظ الإشعارات" : "Save Preferences"}
              </Button>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <IconDatabase className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-extrabold text-foreground">
                {t.settingsData}
              </h3>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="h-9 gap-1.5 rounded-xl text-xs font-bold"
              >
                <IconDownload className="h-4 w-4" />
                <span>{t.exportDataBtn}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAccount}
                className="h-9 gap-1.5 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10"
              >
                <IconTrash className="h-4 w-4" />
                <span>{t.deleteAccountBtn}</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
