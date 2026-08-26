import { fetchAyah } from './api';
import { normalizeApiAyah } from './normalize';
import { QuranLocation } from './types';

/**
 * Fetches a single Ayah from the API and normalizes it to QuranLocation.
 */
export async function getAyahLocation(globalAyahNumber: number): Promise<QuranLocation> {
  const rawAyah = await fetchAyah(globalAyahNumber);
  return normalizeApiAyah(rawAyah);
}
