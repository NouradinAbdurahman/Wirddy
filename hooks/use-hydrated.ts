import { useSyncExternalStore } from "react"

const noopSubscribe = () => () => {}

/**
 * False during server rendering and hydration, true afterwards. Use it to
 * show browser-only values (theme, storage, permissions) without a mismatch
 * between server and client markup.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}
