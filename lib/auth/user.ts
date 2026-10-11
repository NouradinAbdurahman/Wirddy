export interface UserProfileInfo {
  email: string
  fullName: string
  firstName: string
  avatarUrl?: string
}

/**
 * Safely extracts user profile details from Supabase / Google OAuth user metadata.
 * Correctly extracts the first name for the compact header while preserving full name and email for the dropdown.
 *
 * @param user Supabase Auth User object
 * @returns UserProfileInfo or null
 */
/** Shape of the Supabase user fields this helper reads. */
export interface AuthUserLike {
  email?: string | null
  user_metadata?: Record<string, unknown> | null
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

export function extractUserProfile(
  user: AuthUserLike | null | undefined
): UserProfileInfo | null {
  if (!user || typeof user !== "object") {
    return null
  }

  const metadata = user.user_metadata || {}
  const email = text(user.email)

  // 1. Full name: metadata name, else the email's local part
  const fullName =
    text(metadata.full_name) || text(metadata.name) || email.split("@")[0] || "User"

  // 2. First name: given name, else the first word of the full name
  const firstName =
    text(metadata.given_name) ||
    text(metadata.first_name) ||
    fullName.split(/\s+/)[0] ||
    fullName

  // 3. Avatar URL
  const avatarUrl = text(metadata.avatar_url) || text(metadata.picture) || undefined

  return { email, fullName, firstName, avatarUrl }
}
