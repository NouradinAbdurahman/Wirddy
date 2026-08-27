import { ExportTheme } from "./types"

/**
 * In-memory cache for embedded base64 logos to guarantee deterministic, zero-network exports
 */
const embeddedLogoCache: Record<ExportTheme, string | null> = {
  light: null,
  dark: null,
}

export function clearEmbeddedLogoCache(): void {
  embeddedLogoCache.light = null
  embeddedLogoCache.dark = null
  assetCache.clear()
}

const assetCache = new Map<string, string>()

/**
 * Validates that an image string is a non-empty base64 PNG data URL.
 */
export function validateEmbeddedLogoDataUrl(dataUrl: string): boolean {
  if (!dataUrl || typeof dataUrl !== "string") return false
  if (!dataUrl.startsWith("data:image/png;base64,")) return false
  const payload = dataUrl.slice("data:image/png;base64,".length).trim()
  return payload.length > 50
}

/**
 * Fallback to convert an image path to base64 Data URL using an HTML5 Canvas element.
 */
function convertImageViaCanvas(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      reject(new Error("DOM environment unavailable for canvas conversion."))
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth || 600
        canvas.height = img.naturalHeight || 160
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          throw new Error("Failed to get 2D canvas context.")
        }
        ctx.drawImage(img, 0, 0)
        const dataUrl = canvas.toDataURL("image/png")
        if (validateEmbeddedLogoDataUrl(dataUrl)) {
          resolve(dataUrl)
        } else {
          reject(new Error("Canvas toDataURL returned invalid PNG data."))
        }
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () =>
      reject(new Error(`Failed to load image element: ${src}`))
    img.src = src
  })
}

/**
 * Loads an image path and converts it into a base64 Data URL.
 */
export async function preloadImageAsBase64(src: string): Promise<string> {
  if (assetCache.has(src)) {
    return assetCache.get(src)!
  }

  try {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image asset: ${src} (status: ${response.status})`
      )
    }
    const blob = await response.blob()
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = () =>
        reject(new Error(`Failed to convert ${src} to base64.`))
      reader.readAsDataURL(blob)
    })

    assetCache.set(src, base64)
    return base64
  } catch {
    try {
      const fallbackDataUrl = await convertImageViaCanvas(src)
      assetCache.set(src, fallbackDataUrl)
      return fallbackDataUrl
    } catch {
      return src
    }
  }
}

/**
 * Reusable helper that loads, validates, and caches the appropriate theme Wirddy logo as a base64 Data URL.
 * Light theme -> /wirddy-logo-black.png
 * Dark theme -> /wirddy-logo-white.png
 */
export async function getEmbeddedWirddyLogo(
  theme: ExportTheme
): Promise<string> {
  const cached = embeddedLogoCache[theme]
  if (cached && validateEmbeddedLogoDataUrl(cached)) {
    return cached
  }

  const src =
    theme === "dark" ? "/wirddy-logo-white.png" : "/wirddy-logo-black.png"

  // 1. Try Network / Cache fetch + FileReader
  try {
    const response = await fetch(src)
    if (response.ok) {
      const blob = await response.blob()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () =>
          reject(new Error(`Failed to convert ${src} to base64.`))
        reader.readAsDataURL(blob)
      })

      if (validateEmbeddedLogoDataUrl(dataUrl)) {
        embeddedLogoCache[theme] = dataUrl
        return dataUrl
      }
    }
  } catch {
    // Fall through to Canvas fallback
  }

  // 2. Try Image + Canvas conversion
  try {
    const dataUrl = await convertImageViaCanvas(src)
    if (validateEmbeddedLogoDataUrl(dataUrl)) {
      embeddedLogoCache[theme] = dataUrl
      return dataUrl
    }
  } catch {
    // Fall through
  }

  throw new Error("Unable to load the Wirddy logo. Please try again.")
}

export interface ExportAssets {
  wirddyLogoBlack: string
  wirddyLogoWhite: string
  logoBlack: string
  logoWhite: string
}

/**
 * Preloads all essential Wirddy brand assets as base64 data URLs before export HTML generation.
 */
export async function preloadExportAssets(): Promise<ExportAssets> {
  const [wirddyLogoBlack, wirddyLogoWhite, logoBlack, logoWhite] =
    await Promise.all([
      getEmbeddedWirddyLogo("light"),
      getEmbeddedWirddyLogo("dark"),
      preloadImageAsBase64("/logo-black.png"),
      preloadImageAsBase64("/logo-white.png"),
    ])

  return {
    wirddyLogoBlack,
    wirddyLogoWhite,
    logoBlack,
    logoWhite,
  }
}

/**
 * Ensures browser document fonts are loaded before rendering.
 */
export async function ensureFontsReady(): Promise<void> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready
    } catch {
      // Ignore if document.fonts is unsupported
    }
  }
}

/**
 * Waits for every <img> inside a container to finish loading and rendering before
 * resolving. Validates naturalWidth and avoids false positives when img.complete is true but 0x0.
 */
export function waitForImagesToLoad(
  container: HTMLElement,
  timeoutMs = 4000
): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"))
  if (images.length === 0) {
    return Promise.resolve()
  }

  const imageReady = async (img: HTMLImageElement) => {
    // If image is already complete and has valid natural dimensions
    if (img.complete) {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        if (typeof img.decode === "function") {
          try {
            await img.decode()
          } catch {
            // decode failure is non-fatal if image is rendered
          }
        }
        return
      }
      return
    }

    return new Promise<void>((resolve) => {
      const onSettle = async () => {
        img.removeEventListener("load", onSettle)
        img.removeEventListener("error", onSettle)
        if (img.naturalWidth > 0 && typeof img.decode === "function") {
          try {
            await img.decode()
          } catch {
            // ignore
          }
        }
        resolve()
      }

      img.addEventListener("load", onSettle)
      img.addEventListener("error", onSettle)
    })
  }

  const allImagesReady = Promise.all(images.map(imageReady)).then(
    () => undefined
  )
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))

  return Promise.race([allImagesReady, timeout])
}
