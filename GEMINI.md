# Gemini & Antigravity Agent Guidelines

This workspace has installed skills from `michaelshimeles/skills` under `.agents/skills/`. All agents operating in this project must adhere to the instructions defined in `.agents/skills/` and summarized below.

## Installed Skills Reference

- **Worktrees (`new-feature`):** Always create a worktree for new tasks from `origin/main` before writing code.
- **Architecture (`code-structure`):** Keep orchestration (actions) separated from shared mechanics (services).
- **Communication & Docs (`unslop`):** Avoid puffery, AI vocabulary, em dashes, and decorative emojis. Speak plainly with concrete facts and numbers.
- **Verification (`evidence-driven-testing`):** Provide proof through screenshots/recordings and structured assertions, not prose claims alone.
- **UI Comparisons (`before-and-after`):** Use `@vercel/before-and-after` to capture before/after states for UI PRs.
- **Code Review Loops (`greploop` / `greploop-apps`):** Resolve all actionable feedback until reaching 5/5 confidence.

See [AGENTS.md](file:///Users/nouradin/Downloads/Wirddy/AGENTS.md) and [.agents/rules/skills.md](file:///Users/nouradin/Downloads/Wirddy/.agents/rules/skills.md) for complete details.
