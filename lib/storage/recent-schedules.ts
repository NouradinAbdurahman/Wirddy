export interface RecentScheduleItem {
  publicId?: string
  editToken?: string
  groupName: string
  title?: string
  description?: string
  weeksCount: number
  totalJuz: number
  updatedAt: string
  startDate?: string
  usesDates?: boolean
  occasionType?: "normal" | "ramadan"
  islamicYear?: number
  dailyDivisionEnabled?: boolean
  rotationStyle?: string
  rangeType?: string
}

const RECENT_KEY = "wirddy_recent_schedules_v1"
const MAX_RECENT = 10

export function getRecentSchedules(): RecentScheduleItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveRecentSchedule(item: RecentScheduleItem): void {
  if (typeof window === "undefined") return
  try {
    const list = getRecentSchedules()
    // Deduplicate by publicId or groupName
    const filtered = list.filter(
      (s) =>
        (item.publicId && s.publicId !== item.publicId) ||
        (!item.publicId && s.groupName !== item.groupName)
    )
    filtered.unshift({
      ...item,
      updatedAt: new Date().toISOString(),
    })
    const trimmed = filtered.slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(trimmed))
  } catch {
    // ignore
  }
}

export function removeRecentSchedule(identifier: string): void {
  if (typeof window === "undefined") return
  try {
    const list = getRecentSchedules()
    const filtered = list.filter(
      (s) => s.publicId !== identifier && s.groupName !== identifier
    )
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered))
  } catch {
    // ignore
  }
}

export function clearRecentSchedules(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(RECENT_KEY)
  } catch {
    // ignore
  }
}
