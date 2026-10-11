import { useSyncExternalStore } from "react"

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Reads a localStorage entry and re-renders when it changes, in this tab or
 * another. Returns null on the server and when storage is unavailable.
 * Pass null as the key to skip reading.
 */
export function useStorageValue(key: string | null): string | null {
  return useSyncExternalStore(
    subscribe,
    () => (key ? read(key) : null),
    () => null
  )
}

/** Writes a localStorage entry and notifies every `useStorageValue` reader. */
export function writeStorageValue(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Storage can be full or disabled; readers keep the previous value.
  }
  listeners.forEach((l) => l())
}
