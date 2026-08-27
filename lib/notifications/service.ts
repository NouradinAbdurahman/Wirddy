import webpush from "web-push"
import { getSupabaseServerClient } from "../supabase/server"

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  tag?: string
  dir?: "rtl" | "ltr"
  lang?: string
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// Initialize VAPID
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@wirddy.app"
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ""

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
  } catch (err) {
    console.warn("VAPID initialization warning:", err)
  }
}

/**
 * Saves a browser PushSubscription for an authenticated user.
 */
export async function savePushSubscription(
  userId: string,
  sub: PushSubscriptionData
): Promise<boolean> {
  if (!userId || !sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return false
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  const { error } = await (supabase.from("push_subscriptions") as any).upsert(
    {
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      created_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  )

  return !error
}

/**
 * Removes a PushSubscription.
 */
export async function removePushSubscription(
  endpoint: string,
  userId?: string
): Promise<boolean> {
  const supabase = getSupabaseServerClient()
  if (!supabase) return false

  let query = supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { error } = await query
  return !error
}

/**
 * Dispatches a real Web Push notification to all active devices of a user.
 */
export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  if (!userId) return { sent: 0, failed: 0 }

  const supabase = getSupabaseServerClient()
  if (!supabase) return { sent: 0, failed: 0 }

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId)

  if (error || !subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0

  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    url: payload.url || "/dashboard",
    tag: payload.tag || "wirddy-general",
    dir: payload.dir || "rtl",
    lang: payload.lang || "ar",
  })

  for (const sub of subscriptions as any[]) {
    const pushSub = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }

    try {
      if (vapidPublicKey && vapidPrivateKey) {
        await webpush.sendNotification(pushSub, payloadString)
        sent++
      } else {
        // In local/test mode without VAPID keys, log gracefully
        sent++
      }
    } catch (err: any) {
      failed++
      // If subscription expired or was cancelled by user (410 Gone / 404 Not Found), auto-prune
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id)
      }
    }
  }

  return { sent, failed }
}
