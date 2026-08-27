import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { sendPushNotification } from "@/lib/notifications/service"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }

  // Fetch all active notification preferences
  const { data: prefs, error } = await supabase
    .from("notification_preferences")
    .select("user_id, daily_reminder_enabled, reminder_time, timezone")
    .eq("daily_reminder_enabled", true)

  if (error || !prefs) {
    return NextResponse.json(
      { processed: 0, error: error?.message },
      { status: 500 }
    )
  }

  let sentCount = 0
  const now = new Date()

  for (const p of prefs as any[]) {
    // Check user's current local hour
    try {
      const userTz = p.timezone || "UTC"
      const localTimeStr = now.toLocaleTimeString("en-GB", {
        timeZone: userTz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

      const targetTime = p.reminder_time || "20:00"

      // Match within 15 minute cron window
      const [localH] = localTimeStr.split(":").map(Number)
      const [targetH] = targetTime.split(":").map(Number)

      if (localH === targetH) {
        const res = await sendPushNotification(p.user_id, {
          title: "وِردي | تذكير الورد اليومي",
          body: "حان موعد قراءة وردك القرآني لليوم. بارك الله في وقتك وطاعتك.",
          url: "/dashboard",
          tag: "wirddy-daily-reminder",
        })
        if (res.sent > 0) sentCount += res.sent
      }
    } catch {
      // ignore timezone calculation errors
    }
  }

  return NextResponse.json({ success: true, notificationsSent: sentCount })
}
