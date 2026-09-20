# Project Skills & Agent Guidelines (michaelshimeles/skills)

All AI agents working in this repository must follow the instructions provided by the installed skills from `michaelshimeles/skills` located in `.agents/skills/` (and `.claude/skills/`).

## Installed Skills & Rules

### 1. `new-feature` ([`.agents/skills/new-feature/SKILL.md`](file:///Users/nouradin/Downloads/Wirddy/.agents/skills/new-feature/SKILL.md))
- **When to apply:** At the beginning of every new feature, fix, or task before writing any code.
- **Rules:**
  - Start every task in an isolated Git worktree branched from `origin/main`.
  - Never build directly on `main` or reuse another agent's worktree/branch.
  - Sync with `git fetch origin`, verify scope against open PRs (`gh pr list`, `gh pr diff <n> --name-only`), and name tasks cleanly.
  - Use a gitignored directory for worktrees (e.g. `.worktrees/`).

### 2. `code-structure` ([`.agents/skills/code-structure/SKILL.md`](file:///Users/nouradin/Downloads/Wirddy/.agents/skills/code-structure/SKILL.md))
- **When to apply:** When multiple workflows duplicate operational logic, deciding what belongs in actions vs shared services, or adding features sharing mechanics.
- **Rules:**
  - Maintain a strict two-layer architecture:
    - **Orchestration Layer (Actions):** Owns business rules, state transitions, auth checks, and user-facing error classification (the "why/when").
    - **Service Layer (Shared Mechanics):** Centralizes reusable operations, provider interactions, command execution details, returning structured results (the "how").
  - Build composable capability blocks with explicit parameters. Avoid "God services", leaky services, and premature over-abstraction.
  - Write new logic in actions first; extract to a shared service only when repeated operational mechanics appear across multiple callers.

### 3. `unslop` ([`.agents/skills/unslop/SKILL.md`](file:///Users/nouradin/Downloads/Wirddy/.agents/skills/unslop/SKILL.md))
- **When to apply:** Whenever writing or editing text for human readers (commit messages, PR titles and descriptions, documentation, code comments, and chat responses).
- **Rules:**
  - Eliminate AI tells: cut puffery ("pivotal", "evolving landscape", "setting the stage for", "indelible mark", "deeply rooted"), remove AI vocabulary ("crucial", "delve", "landscape", "testament", "vibrant", "tapestry"), avoid em dashes completely, avoid mid-sentence colon connectors, avoid boldface overuse, and eliminate decorative emojis.
  - Use active voice, plain language ("use" instead of "utilize"), and sentence case headings.
  - Say what the code or feature actually does with concrete facts, numbers, and mechanisms.

### 4. `evidence-driven-testing` ([`.agents/skills/evidence-driven-testing/SKILL.md`](file:///Users/nouradin/Downloads/Wirddy/.agents/skills/evidence-driven-testing/SKILL.md))
- **When to apply:** Whenever testing UI behavior, bug fixes, or non-UI features.
- **Rules:**
  - Never make claims that code or fixes work based on prose alone; always provide verifiable proof.
  - Record visual proof (interactive UI tests, computer use, or headless Playwright script `record.mjs`, or measured probe outputs for APIs). Log structured pass/fail assertions into `.artifacts/<task-name>/`.
  - For bug fixes: reproduce and capture the failure before writing the fix, and capture the working behavior after.

### 5. `before-and-after` ([`.agents/skills/before-and-after/SKILL.md`](file:///Users/nouradin/Downloads/Wirddy/.agents/skills/before-and-after/SKILL.md))
- **When to apply:** Visual comparisons for UI changes and PR documentation.
- **Rules:**
  - Capture before/after screenshots with `@vercel/before-and-after`.
  - Provide markdown comparison tables (`| Before | After |`) for PR reviews.

### 6. `greploop` & `greploop-apps` ([`.agents/skills/greploop/SKILL.md`](file:///Users/nouradin/Downloads/Wirddy/.agents/skills/greploop/SKILL.md), [`.agents/skills/greploop-apps/SKILL.md`](file:///Users/nouradin/Downloads/Wirddy/.agents/skills/greploop-apps/SKILL.md))
- **When to apply:** Optimizing PRs for review standards.
- **Rules:**
  - Run iterative review-fix-push loops until reaching a 5/5 confidence rating with zero unresolved comments.
