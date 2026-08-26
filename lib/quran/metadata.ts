import { fetchMeta } from './api';
import { ApiMetaResponseData } from './types';

/**
 * Fetches global Quran metadata (/meta) containing counts and references for Ayahs, Surahs, and Juzs.
 */
export async function getQuranMetadata(): Promise<ApiMetaResponseData> {
  return fetchMeta();
}
