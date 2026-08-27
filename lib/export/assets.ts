/**
 * Cache for preloaded base64 assets to guarantee deterministic, zero-network exports
 */
const assetCache = new Map<string, string>();

/**
 * Loads an image path and converts it into a base64 Data URL.
 */
export async function preloadImageAsBase64(src: string): Promise<string> {
  if (assetCache.has(src)) {
    return assetCache.get(src)!;
  }

  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to fetch image asset: ${src} (status: ${response.status})`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        assetCache.set(src, base64);
        resolve(base64);
      };
      reader.onerror = () => reject(new Error(`Failed to convert ${src} to base64.`));
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`Asset preload warning for ${src}:`, err);
    return src; // fallback to original path if fetch fails in non-standard environments
  }
}

export interface ExportAssets {
  wirddyLogoBlack: string;
  wirddyLogoWhite: string;
  logoBlack: string;
  logoWhite: string;
}

/**
 * Preloads all essential Wirddy brand assets as base64 data URLs.
 */
export async function preloadExportAssets(): Promise<ExportAssets> {
  const [wirddyLogoBlack, wirddyLogoWhite, logoBlack, logoWhite] = await Promise.all([
    preloadImageAsBase64('/wirddy-logo-black.png'),
    preloadImageAsBase64('/wirddy-logo-white.png'),
    preloadImageAsBase64('/logo-black.png'),
    preloadImageAsBase64('/logo-white.png'),
  ]);

  return {
    wirddyLogoBlack,
    wirddyLogoWhite,
    logoBlack,
    logoWhite,
  };
}

/**
 * Ensures browser document fonts are loaded before rendering.
 */
export async function ensureFontsReady(): Promise<void> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore if document.fonts is unsupported
    }
  }
}

/**
 * Waits for every <img> inside a container to finish loading (or fail) before
 * resolving, instead of assuming a fixed delay is enough. A fixed timeout is
 * often fine on a fast desktop connection but unreliable on mobile, where a
 * slower first-load network fetch can still be in flight when the export
 * snapshot is taken, silently dropping images like the brand logo. Falls
 * back to resolving after `timeoutMs` so a single stuck image can't hang the
 * export indefinitely.
 */
export function waitForImagesToLoad(container: HTMLElement, timeoutMs = 4000): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  if (images.length === 0) {
    return Promise.resolve();
  }

  const imageReady = (img: HTMLImageElement) =>
    new Promise<void>((resolve) => {
      if (img.complete) {
        resolve();
        return;
      }
      const onSettle = () => {
        img.removeEventListener('load', onSettle);
        img.removeEventListener('error', onSettle);
        resolve();
      };
      img.addEventListener('load', onSettle);
      img.addEventListener('error', onSettle);
    });

  const allImagesReady = Promise.all(images.map(imageReady)).then(() => undefined);
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));

  return Promise.race([allImagesReady, timeout]);
}
