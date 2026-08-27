"use client"

import { savePushSubscriptionAction } from "@/lib/groups/actions"

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Requests browser push permission and registers the push subscription.
 */
export async function registerPushNotifications(): Promise<{
  success: boolean
  permission: NotificationPermission
  error?: string
}> {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    return {
      success: false,
      permission: "denied",
      error: "Push notifications are not supported by this browser.",
    }
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      return {
        success: false,
        permission,
        error: "Notification permission was not granted.",
      }
    }

    const registration = await navigator.serviceWorker.ready
    const vapidKey =
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"

    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidKey)
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as any,
      })
    }

    const subJson = subscription.toJSON()
    if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
      await savePushSubscriptionAction({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
      })
    }

    return { success: true, permission: "granted" }
  } catch (err: any) {
    console.error("Push registration error:", err)
    return {
      success: false,
      permission: Notification.permission,
      error: err?.message || "Failed to register push subscription.",
    }
  }
}
