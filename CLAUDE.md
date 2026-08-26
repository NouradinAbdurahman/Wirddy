# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Wirddy (وِردي) is a Quran reading-division planner for groups (family, friends, mosque groups, etc.). A user creates a group, adds members with their Quran knowledge bounds and weekly reading capacity, picks a number of weeks, and the app generates a rotating weekly schedule that partitions the full Quran (Juz 1–30) across members — output as on-screen cards/table and exportable PNG/PDF/ZIP. It's a Next.js PWA, Arabic-first (RTL) with English support, fully client-side (no backend calls at runtime; a `supabase/schema.sql` exists for a possible future backend but nothing in the app currently talks to Supabase).

The full spec is in `Docs/Product Requirements Document` — read it when working on scheduling rules, terminology, or UX flow, since it defines invariants (e.g. "weekly reading allocation must equal exactly 30 Juz") that the code enforces.

## Important: this Next.js version is unfamiliar territory

`package.json` pins `next@16.2.6`, a version newer than most training data. Per `AGENTS.md`, treat this as **not** the Next.js you know — APIs, conventions, and file structure may differ. Before writing App Router code, config, or anything Next-specific, check `node_modules/next/dist/docs/` for the current APIs rather than relying on memorized conventions.

## Commands

```bash
npm run dev         # start dev server
npm run build        # production build
npm run start        # run production build
npm run lint          # eslint
npm run typecheck    # tsc --noEmit
npm run format        # prettier --write on **/*.{ts,tsx}
npm test               # vitest run (all tests)
npx vitest run tests/scheduler.test.ts   # run a single test file
npx vitest run -t "resolves Juz 1"          # run tests matching a name
```

There is no vitest config file; it runs with Vitest defaults directly against `tests/*.test.ts`.

Note: `.prettierrc` is configured for no semicolons and double quotes, but the existing codebase is written with semicolons and single quotes throughout. Running `npm run format` against the whole tree will produce a large, unrelated diff — don't run it repo-wide as a side effect of an unrelated task.

## Architecture

**Data flow is entirely client-side and single-page.** `app/page.tsx` (`'use client'`) is a state machine with one `AppStep` (`landing → group_name → members → schedule`) held in local React state, persisted to `localStorage` under `wirddy_planner_state_v1`. There is no routing between steps and no server state.

**Scheduling core (`lib/scheduler/`)** is pure and framework-agnostic:
- `types.ts` — `MemberConfig`, `ScheduleInput`, `GeneratedSchedule`, etc.
- `validator.ts` — `validateScheduleInput` (pre-generation) and `validateGeneratedSchedule` (post-generation invariant check), each returning bilingual (`messageAr`/`messageEn`) errors.
- `engine.ts` — `generateQuranSchedule(input)` is the entry point. For each week it runs a backtracking search (`solveWeekPermutation`) that finds an ordering of members partitioning Juz 1–30 that respects each member's knowledge bounds (`startJuz`/`endJuz`), preferring assignments that minimize overlap with a member's own reading history in prior weeks (exponential recency-weighted penalty, so rotation avoids repeats). This is the trickiest part of the codebase — changes here affect correctness of the core product guarantee (every week sums to exactly 30 Juz, only within each member's known range).

**Quran reference data (`lib/quran/`)** turns abstract Juz numbers into exact Ayah/Surah locations:
- `data.ts` holds the static dataset (Juz boundaries, Surah list, Surah→Juz map), derived from the AlQuran Cloud API (see `yaml.yml`, its OpenAPI spec, and `scripts/fetch-quran-data.ts` which regenerates `data.ts`).
- `service.ts` (`quranService`, a singleton `QuranDataService`) is the lookup layer over that static data — offline, deterministic, no network calls at runtime.
- `resolver.ts` is the public-facing API used by the scheduler (`resolveJuzRange`, `resolveSurahToJuzRange`, `formatAyahReference`) — wraps `quranService` and produces `AyahRef`/`ExactQuranRange`.
- `types.ts` distinguishes raw AlQuran Cloud API shapes (`Api*`) from normalized internal models (`QuranLocation`, `SurahInfo`, `JuzBoundary`).

**i18n (`lib/i18n/`)** is a from-scratch context provider, not a library: `dictionary.ts` holds `translations` keyed by `Language` (`'ar' | 'en'`), `context.tsx` exposes `useI18n()` giving `{ language, dir, t, setLanguage, formatNumber }`. `formatNumber` converts digits to Arabic-Indic numerals when `language === 'ar'`. Language/direction are also written to `document.documentElement` and persisted to `localStorage` (`wirddy_language`). Arabic is the default language and RTL is the default document direction (set in `app/layout.tsx`); English/LTR is the alternate, not the default — keep that direction when adding UI strings or layout logic.

**Export pipeline (`lib/export/`)** turns a `GeneratedSchedule` into shareable artifacts, re-exported as a flat barrel from `index.ts`:
- `render-week.ts` builds raw HTML strings for schedule cards/table (per-language, per-theme), rendered off-DOM.
- `render-png.ts` / `render-pdf.ts` use `html-to-image` (`toBlob`) and `jspdf` to rasterize that HTML into images/PDF pages.
- `create-zip.ts` (via `jszip`) bundles multiple week exports into one archive.
- `assets.ts` handles font preloading/readiness before rendering (`ensureFontsReady`) so exported images don't clip Arabic glyphs.
- `filenames.ts`, `validate-file.ts`, `download.ts` handle naming, validation, and triggering browser downloads.
- `types.ts` defines the export-specific shapes (`ExportSchedule`, `ExportWeek`, `ExportMember`) — these are display/render models, separate from the scheduler's `GeneratedSchedule`/`MemberAssignment`, so exporting means mapping one to the other.

**UI components** are organized by feature area under `components/`: `landing/` (marketing sections), `planner/` (group/member setup form steps), `schedule/` (generated schedule display + export modal), `layout/` (header/footer), `pwa/` (service worker registration), and `ui/` (shadcn/ui primitives — add more via `npx shadcn@latest add <component>`, configured in `components.json` with `style: base-maia`, `baseColor: mist`, `iconLibrary: tabler`, and `rtl: true`).

## Conventions worth knowing

- Path alias `@/*` maps to the repo root (see `tsconfig.json`), matching the `components.json` aliases (`@/components`, `@/lib`, `@/hooks`, `@/components/ui`).
- Icons come from `@tabler/icons-react` (per `components.json`'s `iconLibrary`), and directional icons (arrows, chevrons) should be swapped based on `dir` from `useI18n()` rather than hard-coded, since the app is RTL-first.
- Motion/animation uses the `motion` package (`motion/react`), not `framer-motion`.
- Scheduler and Quran-resolution logic is pure and unit-tested in `tests/` (`scheduler.test.ts`, `quran-api.test.ts`) independent of React — keep new logic there similarly pure/testable rather than embedding it in components.
