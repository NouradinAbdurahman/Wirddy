/**
 * Triggers a browser file download from a Blob.
 *
 * CROSS-BROWSER STRATEGY:
 *
 * Chrome breaks the "user gesture" chain after any `await`. When link.click()
 * is called inside an async export pipeline (font loading → rAF waits → toBlob
 * → etc.), Chrome no longer considers it user-initiated and silently ignores
 * link.download, using the blob URL UUID as filename instead.
 *
 * Fix: Use the File System Access API (showSaveFilePicker) in Chrome — this API
 * shows a native "Save As" dialog and does NOT require the original user gesture
 * to still be active. It pre-fills the filename correctly.
 *
 * Safari / Firefox don't have this issue and the classic blob URL approach works fine.
 */
export async function triggerBrowserDownload(
  blob: Blob,
  filename: string
): Promise<void> {
  if (typeof window === "undefined") return

  const safeFilename = toAsciiFriendlyFilename(filename)
  const ext = safeFilename.split(".").pop()?.toLowerCase() || "bin"

  // --- Chrome path: File System Access API ---
  // showSaveFilePicker works even in async context and always preserves filename.
  if ("showSaveFilePicker" in window) {
    const mimeMap: Record<string, string> = {
      png: "image/png",
      pdf: "application/pdf",
      zip: "application/zip",
    }
    const mimeType = mimeMap[ext] ?? "application/octet-stream"

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: safeFilename,
        types: [
          {
            description: "Download",
            accept: { [mimeType]: [`.${ext}`] },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (err: unknown) {
      // AbortError = user clicked Cancel in the dialog — do nothing
      if ((err as { name?: string })?.name === "AbortError") return
      // Any other error: fall through to the classic approach below
      console.warn("[Wirddy] showSaveFilePicker failed, falling back:", err)
    }
  }

  // --- Safari / Firefox path: classic blob URL anchor ---
  // Safari doesn't break the user gesture chain through await, so link.download
  // is respected and the filename is preserved.
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.style.display = "none"
  link.href = url
  link.download = safeFilename

  document.body.appendChild(link)
  link.click()

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
 * Preserves the file extension. Transliterates common Arabic strings used in Wirddy filenames.
 *
 * Needed because the HTML <a download> attribute is silently ignored by Chrome/Safari when
 * the filename contains non-ASCII characters.
 */
function toAsciiFriendlyFilename(filename: string): string {
  if (!filename) return "Wirddy-export"

  const lastDot = filename.lastIndexOf(".")
  const hasExt = lastDot > 0 && lastDot < filename.length - 1
  const ext = hasExt ? filename.slice(lastDot) : "" // e.g. ".png", ".pdf", ".zip"
  const base = hasExt ? filename.slice(0, lastDot) : filename

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
    // Clean up double-dashes or leading/trailing dashes
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim()

  const safeName = transliterated || "Wirddy-export"
  return `${safeName}${ext}`
}
