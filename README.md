<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/wirddy-logo-white.png">
  <source media="(prefers-color-scheme: light)" srcset="public/wirddy-logo-black.png">
  <img alt="Wirddy | وِردي" src="public/wirddy-logo-black.png" width="280">
</picture>

### Intelligent Quran Reading Planner & Modern Digital Mushaf Workspace
**مُنظّم ورد القرآن الكريم الذكي والمصحف الإلكتروني التفاعلي للمجموعات والعائلات**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Tests](https://img.shields.io/badge/Tests-160%20Passing-emerald?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Auth](https://img.shields.io/badge/Auth-Account--Free%20%2B%20Supabase-blue?style=flat-square)](https://wirddy.vercel.app)

[**🌐 Live App**](https://wirddy.vercel.app) · [**📖 Quran Reader**](#-authentic-digital-mushaf-reader) · [**✨ Features**](#-key-features) · [**📐 Architecture**](#-architecture--data-flow) · [**🚀 Getting Started**](#-getting-started) · [**🧪 Testing**](#-testing--validation)

---

</div>

## 🌟 Overview

**Wirddy (وِردي)** is an all-in-one Islamic productivity platform and modern Quran workspace built for individuals, families, friends, study circles, and Ramadan halaqat. 

It combines two core experiences:
1. **An Intelligent Quran Group Scheduler**: Automatically partitions, balances, and rotates weekly reading assignments across members with capacity constraints and memorization boundaries, ensuring seamless group *Khatmahs*.
2. **An Authentic Digital Mushaf Reader (`/reader`)**: A canonical 604-page Madani Mushaf reader with physical book transitions, responsive two-page open spreads on desktop, integrated Ayah study dialogs, Arabic typography, multiple reading themes (Dark, Sepia, Light), and instant search.

---

## ✨ Key Features

### 📖 Authentic Digital Mushaf Reader
- **Canonical 604-Page Madani Layout**: Continuous Uthmani text flow with natural inline verse markers instead of isolated Ayah cards.
- **Unified Two-Page Open Spread (`/reader`)**: On large desktop screens ($\ge 1600\text{px}$ or when sidebars are collapsed), presents a single, continuous open Mushaf surface with a subtle center book spine gutter, single outer border, and proper RTL visual ordering (lower page on the Right, next page on the Left).
- **Directional Book-Like Horizontal Slide Transition**: Natural 220ms horizontal page-turn transition (`transform: translateX`) matching RTL physical reading without artificial opacity fades or flickering.
- **Ayah Details & Study Dialog**: Clicking any verse opens an interactive study dialog with full Arabic calligraphy, English translation, copy actions, bookmarking, and next/prev Ayah study navigation.
- **Instant Quran Search**: Fast modal search across all 114 Surahs and 6,236 Ayahs with coordinate jumps.
- **Reading Themes & Typography**: Dark Mode, Sepia (Warm Parchment) Mode, and Light Mode with support for *Scheherazade (Naskh - Default)*, *Amiri Quran*, *Amiri Classic*, and *IndoPak Naskh*, plus customizable font size and line spacing.
- **Collapsible Sidebar & Focus Mode**: Toggleable desktop navigation sidebar to expand the reading workspace on demand.

### 🧮 Intelligent Quran Scheduling Engine
- **Mathematical Invariant**: Enforces that total weekly allocations across all members equal exactly 30 Juz (or matches a custom Surah/Juz range).
- **Knowledge-Restricted Partitioning**: Members who only memorize or read specific portions (e.g. Juz 28–30, or Juz 1–15) are strictly assigned within their bounds.
- **Smart Non-Repeating Rotation**: Backtracking solver with exponential recency-weighted penalty to minimize overlapping assignments across successive weeks.
- **Exact Ayah Resolution**: Automatically resolves abstract Juz numbers to exact Surah names, Surah numbers, and Ayah coordinates based on official Uthmani Quranic metadata.

### 📊 Modern Dashboard (`/dashboard`)
- **Reading Progress & Active Portions**: Overview of today's assigned reading portion, group Khatmah status, and current progress.
- **Group Management**: Quick access to active reading groups, personal assignment links, and schedule updates.
- **Responsive Workspace**: Seamless desktop and mobile layout with quick action drawers and bottom navigation bar.

### 📅 Advanced Group & Calendar Options
- **🌙 Ramadan 30-Day Mode**: Dedicated Ramadan mode (1447 H / custom year) with tailored completion badges and daily tracking.
- **🗓️ Hijri & Gregorian Dates**: Automatic weekly date ranges and calendar calculations.
- **📖 Daily 7-Day Subdivisions**: Optional daily breakdowns dividing each member's weekly assignment into 7 manageable daily reading portions.
- **🏷️ Custom Group Branding**: Support for custom group titles, event descriptions, and organizer notes.

### 🔗 Zero-Login Persistence & Supabase Integration
- **100% Account-Free Option**: Create and share schedules instantly without signups or passwords via public links (`/g/[publicId]`).
- **👤 Personal Member Views**: Dedicated personal URLs (`/g/[publicId]/member/[memberPublicId]`) allowing each member to view and track their individual schedule.
- **🔑 Cryptographic Creator Authorization**: SHA-256 hashed edit keys stored in the creator's browser to allow edits without requiring an account.
- **🔐 Optional Supabase Authentication**: Email/Password and OAuth support for authenticated users who wish to synchronize groups and bookmarks across devices.

### 🎨 Cross-Browser 4K Export Suite
- **🖼️ 4K Ultra-HD PNG**: Standalone weekly cards and individual member cards rendered at retina resolution with embedded Cairo/Inter fonts.
- **📑 Multi-Page A4 PDF**: Content-aware dynamic pagination for printing and digital archiving in Arabic RTL and English LTR.
- **📦 ZIP Bulk Archives**: One-click download of all weeks or all member schedule cards packaged in compressed ZIP archives.
- **🖨️ Dedicated Print Mode**: Clean `@media print` layout with generous margins and high-contrast typography.
- **📱 Native Web Share**: Direct file sharing on mobile (iOS/Android) via the Web Share API.

### 📲 Progressive Web App (PWA) & Offline
- **Installable PWA**: Installable to home screens on iOS (Safari) and Android (Chrome) with custom app icons and standalone display mode.
- **Offline Reliability**: Service worker caching for Quran pages, static assets, and client-side scheduling.

---

## 📐 Architecture & Data Flow

```
wirddy/
├── app/                              # Next.js 16 App Router (Turbopack)
│   ├── dashboard/                    # User dashboard & reading overview
│   ├── reader/                       # Canonical 604-page Mushaf workspace
│   ├── settings/                     # User preferences & account settings
│   ├── login/                        # Authentication & sign-in
│   ├── g/[publicId]/                 # Public group schedule view
│   │   └── member/[memberPublicId]/  # Personal member schedule view
│   ├── layout.tsx                    # Root HTML layout (Cairo & Inter fonts, i18n, ThemeProvider)
│   ├── page.tsx                      # Landing page & unified Khatmah planner
│   └── globals.css                   # Tailwind CSS v4 design system & Mushaf themes
├── components/                       # React Components
│   ├── reader/                       # QuranReader, AyahDetailsDialog, SearchModal
│   ├── layout/                       # AppSidebar, Header, Footer
│   ├── landing/                      # Hero, Features, How It Works, AddToHomeScreen
│   ├── planner/                      # Group setup form, Range selector, Member list
│   ├── schedule/                     # Schedule view, Cards/Table/Daily tabs, Export modal
│   ├── pwa/                          # PWA service worker registration & lifecycle
│   └── ui/                           # Base UI / Radix primitive components
├── lib/                              # Core Domain & Utility Libraries
│   ├── quran/                        # Offline Quran metadata, 604 pages, and API service
│   │   ├── pages-data.ts             # 604 canonical pages mapping & coordinates
│   │   ├── api.ts                    # LRU cached Quran verse & translation fetcher
│   │   └── service.ts                # Singleton Quran lookup & Ayah coordinate service
│   ├── scheduler/                    # Pure TypeScript scheduling engine & validator
│   │   ├── engine.ts                 # Backtracking permutation solver & history weighting
│   │   ├── types.ts                  # MemberConfig, ScheduleInput, GeneratedSchedule
│   │   └── validator.ts              # Pre-generation & post-generation invariant validation
│   ├── export/                       # Cross-browser export rasterization pipeline
│   │   ├── render-png.ts             # 4K PNG generation via html-to-image
│   │   ├── render-pdf.ts             # Multi-page A4 PDF generation via jsPDF
│   │   ├── create-zip.ts             # Bulk ZIP archive generation via JSZip
│   │   └── validate-file.ts          # Magic byte signature validators (PNG, PDF, ZIP)
│   ├── groups/                       # Account-free & authenticated Supabase persistence
│   ├── dates/                        # Hijri & Gregorian calendar utilities & Ramadan logic
│   └── i18n/                         # Lightweight zero-dependency bilingual dictionary & context
└── tests/                            # Vitest automated test suite (160 tests, 13 test files)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/NouradinAbdurahman/Wirddy.git
   cd Wirddy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Starts the production server |
| `npm run test` | Runs all 160 automated Vitest unit and integration tests |
| `npm run typecheck` | Runs the TypeScript compiler (`tsc --noEmit`) for strict type validation |
| `npm run lint` | Lints the codebase with ESLint |
| `npm run format` | Formats all code with Prettier |

---

## 🧪 Testing & Validation

Wirddy features a comprehensive automated test suite covering Quran page mapping, Ayah boundary navigation, scheduling algorithms, binary signatures, and Supabase persistence:

```bash
npm test
```

### Test Coverage Summary (160 Passing Tests):
- **`reader-integration.test.ts`**: Canonical 604-page Madani Mushaf coordinates, Ayah boundaries, two-page spread pairings, and dictionary translations.
- **`platform-features.test.ts`**: Quran search across Surahs/Ayahs, group creation, and export workflows.
- **`pages-data.test.ts`**: Verification of all 604 page boundaries and Surah start indices.
- **`scheduler.test.ts`**: Backtracking permutation solver, capacity partitioning, and knowledge bounds.
- **`quran-api.test.ts`**: Offline Quran dataset integrity, Juz boundaries, and Surah mappings.
- **`export.test.ts`**: Filename sanitization, ASCII safety, PDF pagination, and PNG/PDF/ZIP binary header checks.
- **`advanced-features.test.ts`**: Ramadan mode, daily 7-day divisions, Hijri/Gregorian date formatting, and title/description propagation.
- **`share.test.ts`**: Web Share API file attachments, user cancellation handling, and download fallbacks.
- **`supabase-groups.test.ts`**: Account-free CRUD, rate limiting, and cryptographic edit key validation.
- **`auth.test.ts`**: Auth redirects, URL sanitization, and session state handling.
- **`pwa.test.ts`**: Manifest metadata, icon configurations, and service worker registration.
- **`logo-export.test.ts`**: Branding toggles, QR code resolution, and theme color fidelity.
- **`comprehensive-e2e.test.ts`**: End-to-end user workflows from group setup to export generation.

---

## 🔒 Privacy & Data Policy

- **No User Tracking**: Wirddy does not use third-party tracking scripts, analytics cookies, or advertising trackers.
- **Account-Free Sharing**: No personal contact details, emails, or phone numbers are required to create or view group schedules.
- **Cryptographic Edit Keys**: Group creator authorization keys are generated with cryptographic entropy and stored exclusively in the creator's local browser storage.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with care for families and Quran reading circles worldwide.</sub>
</div>
