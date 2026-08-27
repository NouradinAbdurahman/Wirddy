"use client"

import { useEffect } from "react"

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for service worker updates periodically
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
    }
  }, [])

  return null
}
