/**
 * Triggers a browser file download from a Blob, managing object URL creation and revocation.
 *
 * NOTE: The HTML `download` attribute silently fails in Chrome/Safari on macOS when the
 * filename contains non-ASCII characters (Arabic, etc.), causing the browser to fall back
 * to the blob URL UUID (no extension, unreadable file). We force ASCII-safe names here.
 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return

  // Force an ASCII-safe filename so the `download` attribute is respected by all browsers.
  // Non-ASCII chars (Arabic numerals, Arabic text) are transliterated or stripped.
  const safeFilename = toAsciiFriendlyFilename(filename)

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.style.display = "none"
  link.href = url
  link.download = safeFilename

  document.body.appendChild(link)
  link.click()

  // Cleanup after browser triggers download
  setTimeout(() => {
    try {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      // Ignore cleanup errors
    }
  }, 2000)
}

/**
 * Converts a filename that may contain Arabic/Unicode characters into a safe ASCII filename.
 * Preserves the file extension, transliterates common patterns, strips the rest.
 */
function toAsciiFriendlyFilename(filename: string): string {
  if (!filename) return "Wirddy-export"

  // Split extension off
  const lastDot = filename.lastIndexOf(".")
  const hasExt = lastDot > 0 && lastDot < filename.length - 1
  const ext = hasExt ? filename.slice(lastDot) : "" // e.g. ".png", ".pdf", ".zip"
  const base = hasExt ? filename.slice(0, lastDot) : filename

  // Common Arabic transliterations used in Wirddy filenames
  const transliterated = base
    .replace(/الأسبوع/g, "Week")
    .replace(/الخطة-كاملة/g, "Full-Plan")
    .replace(/جميع-الأسابيع/g, "All-Weeks")
    // Arabic-Indic digits → Western digits
    .replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(d))
    )
    // Strip remaining non-ASCII characters
    .replace(/[^\x20-\x7E]/g, "")
    // Clean up any double-dashes or leading/trailing dashes
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim()

  const safeName = transliterated || "Wirddy-export"
  return `${safeName}${ext}`
}
