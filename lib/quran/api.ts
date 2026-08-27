import {
  ApiAyah,
  ApiJuzData,
  ApiMetaResponseData,
  ApiResponse,
  ApiSurahReference,
} from "./types"

export const QURAN_API_BASE_URL =
  process.env.NEXT_PUBLIC_QURAN_API_BASE_URL || "https://api.alquran.cloud/v1"

/**
 * Generic fetch helper with timeout and validation.
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${QURAN_API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(
        `Quran API HTTP ${response.status}: ${response.statusText}`
      )
    }

    const json: ApiResponse<T> = await response.json()

    if (json.code !== 200 || json.status !== "OK") {
      throw new Error(`Quran API Error (Code: ${json.code}): ${json.status}`)
    }

    return json.data
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Quran API request timed out")
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Retrieves global metadata for Ayahs, Surahs, and Juz boundaries.
 * GET /meta
 */
export async function fetchMeta(): Promise<ApiMetaResponseData> {
  return fetchApi<ApiMetaResponseData>("/meta")
}

/**
 * Retrieves all 114 Surahs.
 * GET /surah
 */
export async function fetchSurahs(): Promise<ApiSurahReference[]> {
  return fetchApi<ApiSurahReference[]>("/surah")
}

/**
 * Retrieves full Ayahs for a single Surah.
 * GET /surah/{number}
 */
export async function fetchSurah(
  surahNumber: number
): Promise<ApiSurahReference & { ayahs: ApiAyah[] }> {
  if (surahNumber < 1 || surahNumber > 114) {
    throw new Error(
      `Invalid Surah number: ${surahNumber}. Must be between 1 and 114.`
    )
  }
  return fetchApi<ApiSurahReference & { ayahs: ApiAyah[] }>(
    `/surah/${surahNumber}`
  )
}

/**
 * Retrieves all Ayahs belonging to a Juz.
 * GET /juz/{number} or GET /juz/{number}/{edition}
 */
export async function fetchJuz(
  juzNumber: number,
  edition?: string
): Promise<ApiJuzData> {
  if (juzNumber < 1 || juzNumber > 30) {
    throw new Error(
      `Invalid Juz number: ${juzNumber}. Must be between 1 and 30.`
    )
  }
  const endpoint = edition
    ? `/juz/${juzNumber}/${edition}`
    : `/juz/${juzNumber}`
  return fetchApi<ApiJuzData>(endpoint)
}

/**
 * Retrieves single Ayah metadata by global number (1 to 6236).
 * GET /ayah/{number}
 */
export async function fetchAyah(
  globalAyahNumber: number,
  edition?: string
): Promise<ApiAyah> {
  if (globalAyahNumber < 1 || globalAyahNumber > 6236) {
    throw new Error(
      `Invalid global Ayah number: ${globalAyahNumber}. Must be between 1 and 6236.`
    )
  }
  const endpoint = edition
    ? `/ayah/${globalAyahNumber}/${edition}`
    : `/ayah/${globalAyahNumber}`
  return fetchApi<ApiAyah>(endpoint)
}
