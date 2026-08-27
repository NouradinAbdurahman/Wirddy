import crypto from "crypto"

const BASE62_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

/**
 * Generates a cryptographically random, unguessable public ID (default: 14 characters).
 * 62^14 = 1.24 × 10^25 combinations (approx 83 bits of entropy).
 */
export function generatePublicId(length = 14): string {
  const bytes = crypto.randomBytes(length)
  let result = ""
  for (let i = 0; i < length; i++) {
    result += BASE62_ALPHABET[bytes[i] % BASE62_ALPHABET.length]
  }
  return result
}

/**
 * Generates a 32-byte (256-bit) cryptographically random secret edit token.
 */
export function generateEditToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Computes the SHA-256 hex digest of a secret edit token.
 */
export function hashEditToken(token: string): string {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid token provided for hashing.")
  }
  return crypto.createHash("sha256").update(token.trim()).digest("hex")
}

/**
 * Verifies a raw edit token against a stored SHA-256 hash in constant time.
 */
export function verifyEditToken(rawToken: string, storedHash: string): boolean {
  if (!rawToken || !storedHash || typeof rawToken !== "string") {
    return false
  }

  try {
    const computedHash = hashEditToken(rawToken)
    const bufA = Buffer.from(computedHash, "hex")
    const bufB = Buffer.from(storedHash, "hex")

    if (bufA.length !== bufB.length) {
      return false
    }

    return crypto.timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

/**
 * Generates an unguessable, non-sensitive public identifier for a group member.
 * e.g. "m_a8f3b9c1d2e4"
 */
export function generateMemberPublicId(seedOrInput?: string): string {
  if (seedOrInput) {
    const hash = crypto
      .createHash("sha256")
      .update(seedOrInput)
      .digest("hex")
      .slice(0, 12)
    return `m_${hash}`
  }
  const bytes = crypto.randomBytes(6).toString("hex")
  return `m_${bytes}`
}

