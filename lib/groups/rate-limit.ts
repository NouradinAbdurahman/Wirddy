import { getSupabaseServerClient } from "../supabase/server"

interface RateLimitRecord {
  timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Periodic cleanup every 5 minutes to prevent memory accumulation
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 600000)
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key)
      }
    }
  }, 300000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetInMs: number
}

/**
 * In-memory sliding-window rate limiter. Each server instance keeps its own
 * counts, so on serverless hosting this is only a fallback; use
 * `checkSharedRateLimit` in request handlers.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const key = identifier.trim() || "anonymous"

  let record = rateLimitStore.get(key)
  if (!record) {
    record = { timestamps: [] }
    rateLimitStore.set(key, record)
  }

  // Remove timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs)

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0]
    const resetInMs = Math.max(0, windowMs - (now - oldestTimestamp))
    return {
      allowed: false,
      remaining: 0,
      resetInMs,
    }
  }

  record.timestamps.push(now)
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetInMs: windowMs,
  }
}

/**
 * Resets rate limit records (useful for test isolation).
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear()
}

/**
 * Rate limiter shared by every server instance. Counts are kept in Postgres
 * through the `check_rate_limit` function (see the rate limit migration),
 * so the limit holds on serverless hosting where instances come and go.
 * Falls back to the in-memory limiter when the database is not reachable.
 */
export async function checkSharedRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const supabase = getSupabaseServerClient()
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc("check_rate_limit", {
        p_key: identifier.trim() || "anonymous",
        p_max: maxRequests,
        p_window_seconds: Math.ceil(windowMs / 1000),
      })
      if (!error && typeof data === "boolean") {
        return { allowed: data, remaining: data ? 1 : 0, resetInMs: data ? 0 : windowMs }
      }
    } catch {
      // Fall through to the in-memory limiter.
    }
  }
  return checkRateLimit(identifier, maxRequests, windowMs)
}
