# Instructions for AI coding agents

This repo is **Bugbound** — a game where a human learns React by fixing intentionally planted bugs. If a human asked you to work in this repo, read this before touching anything.

For current shell/runtime ownership and tooling paths, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The protection rules below apply to every subfolder of `src/shell/`.

## If you were asked to help the player with a level

The bugs are the game. **Do not find and fix them for the player, and do not explain the cause.** Coach: point at the relevant concept, suggest what to observe, mirror the in-app hint tiers (nudge → closer look → near-answer). Decode a level's solution from `SOLUTIONS.md` (base64) only if the player explicitly says they want to be spoiled.

## If you were asked to generate new levels

Follow the full authoring guide in [.claude/skills/bugbound-levelsmith/SKILL.md](.claude/skills/bugbound-levelsmith/SKILL.md) — it is written for any agent, not just Claude. The short version of the contract:

- Before writing, make sure you are not on `main`. Create a focused generation branch unless the player already provided one.
- New levels go in `src/levels/custom/<NN-slug>/` (numbering continues from the highest existing level). They're auto-discovered — don't edit the registry or shell.
- Each level = buggy component(s) + `manifest.js` (including difficulty, source, generated date, lesson, and behavioral checks) + three base64 hints in `src/levels/hints.json` + a base64 solution appended to `SOLUTIONS.md`.
- **Blind mode**: never reveal a planted bug's cause in chat, comments, or commit messages. Hint/solution plaintext never appears in the repo or the conversation — encode with `npm run encode -- "text"`.
- Verify both directions before you're done: checks must fail against the planted bug and pass against a privately-applied fix — then restore the bug and discard the fix.
- Validate: `npm run validate-levels`, `npm test`, and `npm run build` must all pass. Use `npm run verify-level -- <id>` for the browser verification loop.

## Hard rules regardless of task

- Never modify `src/shell/` (the game engine), official levels `01`–`15`, existing hints, or existing solutions, unless the player explicitly asks for a shell fix.
- Never remove or rename `data-testid` attributes.
- Season 3 shell work may add maintained npm dependencies and install component libraries using their documented workflow. Prefer the library components themselves, with project theming, over custom recreations. This does not authorize external package imports in generated exercises.
- Custom level code may not use network requests, browser storage, cookies, environment data, dynamic code execution, or external package imports.
- `main` is the pristine "cartridge" branch: level fixes belong on the player's own branch, never on `main`.

<!-- installing-frontend-workflow:start -->
## Frontend workflow

Apply this workflow automatically whenever work changes React components, routes, styles, UI behavior, accessibility, responsive behavior, or frontend performance. Do not run the full workflow for backend-only, documentation-only, or non-UI test changes.

1. Use `$impeccable` as the product, UX, and visual-design authority. Preserve the project's established product requirements, design system, components, and visual identity for narrow refinements. Follow Impeccable's discovery and shaping workflow before creating a new surface or replacing the visual system.
2. Use `$vercel-react-best-practices` while writing or refactoring React code. Prioritize waterfalls, bundle size, server behavior, data fetching, and rendering before low-impact micro-optimizations. Inspect the actual framework, versions, adapters, and deployment target; apply framework-specific APIs only when supported.
3. Once implementation is stable, use `$web-design-guidelines` as an independent audit of the changed UI files, and perform a focused React Best Practices review of the same change. Treat findings as review input rather than automatic edits.
4. Classify findings by severity and applicability. Reject findings that conflict with explicit product requirements, accessibility or correctness, the established design system, or verified framework constraints. Feed valid findings through the appropriate Impeccable remediation workflow, such as polish, harden, adapt, clarify, or optimize.
5. Run repository-defined verification and browser QA at desktop and mobile sizes when the result is visual or interactive. Re-run the two targeted audits once on the final changed files; do not create an open-ended polish loop.

Resolve conflicts in this order: explicit user and product requirements; accessibility, correctness, security, and data integrity; established product and design documentation; verified framework behavior and measured performance; general checklist guidance; aesthetic preference.
<!-- installing-frontend-workflow:end -->
