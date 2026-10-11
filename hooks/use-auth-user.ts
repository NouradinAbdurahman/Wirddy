"use client"

import { useSyncExternalStore } from "react"
import type { User } from "@supabase/supabase-js"

/**
 * Signed-in user shared by every component on the page. The Supabase client
 * (about 330 KB of JavaScript) is loaded on first use instead of with the
 * page, and a single session listener serves all subscribers.
 */
interface AuthState {
  user: User | null
  /** False until the first session check finishes. */
  ready: boolean
}

const SERVER_STATE: AuthState = { user: null, ready: false }
let state: AuthState = SERVER_STATE
let started = false
const listeners = new Set<() => void>()

function setState(next: AuthState) {
  state = next
  listeners.forEach((l) => l())
}

function start() {
  if (started) return
  started = true
  import("@/lib/supabase/client").then(({ getSupabaseBrowserClient }) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setState({ user: null, ready: true })
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, ready: true })
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, ready: true })
    })
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  start()
  return () => {
    listeners.delete(listener)
  }
}

export function useAuthUser(): AuthState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE
  )
}

export async function signOutUser(): Promise<void> {
  const { getSupabaseBrowserClient } = await import("@/lib/supabase/client")
  await getSupabaseBrowserClient()?.auth.signOut()
}
