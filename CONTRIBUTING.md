# Contributing to Bugbound

Two ways to add levels: have your AI agent generate them (the intended path — see [AGENTS.md](AGENTS.md)), or author one by hand. Either way, the contract is the same.

## Authoring a level by hand

1. **Copy the shape** of an official level: a folder `src/levels/custom/<NN-slug>/` containing your buggy component(s) and a `manifest.js`. The manifest fields and check-harness API are documented in [.claude/skills/bugbound-levelsmith/SKILL.md](.claude/skills/bugbound-levelsmith/SKILL.md).
2. **Plant a real bug.** The best levels reproduce failure modes you've hit at work — the component should look plausible and the symptom should feel like a genuine ticket.
3. **Write checks that describe behavior**, not implementation. They must fail with the bug and pass with any reasonable fix.
4. **Encode your hints and solution** (`npm run encode -- "text"`) — three hint tiers into `src/levels/hints.json`, solution appended to `SOLUTIONS.md`. Plaintext spoilers never land in the repo, including in comments and commit messages.
5. **Validate:** `npm run validate-levels` and `npm run build` must pass, and run your level's checks in the app both ways (buggy = red, fixed = green, then restore the bug).

## Ground rules

- `src/shell/` is the game engine — PRs there are welcome for bugs/features, but keep it free of planted bugs.
- Official levels 01–15 are frozen as the canonical campaign.
- No new runtime dependencies.
- Keep the tone: lessons teach mechanisms; symptoms read like QA tickets; hints escalate gently.
