# Season 3 Phase 2 remediation

Date: 2026-09-24. Implements the approved repairs from the [Phase 2 audit](2026-09-23-season-3-phase-2-code-audit.md).

The repairs are in the `season-3` working tree alongside the restored Engineering Lab redesign. Stash `f4fa20e4a851fcf4851ecf8181f617ff9b90c729` was applied and retained. Nothing was committed, pushed, moved to another repository, or changed on main or Season 2.

## Repair record

| Finding | Change | Evidence |
|---|---|---|
| F01: crashes/cleanup could pass | Rendering, assertions, uncaught errors, and teardown all participate in the check result. Cleanup occurs before success is reported. | Browser render, async-error, and effect-cleanup fixtures fail explicitly; healthy controls pass. |
| F02: abandoned or unresolved checks retained work | Each run owns an abort signal, a 15-second execution deadline and a 20-second outer load/run deadline. Navigation/reset disposes the frame and suppresses stale completion callbacks. | Session and frame tests; pending timeout and direct cancellation fixtures; real App navigation while a check never settles removes its frame. |
| F03: unsafe persistence | Completion uses independent event records scoped to a reset generation. Cross-tab storage events refresh the view and invalidate an open verification visit after reset. Legacy completion is read without deleting the old value. Unreadable/corrupt data blocks writes. Learning history reports failure rather than overwriting unread records. | Storage regression tests and two-tab browser reset. Initial unreadable generation requires a fresh verification after recovery. Profile export refuses uncertain completion or unreadable history. |
| F04: retry lost earlier saves | A set retains all pending completion IDs. Retry writes every pending completion; reset invalidates older pending work. Read/save/reset recovery is operation-specific. | Actual App: deny writes, pass A and B, allow writes, retry once; both completions appear. |
| F05: weak manifest validation | A static TypeScript AST inspection validates literal metadata, component references, nonempty callable checks, source references, real dates, and encoded metadata structure. Invalid level metadata is excluded from the development catalog; production build fails validation. Runtime checks the loaded executable contract in its frame. | Synthetic malformed metadata regressions; all 17 existing manifests validate. Exercise code is not evaluated in the Node validator. |
| F06: eager executable startup | A Vite-generated metadata catalog drives the shell. Explicit lazy loaders import each executable manifest inside its preview/check frame. Load failures produce recovery messages. | Catalog test confirms dynamic loaders and fail-closed production behavior. Production output has 17 manifest chunks; browser preview and verification work from the built assets. |
| F07: inconsistent discovery/restrictions | Shared discovery supports 2+ digit IDs and numbering gaps. Custom manifest/component import graphs are checked, including nested, side-effect, dynamic, CommonJS, and re-export cases. Linked folders/source references cannot escape their canonical level location. | Three-digit/gap/import/link regressions. Restrictions inspect executable references, allowing instructional strings and comments to discuss prohibited APIs. |
| F08: inconsistent removal | Removal preflights targets and metadata, stages new files, retains complete backups, removes entire solution sections, and attempts rollback after failure. IDs remain stable. Linked metadata/backup destinations are rejected. | Disposable-tree removal, orphan-body, linked-backup, and injected-failure tests. Real exercises were never removed. |
| F09: preview/check state interference | Every check has a fresh frame and module environment; the preview owns a separate frame. A commit/effect readiness signal replaces the initial fixed delay. `h.waitFor` supports condition-based assertions; existing helper signatures remain compatible. | Repeated module-state checks each see fresh state; preview stays at its initial state. Focus, typing, selection, and missing-readiness cases behave as expected. |
| F10: wrong verification URL on port collision | The CLI binds port 4173 strictly and prints the project root and selected ID only after listening succeeds. | Occupied-port probe: CLI exits 1 with `Port 4173 is already in use`, without a misleading ready URL. Probe exits 0. |
| F11: development advisories | Compatible lockfile updates remediate the reported advisories; no forced major upgrade was used. | Full and production-only npm audits both report zero findings. |
| F12: missing gates/docs | Added scoped JS/React/TS lint, runtime/package-manager declarations, and CI with clean install and repository gates. Updated setup, authoring, recovery, free-choice navigation, stylesheet ownership, and dependency boundaries. | Tests, lint, component typecheck, curriculum validation, and production build pass locally. CI configuration is present; no remote CI run was initiated. |

## Review and frontend verification

Implementation and review used GPT-6 Sol and GPT-6 Luna after the user's model selection. A fresh independent Sol review found three validator issues: linked level directories, linked source references, and prohibited API names in teaching prose. Each was reproduced in a regression test and fixed. Integration also added regressions for initially unreadable reset generations, malformed activity records, linked backup destinations, and uncertain profile export.

The frontend pass used Impeccable hardening and a focused React Best Practices review. Persistence is outside state updater functions; subscriptions use `useSyncExternalStore`; generated executable code is outside shell startup; effects dispose their listeners and observers. The installed beUI stateful button now observes its measured label rather than updating measurement state after every render. Its motion implementation is retained, and the local adaptation is recorded in `THIRD_PARTY_NOTICES.md`.

The independent [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) review checked native controls/links, accessible frame titles, loading/error announcements, focus targets, cleanup, and overflow. Browser review found section jumps could align the heading while clipping the taller action button; scroll margin is now applied to the actual heading targets. At 390px, the final verification button begins 14px below the viewport top, focus lands on the heading, and document width is 375px. The desktop-first editing notice remains visible on narrow screens. Desktop checks used 1280px width. This was a targeted review, not a new whole-site accessibility certification.

The final Impeccable detector returned `[]`. No new ignores or suppressions were added. The earlier 48 design-hook findings retain their documented dispositions in `.impeccable/review/2026-09-12-hook-triage.md`; the Engineering Lab palette and typography were not replaced.

## Validation ledger

All commands ran from the repository root using Node 24.18.0/npm 11.16.0.

| Command / activity | Exit | Result |
|---|---:|---|
| `npm.cmd test` | 0 | 65 tests pass, including persistence, session cancellation, frame transport, catalog validation, maintenance recovery, routing, recommendations, and native navigation semantics. |
| `npm.cmd run lint` | 0 | Shell, installed components, and shared library code pass JS/TS and React Hooks rules. Intentional exercise code is excluded. |
| `npm.cmd run typecheck:components --no-update-notifier` | 0 | Installed components/shared library typecheck passes. This is not a full-shell or curriculum typecheck. |
| `npm.cmd run validate-levels` | 0 | All 17 existing levels pass structural/authoring validation. |
| `npm.cmd run build` | 0 | Vite production build passes: 2,360 modules, main and exercise HTML entries, 17 lazy manifest chunks. |
| `npm.cmd audit --json` | 0 | Zero full-tree findings at verification time. |
| `npm.cmd audit --omit=dev --json` | 0 | Zero production findings at verification time. |
| `impeccable.cmd detect --json src/shell src/components src/styles/lab.css src/styles/exercise-frame.css` | 0 | Empty findings list. |
| `node docs/superpowers/phase2-remediation/verify-port.mjs` | 0 | Expected CLI port-conflict exit 1 detected; no ready URL printed. |
| `node docs/superpowers/phase2-remediation/verify-protected.mjs` | 0 | 47 protected files match the post-stash, pre-repair SHA-256 baseline. |
| `git diff --check` | 0 | No whitespace errors; normal Windows line-ending notices only. |
| Synthetic browser harness | n/a | All 12 scenarios match expected outcomes. |
| Actual App with synthetic catalog | n/a | Two failed saves recover together; cross-tab reset invalidates the visit; navigation disposes a pending check; uncertain profile export is refused. |
| Existing curriculum browser compatibility | n/a | 51 checks across 17 levels finish: 12 pass, 39 fail. Every planted exercise retains at least one failing check. No completion is saved by this compatibility fixture. |
| Production desktop/mobile browser smoke | n/a | Preview, built lazy chunks, check execution, frame cleanup, heading focus, and narrow layout verified. |

Some Vite-based test/server/probe attempts first exited 1 because the sandbox denied config resolution: `Cannot read directory "../..": Access is denied.` Approved retries outside that restriction succeeded. Those were environment failures. An initial call to the retired `detect.mjs` path exited 1 with `MODULE_NOT_FOUND`; the installed Impeccable launcher was discovered and the current detector succeeded. New regression tests also intentionally failed before their corresponding fixes; these are distinct from final validation.

The build previously emitted one 465.80 kB JS asset (151.61 kB gzip). It now emits a 222.86 kB main asset (75.46 kB gzip), 220.31 kB shared runtime (71.22 kB gzip), 5.30 kB exercise entry (2.23 kB gzip), and separate manifest chunks. Main plus shared runtime is still about 443 kB; the primary improvement is the executable loading/failure boundary, not a claimed dramatic download or timing improvement. CSS is 34.71 kB (7.90 kB gzip), plus the tiny exercise-frame stylesheet.

## Preserved content and limits

- The hash comparison covers every existing exercise component/manifest, encoded hint data, `SOLUTIONS.md`, and `src/styles/exercises.css`. Registry `src/levels/index.js` is the approved shell integration change and is excluded. Git line-ending conversion during stash restoration is why the baseline was recaptured before repairs; the older audit baseline is retained separately.
- Behavioral assertions and test IDs were not edited or relaxed. Hints/solutions were not decoded. Running the planted curriculum is compatibility evidence, not a complete private fix-and-restore playthrough. Full TypeScript validation of the intentionally broken lessons is not claimed.
- Same-origin frames isolate lifecycle and module state, not hostile code. They share browser origin/storage and may share an execution thread. Synchronous infinite loops cannot be interrupted by these asynchronous deadlines. Static restrictions are authoring guardrails, not a security proof.
- Completion event records and old reset generations remain in localStorage; legacy bytes are retained. Automatic compaction is not included. Learning activity counters remain best-effort aggregates rather than an atomic cross-tab event log. Unavailable storage can still prevent persistence; the app now reports it and protects unread data.
- File-removal backups are local and retained. Rollback is best effort; if the filesystem also refuses restoration, the command reports the backup path. Concurrent manual file edits during maintenance and machine failure are not transactional guarantees.
- No large synthetic-catalog timing benchmark, multi-browser coverage, screen-reader speech test, fresh-machine `npm ci`, or remote CI run was performed. No claim is made about those environments.
- Phase 3 file restructuring and the later separate-folder/repository move remain separate work.

## Reusable evidence

- [Synthetic harness results](evidence/2026-09-24-harness-browser.json)
- [Curriculum compatibility counts](evidence/2026-09-24-curriculum-browser.json)
- [Multiple-save recovery](evidence/2026-09-24-save-retry-browser.txt)
- [Cross-tab reset](evidence/2026-09-24-cross-tab-reset-browser.txt)
- [Navigation cancellation](evidence/2026-09-24-navigation-cancel-browser.json)
- [Profile recovery](evidence/2026-09-24-profile-recovery-browser.txt)
- [Production runtime](evidence/2026-09-24-production-browser.json)
- [Final section-jump measurements](evidence/2026-09-24-section-jump-browser.json)
- [Desktop capture](evidence/2026-09-24-reliability-desktop.png) and [final mobile capture](evidence/2026-09-24-production-mobile.png)

Manual browser fixtures and their commands are documented in `tests/fixtures/README.md`. Local planning, preservation baselines, and bounded probes remain under ignored `docs/superpowers/`.
