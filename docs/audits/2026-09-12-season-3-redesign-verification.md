# Season 3 Engineering Lab — implementation evidence

Date: 2026-09-12. Scope: the approved frontend redesign on `season-3`, built directly in code. Main and Season 2 were reference sources only. The broader reliability audit, general restructuring, and separate-repository transfer remain later stages.

## Delivered behavior

- Generated practice leads the app. Every challenge is selectable, with an explained unfinished suggestion, recent continuation, search, and completion filters. The 15 original exercises remain available in Foundations.
- Create challenge is a dedicated brief builder with topic, difficulty, count, optional context, exact displayed brief, copy feedback, and learning-profile export. It explicitly hands work to an external coding agent; it does not claim to run or validate that agent.
- Investigations prioritize the live experiment and behavioral verification. Desktop focus mode retains the mounted experiment, while source paths, the full concept reference, and optional encoded hints remain available.
- Saved completion and current verification are distinct. Revisits begin unchecked. Successful current checks reveal an optional reflection retained for the app session.
- The Bugbound family icon, graphite surfaces, warm text, restrained amber, muted teal, and ruled register form the Engineering Lab identity. Mobile retains the source-editing notice and browsable content.

## Final command evidence

Each command completed independently from the repository root.

| Command | Exit | Result |
| --- | ---: | --- |
| `npm.cmd test` | 0 | 29 passing tests: existing progress contracts plus practice, brief, routes, and check-session behavior. |
| `npm.cmd run validate-levels` | 0 | All 17 manifests valid. |
| `npm.cmd run build` | 0 | Vite production build succeeded; 89 modules. JS 294.01 kB / 95.09 kB gzip; CSS 27.18 kB / 6.05 kB gzip. |
| `git diff --check` | 0 | No whitespace errors; Windows line-ending notices only. |
| PowerShell SHA256 baseline comparison | 0 | All 55 protected files unchanged; original exercise stylesheet exact text equality. |
| `node C:/Users/d69ha/.agents/skills/impeccable/scripts/detect.mjs --json src/shell src/styles/lab.css` | 0 | No deterministic findings (`[]`). |
| `rg -n '6aae37b5' dist/index.html` | 0 | The design contract persists in the built HTML. |

There is no declared lint or typecheck script. The build does not prove every intentional exercise is correct. No dependency was added and the lockfile is unchanged.

## Browser evidence

The app ran locally with Vite on `127.0.0.1:5175`. The browser's viewport controls were restored after testing.

| Coverage | Observed result |
| --- | --- |
| Desktop 1280 × 720 and 1440 × 900 | Practice, brief, investigation hierarchy and controls inspected. The brief copy action is visible alongside its output. |
| Tablet 800 × 900; mobile 390 × 844 | Sequential investigation layout and mobile notice inspected. Measured document widths fit the viewport. |
| Selection and filters | Opened challenge 17 with 16 incomplete; searched to one result; completion filter reached an empty state and cleared; all 15 Foundation links are available. |
| Navigation | Return/continue worked, the brief draft survived navigation, and an unknown route offered recovery. Route headings receive focus. |
| Experiment focus | Focus/show-context retained the live component's observed state. |
| Verification | The unchanged challenge 17 checks produced 2 of 4 passing checks, an expected planted-exercise result. No lesson was fixed or decoded. |
| Keyboard | Verification section navigation placed focus on `verification-title`. |
| Brief | Clearing optional context kept it expanded and focused. Editing a copied brief invalidated its copied state. Exact brief copying was checked during the first pass. |
| Source copy | Copied a source path, then pasted through the browser into a temporary draft field; it exactly matched the displayed path. Restored the draft afterward. |
| Profile export | The existing download action completed and displayed its success feedback. Downloaded file contents were not independently re-audited. |
| Synthetic shell fixture | Actual checks passed 1/1; completion was earned through `onComplete`. Leaving/returning retained saved completion but reset current verification. A fresh pass restored the typed reflection. Replacing the check definition reset current success; its intentional failing rerun kept historical completion separate. |

The synthetic fixture lives in `tests/fixtures/` and uses an isolated `localhost` origin during QA. It is not part of the production entry. It does not seed real exercise completion or change protected lessons.

Final viewport captures are in `.impeccable/review/`: `practice-user-1280.png`, `brief-user-1280.png`, `investigation-user-1280.png`, `investigation-desktop-1440.png`, `investigation-tablet-800.png`, `practice-mobile-390.png`, `brief-mobile-390.png`, `investigation-mobile-390.png`, and `investigation-mobile-verification-390.png`. Every listed file was opened and checked before independent review. A malformed full-page capture was replaced with a valid viewport capture.

The filename dimensions identify the configured CSS viewport. The browser exporter proportionally reduced some PNGs: the three 1280 captures are 1265 × 712 pixels, the 1440 capture is 1425 × 891, the 800 capture is 785 × 883, and the Practice/Brief mobile captures are 375 × 812. The two investigation mobile captures are 390 × 844. Browser API settings and DOM width readings establish the tested viewport; bitmap dimensions are recorded separately rather than treated as identical.

## Reviews and corrections

The first independent Web Design Guidelines and React review identified four P2 issues: shell resets leaking into exercise controls, optional context collapsing when cleared, parent verification status surviving a replaced check session, and a section-jump heading lacking a focus target. All four were corrected and rechecked. The final targeted source review approved the changed files with no additional actionable findings. Its primary checklist was fetched again from the [Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

The Impeccable concept seed service was unavailable on both normal and network-enabled attempts. The user-approved Engineering Lab direction and code-first preference governed the build; no generated comparison boards or mockups were available.

The fresh Impeccable finish reviewer returned **`ship`**, with all five contract sections present and no material fixes. Its verdict covers the reviewed source and nine supplied captures; interaction evidence came from the implementation browser pass. It confirmed the type, flat ruled surfaces, palette, experiment priority, external-agent handoff, responsive adaptation, and evidence/guidance presentation. It could not compare against unavailable QUALITY BAR imagery or independently observe motion. The report is retained at `.impeccable/review/2026-09-12-finish-review.md`.

The Impeccable documenter recorded the built system in root `DESIGN.md` and `.impeccable/design.json` after the final review. Its token, narrative, component-reference, JSON, and whitespace checks exited 0. The parent inspected DESIGN.md and independently parsed the schemaVersion 2 sidecar successfully (PowerShell exit 0), then reran `git diff --check` (exit 0).

A subsequent stop hook compared the newly created design record with CSS and reported 48 advisory mismatches. All were triaged: 47 documentation omissions were reconciled (nine existing type steps referenced 34 times, plus 13 component colors); one preserved exercise color received an exact value/file exception. No styles changed. The final detector over shell, lab.css, and global.css returned `[]`, exit 0. See `.impeccable/review/2026-09-12-hook-triage.md` for every finding and disposition.

## Protection and verification limits

The baseline covers `src/levels`, existing maintenance scripts, solutions, the harness, the React entry, and the lockfile. Existing exercise checks, IDs, encoded hints and solutions remain unchanged. `src/styles/exercises.css` exactly preserves the original exercise rule block; shell resets exclude exercise descendants. A live exercise button retained its original computed typography, padding, and color.

The new session guard ignores abandoned results and stops subsequent checks; it cannot interrupt a check already executing. It does not supply iframe isolation, a security sandbox, cross-tab progress synchronization, generation-scoped reset protection, or complete persistence-failure recovery. Those remain candidates for the next audit. The existing eager registry also remains for that stage.

No blanket pass is claimed for all exercises, all browsers, assistive technologies, or actual 200% browser zoom. Storage failure injection, security isolation, and exhaustive harness recovery were outside this frontend verification. No commit, push, deployment, main-branch edit, sibling-project edit, or repository transfer was performed.
