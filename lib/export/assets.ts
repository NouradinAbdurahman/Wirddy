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
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        assetCache.set(src, base64)
        resolve(base64)
      }
      reader.onerror = () =>
        reject(new Error(`Failed to convert ${src} to base64.`))
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.warn(`Asset preload warning for ${src}:`, err)
    return src
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

  try {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch logo asset: ${src} (status: ${response.status})`
      )
    }
    const blob = await response.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () =>
        reject(new Error(`Failed to convert ${src} to base64.`))
      reader.readAsDataURL(blob)
    })

    if (!validateEmbeddedLogoDataUrl(dataUrl)) {
      throw new Error(`Invalid embedded logo data URL generated for ${src}.`)
    }

    embeddedLogoCache[theme] = dataUrl
    return dataUrl
  } catch (err: any) {
    console.error(`Error loading embedded Wirddy logo (${theme}):`, err)
    throw new Error("Unable to load the Wirddy logo. Please try again.")
  }
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
      // complete === true but naturalWidth === 0 -> broken image
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
