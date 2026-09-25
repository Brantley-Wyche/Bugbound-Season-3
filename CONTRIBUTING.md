# Contributing to Bugbound

See [the repository map](docs/ARCHITECTURE.md) before changing shell or tooling code.

Two ways to add levels: have your AI agent generate them (the intended path — see [AGENTS.md](AGENTS.md)), or author one by hand. Either way, the contract is the same.

## Authoring a level by hand

1. **Copy the shape** of an official level: a folder `src/levels/custom/<NN-slug>/` containing your buggy component(s) and a `manifest.js`. The manifest fields and check-harness API are documented in [.claude/skills/bugbound-levelsmith/SKILL.md](.claude/skills/bugbound-levelsmith/SKILL.md).
2. **Plant a real bug.** The best levels reproduce failure modes you've hit at work — the component should look plausible and the symptom should feel like a genuine ticket.
3. **Write checks that describe behavior**, not implementation. They must fail with the bug and pass with any reasonable fix.
4. **Encode your hints and solution** (`npm run encode -- "text"`) — three hint tiers into `src/levels/hints.json`, solution appended to `SOLUTIONS.md`. Plaintext spoilers never land in the repo, including in comments and commit messages.
5. **Validate:** `npm run validate-levels`, `npm test`, and `npm run build` must pass. Use `npm run verify-level -- <id>` to run the level's checks both ways (buggy = red, fixed = green, then restore the bug).

Season 3 lets learners open any challenge. The suggested next challenge is guidance, not an unlock rule. Keep IDs stable when adding or removing a level; gaps are permitted. Exercise styles belong in `src/styles/exercises.css`.

`npm run custom-levels -- list` shows generated levels. `npm run custom-levels -- remove <id> --confirm` removes one and `npm run custom-levels -- reset --confirm` removes all generated levels. Removal prints a backup path under `.bugbound-backups/`; retain it until you have checked the updated hints, solution sections, and folders. If a write fails, the command attempts to restore the originals and reports the backup path for manual recovery. These commands never renumber survivors. Run `npm run validate-levels` after maintenance.

`verify-level` binds its own server on port 4173 and fails if the port is occupied. Check the printed project path and level ID before opening the URL. Static validation confirms structure and local import boundaries; it does not prove that the intended bug is present or that a check passes after a fix. The browser verification step supplies that evidence.

## Ground rules

- `src/shell/` is the game engine — PRs there are welcome for bugs/features, but keep it free of planted bugs.
- Official levels 01–15 are frozen as the canonical campaign.
- Shell changes may add maintained runtime dependencies when needed; generated exercise code may import only React and files inside its own level folder.
- Custom level code must stay local and deterministic: no network, browser storage, cookies, environment data, dynamic code execution, or external package imports.
- Keep the tone: lessons teach mechanisms; symptoms read like QA tickets; hints escalate gently.
