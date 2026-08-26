/**
 * Triggers a browser file download from a Blob, managing object URL creation and revocation.
 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  // Cleanup after browser triggers download
  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Ignore cleanup errors
    }
  }, 1000);
}
