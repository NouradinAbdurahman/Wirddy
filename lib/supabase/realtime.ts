"use client"

import { useEffect } from "react"
import { getSupabaseBrowserClient } from "./client"

/**
 * Subscribes to realtime updates for group progress.
 */
export function useRealtimeGroupProgress(
  groupId: string | undefined,
  onUpdate: () => void
) {
  useEffect(() => {
    if (!groupId) return

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    const channel = supabase
      .channel(`group-progress-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reading_progress",
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          onUpdate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, onUpdate])
}

/**
 * Subscribes to realtime announcements for a group.
 */
export function useRealtimeAnnouncements(
  groupId: string | undefined,
  onUpdate: () => void
) {
  useEffect(() => {
    if (!groupId) return

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    const channel = supabase
      .channel(`group-announcements-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcements",
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          onUpdate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, onUpdate])
}

/**
 * Subscribes to realtime bookmarks for an authenticated user.
 */
export function useRealtimeBookmarks(
  userId: string | undefined,
  onUpdate: () => void
) {
  useEffect(() => {
    if (!userId) return

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    const channel = supabase
      .channel(`user-bookmarks-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          onUpdate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, onUpdate])
}
