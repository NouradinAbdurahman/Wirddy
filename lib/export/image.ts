import { toPng } from "html-to-image"

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

    const link = document.createElement("a")
    link.download = `${filename}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return dataUrl
  } catch (error) {
    console.error("Failed to export element as image:", error)
    throw error
  }
}
