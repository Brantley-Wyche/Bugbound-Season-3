# Bugbound: the closing record

Closed 2026-10-05. Season 3 is the final season of Bugbound. This record says what the game became, where each piece lives, how it was verified, and what was left open. It is spoiler-free: it names no planted cause, hint or solution.

## 1. What Bugbound is

Bugbound teaches by repair. Each incident is a real component with a planted bug, a report of the symptom, a concept reference, opt-in tiered hints, and behavioral checks. The learner reproduces the report in a live preview, repairs the source in their own editor, and runs the checks. There is no embedded editor and no hosted agent: the game runs beside the learner's own tools.

Three seasons, one family:

| | Season 1 | Season 2 | Season 3 |
|---|---|---|---|
| Metaphor | On-call field notebook | Investigation desk | Engineering lab |
| Framework | React (Vite) | Next.js App Router | React 19 (Vite) |
| Curriculum | 15 React and TypeScript incidents | 13 Next.js incidents | The 15 foundations, plus incidents the learner briefs their own coding agent to generate |
| Finished word | Resolved | Closed | Repaired |
| What it added | Ledger register, field notes, resolution in the verification log, sticky workbench | Incident rail, always-open Concept reference, Closed entry, case log, docket register | Agent brief builder, instrument bar with a run trace, Repaired entry, readings, register by batch, batch and lab records |

The arc runs from notebook to case file to lab: Season 1 resolves incidents and notes the work, Season 2 closes cases and keeps their record, and Season 3 repairs incidents the learner commissions and shows the readings back. `FAMILY.md`, identical in all three repositories, holds the thirteen constants every season keeps: graphite and amber, the incident as the unit with its folio and `BUG-###` ID, status as a word, one finished word, saved is not verified, a record rather than a banner, ruled rather than boxed, monospace for references, a 12px floor, an honest desktop-first notice, motion that shows state, the owner's mark, and blind mode.

## 2. Season 3 at close

### The loop

1. **Brief.** Brief an incident prepares an exact prompt for the learner's own coding agent: topic, difficulty (Intermediate or Hard), count, optional context, a topic suggested from the learner's readings, and an optional learning profile. The page never runs the agent and says so.
2. **Generate.** The agent follows `AGENTS.md` and `.claude/skills/bugbound-levelsmith/SKILL.md` on its own branch: it writes the incident, encodes hints and the solution, proves the checks fail against the planted bug and pass with a private fix, then restores the bug. New incidents appear in the register under their generation date.
3. **Investigate.** The incident page leads with the folio, title and readings row; the live experiment sits above the verification record, with the instrument bar pinned beneath it. Ctrl/⌘+Enter runs the checks; a run can be cancelled.
4. **Repair and record.** The run that first passes every check ends the verification record with the Repaired entry (time, run number, saved or not saved yet, an optional conclusion). Its teal rule drawing across is the season's one authored moment. A later run never undoes it.
5. **Read back.** Readings log every run with its change since the previous one, each hint tier the first time it opens (by number, never text), first visits and resets. The register shows activity and dated repairs; Practice ends each finished batch with a batch record, and the whole catalog with a lab record.

### Where things live

- **Shell:** `src/shell/` (app, workspace, investigation, verification, authoring, progress, runtime) and `src/styles/lab.css`. `docs/ARCHITECTURE.md` maps ownership.
- **Design:** `DESIGN.md` describes the built lab; `.impeccable/design.json` is its Impeccable sidecar.
- **Product:** `PRODUCT.md`. **Family:** `FAMILY.md`.
- **Authoring:** `AGENTS.md`, `.claude/skills/bugbound-levelsmith/SKILL.md`, `npm run encode`, `npm run validate-levels`, `npm run verify-level -- <id>`.
- **Curriculum:** `src/levels/` (01–15 protected), `src/levels/custom/` (generated), `src/levels/hints.json` and `SOLUTIONS.md` (base64 only).
- **Design systems on claude.ai (private until shared):** [Bugbound Engineering Lab](https://claude.ai/artifact/A1JM3dzoMVENBJJcMbuznK) for Season 3 and [Bugbound Investigation Desk](https://claude.ai/artifact/Qyi7UsdUAehxEuL1hdGwUP) for Season 2. The [Season 3 mockup canvas](https://claude.ai/artifact/D5Eay9Mqe7QNrATD27LdGR) shows the first mockup round.

### Storage

All progress lives in the learner's browser. Repairs are generation-scoped records with their time and run (`bugbound:progress:v2:*`); a reset starts a new generation. Readings and conclusions (`bugbound:learning:v1`) survive a reset, which appears in each log it followed. Nothing leaves the browser except a learning profile the learner chooses to download.

## 3. How Season 3 got here

| Stage | Result |
|---|---|
| Engineering Lab redesign and reliability audit (before this record) | Experiment-first investigation, free choice, the brief builder, isolated check frames, safer persistence |
| Audit against `FAMILY.md` and Season 2 (2026-09-27) | Design baseline 25/40, technical 15/20. Three P1s: Run off-screen, no finish record, mixed vocabulary |
| Build, merged as [Brantley-Wyche/Bugbound-Season-3#1](https://github.com/Brantley-Wyche/Bugbound-Season-3/pull/1) | Quick fixes, "incident" and "Repaired" throughout, 12px floor, repair records and readings, the instrument bar and Repaired entry, register by batch, the brief's readings. Post-build critique 30/40, then the four follow-ups it raised: the batch record, the report first when stacked, run deltas and the bar trace, readings feeding the brief |
| Closing pass (`season-3-closing`) | Cancel a run, the Run button without letter cascade or blur, an inline reset confirmation instead of the native dialog, the unused Tabs component removed, the hint toggle's "Hide" label, a calmer filter announcement, `FAMILY.md` updated in all three repositories, the Season 3 design system, and the playthrough below |

## 4. Verification at close

**Repository gates** (all exit 0): `npm test` (82), `npm run lint`, `npm run typecheck:components`, `npm run validate-levels` (17), `npm run build`. `impeccable detect` on `src/shell` finds nothing.

**Browser** (Chromium, the desktop app's built-in browser): desktop at 1440×900, 1280×800, 960×1000 and 800×900, and overflow plus the notice at 375. Repairs, revisits, unsaved repairs, cancellation and reset were exercised on the synthetic shell fixture (`npm run dev -- --config tests/fixtures/vite.shell.config.mjs`).

**Playthrough** (2026-10-05, a throwaway worktree and branch, deleted afterwards):

- **Generating.** An agent given the exact brief the app prepared (one Intermediate incident about async UI state) generated a new incident on its branch. The planted version passed 2 of 4 checks, a partial private fix 3 of 4, the full private fix 4 of 4. It restored the planted version, kept hints and the solution encoded, and passed every gate. The incident appeared in the register as a new batch and its checks ran and failed as planted.
- **Solving.** A second agent, playing blind (no hints file, no solutions, no check source), solved that new incident, two generated incidents and one foundation, each in one or two runs with no hints. Every repair produced the Repaired entry with focus, the bar's Repaired state and Next, readings with run deltas, and a saved conclusion. With every generated incident repaired, Practice showed the batch record. A revisit reported that the repair still stood; a cancelled run recorded nothing.
- **Found and fixed:** the batch record miscounted earlier batches (fixed in `8acd4a1`), and the authoring guide now notes that `h.type` appends to a field's value.
- **Noted, not changed:** the agent-facing brief still says "level" (it matches the authoring guide); a foundation whose checks all fail on one render error shows that same message on every row; and verify mode records readings like any visit.

**Not verified:** Firefox (computer use can only screenshot a browser, and that access was declined; another method is pending), Safari (no macOS machine), screen-reader speech (judged low priority), physical touch devices.

## 5. Keeping it running

- **More practice:** open Brief an incident, copy the brief to a coding agent working in this repository, and let it follow the levelsmith skill on a generation branch. Return to Practice once its checks are proven both ways.
- **Before merging shell changes:** run the five gates above, and use the synthetic shell fixture for persistence paths rather than real progress.
- **Protected:** `src/levels/01`–`15`, existing hints and solutions, `data-testid`s, and `src/styles/exercises.css`. `main` is the pristine cartridge; play and generation happen on branches.
- **Blind mode** binds people and agents alike: no planted cause, hint or solution in chat, commits, docs or mockups.

## 6. Deliberately not built

- An embedded editor, hosted agent runs, or a monitor of the agent's work: the game stays beside the learner's own tools.
- A cross-incident comparison of runs or an adaptive difficulty model: the suggestion is a simple, explained choice, and the brief's topic suggestion is a lever, not a verdict.
- Phone polish: phones and tablets can browse and get the notice; solving needs a desktop.
