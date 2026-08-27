"use client"

import { useEffect } from "react"

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    // In development mode, automatically unregister any existing service workers
    // and clear caches to prevent Turbopack/Webpack chunk mismatch errors
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister()
        }
      })
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key)
          }
        })
      }
      return
    }

    // In production, register the service worker
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (
                  installingWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  console.log("Wirddy PWA updated with new cached version.")
                }
              }
            }
          }
        })
        .catch((error) => {
          console.error("ServiceWorker registration failed:", error)
        })
    })
  }, [])

  return null
}
