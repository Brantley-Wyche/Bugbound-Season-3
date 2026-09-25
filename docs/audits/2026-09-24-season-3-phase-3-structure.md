# Season 3 Phase 3: file organization

Completed September 24, 2026 on `season-3`. This phase reorganizes the restored working tree, including the existing Phase 1/2 changes. It does not compare preservation against the older committed tree.

## Changes

Moved 22 files into explicit ownership groups:

- `src/shell/workspace/`: challenge register, navigation, and practice selection.
- `src/shell/investigation/`: investigation page, prose, and hints.
- `src/shell/authoring/`: agent station and brief preparation.
- `src/shell/progress/`: completion, learning activity, and React subscription.
- `src/shell/verification/`: check controls and session coordination.
- `src/shell/runtime/`: previews, disposable exercise frames, harness, and error boundary.
- `tests/`: moved the progress regression suite here alongside the other Node tests.
- `scripts/curriculum/` and `scripts/vite/`: curriculum inspection and its Vite adapter. CLI entry points remain at scripts root.

App and the shared Icon remain at the shell root. The stable `src/levels/index.js` interface and exercise paths remain unchanged. Imports, the exercise HTML entry, and the npm test glob now resolve the moved files directly; no compatibility barrels or aliases were introduced.

[Architecture guide](../ARCHITECTURE.md) documents ownership, entry points, lazy curriculum loading, tests, and authoring boundaries. README, CONTRIBUTING, and AGENTS link to it. The active Levelsmith guide now correctly describes plugin-based discovery rather than claiming the registry itself globs manifests. Dated reports retain their original paths as historical evidence.

## Preservation evidence

A local helper captured source copies and hashes before any moves, checked all destinations stayed inside the repository, and compared final sources against only the expected AST import/export path rewrites.

| Comparison | Result |
| --- | --- |
| Relocated files | 22 |
| Source/config/test files compared against expected import-only transformations | 50; no differences |
| Protected curriculum, styles, component/library files, assets, and lockfile checked | 64; unchanged |
| Production output compared with the Phase 3 baseline | Identical filenames and bytes |

See [preservation evidence](evidence/2026-09-24-phase3-preservation.json). The local baseline and move helper remain ignored under `docs/superpowers/phase3/`. No exercise assertions, test IDs, hints, solutions, application behavior, visual design, or dependency versions changed in this phase.

## Verification

Commands below completed after relocation; exit codes refer to completed processes.

| Command | Exit | Outcome |
| --- | --- | --- |
| `npm.cmd test` | 0 | 65 tests passed |
| `npm.cmd run lint` | 0 | Shell/component/library lint passed |
| `npm.cmd run typecheck:components --no-update-notifier` | 0 | Component TypeScript boundary passed |
| `npm.cmd run validate-levels` | 0 | 17 levels validated |
| `npm.cmd run build` | 0 | Production build passed; 2,360 modules transformed |
| `node docs/superpowers/phase3/restructure.mjs verify` | 0 | Import-only and protected-file comparisons passed; production bytes identical |
| `impeccable.cmd detect --json src/shell` | 0 | Empty finding list; no new suppressions |
| `git diff --check` | 0 | No whitespace errors; Git emitted line-ending conversion warnings |

The initial baseline test attempt exited 1 in the sandbox: `Cannot read directory "../..": Access is denied.` This was an environment restriction while loading Vite configuration. The approved retry outside the sandbox passed, as did the post-move test run. The baseline build also passed.

A focused search for retired paths in current source, configuration, fixtures, agent instructions, and live documentation found no matches (the normal `rg` no-match exit code is 1).

## Browser and review

Browser checks used the local Vite server at `http://127.0.0.1:5190/`:

- All 12 synthetic runtime cases matched their expected outcomes, including success, render/async/cleanup failures, load/readiness timeouts, fresh frame state, and cancellation.
- An actual investigation loaded its preview and completed its checks with the expected planted failures. No completion was recorded and no hints were opened.
- Challenge creation and Foundations routes loaded. Route transitions focused the page heading.
- Desktop at 1280 x 900 and mobile at 390 x 844 showed no horizontal page overflow. The mobile desktop-work notice remained visible and lessons remained browsable.

See [browser evidence](evidence/2026-09-24-phase3-browser.json), [desktop capture](evidence/2026-09-24-phase3-desktop.png), and [mobile capture](evidence/2026-09-24-phase3-mobile.png).

A fresh GPT-6 Sol review found no Phase 3 regressions. Its independent scan found zero missing relative import targets across 43 JS/TS files. It checked production HTML/style entry paths, fixture imports, CLI root calculations, tooling paths, and the lazy curriculum boundary. Its one inherited documentation observation was resolved by the Levelsmith wording correction above.

Focused React Best Practices and [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) reviews found no new applicable issues in the import-only change. Component bodies, hook behavior, semantic controls, focus handling, and CSS are preserved. No design findings were suppressed or left standing by this phase.

## Limits and handoff

The passing component typecheck is scoped; it does not prove intentionally broken curriculum TypeScript is error-free. This phase did not re-run every protected exercise, the complete Phase 2 storage matrix, a clean dependency installation, a dependency security audit, or remote CI. The browser smoke used the development server; production evidence consists of a successful build and byte-for-byte comparison with the baseline output.

Changes remain uncommitted and reviewable on `season-3`. The original stash remains retained. Main and the Season 2 project were not modified. Phase 4, moving Season 3 into its own folder/repository, has not started.
