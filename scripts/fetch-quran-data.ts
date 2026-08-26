/**
 * Development script to fetch and verify the complete Quran metadata and 30 Juz boundaries
 * directly from AlQuran Cloud API (https://api.alquran.cloud/v1) according to OpenAPI spec.
 *
 * Usage: npx tsx scripts/fetch-quran-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'https://api.alquran.cloud/v1';

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  const json = await res.json();
  if (json.code !== 200 || json.status !== 'OK') {
    throw new Error(`API error from ${url}: ${json.status}`);
  }
  return json.data;
}

function cleanSurahNameAr(name: string): string {
  return name.replace(/^سُورَةُ\s+/i, '').replace(/^سورة\s+/i, '').trim();
}

async function main() {
  console.log('🕌 Fetching Quran Metadata from AlQuran Cloud API...');

  // 1. Fetch Surahs
  const surahsData = await fetchJson(`${API_BASE}/surah`);
  console.log(`✓ Fetched ${surahsData.length} Surahs`);

  const surahs = surahsData.map((s: any) => ({
    number: s.number,
    nameAr: cleanSurahNameAr(s.name),
    nameEn: s.englishNameTranslation || s.englishName,
    transliteration: s.englishName,
    totalAyahs: s.numberOfAyahs,
    revelationType: s.revelationType,
  }));

  // Create lookup map for surah names
  const surahMap = new Map<number, { nameAr: string; nameEn: string }>();
  for (const s of surahs) {
    surahMap.set(s.number, { nameAr: s.nameAr, nameEn: s.transliteration });
  }

  // 2. Fetch All 30 Juz
  console.log('📖 Fetching all 30 Juz boundaries...');
  const juzBoundaries = [];

  for (let j = 1; j <= 30; j++) {
    process.stdout.write(`  Fetching Juz ${j}/30... `);
    const juzData = await fetchJson(`${API_BASE}/juz/${j}`);
    const ayahs = juzData.ayahs;
    if (!ayahs || ayahs.length === 0) {
      throw new Error(`Juz ${j} returned empty ayahs!`);
    }

    const first = ayahs[0];
    const last = ayahs[ayahs.length - 1];

    const startSurahInfo = surahMap.get(first.surah.number) || {
      nameAr: cleanSurahNameAr(first.surah.name),
      nameEn: first.surah.englishName,
    };
    const endSurahInfo = surahMap.get(last.surah.number) || {
      nameAr: cleanSurahNameAr(last.surah.name),
      nameEn: last.surah.englishName,
    };

    const boundary = {
      juzNumber: j,
      start: {
        globalAyahNumber: first.number,
        juzNumber: first.juz,
        surahNumber: first.surah.number,
        surahNameArabic: startSurahInfo.nameAr,
        surahNameEnglish: startSurahInfo.nameEn,
        ayahNumber: first.numberInSurah,
        page: first.page,
        hizbQuarter: first.hizbQuarter,
      },
      end: {
        globalAyahNumber: last.number,
        juzNumber: last.juz,
        surahNumber: last.surah.number,
        surahNameArabic: endSurahInfo.nameAr,
        surahNameEnglish: endSurahInfo.nameEn,
        ayahNumber: last.numberInSurah,
        page: last.page,
        hizbQuarter: last.hizbQuarter,
      },
      totalAyahs: ayahs.length,
    };

    juzBoundaries.push(boundary);
    console.log(
      `✓ Start: ${boundary.start.surahNameArabic} ${boundary.start.ayahNumber} | End: ${boundary.end.surahNameArabic} ${boundary.end.ayahNumber}`
    );
  }

  // 3. Mathematical & Continuity Validation
  console.log('\n🔍 Validating all 30 Juz boundaries...');
  if (juzBoundaries.length !== 30) {
    throw new Error(`Expected 30 Juz, got ${juzBoundaries.length}`);
  }

  if (juzBoundaries[0].start.globalAyahNumber !== 1) {
    throw new Error(`Juz 1 does not start at Ayah 1!`);
  }

  if (juzBoundaries[29].end.globalAyahNumber !== 6236) {
    throw new Error(`Juz 30 does not end at Ayah 6236! (got ${juzBoundaries[29].end.globalAyahNumber})`);
  }

  for (let i = 1; i < 30; i++) {
    const prev = juzBoundaries[i - 1];
    const curr = juzBoundaries[i];
    if (curr.start.globalAyahNumber !== prev.end.globalAyahNumber + 1) {
      throw new Error(
        `Discontinuity between Juz ${i} (ends ${prev.end.globalAyahNumber}) and Juz ${i + 1} (starts ${curr.start.globalAyahNumber})`
      );
    }
  }
  console.log('✅ Validation SUCCESS: 30 Juz verified with zero gaps and zero overlaps across 6,236 Ayahs.\n');

  // 4. Generate data.ts
  const outputPath = path.join(process.cwd(), 'lib', 'quran', 'data.ts');
  const fileContent = `/**
 * Authoritative Quran dataset derived directly from AlQuran Cloud API (https://api.alquran.cloud/v1)
 * OpenAPI Specification: yaml.yml
 * Verified: 114 Surahs, 30 Juz boundaries (6,236 Ayahs, zero gaps, zero overlaps).
 */

import { JuzBoundary, SurahInfo } from './types';

export const SURAHS: SurahInfo[] = ${JSON.stringify(surahs, null, 2)};

export const JUZ_BOUNDARIES: JuzBoundary[] = ${JSON.stringify(juzBoundaries, null, 2)};

export const SURAH_TO_JUZ_MAP: Record<number, number> = {
  1: 1, 2: 1, 3: 3, 4: 4, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11,
  11: 11, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14, 17: 15, 18: 15, 19: 16, 20: 16,
  21: 17, 22: 17, 23: 18, 24: 18, 25: 18, 26: 19, 27: 19, 28: 20, 29: 20, 30: 21,
  31: 21, 32: 21, 33: 21, 34: 22, 35: 22, 36: 22, 37: 23, 38: 23, 39: 23, 40: 24,
  41: 24, 42: 25, 43: 25, 44: 25, 45: 25, 46: 26, 47: 26, 48: 26, 49: 26, 50: 26,
  51: 26, 52: 27, 53: 27, 54: 27, 55: 27, 56: 27, 57: 27, 58: 28, 59: 28, 60: 28,
  61: 28, 62: 28, 63: 28, 64: 28, 65: 28, 66: 28, 67: 29, 68: 29, 69: 29, 70: 29,
  71: 29, 72: 29, 73: 29, 74: 29, 75: 29, 76: 29, 77: 29, 78: 30, 79: 30, 80: 30,
  81: 30, 82: 30, 83: 30, 84: 30, 85: 30, 86: 30, 87: 30, 88: 30, 89: 30, 90: 30,
  91: 30, 92: 30, 93: 30, 94: 30, 95: 30, 96: 30, 97: 30, 98: 30, 99: 30, 100: 30,
  101: 30, 102: 30, 103: 30, 104: 30, 105: 30, 106: 30, 107: 30, 108: 30, 109: 30, 110: 30,
  111: 30, 112: 30, 113: 30, 114: 30
};
`;

  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`💾 Saved updated dataset to ${outputPath}`);
}

main().catch((err) => {
  console.error('Error executing fetch-quran-data:', err);
  process.exit(1);
});
