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
 * Sliding-window rate limiter for anonymous abuse prevention.
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
