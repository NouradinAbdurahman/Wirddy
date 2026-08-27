import JSZip from "jszip"
import { GeneratedSchedule, MemberConfig } from "../scheduler/types"
import { ExportProgressCallback, ExportRenderOptions } from "./types"
import { renderMemberPersonalSchedulePngBlob } from "./render-week"
import { sanitizeFilename } from "./filenames"

/**
 * Validates whether a generated Blob is a valid PNG by checking its 8-byte PNG signature:
 * [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
 */
export async function verifyPngBlob(blob: Blob): Promise<boolean> {
  if (!blob || blob.size < 8) return false
  const buffer = await blob.slice(0, 8).arrayBuffer()
  const bytes = new Uint8Array(buffer)
  return (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  )
}

/**
 * Generates an individual 4K PNG schedule card for every member in the group,
 * verifies each image, and compresses them into a single ZIP archive.
 */
export async function createAllMembersZip(
  schedule: GeneratedSchedule,
  members: MemberConfig[],
  groupPublicId?: string,
  options?: ExportRenderOptions,
  onProgress?: ExportProgressCallback
): Promise<Blob> {
  const zip = new JSZip()
  const total = members.length
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://wirddy.app"

  const isArabic = options?.language ? options.language === "ar" : true

  for (let i = 0; i < members.length; i++) {
    const member = members[i]
    if (onProgress) {
      const msg = isArabic
        ? `جارٍ تجهيز بطاقة ${member.name} (${i + 1}/${total})...`
        : `Rendering card for ${member.name} (${i + 1}/${total})...`
      onProgress(i + 1, total, msg)
    }

    const memberPublicId = member.publicId || member.id
    const memberQrUrl = groupPublicId
      ? `${origin}/g/${groupPublicId}/member/${memberPublicId}`
      : undefined

    const pngBlob = await renderMemberPersonalSchedulePngBlob(
      member,
      schedule,
      options,
      memberQrUrl
    )

    const isValid = await verifyPngBlob(pngBlob)
    if (!isValid) {
      throw new Error(`Generated PNG for member ${member.name} is corrupted.`)
    }

    const safeMemberName = sanitizeFilename(member.name)
    const safeGroupName = sanitizeFilename(schedule.groupName)
    const fileName = `${safeMemberName} - ${safeGroupName}.png`

    zip.file(fileName, pngBlob)
  }

  if (onProgress) {
    const compressingMsg = isArabic
      ? "جارٍ ضغط ملفات الأعضاء في أرشيف ZIP..."
      : "Compressing member cards into ZIP archive..."
    onProgress(total, total, compressingMsg)
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/zip",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  })

  return zipBlob
}
