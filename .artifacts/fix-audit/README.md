# Audit fixes: evidence

Proof for the fixes on branch `claude/epic-brown-qz0uub`. Each bug was reproduced before its fix and checked after.

## Scheduler

- `scheduler-before.txt`: the regression suite did not finish in 120 s. The 15-member random-rotation case hung.
- `scheduler-after.txt`: all 17 regression tests pass, with timings. 30 members over 52 weeks: 89 ms (was 775 ms after the correctness fix and unbounded before it). 15 members with mixed knowledge, 4 rotation styles × 12 weeks: 165 ms.

Covered: wrap-around knowledge (start at Juz 28), Surah knowledge enforcement, fully known Juz mapping, impossible splits failing fast with Arabic and English messages, custom ranges (reversed, nonexistent ayahs, too small, no gaps or reversed portions, knowledge bounds, public IDs), and the Ramadan length warning.

## Backend (run against an in-memory Supabase fake that rejects non-UUID values in UUID columns like Postgres)

`backend-before.txt`, from the original `lib/groups/service.ts`:

- link status returned `null` and linking returned `false` (the UUID comparison error)
- two members named "Ahmed" were both saved as member 0 (`[0, 0, 2]`)
- one edit deleted every reading-progress row and every account link
- progress for week 99, day −3 was accepted

`backend-after.txt`: 24 passing tests for linking, takeover protection, filter injection, duplicate names, server-side regeneration, edits that keep links and progress, progress permissions and validation, owner-only progress summaries, member pages, account deletion, and recurring cycles (due date, one cycle per due date, link carry-over).

## Browser (production build, Playwright, 390×844)

`browser-results.txt`: 9/9 pass. Screenshots in `screens/`:

1. `01-landing-ar.png`: Arabic RTL landing page
2. `02-impossible-split-ar.png`: impossible plan shows an Arabic error in under 1 s
3. `03-schedule-generated.png`: wrap-around plan generated; the member who knows Juz 1-15 stays inside it
4. `04-validation-notice.png`: live message explains why Generate is disabled (total 29)
5. `05-dashboard.png`: dashboard without accounts configured shows no endless spinner
6. `06-reader-offline.png`: reader explains a page that cannot load offline

Cron endpoints return 401 with no secret and with a wrong secret (`curl` against the production build).
