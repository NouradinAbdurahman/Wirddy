import { getSafeDownloadFilename } from "./filenames"

/**
 * Diagnostic payload printed before each export download in non-production environments.
 */
export interface DownloadDiagnostics {
  filename: string
  mimeType: string
  size: number
  firstBytes: string
}

/**
 * Inspects the initial bytes of a Blob as a hexadecimal string.
 */
export async function getBlobFirstBytesHex(
  blob: Blob,
  byteCount: number = 8
): Promise<string> {
  if (!blob || blob.size === 0) return ""
  try {
    const slice = blob.slice(0, Math.min(blob.size, byteCount))
    const arrayBuffer = await slice.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  } catch {
    return ""
  }
}

/**
 * Centralized browser download pipeline.
 *
 * Requirements fulfilled:
 * 1. Validates real non-empty Blob instance.
 * 2. Validates & enforces correct MIME type according to extension (image/png, application/pdf, application/zip).
 * 3. Inspects & verifies magic byte signatures.
 * 4. Sanitizes filename with guaranteed correct extension and cross-browser safety.
 * 5. Uses standard HTML5 Anchor download with proper off-screen layout properties.
 * 6. Safely retains Object URL for 60 seconds to prevent premature revocation in Chromium.
 * 7. Emits diagnostic logging before download.
 */
export async function triggerBrowserDownload(
  blob: Blob,
  filename: string
): Promise<void> {
  if (!blob || !(blob instanceof Blob)) {
    throw new Error(
      "Cannot trigger download: provided argument is not a valid Blob."
    )
  }

  if (blob.size === 0) {
    throw new Error("Cannot trigger download: Blob is empty (0 bytes).")
  }

  if (typeof window === "undefined" || typeof document === "undefined") return

  // Detect file format from filename
  const lowerName = filename.toLowerCase()
  let expectedMime = blob.type
  let expectedExt = ""

  if (lowerName.endsWith(".png")) {
    expectedMime = "image/png"
    expectedExt = ".png"
  } else if (lowerName.endsWith(".pdf")) {
    expectedMime = "application/pdf"
    expectedExt = ".pdf"
  } else if (lowerName.endsWith(".zip")) {
    expectedMime = "application/zip"
    expectedExt = ".zip"
  }

  // Ensure Blob has the expected MIME type (wrap if missing or generic)
  const finalBlob =
    blob.type === expectedMime
      ? blob
      : new Blob([blob], { type: expectedMime || "application/octet-stream" })

  // Validate magic bytes
  const firstBytesHex = await getBlobFirstBytesHex(finalBlob, 8)

  if (expectedExt === ".png") {
    // PNG 8-byte signature: 89 50 4E 47 0D 0A 1A 0A
    if (!firstBytesHex.startsWith("89504e470d0a1a0a")) {
      console.warn(
        "[Wirddy Export] Warning: PNG header signature mismatch:",
        firstBytesHex
      )
    }
  } else if (expectedExt === ".pdf") {
    // PDF signature: 25 50 44 46 (%PDF)
    if (!firstBytesHex.startsWith("25504446")) {
      console.warn(
        "[Wirddy Export] Warning: PDF header signature mismatch:",
        firstBytesHex
      )
    }
  } else if (expectedExt === ".zip") {
    // ZIP signature: 50 4B 03 04 (PK..)
    if (
      !firstBytesHex.startsWith("504b0304") &&
      !firstBytesHex.startsWith("504b0506")
    ) {
      console.warn(
        "[Wirddy Export] Warning: ZIP header signature mismatch:",
        firstBytesHex
      )
    }
  }

  // Obtain clean, safe download filename with guaranteed extension
  const safeFilename = getSafeDownloadFilename(filename, expectedExt)

  // Diagnostic logging
  const diagnostics: DownloadDiagnostics = {
    filename: safeFilename,
    mimeType: finalBlob.type,
    size: finalBlob.size,
    firstBytes: firstBytesHex,
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[Wirddy Download Triggered]", diagnostics)
  }

  // Create Object URL for the validated Blob
  const objectUrl = URL.createObjectURL(finalBlob)

  // Create anchor element with safe layout properties (not display:none)
  const link = document.createElement("a")
  link.style.position = "fixed"
  link.style.left = "-99999px"
  link.style.top = "-99999px"
  link.style.opacity = "0"
  link.style.pointerEvents = "none"
  link.href = objectUrl
  link.download = safeFilename
  link.rel = "noopener"

  document.body.appendChild(link)

  try {
    // Dispatch native click event
    if (typeof MouseEvent !== "undefined") {
      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      )
    } else {
      link.click()
    }
  } finally {
    // Remove element from DOM
    if (document.body.contains(link)) {
      document.body.removeChild(link)
    }

    // Retain object URL for 60 seconds so Chromium's asynchronous DownloadManager
    // can safely finish fetching the stream without UUID fallback
    setTimeout(() => {
      try {
        URL.revokeObjectURL(objectUrl)
      } catch {
        // Ignore cleanup errors
      }
    }, 60000)
  }
}
