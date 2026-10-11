# CLAUDE.md

This file guides Claude Code (claude.ai/code) and other agents working in this repository.

## Read first: project skills (`npx skills add michaelshimeles/skills`)

This project uses the skills installed by `npx skills add michaelshimeles/skills`. They live in `.claude/skills/` and `.agents/skills/` and are committed, so every checkout has them. If either folder is missing, run `npx skills add michaelshimeles/skills -s '*' -y` from the repo root.

Every agent, on every task, must read and follow these skills:

- **`new-feature`** (`.claude/skills/new-feature/SKILL.md`): sync with `origin/main`, check open PRs for overlapping files, and work on your own branch or worktree. Claude Code manages worktrees under `.claude/worktrees/`; keep a branch the harness assigned you.
- **`code-structure`** (`.claude/skills/code-structure/SKILL.md`): actions own business rules and authorization; services hold shared mechanics. Example: `lib/groups/actions.ts` (actions), `lib/groups/service.ts` (domain rules), `lib/groups/persistence.ts` (shared DB mechanics).
- **`unslop`** (`.claude/skills/unslop/SKILL.md`): plain language in commits, PRs, docs, comments, and replies. No em dashes, puffery, or decorative emoji.
- **`evidence-driven-testing`** (`.claude/skills/evidence-driven-testing/SKILL.md`): prove behavior. Capture the failure before a fix and the passing result after. Put evidence in `.artifacts/<task>/`.
- **`before-and-after`** (`.claude/skills/before-and-after/SKILL.md`): screenshot comparisons for UI changes.
- **`greploop` / `greploop-apps`** (`.claude/skills/greploop/`): iterate on PR review feedback until it is resolved.

## What this is

Wirddy (وِردي) is a Quran reading planner for groups (family, friends, mosque circles). A user creates a group, adds members with the part of the Quran each knows and how much each reads per week, picks a number of weeks, and the app builds a rotating schedule that splits the Quran across members. It shows the schedule as cards and a table and exports PNG, PDF, and ZIP files. It is a Next.js PWA, Arabic first (RTL) with English support.

Generating a schedule runs entirely in the browser. Saving, sharing, accounts, reading progress, reminders, and recurring cycles use Supabase through server actions.

The product spec is in `Docs/Product Requirements Document`. Read it before changing scheduling rules or terminology.

## This Next.js version is newer than your training data

`package.json` pins `next@16.2.6`. Per `AGENTS.md`, check `node_modules/next/dist/docs/` before writing App Router code or config.

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint (must report 0 errors)
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npx vitest run tests/scheduler-regressions.test.ts   # one file
npx vitest run -t "links a slot"                     # tests by name
```

There is no vitest config file; Vitest runs `tests/*.test.ts` with defaults (use relative imports in tests, the `@/` alias is not set up for Vitest).

`.prettierrc` says no semicolons and double quotes; most files follow it. Do not run `npm run format` across the whole tree as a side effect of another task.

## Architecture

### Planner page (`app/page.tsx`)

A client component holding one `AppStep` (`landing`, `planner`, `schedule`) in React state. The whole plan is saved to `localStorage` under `wirddy_planner_state_v3` and restored on the first render after hydration (see `hooks/use-hydrated.ts`). Validation errors and warnings appear live through `components/planner/validation-notice.tsx`, because the Generate button stays disabled while input is invalid.

### Scheduling core (`lib/scheduler/`)

Pure, framework free, and unit tested.

- `types.ts`: `MemberConfig`, `ScheduleInput`, `GeneratedSchedule`, and so on.
- `knowledge.ts`: turns a member's knowledge (`entire`, `juz_range`, `surah_range`) into an exact global ayah interval, and lists the Juz a member fully knows. A Surah range only counts a Juz when every ayah of that Juz is in a known Surah.
- `validator.ts`: `validateScheduleInput` returns bilingual errors (and `warnings`, such as a Ramadan plan longer than 30 days). It checks custom ranges ayah by ayah, that every Juz is known by some member, and that each member's amount fits what they know.
- `engine.ts`: `generateQuranSchedule(input)`. Both modes share one solver over "units" (Juz in full mode, starting at `startJuz` and wrapping from 30 to 1; ayahs in custom mode). For each week, a depth-first search orders members into consecutive blocks so each block is fully inside its member's known range. Dead ends are memoized by the multiset of remaining member types, and a fixed node budget caps the time spent improving rotation, so generation stays fast (30 members over 52 weeks takes under 100 ms). Repetition cost is the overlap with each member's earlier portions, weighted by 1/age so recent repeats cost more. Failures throw `SchedulerError` with `messageAr` and `messageEn`.

Changes here affect the product guarantee: every week covers the whole range with no gaps or overlaps, and every member reads only what they know. `tests/scheduler-regressions.test.ts` checks this.

### Quran data (`lib/quran/`)

- `data.ts` and `pages-data.ts`: static datasets (114 Surahs, 6236 ayahs, Juz boundaries, Mushaf pages), generated by `scripts/fetch-quran-data.ts` from the AlQuran Cloud API.
- `service.ts` (`quranService`): offline lookups. `getGlobalAyahNumber` clamps out-of-range input, so validate user input before calling it.
- `resolver.ts`: public API (`resolveJuzRange`, `resolveSurahToJuzRange`, `resolveSurahToKnownJuzRange`, `formatAyahReference`).
- `api.ts`: the Quran reader fetches page text from AlQuran Cloud at runtime. The service worker caches those responses cache-first in `wirddy-quran-text-v1`, so pages read once work offline.

### Groups backend (`lib/groups/`, `lib/supabase/`, `supabase/`)

- `actions.ts`: server actions. Authentication, rate limits (`checkSharedRateLimit`, backed by the `check_rate_limit` Postgres function, with an in-memory fallback), and user-facing errors.
- `service.ts`: domain rules. Saving regenerates the schedule on the server from validated input and ignores any schedule the browser sends. Editing updates member rows in place so public IDs, linked accounts, and reading progress survive. Linking never takes over a slot linked to another account, and an account can hold one slot per group. Progress on a linked slot can only be changed by that account or the group owner. Recurring groups store `recurrence` and `next_cycle_due_at`; the cron job creates the next cycle when due, points it back with `recurring_source_group_id`, and hands auto renewal to the new cycle.
- `persistence.ts`: shared DB mechanics (member lookup by public ID with `eq` filters only, batched plan inserts).
- `lib/supabase/types.ts`: generated `Database` types. Update them when a migration adds columns, instead of casting queries to `any`.
- `supabase/migrations/`: the source of truth for the schema. `supabase/schema.sql` is the migrations concatenated in order; regenerate it after adding a migration (command in its header).
- Cron routes in `app/api/cron/` require `Authorization: Bearer $CRON_SECRET` and refuse every request when `CRON_SECRET` is unset (`lib/auth/cron.ts`). Reminders run every 15 minutes and match each user's local reminder time to one run.

### Browser state helpers (`hooks/`, `lib/storage/`)

- `hooks/use-hydrated.ts` and `hooks/use-storage-value.ts`: read browser-only values without setting state in effects (the `react-hooks/set-state-in-effect` lint rule is on). Prefer these, derived state, or setting state in async callbacks.
- `lib/storage/offline-sync.ts`: progress saved while offline is queued in IndexedDB and replayed when the connection returns (`saveProgressOrQueue`, flushed by `useOfflineSync` in `components/pwa/pwa-registrar.tsx`).
- `lib/i18n/`: a small context provider. `useI18n()` returns `{ language, dir, t, setLanguage, formatNumber }`. The language is stored in `localStorage` (`wirddy_language`). Arabic and RTL are the defaults; keep that when adding UI.

### Export (`lib/export/`)

`render-week.ts` builds HTML per language and theme; `render-png.ts` and `render-pdf.ts` rasterize it with `html-to-image` and `jspdf`; `create-zip.ts` bundles weeks with `jszip`; `assets.ts` waits for fonts so Arabic glyphs do not clip. `types.ts` holds display models separate from the scheduler's types.

### UI

Components live by feature under `components/` (`landing/`, `planner/`, `schedule/`, `dashboard/`, `reader/`, `layout/`, `pwa/`, and `ui/` for shadcn/ui primitives; add more with `npx shadcn@latest add <component>`).

## Conventions

- Path alias `@/*` maps to the repo root.
- Icons come from `@tabler/icons-react`. Swap directional icons using `dir` from `useI18n()`.
- Animation uses `motion/react`, never `framer-motion`.
- Keep scheduler and Quran logic pure and tested in `tests/`. Backend tests use the in-memory Supabase fake in `tests/helpers/fake-supabase.ts`, which rejects non-UUID values in UUID columns the way Postgres does.
- The service worker (`public/sw.js`) is registered as `/sw.js?v=<build id>`, so each deploy gets a fresh cache.
