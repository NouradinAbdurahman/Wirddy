"use client"

import { useEffect, useState } from "react"
import {
  saveReadingProgressAction,
  saveBookmarkAction,
} from "@/lib/groups/actions"

export interface QueuedMutation {
  id: string
  action: "save_progress" | "save_bookmark"
  payload: any
  createdAt: string
  retryCount: number
}

const DB_NAME = "wirddy_offline_sync_db"
const DB_VERSION = 1
const STORE_NAME = "mutations"

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not supported in this environment."))
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Adds a mutation to the offline IndexedDB queue.
 */
export async function enqueueOfflineMutation(
  action: "save_progress" | "save_bookmark",
  payload: any
): Promise<void> {
  const mutation: QueuedMutation = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    action,
    payload,
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
  } catch (err) {
    // LocalStorage fallback if IndexedDB fails
    try {
      const raw = localStorage.getItem("wirddy_offline_mutations") || "[]"
      const list = JSON.parse(raw)
      list.push(mutation)
      localStorage.setItem("wirddy_offline_mutations", JSON.stringify(list))
    } catch {
      // ignore
    }
  }

  // Attempt instant flush if online
  if (typeof navigator !== "undefined" && navigator.onLine) {
    flushOfflineQueue().catch(console.error)
  }
}

/**
 * Retrieves all pending offline mutations.
 */
export async function getPendingOfflineMutations(): Promise<QueuedMutation[]> {
  try {
    const db = await openDatabase()
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    return new Promise((resolve, reject) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = reject
    })
  } catch {
    try {
      const raw = localStorage.getItem("wirddy_offline_mutations") || "[]"
      return JSON.parse(raw)
    } catch {
      return []
    }
  }
}

/**
 * Deletes a processed mutation from the queue.
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
    try {
      const raw = localStorage.getItem("wirddy_offline_mutations") || "[]"
      const list = JSON.parse(raw).filter((m: any) => m.id !== id)
      localStorage.setItem("wirddy_offline_mutations", JSON.stringify(list))
    } catch {
      // ignore
    }
  }
}

let isFlushing = false

/**
 * Replays all pending mutations against Supabase when connectivity resumes.
 */
export async function flushOfflineQueue(): Promise<{
  syncedCount: number
  errors: number
}> {
  if (isFlushing || (typeof navigator !== "undefined" && !navigator.onLine)) {
    return { syncedCount: 0, errors: 0 }
  }

  isFlushing = true
  let syncedCount = 0
  let errors = 0

  try {
    const pending = await getPendingOfflineMutations()
    for (const m of pending) {
      try {
        if (m.action === "save_progress") {
          const {
            groupPublicId,
            memberPublicId,
            weekNumber,
            dayNumber,
            isCompleted,
          } = m.payload
          const res = await saveReadingProgressAction(
            groupPublicId,
            memberPublicId,
            weekNumber,
            dayNumber,
            isCompleted
          )
          if (res.success) {
            await removeOfflineMutation(m.id)
            syncedCount++
          } else {
            errors++
          }
        } else if (m.action === "save_bookmark") {
          const { surahNumber, ayahNumber, juzNumber, note } = m.payload
          const res = await saveBookmarkAction(
            surahNumber,
            ayahNumber,
            juzNumber,
            note
          )
          if (res.success) {
            await removeOfflineMutation(m.id)
            syncedCount++
          } else {
            errors++
          }
        }
      } catch (err) {
        errors++
      }
    }
  } finally {
    isFlushing = false
  }

  return { syncedCount, errors }
}

/**
 * React hook to track online/offline status and pending sync queue.
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  )
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  const updateStatus = () => {
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine)
    }
    getPendingOfflineMutations().then((list) => setPendingCount(list.length))
  }

  useEffect(() => {
    updateStatus()

    const handleOnline = () => {
      setIsOnline(true)
      setIsSyncing(true)
      flushOfflineQueue()
        .then(() => updateStatus())
        .finally(() => setIsSyncing(false))
    }

    const handleOffline = () => {
      setIsOnline(false)
      updateStatus()
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    const interval = setInterval(updateStatus, 15000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  return { isOnline, pendingCount, isSyncing, flushQueue: flushOfflineQueue }
}
