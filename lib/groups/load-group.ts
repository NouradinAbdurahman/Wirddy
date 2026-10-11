import { cache } from "react"
import { getGroupByPublicId } from "./service"

/**
 * Loads a group once per request. Page metadata, the page itself and its
 * Open Graph image all need the same group, so this avoids repeating the
 * database round trips.
 */
export const loadGroup = cache(getGroupByPublicId)
