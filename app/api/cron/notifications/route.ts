import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { sendPushNotification } from "@/lib/notifications/service"
import { isAuthorizedCronRequest, isReminderDue } from "@/lib/auth/cron"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }

  const { data: prefs, error } = await supabase
    .from("notification_preferences")
    .select("user_id, daily_reminder_enabled, reminder_time, timezone")
    .eq("daily_reminder_enabled", true)

  if (error || !prefs) {
    return NextResponse.json({ processed: 0, error: error?.message }, { status: 500 })
  }

  const now = new Date()
  let sentCount = 0

  for (const p of prefs as Array<{ user_id: string; reminder_time: string | null; timezone: string | null }>) {
    try {
      if (!isReminderDue(p.reminder_time || "20:00", p.timezone || "UTC", now)) continue
      const res = await sendPushNotification(p.user_id, {
        title: "وِردي | تذكير الورد اليومي",
        body: "حان موعد قراءة وردك القرآني لليوم. بارك الله في وقتك وطاعتك.",
        url: "/dashboard",
        tag: "wirddy-daily-reminder",
      })
      sentCount += res.sent
    } catch {
      // An invalid time zone skips that user only.
    }
  }

  return NextResponse.json({ success: true, notificationsSent: sentCount })
}

export const POST = GET
