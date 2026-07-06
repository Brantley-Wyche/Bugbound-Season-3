# Instructions for AI coding agents

This repo is **Bugbound** — a game where a human learns React by fixing intentionally planted bugs. If a human asked you to work in this repo, read this before touching anything.

## If you were asked to help the player with a level

The bugs are the game. **Do not find and fix them for the player, and do not explain the cause.** Coach: point at the relevant concept, suggest what to observe, mirror the in-app hint tiers (nudge → closer look → near-answer). Decode a level's solution from `SOLUTIONS.md` (base64) only if the player explicitly says they want to be spoiled.

## If you were asked to generate new levels

Follow the full authoring guide in [.claude/skills/bugbound-levelsmith/SKILL.md](.claude/skills/bugbound-levelsmith/SKILL.md) — it is written for any agent, not just Claude. The short version of the contract:

- New levels go in `src/levels/custom/<NN-slug>/` (numbering continues from the highest existing level). They're auto-discovered — don't edit the registry or shell.
- Each level = buggy component(s) + `manifest.js` (id, number, title, concept, severity, symptom, 3-paragraph lesson, behavioral checks) + three base64 hints in `src/levels/hints.json` + a base64 solution appended to `SOLUTIONS.md`.
- **Blind mode**: never reveal a planted bug's cause in chat, comments, or commit messages. Hint/solution plaintext never appears in the repo or the conversation — encode with `npm run encode -- "text"`.
- Verify both directions before you're done: checks must fail against the planted bug and pass against a privately-applied fix — then restore the bug and discard the fix.
- Validate: `npm run validate-levels` and `npm run build` must both pass.

## Hard rules regardless of task

- Never modify `src/shell/` (the game engine), official levels `01`–`15`, existing hints, or existing solutions, unless the player explicitly asks for a shell fix.
- Never remove or rename `data-testid` attributes.
- No new npm dependencies.
- `main` is the pristine "cartridge" branch: level fixes belong on the player's own branch, never on `main`.
