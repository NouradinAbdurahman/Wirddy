"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { saveReadingProgressAction, saveBookmarkAction } from "@/lib/groups/actions"

/**
 * Offline queue for changes made without a connection. Changes are stored in
 * IndexedDB (localStorage when IndexedDB is unavailable) and replayed in
 * order when the browser comes back online.
 */

export interface ProgressPayload {
  groupPublicId: string
  memberPublicId: string
  weekNumber: number
  dayNumber: number
  isCompleted: boolean
}

export interface BookmarkPayload {
  surahNumber: number
  ayahNumber: number
  juzNumber: number
  note?: string
}

export type QueuedMutation = {
  id: string
  createdAt: string
  retryCount: number
} & (
  | { action: "save_progress"; payload: ProgressPayload }
  | { action: "save_bookmark"; payload: BookmarkPayload }
)

type MutationInput =
  | { action: "save_progress"; payload: ProgressPayload }
  | { action: "save_bookmark"; payload: BookmarkPayload }

const DB_NAME = "wirddy_offline_sync_db"
const DB_VERSION = 1
const STORE_NAME = "mutations"
const FALLBACK_KEY = "wirddy_offline_mutations"

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not supported in this environment."))
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function readFallback(): QueuedMutation[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(FALLBACK_KEY) || "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeFallback(list: QueuedMutation[]) {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(list))
  } catch {
    // Storage full or disabled: the change is lost, as it would be without a queue.
  }
}

/**
 * Adds a change to the offline queue.
 */
export async function enqueueOfflineMutation(input: MutationInput): Promise<void> {
  const mutation: QueuedMutation = {
    ...input,
    // Timestamp prefix keeps the queue in creation order.
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  }

  try {
    const db = await openDatabase()
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put(mutation)
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve
      tx.onerror = reject
    })
  } catch {
    writeFallback([...readFallback(), mutation])
  }
  notifyQueueChanged()
}

/**
 * Returns all queued changes, oldest first.
 */
export async function getPendingOfflineMutations(): Promise<QueuedMutation[]> {
  try {
    const db = await openDatabase()
    const store = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME)
    const list = await new Promise<QueuedMutation[]>((resolve, reject) => {
      const req = store.getAll()
      req.onsuccess = () => resolve((req.result as QueuedMutation[]) || [])
      req.onerror = reject
    })
    return list.sort((a, b) => a.id.localeCompare(b.id))
  } catch {
    return readFallback()
  }
}

/**
 * Removes a replayed change from the queue.
 */
export async function removeOfflineMutation(id: string): Promise<void> {
  try {
    const db = await openDatabase()
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).delete(id)
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve
      tx.onerror = reject
    })
  } catch {
    writeFallback(readFallback().filter((m) => m.id !== id))
  }
  notifyQueueChanged()
}

function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine
}

/**
 * Saves reading progress, or queues it when the device is offline or the
 * request cannot reach the server. A queued change counts as saved for the
 * UI and is sent once the connection returns.
 */
export async function saveProgressOrQueue(
  payload: ProgressPayload
): Promise<{ success: boolean; queued?: boolean; reason?: string }> {
  if (isOffline()) {
    await enqueueOfflineMutation({ action: "save_progress", payload })
    return { success: true, queued: true }
  }
  try {
    const res = await saveReadingProgressAction(
      payload.groupPublicId,
      payload.memberPublicId,
      payload.weekNumber,
      payload.dayNumber,
      payload.isCompleted
    )
    return { success: res.success, reason: res.data?.reason }
  } catch {
    // The server action request itself failed, which means no connection.
    await enqueueOfflineMutation({ action: "save_progress", payload })
    return { success: true, queued: true }
  }
}

let isFlushing = false

/**
 * Replays queued changes in order. Changes the server refuses for good
 * (not allowed, invalid, or gone) are dropped; others stay for the next try.
 */
export async function flushOfflineQueue(): Promise<{ syncedCount: number; errors: number }> {
  if (isFlushing || isOffline()) return { syncedCount: 0, errors: 0 }

  isFlushing = true
  let syncedCount = 0
  let errors = 0

  try {
    for (const m of await getPendingOfflineMutations()) {
      try {
        if (m.action === "save_progress") {
          const p = m.payload
          const res = await saveReadingProgressAction(
            p.groupPublicId,
            p.memberPublicId,
            p.weekNumber,
            p.dayNumber,
            p.isCompleted
          )
          const permanent =
            res.data?.reason === "forbidden" ||
            res.data?.reason === "invalid" ||
            res.data?.reason === "not_found"
          if (res.success) syncedCount++
          else errors++
          if (res.success || permanent) await removeOfflineMutation(m.id)
        } else {
          const p = m.payload
          const res = await saveBookmarkAction(p.surahNumber, p.ayahNumber, p.juzNumber, p.note)
          if (res.success) {
            syncedCount++
            await removeOfflineMutation(m.id)
          } else {
            errors++
          }
        }
      } catch {
        // Still unreachable: stop and keep the rest for the next attempt.
        errors++
        break
      }
    }
  } finally {
    isFlushing = false
  }

  return { syncedCount, errors }
}

// Lets components re-read the queue size after it changes.
const queueListeners = new Set<() => void>()
function notifyQueueChanged() {
  queueListeners.forEach((l) => l())
}

function subscribeOnline(listener: () => void) {
  window.addEventListener("online", listener)
  window.addEventListener("offline", listener)
  return () => {
    window.removeEventListener("online", listener)
    window.removeEventListener("offline", listener)
  }
}

/**
 * Tracks connectivity and the queue size, and replays the queue when the
 * app starts online or the connection comes back.
 */
export function useOfflineSync() {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  )
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const refreshCount = () => {
      getPendingOfflineMutations().then((list) => setPendingCount(list.length))
    }
    queueListeners.add(refreshCount)
    refreshCount()
    return () => {
      queueListeners.delete(refreshCount)
    }
  }, [])

  useEffect(() => {
    if (!isOnline) return
    let active = true
    getPendingOfflineMutations().then((list) => {
      if (!active || list.length === 0) return
      setIsSyncing(true)
      flushOfflineQueue().finally(() => {
        if (active) setIsSyncing(false)
      })
    })
    return () => {
      active = false
    }
  }, [isOnline])

  return { isOnline, pendingCount, isSyncing, flushQueue: flushOfflineQueue }
}
