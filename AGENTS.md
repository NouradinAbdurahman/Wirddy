<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Read first: `npx skills add michaelshimeles/skills`

This project's agent skills come from `npx skills add michaelshimeles/skills` and are committed under `.claude/skills/` and `.agents/skills/`. Every agent must read the `SKILL.md` of each skill and follow it on every task. If the folders are missing, run `npx skills add michaelshimeles/skills -s '*' -y` from the repo root first. `CLAUDE.md` describes the codebase.

# AI Agent Workflow & Skills (`michaelshimeles/skills`)

Whenever any AI agent works in this repository, you must read and strictly follow the instructions in the skills installed via `npx skills add michaelshimeles/skills` located in `.agents/skills/` (and `.claude/skills/`).

## Mandatory Skills & Protocols

### 1. `new-feature` ([`.agents/skills/new-feature/SKILL.md`](/.agents/skills/new-feature/SKILL.md))
- **When to apply:** At the start of every new feature, fix, or task before modifying code.
- **Rules:**
  - Start every task in an isolated Git worktree branched from `origin/main`.
  - Never develop directly on `main`, and never reuse another agent's worktree or branch.
  - Sync with `git fetch origin` and check open PR scopes (`gh pr list`, `gh pr diff <n> --name-only`) to avoid collisions.
  - Keep worktrees in a gitignored directory (e.g. `.worktrees/`).
  - *Harness note:* Claude Code manages worktrees under `.claude/worktrees/`; respect harness-managed worktrees.

### 2. `code-structure` ([`.agents/skills/code-structure/SKILL.md`](/.agents/skills/code-structure/SKILL.md))
- **When to apply:** When creating or refactoring features, workflows, and services.
- **Rules:**
  - Maintain a strict two-layer architecture:
    - **Orchestration Layer (Actions):** Owns business rules, state transitions, authorization, and error classification (the "why/when").
    - **Service Layer (Shared Mechanics):** Centralizes reusable operational mechanics, provider/SDK interactions, execution details, returning structured results (the "how").
  - Avoid God services, leaky services, and premature over-abstraction. Write logic in actions first; extract to services only when operations repeat across multiple callers.

### 3. `unslop` ([`.agents/skills/unslop/SKILL.md`](/.agents/skills/unslop/SKILL.md))
- **When to apply:** Whenever writing or editing text for human readers (commit messages, PR titles/descriptions, documentation, code comments, and chat responses).
- **Rules:**
  - Cut AI tells and puffery: avoid "pivotal", "testament to", "evolving landscape", "setting the stage for", "indelible mark", "deeply rooted", "delve", "crucial", "tapestry", "vibrant".
  - Eliminate punctuation tells: no em dashes (`, `), no mid-sentence colons, no boldface overuse, and no decorative emojis.
  - Use active voice, plain language ("use" instead of "utilize"/"leverage"), sentence case headings, and concrete numbers/facts.

### 4. `evidence-driven-testing` ([`.agents/skills/evidence-driven-testing/SKILL.md`](/.agents/skills/evidence-driven-testing/SKILL.md))
- **When to apply:** Whenever verifying changes, fixes, or new capabilities.
- **Rules:**
  - Never claim code or fixes work without verifiable proof.
  - UI testing: drive the app live or with scripted browser probes (Playwright), capturing recordings/screenshots and structured pass/fail assertions into `.artifacts/<task-name>/`.
  - Logic/scheduler testing: run Vitest with exact test output and before/after verification.
  - Bug fixes: capture the failure before writing the fix, and capture the working behavior after.

### 5. `before-and-after` ([`.agents/skills/before-and-after/SKILL.md`](/.agents/skills/before-and-after/SKILL.md))
- **When to apply:** When making UI changes and preparing PR documentation.
- **Rules:**
  - Use `@vercel/before-and-after` to capture visual comparisons.
  - Generate markdown comparison tables (`| Before | After |`) for PR reviews.

### 6. `greploop` & `greploop-apps` ([`.agents/skills/greploop/SKILL.md`](/.agents/skills/greploop/SKILL.md), [`.agents/skills/greploop-apps/SKILL.md`](/.agents/skills/greploop-apps/SKILL.md))
- **When to apply:** When preparing or refining PRs for merge.
- **Rules:**
  - Follow an iterative review-fix-push loop until reaching a 5/5 confidence rating with zero unresolved comments.
