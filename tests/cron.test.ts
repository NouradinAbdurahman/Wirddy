import { afterEach, describe, expect, it } from "vitest"
import { isAuthorizedCronRequest, isReminderDue } from "../lib/auth/cron"

const original = process.env.CRON_SECRET

afterEach(() => {
  if (original === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = original
})

describe("cron authorization", () => {
  it("refuses every request when CRON_SECRET is not set", () => {
    delete process.env.CRON_SECRET
    expect(isAuthorizedCronRequest(null)).toBe(false)
    expect(isAuthorizedCronRequest("Bearer ")).toBe(false)
    expect(isAuthorizedCronRequest("Bearer anything")).toBe(false)
  })

  it("accepts only the exact bearer secret", () => {
    process.env.CRON_SECRET = "s3cret"
    expect(isAuthorizedCronRequest("Bearer s3cret")).toBe(true)
    expect(isAuthorizedCronRequest("Bearer s3cre")).toBe(false)
    expect(isAuthorizedCronRequest("s3cret")).toBe(false)
    expect(isAuthorizedCronRequest(null)).toBe(false)
  })
})

describe("reminder timing", () => {
  const at = (iso: string) => new Date(iso)

  it("sends a 20:30 reminder in the 20:30 run, not at 20:00", () => {
    expect(isReminderDue("20:30", "UTC", at("2026-10-11T20:00:00Z"))).toBe(false)
    expect(isReminderDue("20:30", "UTC", at("2026-10-11T20:30:00Z"))).toBe(true)
    expect(isReminderDue("20:30", "UTC", at("2026-10-11T20:45:00Z"))).toBe(false)
  })

  it("sends an off-grid time exactly once a day", () => {
    let sends = 0
    for (let m = 0; m < 24 * 60; m += 15) {
      const now = new Date(Date.UTC(2026, 9, 11, 0, m))
      if (isReminderDue("07:07", "UTC", now)) sends++
    }
    expect(sends).toBe(1)
  })

  it("uses the member's time zone", () => {
    // 17:30 UTC is 20:30 in Riyadh (UTC+3).
    expect(isReminderDue("20:30", "Asia/Riyadh", at("2026-10-11T17:30:00Z"))).toBe(true)
    expect(isReminderDue("20:30", "Asia/Riyadh", at("2026-10-11T20:30:00Z"))).toBe(false)
  })

  it("handles midnight wrap", () => {
    expect(isReminderDue("23:55", "UTC", at("2026-10-12T00:00:00Z"))).toBe(true)
  })
})
