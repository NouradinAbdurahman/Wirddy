/**
 * Authoritative Quran dataset derived directly from AlQuran Cloud API (https://api.alquran.cloud/v1)
 * OpenAPI Specification: yaml.yml
 * Verified: 114 Surahs, 30 Juz boundaries (6,236 Ayahs, zero gaps, zero overlaps).
 */

import { JuzBoundary, SurahInfo } from './types';

export const SURAHS: SurahInfo[] = [
  {
    "number": 1,
    "nameAr": "ٱلْفَاتِحَةِ",
    "nameEn": "The Opening",
    "transliteration": "Al-Faatiha",
    "totalAyahs": 7,
    "revelationType": "Meccan"
  },
  {
    "number": 2,
    "nameAr": "البَقَرَةِ",
    "nameEn": "The Cow",
    "transliteration": "Al-Baqara",
    "totalAyahs": 286,
    "revelationType": "Medinan"
  },
  {
    "number": 3,
    "nameAr": "آلِ عِمۡرَانَ",
    "nameEn": "The Family of Imraan",
    "transliteration": "Aal-i-Imraan",
    "totalAyahs": 200,
    "revelationType": "Medinan"
  },
  {
    "number": 4,
    "nameAr": "النِّسَاءِ",
    "nameEn": "The Women",
    "transliteration": "An-Nisaa",
    "totalAyahs": 176,
    "revelationType": "Medinan"
  },
  {
    "number": 5,
    "nameAr": "المَائـِدَةِ",
    "nameEn": "The Table",
    "transliteration": "Al-Maaida",
    "totalAyahs": 120,
    "revelationType": "Medinan"
  },
  {
    "number": 6,
    "nameAr": "الأَنۡعَامِ",
    "nameEn": "The Cattle",
    "transliteration": "Al-An'aam",
    "totalAyahs": 165,
    "revelationType": "Meccan"
  },
  {
    "number": 7,
    "nameAr": "الأَعۡرَافِ",
    "nameEn": "The Heights",
    "transliteration": "Al-A'raaf",
    "totalAyahs": 206,
    "revelationType": "Meccan"
  },
  {
    "number": 8,
    "nameAr": "الأَنفَالِ",
    "nameEn": "The Spoils of War",
    "transliteration": "Al-Anfaal",
    "totalAyahs": 75,
    "revelationType": "Medinan"
  },
  {
    "number": 9,
    "nameAr": "التَّوۡبَةِ",
    "nameEn": "The Repentance",
    "transliteration": "At-Tawba",
    "totalAyahs": 129,
    "revelationType": "Medinan"
  },
  {
    "number": 10,
    "nameAr": "يُونُسَ",
    "nameEn": "Jonas",
    "transliteration": "Yunus",
    "totalAyahs": 109,
    "revelationType": "Meccan"
  },
  {
    "number": 11,
    "nameAr": "هُودٍ",
    "nameEn": "Hud",
    "transliteration": "Hud",
    "totalAyahs": 123,
    "revelationType": "Meccan"
  },
  {
    "number": 12,
    "nameAr": "يُوسُفَ",
    "nameEn": "Joseph",
    "transliteration": "Yusuf",
    "totalAyahs": 111,
    "revelationType": "Meccan"
  },
  {
    "number": 13,
    "nameAr": "الرَّعۡدِ",
    "nameEn": "The Thunder",
    "transliteration": "Ar-Ra'd",
    "totalAyahs": 43,
    "revelationType": "Medinan"
  },
  {
    "number": 14,
    "nameAr": "إِبۡرَاهِيمَ",
    "nameEn": "Abraham",
    "transliteration": "Ibrahim",
    "totalAyahs": 52,
    "revelationType": "Meccan"
  },
  {
    "number": 15,
    "nameAr": "الحِجۡرِ",
    "nameEn": "The Rock",
    "transliteration": "Al-Hijr",
    "totalAyahs": 99,
    "revelationType": "Meccan"
  },
  {
    "number": 16,
    "nameAr": "النَّحۡلِ",
    "nameEn": "The Bee",
    "transliteration": "An-Nahl",
    "totalAyahs": 128,
    "revelationType": "Meccan"
  },
  {
    "number": 17,
    "nameAr": "الإِسۡرَاءِ",
    "nameEn": "The Night Journey",
    "transliteration": "Al-Israa",
    "totalAyahs": 111,
    "revelationType": "Meccan"
  },
  {
    "number": 18,
    "nameAr": "الكَهۡفِ",
    "nameEn": "The Cave",
    "transliteration": "Al-Kahf",
    "totalAyahs": 110,
    "revelationType": "Meccan"
  },
  {
    "number": 19,
    "nameAr": "مَرۡيَمَ",
    "nameEn": "Mary",
    "transliteration": "Maryam",
    "totalAyahs": 98,
    "revelationType": "Meccan"
  },
  {
    "number": 20,
    "nameAr": "طه",
    "nameEn": "Taa-Haa",
    "transliteration": "Taa-Haa",
    "totalAyahs": 135,
    "revelationType": "Meccan"
  },
  {
    "number": 21,
    "nameAr": "الأَنبِيَاءِ",
    "nameEn": "The Prophets",
    "transliteration": "Al-Anbiyaa",
    "totalAyahs": 112,
    "revelationType": "Meccan"
  },
  {
    "number": 22,
    "nameAr": "الحَجِّ",
    "nameEn": "The Pilgrimage",
    "transliteration": "Al-Hajj",
    "totalAyahs": 78,
    "revelationType": "Medinan"
  },
  {
    "number": 23,
    "nameAr": "المُؤۡمِنُونَ",
    "nameEn": "The Believers",
    "transliteration": "Al-Muminoon",
    "totalAyahs": 118,
    "revelationType": "Meccan"
  },
  {
    "number": 24,
    "nameAr": "النُّورِ",
    "nameEn": "The Light",
    "transliteration": "An-Noor",
    "totalAyahs": 64,
    "revelationType": "Medinan"
  },
  {
    "number": 25,
    "nameAr": "الفُرۡقَانِ",
    "nameEn": "The Criterion",
    "transliteration": "Al-Furqaan",
    "totalAyahs": 77,
    "revelationType": "Meccan"
  },
  {
    "number": 26,
    "nameAr": "الشُّعَرَاءِ",
    "nameEn": "The Poets",
    "transliteration": "Ash-Shu'araa",
    "totalAyahs": 227,
    "revelationType": "Meccan"
  },
  {
    "number": 27,
    "nameAr": "النَّمۡلِ",
    "nameEn": "The Ant",
    "transliteration": "An-Naml",
    "totalAyahs": 93,
    "revelationType": "Meccan"
  },
  {
    "number": 28,
    "nameAr": "القَصَصِ",
    "nameEn": "The Stories",
    "transliteration": "Al-Qasas",
    "totalAyahs": 88,
    "revelationType": "Meccan"
  },
  {
    "number": 29,
    "nameAr": "العَنكَبُوتِ",
    "nameEn": "The Spider",
    "transliteration": "Al-Ankaboot",
    "totalAyahs": 69,
    "revelationType": "Meccan"
  },
  {
    "number": 30,
    "nameAr": "الرُّومِ",
    "nameEn": "The Romans",
    "transliteration": "Ar-Room",
    "totalAyahs": 60,
    "revelationType": "Meccan"
  },
  {
    "number": 31,
    "nameAr": "لُقۡمَانَ",
    "nameEn": "Luqman",
    "transliteration": "Luqman",
    "totalAyahs": 34,
    "revelationType": "Meccan"
  },
  {
    "number": 32,
    "nameAr": "السَّجۡدَةِ",
    "nameEn": "The Prostration",
    "transliteration": "As-Sajda",
    "totalAyahs": 30,
    "revelationType": "Meccan"
  },
  {
    "number": 33,
    "nameAr": "الأَحۡزَابِ",
    "nameEn": "The Clans",
    "transliteration": "Al-Ahzaab",
    "totalAyahs": 73,
    "revelationType": "Medinan"
  },
  {
    "number": 34,
    "nameAr": "سَبَإٍ",
    "nameEn": "Sheba",
    "transliteration": "Saba",
    "totalAyahs": 54,
    "revelationType": "Meccan"
  },
  {
    "number": 35,
    "nameAr": "فَاطِرٍ",
    "nameEn": "The Originator",
    "transliteration": "Faatir",
    "totalAyahs": 45,
    "revelationType": "Meccan"
  },
  {
    "number": 36,
    "nameAr": "يسٓ",
    "nameEn": "Yaseen",
    "transliteration": "Yaseen",
    "totalAyahs": 83,
    "revelationType": "Meccan"
  },
  {
    "number": 37,
    "nameAr": "الصَّافَّاتِ",
    "nameEn": "Those drawn up in Ranks",
    "transliteration": "As-Saaffaat",
    "totalAyahs": 182,
    "revelationType": "Meccan"
  },
  {
    "number": 38,
    "nameAr": "صٓ",
    "nameEn": "The letter Saad",
    "transliteration": "Saad",
    "totalAyahs": 88,
    "revelationType": "Meccan"
  },
  {
    "number": 39,
    "nameAr": "الزُّمَرِ",
    "nameEn": "The Groups",
    "transliteration": "Az-Zumar",
    "totalAyahs": 75,
    "revelationType": "Meccan"
  },
  {
    "number": 40,
    "nameAr": "غَافِرٍ",
    "nameEn": "The Forgiver",
    "transliteration": "Ghafir",
    "totalAyahs": 85,
    "revelationType": "Meccan"
  },
  {
    "number": 41,
    "nameAr": "فُصِّلَتۡ",
    "nameEn": "Explained in detail",
    "transliteration": "Fussilat",
    "totalAyahs": 54,
    "revelationType": "Meccan"
  },
  {
    "number": 42,
    "nameAr": "الشُّورَىٰ",
    "nameEn": "Consultation",
    "transliteration": "Ash-Shura",
    "totalAyahs": 53,
    "revelationType": "Meccan"
  },
  {
    "number": 43,
    "nameAr": "الزُّخۡرُفِ",
    "nameEn": "Ornaments of gold",
    "transliteration": "Az-Zukhruf",
    "totalAyahs": 89,
    "revelationType": "Meccan"
  },
  {
    "number": 44,
    "nameAr": "الدُّخَانِ",
    "nameEn": "The Smoke",
    "transliteration": "Ad-Dukhaan",
    "totalAyahs": 59,
    "revelationType": "Meccan"
  },
  {
    "number": 45,
    "nameAr": "الجَاثِيَةِ",
    "nameEn": "Crouching",
    "transliteration": "Al-Jaathiya",
    "totalAyahs": 37,
    "revelationType": "Meccan"
  },
  {
    "number": 46,
    "nameAr": "الأَحۡقَافِ",
    "nameEn": "The Dunes",
    "transliteration": "Al-Ahqaf",
    "totalAyahs": 35,
    "revelationType": "Meccan"
  },
  {
    "number": 47,
    "nameAr": "مُحَمَّدٍ",
    "nameEn": "Muhammad",
    "transliteration": "Muhammad",
    "totalAyahs": 38,
    "revelationType": "Medinan"
  },
  {
    "number": 48,
    "nameAr": "الفَتۡحِ",
    "nameEn": "The Victory",
    "transliteration": "Al-Fath",
    "totalAyahs": 29,
    "revelationType": "Medinan"
  },
  {
    "number": 49,
    "nameAr": "الحُجُرَاتِ",
    "nameEn": "The Inner Apartments",
    "transliteration": "Al-Hujuraat",
    "totalAyahs": 18,
    "revelationType": "Medinan"
  },
  {
    "number": 50,
    "nameAr": "قٓ",
    "nameEn": "The letter Qaaf",
    "transliteration": "Qaaf",
    "totalAyahs": 45,
    "revelationType": "Meccan"
  },
  {
    "number": 51,
    "nameAr": "الذَّارِيَاتِ",
    "nameEn": "The Winnowing Winds",
    "transliteration": "Adh-Dhaariyat",
    "totalAyahs": 60,
    "revelationType": "Meccan"
  },
  {
    "number": 52,
    "nameAr": "الطُّورِ",
    "nameEn": "The Mount",
    "transliteration": "At-Tur",
    "totalAyahs": 49,
    "revelationType": "Meccan"
  },
  {
    "number": 53,
    "nameAr": "النَّجۡمِ",
    "nameEn": "The Star",
    "transliteration": "An-Najm",
    "totalAyahs": 62,
    "revelationType": "Meccan"
  },
  {
    "number": 54,
    "nameAr": "القَمَرِ",
    "nameEn": "The Moon",
    "transliteration": "Al-Qamar",
    "totalAyahs": 55,
    "revelationType": "Meccan"
  },
  {
    "number": 55,
    "nameAr": "الرَّحۡمَٰن",
    "nameEn": "The Beneficent",
    "transliteration": "Ar-Rahmaan",
    "totalAyahs": 78,
    "revelationType": "Medinan"
  },
  {
    "number": 56,
    "nameAr": "الوَاقِعَةِ",
    "nameEn": "The Inevitable",
    "transliteration": "Al-Waaqia",
    "totalAyahs": 96,
    "revelationType": "Meccan"
  },
  {
    "number": 57,
    "nameAr": "الحَدِيدِ",
    "nameEn": "The Iron",
    "transliteration": "Al-Hadid",
    "totalAyahs": 29,
    "revelationType": "Medinan"
  },
  {
    "number": 58,
    "nameAr": "المُجَادلَةِ",
    "nameEn": "The Pleading Woman",
    "transliteration": "Al-Mujaadila",
    "totalAyahs": 22,
    "revelationType": "Medinan"
  },
  {
    "number": 59,
    "nameAr": "الحَشۡرِ",
    "nameEn": "The Exile",
    "transliteration": "Al-Hashr",
    "totalAyahs": 24,
    "revelationType": "Medinan"
  },
  {
    "number": 60,
    "nameAr": "المُمۡتَحنَةِ",
    "nameEn": "She that is to be examined",
    "transliteration": "Al-Mumtahana",
    "totalAyahs": 13,
    "revelationType": "Medinan"
  },
  {
    "number": 61,
    "nameAr": "الصَّفِّ",
    "nameEn": "The Ranks",
    "transliteration": "As-Saff",
    "totalAyahs": 14,
    "revelationType": "Medinan"
  },
  {
    "number": 62,
    "nameAr": "الجُمُعَةِ",
    "nameEn": "Friday",
    "transliteration": "Al-Jumu'a",
    "totalAyahs": 11,
    "revelationType": "Medinan"
  },
  {
    "number": 63,
    "nameAr": "المُنَافِقُونَ",
    "nameEn": "The Hypocrites",
    "transliteration": "Al-Munaafiqoon",
    "totalAyahs": 11,
    "revelationType": "Medinan"
  },
  {
    "number": 64,
    "nameAr": "التَّغَابُنِ",
    "nameEn": "Mutual Disillusion",
    "transliteration": "At-Taghaabun",
    "totalAyahs": 18,
    "revelationType": "Medinan"
  },
  {
    "number": 65,
    "nameAr": "الطَّلَاقِ",
    "nameEn": "Divorce",
    "transliteration": "At-Talaaq",
    "totalAyahs": 12,
    "revelationType": "Medinan"
  },
  {
    "number": 66,
    "nameAr": "التَّحۡرِيمِ",
    "nameEn": "The Prohibition",
    "transliteration": "At-Tahrim",
    "totalAyahs": 12,
    "revelationType": "Medinan"
  },
  {
    "number": 67,
    "nameAr": "المُلۡكِ",
    "nameEn": "The Sovereignty",
    "transliteration": "Al-Mulk",
    "totalAyahs": 30,
    "revelationType": "Meccan"
  },
  {
    "number": 68,
    "nameAr": "القَلَمِ",
    "nameEn": "The Pen",
    "transliteration": "Al-Qalam",
    "totalAyahs": 52,
    "revelationType": "Meccan"
  },
  {
    "number": 69,
    "nameAr": "الحَاقَّةِ",
    "nameEn": "The Reality",
    "transliteration": "Al-Haaqqa",
    "totalAyahs": 52,
    "revelationType": "Meccan"
  },
  {
    "number": 70,
    "nameAr": "المَعَارِجِ",
    "nameEn": "The Ascending Stairways",
    "transliteration": "Al-Ma'aarij",
    "totalAyahs": 44,
    "revelationType": "Meccan"
  },
  {
    "number": 71,
    "nameAr": "نُوحٍ",
    "nameEn": "Noah",
    "transliteration": "Nooh",
    "totalAyahs": 28,
    "revelationType": "Meccan"
  },
  {
    "number": 72,
    "nameAr": "الجِنِّ",
    "nameEn": "The Jinn",
    "transliteration": "Al-Jinn",
    "totalAyahs": 28,
    "revelationType": "Meccan"
  },
  {
    "number": 73,
    "nameAr": "المُزَّمِّلِ",
    "nameEn": "The Enshrouded One",
    "transliteration": "Al-Muzzammil",
    "totalAyahs": 20,
    "revelationType": "Meccan"
  },
  {
    "number": 74,
    "nameAr": "المُدَّثِّرِ",
    "nameEn": "The Cloaked One",
    "transliteration": "Al-Muddaththir",
    "totalAyahs": 56,
    "revelationType": "Meccan"
  },
  {
    "number": 75,
    "nameAr": "القِيَامَةِ",
    "nameEn": "The Resurrection",
    "transliteration": "Al-Qiyaama",
    "totalAyahs": 40,
    "revelationType": "Meccan"
  },
  {
    "number": 76,
    "nameAr": "الإِنسَانِ",
    "nameEn": "Man",
    "transliteration": "Al-Insaan",
    "totalAyahs": 31,
    "revelationType": "Medinan"
  },
  {
    "number": 77,
    "nameAr": "المُرۡسَلَاتِ",
    "nameEn": "The Emissaries",
    "transliteration": "Al-Mursalaat",
    "totalAyahs": 50,
    "revelationType": "Meccan"
  },
  {
    "number": 78,
    "nameAr": "النَّبَإِ",
    "nameEn": "The Announcement",
    "transliteration": "An-Naba",
    "totalAyahs": 40,
    "revelationType": "Meccan"
  },
  {
    "number": 79,
    "nameAr": "النَّازِعَاتِ",
    "nameEn": "Those who drag forth",
    "transliteration": "An-Naazi'aat",
    "totalAyahs": 46,
    "revelationType": "Meccan"
  },
  {
    "number": 80,
    "nameAr": "عَبَسَ",
    "nameEn": "He frowned",
    "transliteration": "Abasa",
    "totalAyahs": 42,
    "revelationType": "Meccan"
  },
  {
    "number": 81,
    "nameAr": "التَّكۡوِيرِ",
    "nameEn": "The Overthrowing",
    "transliteration": "At-Takwir",
    "totalAyahs": 29,
    "revelationType": "Meccan"
  },
  {
    "number": 82,
    "nameAr": "الانفِطَارِ",
    "nameEn": "The Cleaving",
    "transliteration": "Al-Infitaar",
    "totalAyahs": 19,
    "revelationType": "Meccan"
  },
  {
    "number": 83,
    "nameAr": "المُطَفِّفِينَ",
    "nameEn": "Defrauding",
    "transliteration": "Al-Mutaffifin",
    "totalAyahs": 36,
    "revelationType": "Meccan"
  },
  {
    "number": 84,
    "nameAr": "الانشِقَاقِ",
    "nameEn": "The Splitting Open",
    "transliteration": "Al-Inshiqaaq",
    "totalAyahs": 25,
    "revelationType": "Meccan"
  },
  {
    "number": 85,
    "nameAr": "البُرُوجِ",
    "nameEn": "The Constellations",
    "transliteration": "Al-Burooj",
    "totalAyahs": 22,
    "revelationType": "Meccan"
  },
  {
    "number": 86,
    "nameAr": "الطَّارِقِ",
    "nameEn": "The Morning Star",
    "transliteration": "At-Taariq",
    "totalAyahs": 17,
    "revelationType": "Meccan"
  },
  {
    "number": 87,
    "nameAr": "الأَعۡلَىٰ",
    "nameEn": "The Most High",
    "transliteration": "Al-A'laa",
    "totalAyahs": 19,
    "revelationType": "Meccan"
  },
  {
    "number": 88,
    "nameAr": "الغَاشِيَةِ",
    "nameEn": "The Overwhelming",
    "transliteration": "Al-Ghaashiya",
    "totalAyahs": 26,
    "revelationType": "Meccan"
  },
  {
    "number": 89,
    "nameAr": "الفَجۡرِ",
    "nameEn": "The Dawn",
    "transliteration": "Al-Fajr",
    "totalAyahs": 30,
    "revelationType": "Meccan"
  },
  {
    "number": 90,
    "nameAr": "البَلَدِ",
    "nameEn": "The City",
    "transliteration": "Al-Balad",
    "totalAyahs": 20,
    "revelationType": "Meccan"
  },
  {
    "number": 91,
    "nameAr": "الشَّمۡسِ",
    "nameEn": "The Sun",
    "transliteration": "Ash-Shams",
    "totalAyahs": 15,
    "revelationType": "Meccan"
  },
  {
    "number": 92,
    "nameAr": "اللَّيۡلِ",
    "nameEn": "The Night",
    "transliteration": "Al-Lail",
    "totalAyahs": 21,
    "revelationType": "Meccan"
  },
  {
    "number": 93,
    "nameAr": "الضُّحَىٰ",
    "nameEn": "The Morning Hours",
    "transliteration": "Ad-Dhuhaa",
    "totalAyahs": 11,
    "revelationType": "Meccan"
  },
  {
    "number": 94,
    "nameAr": "الشَّرۡحِ",
    "nameEn": "The Consolation",
    "transliteration": "Ash-Sharh",
    "totalAyahs": 8,
    "revelationType": "Meccan"
  },
  {
    "number": 95,
    "nameAr": "التِّينِ",
    "nameEn": "The Fig",
    "transliteration": "At-Tin",
    "totalAyahs": 8,
    "revelationType": "Meccan"
  },
  {
    "number": 96,
    "nameAr": "العَلَقِ",
    "nameEn": "The Clot",
    "transliteration": "Al-Alaq",
    "totalAyahs": 19,
    "revelationType": "Meccan"
  },
  {
    "number": 97,
    "nameAr": "القَدۡرِ",
    "nameEn": "The Power, Fate",
    "transliteration": "Al-Qadr",
    "totalAyahs": 5,
    "revelationType": "Meccan"
  },
  {
    "number": 98,
    "nameAr": "البَيِّنَةِ",
    "nameEn": "The Evidence",
    "transliteration": "Al-Bayyina",
    "totalAyahs": 8,
    "revelationType": "Medinan"
  },
  {
    "number": 99,
    "nameAr": "الزَّلۡزَلَةِ",
    "nameEn": "The Earthquake",
    "transliteration": "Az-Zalzala",
    "totalAyahs": 8,
    "revelationType": "Medinan"
  },
  {
    "number": 100,
    "nameAr": "العَادِيَاتِ",
    "nameEn": "The Chargers",
    "transliteration": "Al-Aadiyaat",
    "totalAyahs": 11,
    "revelationType": "Meccan"
  },
  {
    "number": 101,
    "nameAr": "القَارِعَةِ",
    "nameEn": "The Calamity",
    "transliteration": "Al-Qaari'a",
    "totalAyahs": 11,
    "revelationType": "Meccan"
  },
  {
    "number": 102,
    "nameAr": "التَّكَاثُرِ",
    "nameEn": "Competition",
    "transliteration": "At-Takaathur",
    "totalAyahs": 8,
    "revelationType": "Meccan"
  },
  {
    "number": 103,
    "nameAr": "العَصۡرِ",
    "nameEn": "The Declining Day, Epoch",
    "transliteration": "Al-Asr",
    "totalAyahs": 3,
    "revelationType": "Meccan"
  },
  {
    "number": 104,
    "nameAr": "الهُمَزَةِ",
    "nameEn": "The Traducer",
    "transliteration": "Al-Humaza",
    "totalAyahs": 9,
    "revelationType": "Meccan"
  },
  {
    "number": 105,
    "nameAr": "الفِيلِ",
    "nameEn": "The Elephant",
    "transliteration": "Al-Fil",
    "totalAyahs": 5,
    "revelationType": "Meccan"
  },
  {
    "number": 106,
    "nameAr": "قُرَيۡشٍ",
    "nameEn": "Quraysh",
    "transliteration": "Quraish",
    "totalAyahs": 4,
    "revelationType": "Meccan"
  },
  {
    "number": 107,
    "nameAr": "المَاعُونِ",
    "nameEn": "Almsgiving",
    "transliteration": "Al-Maa'un",
    "totalAyahs": 7,
    "revelationType": "Meccan"
  },
  {
    "number": 108,
    "nameAr": "الكَوۡثَرِ",
    "nameEn": "Abundance",
    "transliteration": "Al-Kawthar",
    "totalAyahs": 3,
    "revelationType": "Meccan"
  },
  {
    "number": 109,
    "nameAr": "الكَافِرُونَ",
    "nameEn": "The Disbelievers",
    "transliteration": "Al-Kaafiroon",
    "totalAyahs": 6,
    "revelationType": "Meccan"
  },
  {
    "number": 110,
    "nameAr": "النَّصۡرِ",
    "nameEn": "Divine Support",
    "transliteration": "An-Nasr",
    "totalAyahs": 3,
    "revelationType": "Medinan"
  },
  {
    "number": 111,
    "nameAr": "المَسَدِ",
    "nameEn": "The Palm Fibre",
    "transliteration": "Al-Masad",
    "totalAyahs": 5,
    "revelationType": "Meccan"
  },
  {
    "number": 112,
    "nameAr": "الإِخۡلَاصِ",
    "nameEn": "Sincerity",
    "transliteration": "Al-Ikhlaas",
    "totalAyahs": 4,
    "revelationType": "Meccan"
  },
  {
    "number": 113,
    "nameAr": "الفَلَقِ",
    "nameEn": "The Dawn",
    "transliteration": "Al-Falaq",
    "totalAyahs": 5,
    "revelationType": "Meccan"
  },
  {
    "number": 114,
    "nameAr": "النَّاسِ",
    "nameEn": "Mankind",
    "transliteration": "An-Naas",
    "totalAyahs": 6,
    "revelationType": "Meccan"
  }
];

export const JUZ_BOUNDARIES: JuzBoundary[] = [
  {
    "juzNumber": 1,
    "start": {
      "globalAyahNumber": 1,
      "juzNumber": 1,
      "surahNumber": 1,
      "surahNameArabic": "ٱلْفَاتِحَةِ",
      "surahNameEnglish": "Al-Faatiha",
      "ayahNumber": 1,
      "page": 1,
      "hizbQuarter": 1
    },
    "end": {
      "globalAyahNumber": 148,
      "juzNumber": 1,
      "surahNumber": 2,
      "surahNameArabic": "البَقَرَةِ",
      "surahNameEnglish": "Al-Baqara",
      "ayahNumber": 141,
      "page": 21,
      "hizbQuarter": 8
    },
    "totalAyahs": 148
  },
  {
    "juzNumber": 2,
    "start": {
      "globalAyahNumber": 149,
      "juzNumber": 2,
      "surahNumber": 2,
      "surahNameArabic": "البَقَرَةِ",
      "surahNameEnglish": "Al-Baqara",
      "ayahNumber": 142,
      "page": 22,
      "hizbQuarter": 9
    },
    "end": {
      "globalAyahNumber": 259,
      "juzNumber": 2,
      "surahNumber": 2,
      "surahNameArabic": "البَقَرَةِ",
      "surahNameEnglish": "Al-Baqara",
      "ayahNumber": 252,
      "page": 41,
      "hizbQuarter": 16
    },
    "totalAyahs": 111
  },
  {
    "juzNumber": 3,
    "start": {
      "globalAyahNumber": 260,
      "juzNumber": 3,
      "surahNumber": 2,
      "surahNameArabic": "البَقَرَةِ",
      "surahNameEnglish": "Al-Baqara",
      "ayahNumber": 253,
      "page": 42,
      "hizbQuarter": 17
    },
    "end": {
      "globalAyahNumber": 385,
      "juzNumber": 3,
      "surahNumber": 3,
      "surahNameArabic": "آلِ عِمۡرَانَ",
      "surahNameEnglish": "Aal-i-Imraan",
      "ayahNumber": 92,
      "page": 62,
      "hizbQuarter": 24
    },
    "totalAyahs": 126
  },
  {
    "juzNumber": 4,
    "start": {
      "globalAyahNumber": 386,
      "juzNumber": 4,
      "surahNumber": 3,
      "surahNameArabic": "آلِ عِمۡرَانَ",
      "surahNameEnglish": "Aal-i-Imraan",
      "ayahNumber": 93,
      "page": 62,
      "hizbQuarter": 25
    },
    "end": {
      "globalAyahNumber": 516,
      "juzNumber": 4,
      "surahNumber": 4,
      "surahNameArabic": "النِّسَاءِ",
      "surahNameEnglish": "An-Nisaa",
      "ayahNumber": 23,
      "page": 81,
      "hizbQuarter": 32
    },
    "totalAyahs": 131
  },
  {
    "juzNumber": 5,
    "start": {
      "globalAyahNumber": 517,
      "juzNumber": 5,
      "surahNumber": 4,
      "surahNameArabic": "النِّسَاءِ",
      "surahNameEnglish": "An-Nisaa",
      "ayahNumber": 24,
      "page": 82,
      "hizbQuarter": 33
    },
    "end": {
      "globalAyahNumber": 640,
      "juzNumber": 5,
      "surahNumber": 4,
      "surahNameArabic": "النِّسَاءِ",
      "surahNameEnglish": "An-Nisaa",
      "ayahNumber": 147,
      "page": 101,
      "hizbQuarter": 40
    },
    "totalAyahs": 124
  },
  {
    "juzNumber": 6,
    "start": {
      "globalAyahNumber": 641,
      "juzNumber": 6,
      "surahNumber": 4,
      "surahNameArabic": "النِّسَاءِ",
      "surahNameEnglish": "An-Nisaa",
      "ayahNumber": 148,
      "page": 102,
      "hizbQuarter": 41
    },
    "end": {
      "globalAyahNumber": 750,
      "juzNumber": 6,
      "surahNumber": 5,
      "surahNameArabic": "المَائـِدَةِ",
      "surahNameEnglish": "Al-Maaida",
      "ayahNumber": 81,
      "page": 121,
      "hizbQuarter": 48
    },
    "totalAyahs": 110
  },
  {
    "juzNumber": 7,
    "start": {
      "globalAyahNumber": 751,
      "juzNumber": 7,
      "surahNumber": 5,
      "surahNameArabic": "المَائـِدَةِ",
      "surahNameEnglish": "Al-Maaida",
      "ayahNumber": 82,
      "page": 121,
      "hizbQuarter": 49
    },
    "end": {
      "globalAyahNumber": 899,
      "juzNumber": 7,
      "surahNumber": 6,
      "surahNameArabic": "الأَنۡعَامِ",
      "surahNameEnglish": "Al-An'aam",
      "ayahNumber": 110,
      "page": 141,
      "hizbQuarter": 56
    },
    "totalAyahs": 149
  },
  {
    "juzNumber": 8,
    "start": {
      "globalAyahNumber": 900,
      "juzNumber": 8,
      "surahNumber": 6,
      "surahNameArabic": "الأَنۡعَامِ",
      "surahNameEnglish": "Al-An'aam",
      "ayahNumber": 111,
      "page": 142,
      "hizbQuarter": 57
    },
    "end": {
      "globalAyahNumber": 1041,
      "juzNumber": 8,
      "surahNumber": 7,
      "surahNameArabic": "الأَعۡرَافِ",
      "surahNameEnglish": "Al-A'raaf",
      "ayahNumber": 87,
      "page": 161,
      "hizbQuarter": 64
    },
    "totalAyahs": 142
  },
  {
    "juzNumber": 9,
    "start": {
      "globalAyahNumber": 1042,
      "juzNumber": 9,
      "surahNumber": 7,
      "surahNameArabic": "الأَعۡرَافِ",
      "surahNameEnglish": "Al-A'raaf",
      "ayahNumber": 88,
      "page": 162,
      "hizbQuarter": 65
    },
    "end": {
      "globalAyahNumber": 1200,
      "juzNumber": 9,
      "surahNumber": 8,
      "surahNameArabic": "الأَنفَالِ",
      "surahNameEnglish": "Al-Anfaal",
      "ayahNumber": 40,
      "page": 181,
      "hizbQuarter": 72
    },
    "totalAyahs": 159
  },
  {
    "juzNumber": 10,
    "start": {
      "globalAyahNumber": 1201,
      "juzNumber": 10,
      "surahNumber": 8,
      "surahNameArabic": "الأَنفَالِ",
      "surahNameEnglish": "Al-Anfaal",
      "ayahNumber": 41,
      "page": 182,
      "hizbQuarter": 73
    },
    "end": {
      "globalAyahNumber": 1327,
      "juzNumber": 10,
      "surahNumber": 9,
      "surahNameArabic": "التَّوۡبَةِ",
      "surahNameEnglish": "At-Tawba",
      "ayahNumber": 92,
      "page": 201,
      "hizbQuarter": 80
    },
    "totalAyahs": 127
  },
  {
    "juzNumber": 11,
    "start": {
      "globalAyahNumber": 1328,
      "juzNumber": 11,
      "surahNumber": 9,
      "surahNameArabic": "التَّوۡبَةِ",
      "surahNameEnglish": "At-Tawba",
      "ayahNumber": 93,
      "page": 201,
      "hizbQuarter": 81
    },
    "end": {
      "globalAyahNumber": 1478,
      "juzNumber": 11,
      "surahNumber": 11,
      "surahNameArabic": "هُودٍ",
      "surahNameEnglish": "Hud",
      "ayahNumber": 5,
      "page": 221,
      "hizbQuarter": 88
    },
    "totalAyahs": 151
  },
  {
    "juzNumber": 12,
    "start": {
      "globalAyahNumber": 1479,
      "juzNumber": 12,
      "surahNumber": 11,
      "surahNameArabic": "هُودٍ",
      "surahNameEnglish": "Hud",
      "ayahNumber": 6,
      "page": 222,
      "hizbQuarter": 89
    },
    "end": {
      "globalAyahNumber": 1648,
      "juzNumber": 12,
      "surahNumber": 12,
      "surahNameArabic": "يُوسُفَ",
      "surahNameEnglish": "Yusuf",
      "ayahNumber": 52,
      "page": 241,
      "hizbQuarter": 96
    },
    "totalAyahs": 170
  },
  {
    "juzNumber": 13,
    "start": {
      "globalAyahNumber": 1649,
      "juzNumber": 13,
      "surahNumber": 12,
      "surahNameArabic": "يُوسُفَ",
      "surahNameEnglish": "Yusuf",
      "ayahNumber": 53,
      "page": 242,
      "hizbQuarter": 97
    },
    "end": {
      "globalAyahNumber": 1802,
      "juzNumber": 13,
      "surahNumber": 14,
      "surahNameArabic": "إِبۡرَاهِيمَ",
      "surahNameEnglish": "Ibrahim",
      "ayahNumber": 52,
      "page": 261,
      "hizbQuarter": 104
    },
    "totalAyahs": 154
  },
  {
    "juzNumber": 14,
    "start": {
      "globalAyahNumber": 1803,
      "juzNumber": 14,
      "surahNumber": 15,
      "surahNameArabic": "الحِجۡرِ",
      "surahNameEnglish": "Al-Hijr",
      "ayahNumber": 1,
      "page": 262,
      "hizbQuarter": 105
    },
    "end": {
      "globalAyahNumber": 2029,
      "juzNumber": 14,
      "surahNumber": 16,
      "surahNameArabic": "النَّحۡلِ",
      "surahNameEnglish": "An-Nahl",
      "ayahNumber": 128,
      "page": 281,
      "hizbQuarter": 112
    },
    "totalAyahs": 227
  },
  {
    "juzNumber": 15,
    "start": {
      "globalAyahNumber": 2030,
      "juzNumber": 15,
      "surahNumber": 17,
      "surahNameArabic": "الإِسۡرَاءِ",
      "surahNameEnglish": "Al-Israa",
      "ayahNumber": 1,
      "page": 282,
      "hizbQuarter": 113
    },
    "end": {
      "globalAyahNumber": 2214,
      "juzNumber": 15,
      "surahNumber": 18,
      "surahNameArabic": "الكَهۡفِ",
      "surahNameEnglish": "Al-Kahf",
      "ayahNumber": 74,
      "page": 301,
      "hizbQuarter": 120
    },
    "totalAyahs": 185
  },
  {
    "juzNumber": 16,
    "start": {
      "globalAyahNumber": 2215,
      "juzNumber": 16,
      "surahNumber": 18,
      "surahNameArabic": "الكَهۡفِ",
      "surahNameEnglish": "Al-Kahf",
      "ayahNumber": 75,
      "page": 302,
      "hizbQuarter": 121
    },
    "end": {
      "globalAyahNumber": 2483,
      "juzNumber": 16,
      "surahNumber": 20,
      "surahNameArabic": "طه",
      "surahNameEnglish": "Taa-Haa",
      "ayahNumber": 135,
      "page": 321,
      "hizbQuarter": 128
    },
    "totalAyahs": 269
  },
  {
    "juzNumber": 17,
    "start": {
      "globalAyahNumber": 2484,
      "juzNumber": 17,
      "surahNumber": 21,
      "surahNameArabic": "الأَنبِيَاءِ",
      "surahNameEnglish": "Al-Anbiyaa",
      "ayahNumber": 1,
      "page": 322,
      "hizbQuarter": 129
    },
    "end": {
      "globalAyahNumber": 2673,
      "juzNumber": 17,
      "surahNumber": 22,
      "surahNameArabic": "الحَجِّ",
      "surahNameEnglish": "Al-Hajj",
      "ayahNumber": 78,
      "page": 341,
      "hizbQuarter": 136
    },
    "totalAyahs": 190
  },
  {
    "juzNumber": 18,
    "start": {
      "globalAyahNumber": 2674,
      "juzNumber": 18,
      "surahNumber": 23,
      "surahNameArabic": "المُؤۡمِنُونَ",
      "surahNameEnglish": "Al-Muminoon",
      "ayahNumber": 1,
      "page": 342,
      "hizbQuarter": 137
    },
    "end": {
      "globalAyahNumber": 2875,
      "juzNumber": 18,
      "surahNumber": 25,
      "surahNameArabic": "الفُرۡقَانِ",
      "surahNameEnglish": "Al-Furqaan",
      "ayahNumber": 20,
      "page": 361,
      "hizbQuarter": 144
    },
    "totalAyahs": 202
  },
  {
    "juzNumber": 19,
    "start": {
      "globalAyahNumber": 2876,
      "juzNumber": 19,
      "surahNumber": 25,
      "surahNameArabic": "الفُرۡقَانِ",
      "surahNameEnglish": "Al-Furqaan",
      "ayahNumber": 21,
      "page": 362,
      "hizbQuarter": 145
    },
    "end": {
      "globalAyahNumber": 3214,
      "juzNumber": 19,
      "surahNumber": 27,
      "surahNameArabic": "النَّمۡلِ",
      "surahNameEnglish": "An-Naml",
      "ayahNumber": 55,
      "page": 381,
      "hizbQuarter": 152
    },
    "totalAyahs": 339
  },
  {
    "juzNumber": 20,
    "start": {
      "globalAyahNumber": 3215,
      "juzNumber": 20,
      "surahNumber": 27,
      "surahNameArabic": "النَّمۡلِ",
      "surahNameEnglish": "An-Naml",
      "ayahNumber": 56,
      "page": 382,
      "hizbQuarter": 153
    },
    "end": {
      "globalAyahNumber": 3385,
      "juzNumber": 20,
      "surahNumber": 29,
      "surahNameArabic": "العَنكَبُوتِ",
      "surahNameEnglish": "Al-Ankaboot",
      "ayahNumber": 45,
      "page": 401,
      "hizbQuarter": 160
    },
    "totalAyahs": 171
  },
  {
    "juzNumber": 21,
    "start": {
      "globalAyahNumber": 3386,
      "juzNumber": 21,
      "surahNumber": 29,
      "surahNameArabic": "العَنكَبُوتِ",
      "surahNameEnglish": "Al-Ankaboot",
      "ayahNumber": 46,
      "page": 402,
      "hizbQuarter": 161
    },
    "end": {
      "globalAyahNumber": 3563,
      "juzNumber": 21,
      "surahNumber": 33,
      "surahNameArabic": "الأَحۡزَابِ",
      "surahNameEnglish": "Al-Ahzaab",
      "ayahNumber": 30,
      "page": 421,
      "hizbQuarter": 168
    },
    "totalAyahs": 178
  },
  {
    "juzNumber": 22,
    "start": {
      "globalAyahNumber": 3564,
      "juzNumber": 22,
      "surahNumber": 33,
      "surahNameArabic": "الأَحۡزَابِ",
      "surahNameEnglish": "Al-Ahzaab",
      "ayahNumber": 31,
      "page": 422,
      "hizbQuarter": 169
    },
    "end": {
      "globalAyahNumber": 3732,
      "juzNumber": 22,
      "surahNumber": 36,
      "surahNameArabic": "يسٓ",
      "surahNameEnglish": "Yaseen",
      "ayahNumber": 27,
      "page": 441,
      "hizbQuarter": 176
    },
    "totalAyahs": 169
  },
  {
    "juzNumber": 23,
    "start": {
      "globalAyahNumber": 3733,
      "juzNumber": 23,
      "surahNumber": 36,
      "surahNameArabic": "يسٓ",
      "surahNameEnglish": "Yaseen",
      "ayahNumber": 28,
      "page": 442,
      "hizbQuarter": 177
    },
    "end": {
      "globalAyahNumber": 4089,
      "juzNumber": 23,
      "surahNumber": 39,
      "surahNameArabic": "الزُّمَرِ",
      "surahNameEnglish": "Az-Zumar",
      "ayahNumber": 31,
      "page": 461,
      "hizbQuarter": 184
    },
    "totalAyahs": 357
  },
  {
    "juzNumber": 24,
    "start": {
      "globalAyahNumber": 4090,
      "juzNumber": 24,
      "surahNumber": 39,
      "surahNameArabic": "الزُّمَرِ",
      "surahNameEnglish": "Az-Zumar",
      "ayahNumber": 32,
      "page": 462,
      "hizbQuarter": 185
    },
    "end": {
      "globalAyahNumber": 4264,
      "juzNumber": 24,
      "surahNumber": 41,
      "surahNameArabic": "فُصِّلَتۡ",
      "surahNameEnglish": "Fussilat",
      "ayahNumber": 46,
      "page": 481,
      "hizbQuarter": 192
    },
    "totalAyahs": 175
  },
  {
    "juzNumber": 25,
    "start": {
      "globalAyahNumber": 4265,
      "juzNumber": 25,
      "surahNumber": 41,
      "surahNameArabic": "فُصِّلَتۡ",
      "surahNameEnglish": "Fussilat",
      "ayahNumber": 47,
      "page": 482,
      "hizbQuarter": 193
    },
    "end": {
      "globalAyahNumber": 4510,
      "juzNumber": 25,
      "surahNumber": 45,
      "surahNameArabic": "الجَاثِيَةِ",
      "surahNameEnglish": "Al-Jaathiya",
      "ayahNumber": 37,
      "page": 502,
      "hizbQuarter": 200
    },
    "totalAyahs": 246
  },
  {
    "juzNumber": 26,
    "start": {
      "globalAyahNumber": 4511,
      "juzNumber": 26,
      "surahNumber": 46,
      "surahNameArabic": "الأَحۡقَافِ",
      "surahNameEnglish": "Al-Ahqaf",
      "ayahNumber": 1,
      "page": 502,
      "hizbQuarter": 201
    },
    "end": {
      "globalAyahNumber": 4705,
      "juzNumber": 26,
      "surahNumber": 51,
      "surahNameArabic": "الذَّارِيَاتِ",
      "surahNameEnglish": "Adh-Dhaariyat",
      "ayahNumber": 30,
      "page": 521,
      "hizbQuarter": 208
    },
    "totalAyahs": 195
  },
  {
    "juzNumber": 27,
    "start": {
      "globalAyahNumber": 4706,
      "juzNumber": 27,
      "surahNumber": 51,
      "surahNameArabic": "الذَّارِيَاتِ",
      "surahNameEnglish": "Adh-Dhaariyat",
      "ayahNumber": 31,
      "page": 522,
      "hizbQuarter": 209
    },
    "end": {
      "globalAyahNumber": 5104,
      "juzNumber": 27,
      "surahNumber": 57,
      "surahNameArabic": "الحَدِيدِ",
      "surahNameEnglish": "Al-Hadid",
      "ayahNumber": 29,
      "page": 541,
      "hizbQuarter": 216
    },
    "totalAyahs": 399
  },
  {
    "juzNumber": 28,
    "start": {
      "globalAyahNumber": 5105,
      "juzNumber": 28,
      "surahNumber": 58,
      "surahNameArabic": "المُجَادلَةِ",
      "surahNameEnglish": "Al-Mujaadila",
      "ayahNumber": 1,
      "page": 542,
      "hizbQuarter": 217
    },
    "end": {
      "globalAyahNumber": 5241,
      "juzNumber": 28,
      "surahNumber": 66,
      "surahNameArabic": "التَّحۡرِيمِ",
      "surahNameEnglish": "At-Tahrim",
      "ayahNumber": 12,
      "page": 561,
      "hizbQuarter": 224
    },
    "totalAyahs": 137
  },
  {
    "juzNumber": 29,
    "start": {
      "globalAyahNumber": 5242,
      "juzNumber": 29,
      "surahNumber": 67,
      "surahNameArabic": "المُلۡكِ",
      "surahNameEnglish": "Al-Mulk",
      "ayahNumber": 1,
      "page": 562,
      "hizbQuarter": 225
    },
    "end": {
      "globalAyahNumber": 5672,
      "juzNumber": 29,
      "surahNumber": 77,
      "surahNameArabic": "المُرۡسَلَاتِ",
      "surahNameEnglish": "Al-Mursalaat",
      "ayahNumber": 50,
      "page": 581,
      "hizbQuarter": 232
    },
    "totalAyahs": 431
  },
  {
    "juzNumber": 30,
    "start": {
      "globalAyahNumber": 5673,
      "juzNumber": 30,
      "surahNumber": 78,
      "surahNameArabic": "النَّبَإِ",
      "surahNameEnglish": "An-Naba",
      "ayahNumber": 1,
      "page": 582,
      "hizbQuarter": 233
    },
    "end": {
      "globalAyahNumber": 6236,
      "juzNumber": 30,
      "surahNumber": 114,
      "surahNameArabic": "النَّاسِ",
      "surahNameEnglish": "An-Naas",
      "ayahNumber": 6,
      "page": 604,
      "hizbQuarter": 240
    },
    "totalAyahs": 564
  }
];

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
