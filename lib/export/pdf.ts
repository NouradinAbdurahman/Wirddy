import { toPng } from "html-to-image"
import { jsPDF } from "jspdf"
import { triggerBrowserDownload } from "./download"

export async function exportScheduleAsPdf(
  elementIds: string[],
  filename: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (elementIds.length === 0) return

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < elementIds.length; i++) {
    const elId = elementIds[i]
    const element = document.getElementById(elId)
    if (!element) continue

    if (onProgress) {
      onProgress(i + 1, elementIds.length)
    }

    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2.2,
      skipFonts: true,
      cacheBust: false,
    })

    if (i > 0) {
      pdf.addPage()
    }

    const margin = 12
    const maxImgWidth = pageWidth - margin * 2
    const maxImgHeight = pageHeight - margin * 2

    const imgProps = pdf.getImageProperties(dataUrl)
    const imgRatio = imgProps.width / imgProps.height

    let imgWidth = maxImgWidth
    let imgHeight = maxImgWidth / imgRatio

    if (imgHeight > maxImgHeight) {
      imgHeight = maxImgHeight
      imgWidth = imgHeight * imgRatio
    }

    const xOffset = (pageWidth - imgWidth) / 2
    const yOffset = margin

    pdf.addImage(
      dataUrl,
      "PNG",
      xOffset,
      yOffset,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    )
  }

  // Use blob output + triggerBrowserDownload to ensure ASCII-safe filename
  // (pdf.save() with Arabic filenames fails silently in Chrome/Safari on macOS)
  const pdfBlob = pdf.output("blob")
  await triggerBrowserDownload(pdfBlob, `${filename}.pdf`)
}
