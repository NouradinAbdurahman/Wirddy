import { timingSafeEqual } from "crypto"

/**
 * Checks a cron request's `Authorization: Bearer <CRON_SECRET>` header.
 * Fails closed: when CRON_SECRET is not configured, every request is refused.
 */
export function isAuthorizedCronRequest(authorizationHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || !authorizationHeader) return false

  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(authorizationHeader)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

/** Minutes between scheduled reminder runs (see the cron migration). */
export const REMINDER_INTERVAL_MINUTES = 15

/**
 * Returns true when a reminder set for `reminderTime` ("HH:MM", in the
 * user's time zone) should be sent by the run at `now`. Each reminder falls
 * in exactly one run window, so it is sent once a day.
 */
export function isReminderDue(reminderTime: string, timeZone: string, now: Date): boolean {
  const match = /^(\d{1,2}):(\d{2})$/.exec(reminderTime.trim())
  if (!match) return false
  const target = Number(match[1]) * 60 + Number(match[2])

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now)
  const hour = Number(parts.find((p) => p.type === "hour")?.value)
  const minute = Number(parts.find((p) => p.type === "minute")?.value)
  const local = hour * 60 + minute

  // The run at `local` covers reminders set in (local - interval, local].
  const diff = (local - target + 1440) % 1440
  return diff < REMINDER_INTERVAL_MINUTES
}
