# Season 3 repository map

The shell supports the learner's investigation. Exercise code is a separate,
protected curriculum: restructuring the shell must not change planted bugs,
behavioral assertions, test IDs, encoded hints, or encoded solutions.

## Application ownership

```text
src/
  main.jsx                    Browser shell entry
  shell/
    App.jsx                   App composition, route state, brief draft and filters
    Icon.jsx                  Shared shell icons
    format.js                 Day, time, BUG ID and folio formatting
    workspace/                Practice register, route parsing, recommendations
    investigation/            Investigation page, source guidance, hints, prose
    authoring/                External-agent brief builder and profile export UI
    progress/                 Completion storage, React adapter, learning activity
    verification/             Check-run UI and cancellable session coordination
    runtime/                  Disposable frame loading, preview, check harness
  levels/
    index.js                  Stable facade for the virtual metadata catalog
    01-… through 15-…          Protected foundation exercises
    custom/                   Generated exercises, numbered after existing levels
    hints.json                Three encoded hints per exercise
  components/motion/          Installed beUI components
  lib/                        Helpers used by installed components
  styles/                     Shell, library, frame, and exercise styles
```

Files are grouped by responsibility without forwarding barrels. Consumers import
the module they need. `src/levels/index.js` remains the existing catalog boundary;
it does not eagerly import executable exercise manifests.

| Folder | Primary files | Responsibility |
|---|---|---|
| `workspace/` | `LevelMap.jsx`, `navigation.js`, `practice.js` | The bench, the register by batch and the lab record; filter, parse routes, suggest next practice. |
| `investigation/` | `LevelPage.jsx`, `ReadingsRow.jsx`, `Readings.jsx`, `HintBox.jsx`, `Prose.jsx` | Compose the investigation, its readings row and readings log, and optional guidance. |
| `authoring/` | `AgentStation.jsx`, `brief.js` | Prepare a handoff for an external agent; the app does not invoke an agent. |
| `progress/` | `progress.js`, `useProgress.js`, `learning.js`, `useLearning.js` | Repairs (with time and run, generation-scoped) kept apart from current verification; readings (per-incident event log, conclusions, resets) that survive a reset. |
| `verification/` | `ChecksRunner.jsx`, `check-session.js` | Sequence checks, render the verification record, the Repaired entry and the instrument bar, cancel abandoned visits. |
| `runtime/` | `exercise-entry.jsx`, `exercise-runtime.jsx`, `frame-check.js`, `harness.jsx`, `ExercisePreview.jsx`, `ErrorBoundary.jsx` | Own frame loading, rendering, deadlines, errors, and cleanup. |

## Runtime and build boundaries

`index.html` loads `src/main.jsx` and the shell. The shell consumes static metadata
through the catalog facade. `exercise.html` loads
`src/shell/runtime/exercise-entry.jsx`; that entry loads a requested executable
manifest and renders a preview or runs one behavioral check.

The Vite integration at `scripts/vite/curriculum-plugin.mjs` uses
`scripts/curriculum/inspect.mjs` to create the virtual catalog and explicit lazy
loaders. This is generated in memory, not a source file authors must edit.
Production output belongs in ignored `dist/` and is rebuilt with `npm run build`.
Both HTML entries must be deployed together.

Frames isolate lifecycle and module state, not hostile code. They remain
same-origin browsing contexts; source restrictions are authoring guardrails.
Asynchronous deadlines cannot interrupt synchronous loops.

## Styles and library components

- `src/styles/global.css` loads shared styles and base font/theme rules.
- `lab.css` owns the Engineering Lab shell; `components.css` integrates library
  utilities without Tailwind Preflight; `exercise-frame.css` sizes the runtime host.
- `exercises.css` preserves the curriculum's `lv-*` presentation.
- Keep `src/components/` and `src/lib/` compatible with the aliases in
  `components.json` and the component typecheck. See `THIRD_PARTY_NOTICES.md` for
  upstream attribution and local adaptations.

## Commands, tests, and documentation

Public maintenance commands remain at `scripts/` root (`encode.mjs`,
`validate-levels.mjs`, `verify-level.mjs`, and `custom-levels.mjs`). Their npm command
names and exercise paths are stable. Removal backups live in ignored
`.bugbound-backups/`; recovery is described in `CONTRIBUTING.md`.

All Node regression tests are in `tests/*.test.mjs`. They verify the shell and
authoring tools independently of planted exercise failures. `tests/fixtures/`
contains browser-only synthetic cases and a usage guide; fixtures are not
production HTML entries. CI runs the same repository gates:

```sh
npm test
npm run lint
npm run typecheck:components
npm run validate-levels
npm run build
```

The component typecheck is deliberately narrower than the full curriculum.
Existing exercises include intentional typing and runtime mistakes. Structural
validation passing does not prove the learner has solved an exercise.

`AGENTS.md` and `.claude/skills/bugbound-levelsmith/SKILL.md` are the active agent
contracts. `PRODUCT.md` and `DESIGN.md` define product/visual requirements.
`docs/audits/` holds dated findings and evidence; `docs/design-concepts/` holds
design history. Historical reports describe paths at the time they were written;
use this map for current ownership. `docs/superpowers/` contains ignored local
plans/probes and is not a product dependency.

## Protected authoring interface

Generated levels still go in `src/levels/custom/<NN-slug>/`; numbering accepts two
or more digits and does not require filling gaps. Keep manifests, source references,
hint keys, solution headings, and test IDs stable. Do not edit shell/runtime or
validation code while generating a challenge to make its checks pass. Follow the
existing private fail-before/pass-after/restoration contract.

This is the standalone [Bugbound Season 3 repository](https://github.com/Brantley-Wyche/Bugbound-Season-3).
Its main branch is the pristine cartridge; use separate branches for generation and
learner repairs. It was transferred from the original repository's season-3 checkpoint
2a562fd with Git history retained. The local folder name is bugbound-season-3.
