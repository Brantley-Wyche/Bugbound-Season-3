# Season 3 Phase 2: code, reliability, and authoring audit

Date: 2026-09-23. Scope: the current `season-3` working tree, including the approved Engineering Lab redesign and beUI integration. This is an audit and recommendation document; none of the fixes below have been implemented.

The largest risks are verification that can report success after a crash, progress that can be lost or resurrected by stale state, and validation that accepts unusable generated exercises. These matter more than component-level rendering optimizations for an agent-driven practice application.

## Scope and evidence

- Reviewed shell state, navigation, checks, persistence, agent handoff, curriculum discovery, authoring/maintenance commands, dependencies, and verification gates. Existing exercise behavior was treated as protected curriculum, not a repair target.
- Used React Best Practices for the React/loading review and the repository's verification workflow for evidence. Phase 1 visual design decisions remain intact.
- Used `main` and Season 2's reliability work as context only. Findings below come from the Season 3 implementation; recommendations are not instructions to transplant either implementation.
- Ran synthetic browser cases against the actual harness/session modules and the actual App with an audit-only synthetic curriculum alias. The separate localhost origin on port 5187 did not use the learner's existing progress.
- Exercised the actual persistence modules with an in-memory storage double. Maintenance/validator probes used copies of the actual scripts in disposable synthetic curriculum trees, never the real curriculum.
- A SHA-256 comparison against this audit's **working-tree baseline** found all 102 captured source, curriculum, tooling, test, asset, and contract files unchanged. Existing Phase 1 changes were preserved.
- No hints or solutions from existing exercises were decoded. No dependency updates, restructuring, commits, pushes, or repository transfer occurred.

**Evidence labels:** reproduced means observed with a synthetic executable or browser case; source-confirmed means the relevant control flow was inspected but the complete failure scenario was not executed. P1 is a high-priority correctness/reliability problem; P2 is a normal-priority defect or engineering gap, not a claim about security exploit severity.

## Findings

### F01 — P1: render and cleanup errors can still produce passing checks

**Reproduced in the browser.** [`harness.jsx`](../../src/shell/harness.jsx#L99) captures a boundary error, but `runCheck` returns success whenever `check.run()` resolves (lines 106–119). Calling `ensureNoCrash()` is optional. A synthetic crashing component with a resolving no-op check returned `pass: true`. An effect cleanup that threw also returned `pass: true`, while the browser reported the synthetic cleanup error.

This can mark broken generated exercises complete. The cleanup case removed its host successfully; **a cleanup host leak was not reproduced** and is not asserted here.

**Recommend:** make successful verification contingent on rendering, assertions, and teardown all completing without relevant errors. Capture failures throughout the run and cleanup before finalizing its result. Preserve existing behavioral assertions; do not require every generated author to remember an optional crash check. Add regressions for render failure, effect failure, and teardown failure, with separate error attribution per run.

### F02 — P1: an unresolved check has no deadline or disposal on abandonment

**Reproduced retention; source-confirmed absence of a deadline.** [`harness.jsx`](../../src/shell/harness.jsx#L113) awaits the check without a timeout. [`check-session.js`](../../src/shell/check-session.js#L7) only marks the session inactive. A controllable pending check kept one hidden root mounted after abandonment. Only releasing the synthetic promise allowed cleanup; completion was correctly suppressed and the session returned `null`.

The current cancellation guard protects saved completion from a late result, but it does not dispose of the work. A permanently pending promise can leave a mounted exercise running indefinitely. On the current page, the verification button remains busy.

**Recommend:** a bounded asynchronous deadline, cancellation passed to the runner, and one guaranteed disposal path for success, failure, timeout, and navigation/reset. Keep the existing stale-callback protection. Test that abandoned checks release resources and never save completion. Asynchronous cancellation cannot interrupt a synchronous infinite loop in the same JavaScript context.

### F03 — P1: persistence can lose completion, resurrect resets, or overwrite unread history

**Reproduced using the actual storage modules with synthetic data.** [`progress.js`](../../src/shell/progress.js#L11) treats every read failure as an empty set and saves the whole set. [`App.jsx`](../../src/shell/App.jsx#L28) loads once, derives subsequent saves from its React snapshot, and has no cross-tab subscription. [`learning.js`](../../src/shell/learning.js#L7) also treats an unreadable store as empty before later writing it.

Observed cases:

| Scenario | Expected | Observed |
|---|---|---|
| Two tabs complete different challenges from the same starting state | Both completions survive | Later save loses the first completion |
| A tab resets progress, then a stale tab completes another challenge | Reset completion stays cleared | Old completion is resurrected |
| Initial completion read fails, later write succeeds | Retain existing completion or require recovery | Next save overwrites unread completion |
| Learning-history read fails while writing remains available | Preserve previous history | A new run replaces previous history with an empty-derived store |

**Recommend:** separate successful-empty, unreadable, malformed, and unavailable storage states; never write from an uncertain read. Use additive completion records scoped to a reset generation, synchronize tabs, and define an explicit migration from v1. Learning telemetry can remain non-blocking, but should preserve unread data and report degraded export/history honestly. A simple merge before `setItem` is insufficient to guarantee correctness under concurrent read/modify/write operations; choose and test a storage protocol that preserves independent writes.

### F04 — P2: retry retains only the most recent failed completion

**Reproduced in the actual App with synthetic challenges.** [`App.jsx`](../../src/shell/App.jsx#L44) has one `storageFailure` slot. With completion writes denied, challenge A passed, then challenge B passed. After writes were allowed, **Retry saving** saved B only, dismissed the error, and showed `1 / 3 saved`; A remained Open.

**Recommend:** retain every pending completion independently of the displayed error and retry the outstanding operations. Clear an error only when its operation has recovered. Keep save and reset recovery distinct; specify what an intentional reset does to pending pre-reset saves so retry cannot resurrect them.

### F05 — P1: level validation accepts unusable executable contracts

**Reproduced in a synthetic curriculum.** [`validate-levels.mjs`](../../scripts/validate-levels.mjs#L53) extracts a few values with regex and checks other field names using substring presence (lines 78–95). A manifest containing `Component: null`, `checks: []`, `files: []`, and `generatedAt: '2026-99-99'` passed with exit 0.

This does not mean the validator should prove the intended bug. It does mean its successful structural result currently says little about whether the shell can consume the manifest. The existing manual fail-before/pass-after requirement is valuable but cannot replace a valid contract.

**Recommend:** validate actual export structure, supported metadata, nonempty checks with callable runners, component suitability, source references confined to the exercise, and real calendar dates. Combine static parsing with controlled runtime verification; do not import unrestricted generated browser code directly into a privileged Node process just to inspect its shape. Validate hint/solution structure without disclosing their contents. Keep behavioral verification as a separate mandatory gate.

### F06 — P1: generated modules share the shell's startup failure path

**Source-confirmed; bundle size measured.** [`src/levels/index.js`](../../src/levels/index.js#L1) statically imports every official manifest and eagerly imports every custom manifest at line 23. [`App.jsx`](../../src/shell/App.jsx#L2) imports this registry before mounting. A runtime exception while evaluating one generated module can prevent the entire shell from starting; the preview's error boundary cannot catch that import-time failure.

The successful production build emitted one **465.80 kB JavaScript asset, 151.61 kB gzip**, and 34.56 kB CSS, 7.87 kB gzip. This is a baseline, not proof of a user-visible performance problem. The eager architecture also scales initial code with the generated collection.

**Recommend:** a lightweight, validated metadata catalog for navigation/progress and explicit lazy loaders for executable manifests, with per-investigation loading and recovery states. Preserve automatic discovery through a validated generation step. Measure the resulting startup and chunk behavior with a larger synthetic collection. Lazy imports can isolate evaluation/loading errors but do not make invalid syntax buildable or create a security sandbox. See [Vite glob imports](https://vite.dev/guide/features.html#glob-import) and [React lazy](https://react.dev/reference/react/lazy).

### F07 — P2: custom-code scanning and discovery disagree with the authoring contract

**Reproduced in synthetic trees.** [`validate-levels.mjs`](../../scripts/validate-levels.mjs#L121) excludes `manifest.js` from the restricted-code scan and detects only imports containing `from`. An external import in a manifest and a side-effect external import in a component both passed. Only direct sibling source files are scanned; relative dependencies are not resolved and checked as a confined graph.

The directory matcher at line 28 accepts exactly two digits. A synthetic `100-demo` manifest was ignored while validation reported the other two levels as valid. The runtime glob and maintenance listing discover that folder. Missing associated metadata can therefore go unnoticed until another gate or the app encounters it.

**Recommend:** one shared discovery contract supporting two or more digits and reporting malformed candidate directories; parse imports in manifests and all reachable local source files, including side-effect/dynamic imports and re-exports. Resolve relative paths and enforce the exercise boundary. Keep the React allowance and reject other external packages in generated exercises. Treat static restrictions as authoring guardrails, not hostile-code containment.

### F08 — P2: custom-level removal leaves inconsistent curriculum data

**Solution-section defect reproduced; transaction risk source-confirmed.** [`custom-levels.mjs`](../../scripts/custom-levels.mjs#L25) uses a multiline regex whose end condition can stop at the heading's line ending. Removing a synthetic custom level exited 0 and removed its heading, but left its fenced encoded solution body behind. Validation still passed because orphan detection inspects headings, not unassociated bodies.

The same command deletes folders before writing hints and reading/writing solutions (lines 31–47). A later I/O failure can leave partial removal without rollback. Separately, the contiguous-number rule in [`validate-levels.mjs`](../../scripts/validate-levels.mjs#L147) conflicts with deleting an interior custom challenge and with Season 3's free-choice model; its error still cites unlock gating.

**Recommend:** parse entire solution sections, preflight every affected path/file, stage updates, and provide recoverable removal with a clear change summary. Preserve stable IDs and permit gaps for generated challenges rather than renumbering surviving exercises. Add remove-last, remove-interior, reset-all, orphan-body, and injected-I/O-failure cases using disposable fixtures. Never run destructive maintenance tests against the real curriculum.

### F09 — P2: a fresh DOM mount does not isolate exercise state

**Reproduced in the browser.** [`harness.jsx`](../../src/shell/harness.jsx#L99) mounts imported components into a separate offscreen root in the same document and JavaScript module environment. In a synthetic module-state case, the hidden check changed the visible preview's observed mount count from 1 to 2.

Checks can therefore influence a preview or each other through module state, globals, timers, event listeners, and document-level behavior. Senior-level exercises involving effects and state ownership make this particularly relevant. Fixed 60/25/5 ms waits also provide no readiness contract for arbitrary generated async behavior; no specific existing exercise timing failure is claimed here.

**Recommend:** evaluate disposable browsing contexts for preview/check lifecycle isolation, define what state must be reset per check, and provide condition-based waits with deadlines. Re-verify both buggy and privately fixed synthetic exercises after changing the harness. Same-origin iframes are not security sandboxes; assess separate-origin or stronger isolation independently if hostile generated code becomes a product requirement.

### F10 — P2: the verification CLI can print a URL for the wrong server

**Source-confirmed, including installed Vite behavior; no port-collision browser test performed.** [`verify-level.mjs`](../../scripts/verify-level.mjs#L34) requests port 4173 without strict port binding, then prints port 4173 unconditionally. Installed Vite defaults to `strictPort: false` and selects another port when occupied. An author following the printed URL could verify an older or unrelated server.

**Recommend:** either fail clearly when 4173 is busy or print the actual bound URL after listening. Include the active project root/level in the verification evidence so authors can identify the checkout they tested.

### F11 — P2: development dependencies have outstanding advisories

**Measured with npm audit.** The full audit exited 1 with **13 affected dependency nodes: 10 high and 3 moderate, from seven underlying advisories**. The production-only audit exited 0 with zero reported findings. These are development-tool findings; this audit did not establish an exploitable path in Bugbound.

Affected locked packages include PostCSS 8.5.16, nanoid 3.3.15, Browserslist 4.28.4, and baseline-browser-mapping 2.10.42. Published patched versions are 8.5.23, 3.3.18, 4.28.7, and 2.11.0 respectively. Sources: [PostCSS](https://github.com/postcss/postcss/security/advisories/GHSA-fxqj-rqcc-2cmp), [nanoid](https://github.com/advisories/GHSA-2v37-7h3g-55p8), [Browserslist](https://github.com/browserslist/browserslist/security/advisories/GHSA-73wf-gq98-2v4g), and [baseline-browser-mapping](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv).

**Recommend:** a controlled tooling update, checking compatibility with the existing Vite/Tailwind/React toolchain, then rerun both audits and project gates. npm reported no automatic fix for part of the Vite/PostCSS/nanoid chain; that is not evidence that a compatible manual update is impossible. Do not use a forced major-version update without reviewing the resulting changes.

### F12 — P2: engineering gates and authoring documentation lag behind Season 3

**Source-confirmed; existing gates executed.** [`package.json`](../../package.json#L7) has tests, build, level validation, and component typechecking, but no lint or full shell static-check command. [`tsconfig.components.json`](../../tsconfig.components.json#L1) covers only `src/components` and `src/lib`. There is no repository CI workflow, `engines`, or `packageManager` declaration. The locked Vite requires Node `^20.19.0 || >=22.12.0`; the audit used Node 24.18.0/npm 11.16.0.

The authoring guide still describes sequential unlocking and points shared exercise styles to the old global stylesheet. `CONTRIBUTING.md` has an unqualified ban on runtime dependencies despite the approved Season 3 shell exception. Current tests exercise useful pure shell behavior but do not cover the browser harness failures, storage recovery, or destructive maintenance cases above.

**Recommend:** declare a supported Node/npm environment, document clean installs with `npm ci`, and establish CI for existing gates plus shell-focused lint/static checking and the meaningful regressions identified here. Exclude intentional exercise failures explicitly. Update authoring/contributing prose to free choice with a suggestion, current style ownership, and separate shell versus generated-exercise dependency rules. Maintain the existing generation/investigation/help distinction, blind mode, and mandatory fail-before/pass-after verification.

## Patterns worth retaining

- The external-agent brief explicitly preserves blind mode, requires both directions of behavioral verification, and requires restoring the planted version. The app honestly says that it prepares a handoff rather than running an agent itself.
- The check-session abstraction already rejects duplicate starts, suppresses abandoned results, stops later checks, and refuses to count an empty run as success. Strengthen its resource lifecycle rather than replacing these guarantees.
- Saved completion and verification this visit are presented separately. Revisited challenges start unchecked. Free selection and suggested next challenge match the approved product direction.
- Reflection and draft lifetimes are explicitly session-only. Their loss on reload is a disclosed product choice, not a persistence bug to silently change.
- Native navigation, component-scoped styling, and small pure helpers are suitable here. There is no evidence justifying a new state-management framework, generic repository layer, or broad memoization pass.

## Recommended repair order

1. **Trustworthy verification:** F01/F02/F09, with synthetic browser regressions, explicit readiness/deadlines, and teardown/cancellation evidence. Decide the isolation contract before changing the harness. Preserve check assertions and helper compatibility.
2. **Durable progress and history:** F03/F04, including migration, cross-tab/reset behavior, read/write/reset failures, and multiple pending completions.
3. **Reliable authoring and recovery:** F05/F07/F08/F10. Align discovery, validate contracts, make maintenance recoverable, and prove the generated exercise was tested on the intended server. Keep generated changes bounded and spoiler-safe.
4. **Loading, dependencies, and gates:** F06/F11/F12. Split executable curriculum loading, measure it, update compatible development tools, and add repeatable checks/documentation.
5. **Then Phase 3:** organize files around the resulting ownership boundaries. Capture another current-working-tree baseline before moving protected paths. Perform the separate-folder/repository transfer only after these approved repairs and structural verification.

Each batch should be independently reviewable. A small safe checkpoint/diff and a spoiler-free validation record are useful for generation recovery; a new history/diff UI is not required to repair these defects.

## Validation and limits

| Command / activity | Exit | Result |
|---|---:|---|
| Focused Node shell tests (progress, brief, session, navigation, practice) | 0 | 29 tests passed |
| `npm.cmd test` | 1, then 0 | Sandbox denied esbuild directory access; approved retry passed all 30 tests |
| `npm.cmd run typecheck:components --no-update-notifier` | 0 | Installed component/library boundary passed; not a full-shell typecheck |
| `npm.cmd run validate-levels` | 0 | Current 17-level curriculum passed the existing validator; its gaps are F05/F07/F08 |
| `npm.cmd run build` | 0 | Vite 7.3.6 build passed; 2,351 transformed modules; sizes recorded in F06 |
| `npm.cmd audit --json` | 1 | 13 affected development dependency nodes; see F11 |
| `npm.cmd audit --omit=dev --json` | 0 | Zero production dependency findings |
| `node docs/superpowers/phase2/persistence-probes.mjs` | 0 | Four assertions reproduced the current persistence defects; this is not a fix verification |
| Synthetic browser harness and App cases | n/a | F01/F02/F04/F09 reproduced through the browser UI |
| Copied validator/maintenance scripts with synthetic curricula | 0 on invalid cases | Demonstrated the acceptance/removal defects; no real curriculum mutation |
| `node docs/superpowers/phase2/state-snapshot.mjs --verify` | 0 | 102 captured working-tree files unchanged |
| `git diff --check` | 0 | No whitespace errors; existing Windows line-ending warnings only |

The first audit-server startup also hit the same sandbox directory restriction and succeeded after approval. The first actionable error was `Cannot read directory "../..": Access is denied.` Optional npm metadata reads were blocked by npm-cache `EPERM`; published patch information came from the primary advisory pages instead. These are environment failures, not application failures.

No lint/full-shell typecheck command exists yet. No large-catalog speed benchmark, hostile-code security assessment, port-collision browser run, or complete fail-before/pass-after verification of the 17 existing exercises was performed. The intentional exercise bugs were not repaired or used as ordinary failing regression tests. Passing the existing suite and build does not disprove the reproduced defects.

Evidence summaries are in [phase2-reproduction-results.json](evidence/2026-09-23-phase2-reproduction-results.json). Reusable local probes and synthetic browser fixtures remain under the Git-ignored `docs/superpowers/phase2/`; this directory is not part of the proposed product changes.
