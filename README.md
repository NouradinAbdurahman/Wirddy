<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/wirddy-logo-white.png">
  <source media="(prefers-color-scheme: light)" srcset="public/wirddy-logo-black.png">
  <img alt="Wirddy | وِردي" src="public/wirddy-logo-black.png" width="280">
</picture>

### Intelligent Quran Reading Planner for Groups & Families
**مُنظّم ورد القرآن الكريم الذكي للمجموعات والعائلات**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Tests](https://img.shields.io/badge/Tests-115%20Passing-emerald?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Account Free](https://img.shields.io/badge/Auth-100%25%20Account--Free-blue?style=flat-square)](https://wirddy.vercel.app)

[**🌐 Live Demo**](https://wirddy.vercel.app) · [**✨ Features**](#-key-features) · [**📐 Architecture**](#-architecture--data-flow) · [**🚀 Getting Started**](#-getting-started) · [**📄 Export Engine**](#-export--sharing-engine) · [**🧪 Testing**](#-testing--validation)

---

</div>

## 🌟 Overview

**Wirddy (وِردي)** is a modern, high-performance, account-free web application and Progressive Web App (PWA) designed to organize, partition, and rotate weekly Quran reading assignments among groups—such as families, friends, study circles, and Ramadan halaqat.

Users can create a group, configure each member's capacity and Quran knowledge boundaries, choose a duration and starting date, and generate an equitable, non-repeating rotating schedule that guarantees the completion of the Quran (*Khatmah*) on a weekly basis.

---

## ✨ Key Features

### 🧮 Intelligent Quran Scheduling Engine
- **Mathematical Invariant**: Enforces that the total weekly allocation across all members equals exactly 30 Juz (or matches a custom Surah/Juz range).
- **Knowledge-Restricted Partitioning**: Members who only memorize or read specific portions (e.g. Juz 28–30, or Juz 1–15) are strictly assigned within their bounds.
- **Smart Non-Repeating Rotation**: Implements a backtracking solver with an exponential recency-weighted penalty to minimize overlapping assignments across successive weeks.
- **Exact Ayah Resolution**: Automatically resolves abstract Juz numbers to exact Surah names (Arabic & English), Surah numbers, and Ayah numbers based on official Uthmani Quranic metadata.

### 📅 Advanced Group & Calendar Options
- **🌙 Ramadan 30-Day Mode**: Dedicated Ramadan mode (1447 H / custom year) with tailored completion badges and daily tracking.
- **🗓️ Hijri & Gregorian Dates**: Automatic weekly date ranges and calendar calculations.
- **📖 Daily 7-Day Subdivisions**: Optional daily breakdowns dividing each member's weekly assignment into 7 manageable daily reading portions.
- **🏷️ Custom Group Branding**: Support for custom group titles, event descriptions, and organizer notes.

### 🔗 Zero-Login Persistence & Public Links
- **100% Account-Free**: No passwords, signups, emails, or user profiles.
- **Instant Public Share Links**: Groups can be saved and shared via short URLs (`/g/[publicId]`).
- **👤 Personal Member Views**: Dedicated personal URLs (`/g/[publicId]/member/[memberPublicId]`) allowing each member to view and track their individual schedule.
- **🔑 Cryptographic Creator Authorization**: Uses SHA-256 hashed edit keys stored in the creator's browser to allow edits and updates without requiring an account.

### 🎨 Cross-Browser 4K Export Suite
- **🖼️ 4K Ultra-HD PNG**: Standalone weekly cards and individual member cards rendered at retina resolution with embedded Cairo/Inter fonts.
- **📑 Multi-Page A4 PDF**: Content-aware dynamic pagination for printing and digital archiving in Arabic RTL and English LTR.
- **📦 ZIP Bulk Archives**: One-click download of all weeks or all member schedule cards packaged in compressed ZIP archives.
- **🖨️ Dedicated Print Mode**: Clean `@media print` layout with generous margins and high-contrast typography.
- **📱 Native Web Share**: Direct file sharing on mobile (iOS/Android) via the Web Share API.
- **🏷️ Branding Customization**: Configurable export toggles for Wirddy logo, dynamic QR codes, group name, and creation timestamp.

### 🌐 Bilingual (i18n) & Modern Theme System
- **RTL-First Arabic**: Native right-to-left layout with the **Cairo** Google Font and Arabic-Indic numerals option.
- **English LTR**: Complete English translation with the **Inter** Google Font.
- **🌗 Dark / Light / System Mode**: Instantaneous theme switching with smooth transitions and keyboard shortcut (`D` key).
- **📲 Progressive Web App (PWA)**: Installable to home screens with offline caching support and web app manifest.

---

## 📐 Architecture & Data Flow

Wirddy is built on **Next.js 16 (App Router)** with a clean, modular architecture separating the scheduling math, Quran metadata, export rasterization, and presentation layers:

```
wirddy/
├── app/                              # Next.js App Router
│   ├── g/[publicId]/                 # Public group schedule view
│   │   └── member/[memberPublicId]/  # Personal member schedule view
│   ├── layout.tsx                    # Root HTML layout (Cairo & Inter fonts, i18n, ThemeProvider)
│   ├── page.tsx                      # Main single-page application & state machine
│   └── globals.css                   # Tailwind CSS v4 design system
├── components/                       # React Components
│   ├── landing/                      # Hero, Features, How It Works, Example Schedules
│   ├── planner/                      # Group setup form, Range selector, Member list, Rotation styles
│   ├── schedule/                     # Schedule view, Cards/Table/Daily tabs, Export modal, Print view
│   ├── pwa/                          # PWA service worker registration & lifecycle
│   └── ui/                           # Base UI / Radix primitive components
├── lib/                              # Core Domain & Utility Libraries
│   ├── scheduler/                    # Pure TypeScript scheduling engine & validator
│   │   ├── engine.ts                 # Backtracking permutation solver & history weighting
│   │   ├── types.ts                  # MemberConfig, ScheduleInput, GeneratedSchedule
│   │   └── validator.ts              # Pre-generation & post-generation invariant validation
│   ├── quran/                        # Offline Quran metadata & resolution service
│   │   ├── data.ts                   # Static Ayah, Surah, and Juz boundary dataset
│   │   ├── resolver.ts               # Juz-to-Ayah and Surah-to-Juz range resolver
│   │   └── service.ts                # Singleton Quran lookup service
│   ├── export/                       # Cross-browser export rasterization pipeline
│   │   ├── download.ts               # Centralized HTML5 anchor download helper
│   │   ├── filenames.ts              # Cross-browser ASCII filename sanitizer
│   │   ├── render-week.ts            # HTML string generation for cards & table
│   │   ├── render-png.ts             # 4K PNG generation via html-to-image
│   │   ├── render-pdf.ts             # Multi-page A4 PDF generation via jsPDF
│   │   ├── create-zip.ts             # Bulk ZIP archive generation via JSZip
│   │   └── validate-file.ts          # Magic byte signature validators (PNG, PDF, ZIP)
│   ├── groups/                       # Account-free Supabase persistence & Server Actions
│   ├── dates/                        # Hijri & Gregorian calendar utilities & Ramadan logic
│   └── i18n/                         # Lightweight zero-dependency bilingual dictionary & context
├── public/                           # Static assets, logos, icons, PWA manifest, service worker
└── tests/                            # Automated Vitest test suites (115 tests)
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
| `npm run test` | Runs all 115 automated Vitest unit and integration tests |
| `npm run typecheck` | Runs the TypeScript compiler (`tsc --noEmit`) for type validation |
| `npm run format` | Formats all code with Prettier |
| `npm run lint` | Lints the codebase with ESLint |

---

## 📄 Export & Sharing Engine

Wirddy includes a deterministic, cross-browser export pipeline:

```
User Action (PNG / PDF / ZIP / Personal Card)
  │
  ▼
Off-DOM Element Construction (render-week.ts)
  │   - Cairo & Inter fonts embedded as base64 CSS
  │   - Explicit SVG width/height dimensions
  ▼
Rasterization & Binary Generation
  ├── PNG: html-to-image toBlob() at 4K resolution (89 50 4E 47 0D 0A 1A 0A)
  ├── PDF: jsPDF multi-page A4 document (%PDF-)
  └── ZIP: JSZip DEFLATE level 6 archive (50 4B 03 04)
  │
  ▼
Validation & Normalization (validate-file.ts)
  │   - Non-zero byte check & MIME enforcement
  │   - Hexadecimal magic byte verification
  ▼
Centralized Download Pipeline (download.ts)
      - ASCII-safe filename sanitization (filenames.ts)
      - HTML5 connected anchor download with delayed URL revocation
```

---

## 🧪 Testing & Validation

Wirddy features a comprehensive automated test suite covering scheduling correctness, exact Ayah mathematics, export validation, binary signatures, and Supabase persistence:

```bash
npm test
```

### Test Coverage Summary:
- **`scheduler.test.ts`**: Backtracking permutation solver, capacity partitioning, and knowledge bounds.
- **`quran-api.test.ts`**: Offline Quran dataset integrity, Juz boundaries, and Surah mappings.
- **`export.test.ts`**: Filename sanitization, ASCII safety, PDF pagination, and PNG/PDF/ZIP binary header checks.
- **`advanced-features.test.ts`**: Ramadan mode, daily 7-day divisions, Hijri/Gregorian date formatting, and title/description propagation.
- **`share.test.ts`**: Web Share API file attachments, user cancellation handling, and download fallbacks.
- **`supabase-groups.test.ts`**: Account-free CRUD, rate limiting, and cryptographic edit key validation.
- **`pwa.test.ts`**: Manifest metadata, icon configurations, and service worker registration.
- **`logo-export.test.ts`**: Branding toggles, QR code resolution, and theme color fidelity.
- **`comprehensive-e2e.test.ts`**: Full end-to-end user workflows from group setup to export generation.

---

## 🔒 Privacy & Data Policy

- **No User Tracking**: Wirddy does not use third-party tracking scripts, analytics cookies, or advertising trackers.
- **Zero Login**: No personal contact details, emails, or phone numbers are ever requested or stored.
- **Encrypted Edit Keys**: Group creator authorization keys are generated with cryptographic entropy and stored exclusively in the creator's local browser storage.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with care for families and Quran reading circles worldwide.</sub>
</div>
