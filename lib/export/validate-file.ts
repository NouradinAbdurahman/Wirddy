export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a PNG Blob:
 * - Checks Blob instance and non-zero size
 * - Checks MIME type (image/png)
 * - Verifies PNG 8-byte magic header [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
 */
export async function validatePngBlob(blob: Blob): Promise<ValidationResult> {
  if (!blob || !(blob instanceof Blob)) {
    return { isValid: false, error: 'Invalid or missing Blob object.' };
  }

  if (blob.size === 0) {
    return { isValid: false, error: 'Generated PNG is empty (0 bytes).' };
  }

  if (blob.type && !blob.type.includes('png')) {
    return { isValid: false, error: `Invalid MIME type for PNG: "${blob.type}".` };
  }

  try {
    const buffer = await blob.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

    if (bytes.length < 8) {
      return { isValid: false, error: 'File too small to contain a valid PNG header.' };
    }

    for (let i = 0; i < 8; i++) {
      if (bytes[i] !== pngSignature[i]) {
        return { isValid: false, error: 'PNG magic bytes signature check failed.' };
      }
    }

    return { isValid: true };
  } catch (err) {
    return { isValid: false, error: `Failed to inspect PNG binary: ${String(err)}` };
  }
}

/**
 * Validates a PDF Blob:
 * - Checks Blob instance and non-zero size
 * - Checks MIME type (application/pdf)
 * - Verifies PDF 5-byte header (%PDF- -> [0x25, 0x50, 0x44, 0x46, 0x2D])
 */
export async function validatePdfBlob(blob: Blob): Promise<ValidationResult> {
  if (!blob || !(blob instanceof Blob)) {
    return { isValid: false, error: 'Invalid or missing Blob object.' };
  }

  if (blob.size === 0) {
    return { isValid: false, error: 'Generated PDF is empty (0 bytes).' };
  }

  if (blob.type && !blob.type.includes('pdf')) {
    return { isValid: false, error: `Invalid MIME type for PDF: "${blob.type}".` };
  }

  try {
    const buffer = await blob.slice(0, 5).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const pdfSignature = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

    if (bytes.length < 5) {
      return { isValid: false, error: 'File too small to contain a valid PDF header.' };
    }

    for (let i = 0; i < 5; i++) {
      if (bytes[i] !== pdfSignature[i]) {
        return { isValid: false, error: 'PDF signature check failed (missing %PDF- header).' };
      }
    }

    return { isValid: true };
  } catch (err) {
    return { isValid: false, error: `Failed to inspect PDF binary: ${String(err)}` };
  }
}

/**
 * Validates a ZIP Blob:
 * - Checks Blob instance and non-zero size
 * - Verifies ZIP 4-byte header (PK\x03\x04 -> [0x50, 0x4B, 0x03, 0x04])
 */
export async function validateZipBlob(blob: Blob): Promise<ValidationResult> {
  if (!blob || !(blob instanceof Blob)) {
    return { isValid: false, error: 'Invalid or missing Blob object.' };
  }

  if (blob.size === 0) {
    return { isValid: false, error: 'Generated ZIP is empty (0 bytes).' };
  }

  try {
    const buffer = await blob.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const zipSignature = [0x50, 0x4b, 0x03, 0x04]; // PK\x03\x04

    if (bytes.length < 4) {
      return { isValid: false, error: 'File too small to contain a valid ZIP header.' };
    }

    for (let i = 0; i < 4; i++) {
      if (bytes[i] !== zipSignature[i]) {
        return { isValid: false, error: 'ZIP signature check failed (missing PK header).' };
      }
    }

    return { isValid: true };
  } catch (err) {
    return { isValid: false, error: `Failed to inspect ZIP binary: ${String(err)}` };
  }
}
