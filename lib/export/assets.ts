import QRCode from "qrcode"
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
      return ""
    }
  }
}

/**
 * Generates a base64 QR Code data URL.
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 360,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
  } catch (err) {
    console.warn("Failed to generate QR code:", err)
    return ""
  }
}

/**
 * Retrieves the embedded base64 logo with caching and multiple fallbacks.
 */
export async function getEmbeddedWirddyLogo(
  theme: ExportTheme
): Promise<string> {
  if (embeddedLogoCache[theme]) {
    return embeddedLogoCache[theme]!
  }

  const primaryPath =
    theme === "light" ? "/wirddy-logo-black.png" : "/wirddy-logo-white.png"
  const secondaryPath =
    theme === "light" ? "/logo-black.png" : "/logo-white.png"

  try {
    const dataUrl = await preloadImageAsBase64(primaryPath)
    if (validateEmbeddedLogoDataUrl(dataUrl)) {
      embeddedLogoCache[theme] = dataUrl
      return dataUrl
    }
  } catch {
    // Fall through
  }

  try {
    const dataUrl = await preloadImageAsBase64(secondaryPath)
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
  qrCode?: string
}

/**
 * Preloads all essential Wirddy brand assets as base64 data URLs before export HTML generation.
 */
export async function preloadExportAssets(
  qrUrl?: string
): Promise<ExportAssets> {
  const defaultBase = "https://wirddy.vercel.app"
  let resolvedQrUrl = qrUrl
  if (!resolvedQrUrl) {
    if (
      typeof window !== "undefined" &&
      window.location?.pathname?.startsWith("/g/")
    ) {
      resolvedQrUrl = `${window.location.origin}${window.location.pathname}`
    } else {
      resolvedQrUrl = defaultBase
    }
  }

  const [wirddyLogoBlack, wirddyLogoWhite, logoBlack, logoWhite, qrCode] =
    await Promise.all([
      getEmbeddedWirddyLogo("light"),
      getEmbeddedWirddyLogo("dark"),
      preloadImageAsBase64("/logo-black.png"),
      preloadImageAsBase64("/logo-white.png"),
      generateQrDataUrl(resolvedQrUrl),
    ])

  return {
    wirddyLogoBlack,
    wirddyLogoWhite,
    logoBlack,
    logoWhite,
    qrCode: qrCode || undefined,
  }
}

/**
 * Ensures browser document fonts are loaded before rendering.
 * Also explicitly loads Cairo + Inter since Chrome needs them available
 * before html-to-image captures the off-canvas element.
 *
 * Cairo supports weights 300-700 only. Requesting 800/900 silently falls
 * back to the OS default which cannot render Arabic glyphs correctly.
 * We therefore load every valid Cairo weight and use weight 700 (bold)
 * for all "heavy" text in the export HTML.
 */
export async function ensureFontsReady(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return
  try {
    // Cairo supports weights 300–700; Inter supports 100–900.
    // Load all needed weights explicitly so Chrome has them in the
    // font cache before html-to-image snaps the off-canvas element.
    await Promise.all([
      document.fonts.load("300 16px Cairo"),
      document.fonts.load("400 16px Cairo"),
      document.fonts.load("500 16px Cairo"),
      document.fonts.load("600 16px Cairo"),
      document.fonts.load("700 16px Cairo"),
      document.fonts.load("700 24px Cairo"),
      document.fonts.load("400 24px Cairo"),
      document.fonts.load("400 16px Inter"),
      document.fonts.load("700 16px Inter"),
      document.fonts.load("400 16px Amiri"),
      document.fonts.load("700 16px Amiri"),
      document.fonts.load("400 24px Amiri"),
      document.fonts.load("700 24px Amiri"),
      document.fonts.load("400 16px 'Amiri Quran'"),
      document.fonts.ready,
    ])

    // Warm up Arabic shaping: inject a tiny off-screen element with Arabic
    // text so the browser fully shapes and rasterizes the glyphs before
    // html-to-image captures the SVG foreignObject.
    const warmup = document.createElement("span")
    warmup.setAttribute("aria-hidden", "true")
    warmup.style.cssText = [
      "position:absolute",
      "left:-9999px",
      "top:0",
      "font-family:Amiri, Cairo, sans-serif",
      "font-size:16px",
      "visibility:visible",
      "pointer-events:none",
      "direction:rtl",
      "unicode-bidi:embed",
    ].join(";")
    // Covers Arabic letters, tashkeel, and Quranic characters (alef wasla, quranic jazm)
    warmup.textContent = "سورة ٱلْفَاتِحَةِ سورة النَّمۡلِ سورة الأَحۡزَابِ ختمة وِردي"
    document.body.appendChild(warmup)

    // Wait one rAF so the browser can layout + rasterize the warmup text
    await new Promise<void>((r) => requestAnimationFrame(() => r()))

    document.body.removeChild(warmup)
  } catch {
    // Non-fatal: fall back to system fonts if loading fails
  }
}

/**
 * Cache for embedded font CSS base64 blobs (session-level, cleared on page reload).
 * Chrome strips CSS custom properties (var(--font-arabic)) inside SVG foreignObject.
 * Embedding the actual font bytes solves the blank-canvas issue in Chrome.
 *
 * IMPORTANT: We pass document.body (not the off-canvas element) to getFontEmbedCSS.
 * html-to-image's getUsedFonts() walks the node's computed styles to filter which
 * @font-face rules to embed. An off-canvas element may not have resolved computed
 * font families yet, causing getUsedFonts to return an empty set → empty fontEmbedCSS
 * → fonts not embedded → Chrome renders without Cairo/Inter.
 * Using document.body ensures all currently used fonts are included.
 */
let fontEmbedCSSCache: string | null = null

export async function getEmbeddedFontCSS(): Promise<string | undefined> {
  if (typeof window === "undefined" || typeof document === "undefined")
    return undefined

  // Return from cache after first successful call
  if (fontEmbedCSSCache !== null) return fontEmbedCSSCache

  try {
    // Use html-to-image's getFontEmbedCSS on document.body so it can see ALL
    // @font-face rules and ALL font-families currently used in the page.
    const { getFontEmbedCSS } = await import("html-to-image")
    const css = await getFontEmbedCSS(document.body)
    fontEmbedCSSCache = css || ""
    return fontEmbedCSSCache
  } catch {
    // Non-fatal: fonts will render from browser cache in most cases.
    // Do NOT cache the failure — let the next export retry.
    return undefined
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
