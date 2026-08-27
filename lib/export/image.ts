import { toPng } from "html-to-image"
import { triggerBrowserDownload } from "./download"

export async function exportElementAsPng(
  elementId: string,
  filename: string
): Promise<string | null> {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Export element with ID "${elementId}" not found.`)
    return null
  }

  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2.2,
      skipFonts: true,
      cacheBust: false,
      filter: (node) => {
        if (node instanceof HTMLElement && node.dataset.noExport === "true") {
          return false
        }
        return true
      },
    })

    // Convert data URL to Blob and use the safe download helper
    // (direct link.download with Arabic filenames silently fails in Chrome/macOS)
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    triggerBrowserDownload(blob, `${filename}.png`)

    return dataUrl
  } catch (error) {
    console.error("Failed to export element as image:", error)
    throw error
  }
}
