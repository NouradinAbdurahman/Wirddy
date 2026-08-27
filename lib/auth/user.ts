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
export function extractUserProfile(user: any): UserProfileInfo | null {
  if (!user || typeof user !== "object") {
    return null
  }

  const metadata = user.user_metadata || {}

  // 1. Full name resolution
  const rawFullName =
    metadata.full_name ||
    metadata.name ||
    (user.email ? user.email.split("@")[0] : "User")

  const fullName =
    typeof rawFullName === "string" && rawFullName.trim().length > 0
      ? rawFullName.trim()
      : "User"

  // 2. First name resolution: check given_name first, then extract first token from full_name
  let firstName = metadata.given_name || metadata.first_name || ""

  if (
    (!firstName ||
      typeof firstName !== "string" ||
      firstName.trim().length === 0) &&
    fullName
  ) {
    const words = fullName.split(/\s+/)
    if (words.length > 0 && words[0] && words[0].trim().length > 0) {
      firstName = words[0].trim()
    }
  }

  if (
    !firstName ||
    typeof firstName !== "string" ||
    firstName.trim().length === 0
  ) {
    firstName = fullName
  }

  // 3. Avatar URL
  const rawAvatar = metadata.avatar_url || metadata.picture || undefined
  const avatarUrl =
    typeof rawAvatar === "string" && rawAvatar.trim().length > 0
      ? rawAvatar.trim()
      : undefined

  return {
    email: typeof user.email === "string" ? user.email.trim() : "",
    fullName,
    firstName: typeof firstName === "string" ? firstName.trim() : "User",
    avatarUrl,
  }
}
