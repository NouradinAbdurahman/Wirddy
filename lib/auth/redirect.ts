/**
 * Validates and sanitizes a destination URL for post-login redirection.
 * Ensures the destination is a safe relative path to prevent open-redirect vulnerabilities.
 *
 * @param target The untrusted redirect target from query parameters.
 * @returns A safe relative path (defaults to '/').
 */
export function sanitizeRedirectUrl(target: string | null | undefined): string {
  if (!target || typeof target !== "string") {
    return "/"
  }

  const trimmed = target.trim()

  // Must start with '/' and not '//' (protocol-relative URL)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/"
  }

  // Reject URLs containing protocol schemes or javascript:/data: pseudo-protocols
  if (
    trimmed.includes(":") ||
    trimmed.includes("\\") ||
    trimmed.includes("%5C") ||
    trimmed.includes("%2F%2F")
  ) {
    return "/"
  }

  // Prevent redirect loops back to login or callback routes
  if (trimmed.startsWith("/login") || trimmed.startsWith("/auth/callback")) {
    return "/"
  }

  return trimmed
}
