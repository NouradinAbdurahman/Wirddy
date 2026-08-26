import { fetchJuz } from './api';
import { normalizeApiJuzData } from './normalize';
import { JuzBoundary, QuranValidationResult } from './types';

/**
 * Validates a set of 30 Juz boundaries according to strict Quran structure rules.
 */
export function validateJuzBoundaries(boundaries: JuzBoundary[]): QuranValidationResult {
  const errors: string[] = [];

  if (boundaries.length !== 30) {
    errors.push(`Expected 30 Juz boundaries, but received ${boundaries.length}.`);
    return { isValid: false, errors };
  }

  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i];
    const expectedJuz = i + 1;

    if (boundary.juzNumber !== expectedJuz) {
      errors.push(`Boundary at index ${i} has Juz number ${boundary.juzNumber}, expected ${expectedJuz}.`);
    }

    if (!boundary.start || !boundary.end) {
      errors.push(`Juz ${expectedJuz} is missing start or end location.`);
      continue;
    }

    if (boundary.start.globalAyahNumber > boundary.end.globalAyahNumber) {
      errors.push(`Juz ${expectedJuz} start global Ayah (${boundary.start.globalAyahNumber}) is greater than end global Ayah (${boundary.end.globalAyahNumber}).`);
    }

    // Continuity check with previous Juz
    if (i > 0) {
      const prevBoundary = boundaries[i - 1];
      if (prevBoundary.end && boundary.start) {
        if (boundary.start.globalAyahNumber !== prevBoundary.end.globalAyahNumber + 1) {
          errors.push(
            `Gap or overlap between Juz ${i} and Juz ${expectedJuz}: Juz ${i} ends at Ayah ${prevBoundary.end.globalAyahNumber}, but Juz ${expectedJuz} starts at Ayah ${boundary.start.globalAyahNumber}.`
          );
        }
      }
    }
  }

  // First and last ayah of the entire Quran
  if (boundaries[0]?.start?.globalAyahNumber !== 1) {
    errors.push(`Juz 1 must start at global Ayah 1 (received ${boundaries[0]?.start?.globalAyahNumber}).`);
  }

  if (boundaries[29]?.end?.globalAyahNumber !== 6236) {
    errors.push(`Juz 30 must end at global Ayah 6236 (received ${boundaries[29]?.end?.globalAyahNumber}).`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Fetches all 30 Juz from the API, normalizes their boundaries, and validates them.
 */
export async function fetchAndDeriveAllJuzBoundaries(
  onProgress?: (juzNumber: number) => void
): Promise<JuzBoundary[]> {
  const boundaries: JuzBoundary[] = [];

  for (let juzNum = 1; juzNum <= 30; juzNum++) {
    const rawJuz = await fetchJuz(juzNum);
    const normalized = normalizeApiJuzData(rawJuz);
    boundaries.push(normalized);
    if (onProgress) onProgress(juzNum);
  }

  const validation = validateJuzBoundaries(boundaries);
  if (!validation.isValid) {
    throw new Error(`Juz boundary validation failed:\n- ${validation.errors.join('\n- ')}`);
  }

  return boundaries;
}
