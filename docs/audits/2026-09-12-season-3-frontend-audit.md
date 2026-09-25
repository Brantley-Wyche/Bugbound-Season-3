# Bugbound Season 3: Frontend Audit and Critique

Method: dual-agent (A: `/root/critique_design`; B: `/root/critique_evidence`), with parent source review, browser reproduction, and repository validation.

Date: 2026-09-12. Audited branch: `season-3`, commit `7663891931a608cb6fd8c17441567546491828a3`, plus the pre-existing local working tree. This is phase one: findings and recommendations, not an approved redesign or reliability implementation.

## Outcome and scope

Season 3 has a useful working foundation: a visible generation brief, real React exercises, local learning telemetry, automatic custom-level discovery, and explicit blind-mode instructions. It does not yet deliver the substantial advance over Season 2 requested in the brief. Its structure still centers the earlier campaign shell, while gradients and an Agent Station supply most of the seasonal distinction.

The recommended direction is to organize Season 3 around commissioning and investigating custom practice: choose what to practice, review the brief and optional learning evidence, hand it to an agent, inspect spoiler-safe verification evidence, investigate the resulting incident, and reflect on the result. This is a proposed direction. It does not require an embedded editor, agent API, automatic source-diff viewer, or new dashboard panels.

Only the managed frontend-workflow block in tracked `AGENTS.md` was installed. New audit evidence and a critique snapshot accompany it. Product source, intentional exercises, manifests/checks, hints, solutions, dependencies, and branch history were not changed. No commits, pushes, merges, or folder moves were performed. Existing untracked `.claude/settings.local.json`, `.impeccable/`, `docs/design-concepts/`, and `docs/superpowers/` content was retained.

## Current architecture and reference context

- The lockfile resolves React/React DOM 19.2.7, Vite 7.3.6, and TypeScript 5.9.3. The application uses JavaScript/JSX, selected TypeScript exercises, plain CSS, hash routes, and native controls. It has no installed coss UI/Base UI stack. The current no-new-dependencies rule applies.
- There are 15 campaign levels and two custom levels. The first custom level is available without campaign completion; subsequent custom levels have sequential prerequisites.
- `src/shell/AgentStation.jsx` composes a prompt from topic, difficulty, and count. Learning history is a separate JSON download. The app does not call an agent or observe its execution.
- `src/levels/index.js` imports official manifests and eagerly discovers custom manifests. Preview and check components execute in the page's JavaScript environment. The check harness creates an offscreen React root, not an iframe or security boundary.
- `PRODUCT.md` and `DESIGN.md` are absent from this branch. The existing implementation is evidence of the incumbent design, not evidence that old untracked design artifacts are an approved Season 3 direction.
- Read-only comparison used `main` at `7a299cf0c27925610827783983911d611cae23db`: its Product/Design documents describe the field notebook, accessible navigation, explicit completion states, and restrained shell structure.
- Season 2's current local `PRODUCT.md`, `DESIGN.md`, package manifest, and September 12 phase-two/three reports were read. They document the Investigation Desk, coss/Base UI, separated shell gates, and preserved curriculum limitations. These were context, not instructions to copy its Next.js architecture or dependencies. The supplied GitHub URL could not be fetched, so the local Season 2 checkout was the substantive reference. Neither reference project was changed, checked out over this branch, or revalidated live.

## Explicit Impeccable audit

### Implementation integrity verdict

**Needs work.** The product has recognizable learning-specific behavior, but its validation claims, agent instructions, season transitions, and displayed completion states do not consistently match their implementation. The deterministic scan found no issues in its narrow target; the verified manual findings below remain applicable.

| Dimension | Score / 4 | Evidence and limitation |
| --- | ---: | --- |
| Accessibility | 2 | Native labels, visible focus, and live feedback exist; faint instructional text fails minimum contrast, and route/heading semantics need work. |
| Performance | 3 | Current build is modest and uses system fonts; every exercise's executable manifest is eagerly included. No throttled performance benchmark was run. |
| Responsive design | 2 | Default landing/form content fits 320–1280px; long topic text clips and the 800px lesson puts working controls far below the initial reading sequence. |
| Theming | 2 | Core tokens exist; repeated raw colors/gradients and faint text weaken consistency. A light theme is not a requirement. |
| Implementation integrity | 1 | The claimed validation boundary is absent, agent documents conflict, and several season/status strings are misleading. |
| **Total** | **10/20** | **Acceptable: significant work needed.** |

Scores are a prioritization aid, not a WCAG, security, or performance certification. The nine technical findings below contain **0 P0, 3 P1, 6 P2, and 0 P3** items. Design priorities later in the report overlap these findings and must not be added to that count.

### T1 — [P1] The UI promises validation before discovery without an enforced gate

**Category:** implementation integrity. **Evidence:** source-confirmed contract mismatch.

`src/shell/AgentStation.jsx:104` says generated levels are validated before appearing. `src/shell/LevelMap.jsx:167` repeats that ordering. In fact, `src/levels/index.js:23` eagerly imports every matching custom manifest; neither the loader nor the dev/build scripts require a validation receipt. Validation is a separate command. The validator's forbidden-operation checks inspect direct sibling source files and exclude the manifest (`scripts/validate-levels.mjs:121`), so they should not be described as a security guarantee.

This matters because a learner can confuse discovery with approval, and a broken or incomplete generation can affect the application before the intended review. Preview error boundaries do not contain module-import failures. No malicious exercise or exploit was created to demonstrate this; the finding is based on the actual import/validation path.

**Recommendation:** first make the copy truthful about agent-run validation. In phase two, evaluate an explicit staged-generation/validation record and an executable loading boundary, with clear failure recovery. Review execution isolation separately if generated code is treated as untrusted. Same-origin iframe lifecycle isolation alone would not establish security isolation.

**Follow-up:** Impeccable `clarify` and `harden`; deeper loader/validator/isolation design belongs to phase two.

### T2 — [P1] Agent handoff documents give conflicting protection and verification instructions

**Category:** implementation integrity. **Evidence:** source-confirmed contradiction.

`SEASONS.md:18` allows limited end-to-end verification and disclosure warnings, while `.claude/skills/bugbound-levelsmith/SKILL.md:92` requires red/green proof for every generated exercise and restoration of the hidden buggy version. `SEASONS.md:95` tells agents to edit the registry, while the active authoring contract forbids it and uses automatic discovery. Its old future-release note (`SEASONS.md:103`) also conflicts with the current requested separate Season 3 repository.

Blind mode additionally needs a concrete operational method: passing plaintext to an encode command or applying a private fix in the visible working tree can expose that content in agent transcripts/diffs even if committed files contain base64. The docs state the desired secrecy but do not establish a portable hidden-verification procedure.

**Recommendation:** establish one current agent contract and make historical notes explicitly non-authoritative. Define generation, coaching, learner repair, protected checks, preservation of existing learner work, private verification, and rollback separately. Do not weaken checks or decode existing content to repair documentation. Validate the procedure in phase two before claiming every agent interface can preserve secrecy.

**Follow-up:** Impeccable `clarify`; authoring tooling and recovery audit in phase two.

### T3 — [P1] Faint text is too low contrast for instructions and controls

**Category:** accessibility/theming. **Evidence:** source color calculation and browser observation.

The `--faint` color `#55657a` (`src/styles/global.css:17`) against the opaque workflow background `#0d1117` is **3.18:1**. It is used for 11px workflow text (`global.css:497`). The Agent Station safety paragraph uses the same foreground at 10.5px (`global.css:1339`); its base-panel calculation is **3.11:1**, with actual gradient pixels varying. The plain footer/reset treatment is also faint. Disabled incident text was not used as evidence of a contrast violation.

Ordinary small text needs 4.5:1 under [WCAG contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). The opaque workflow pair is the deterministic failure; the gradient paragraph is supporting visual evidence, not a pixel-sampled ratio.

**Recommendation:** define readable secondary and tertiary text roles, check actual composited backgrounds, and enlarge useful metadata. Preserve textual status labels and strong keyboard focus.

**Follow-up:** Impeccable `typeset`, `colorize`, and `harden`.

### T4 — [P2] Return navigation and progress language lose Season 3 context

**Category:** implementation integrity/navigation. **Evidence:** live reproduction plus source-only completion branches.

Infinite Mode → first generated incident → “Back to the map” lands at `#/`, displaying Season 1. `src/shell/LevelPage.jsx:17` hardcodes that destination; the brand uses a different track-aware rule (`App.jsx:76`). The final generated incident's completion branch says “Season 1 complete!” (`LevelPage.jsx:43`); this branch was read, not activated by solving an exercise. The header's “0/2 GENERATED” counts resolved generated incidents even though two generated incidents already exist (`App.jsx:99`).

**Recommendation:** derive map/back/completion destinations and labels from the active track. Show resolutions as resolutions and give a completed custom queue its own next-practice action. Preserve the sequential learning rules unless a later product decision changes them.

**Follow-up:** Impeccable `harden` and `clarify`.

### T5 — [P2] Brief drafts disappear, long topics clip, and copy feedback can become stale

**Category:** responsive design/implementation integrity. **Evidence:** live reproduction.

After entering a custom topic, difficulty, and count, opening an incident and returning recreated Agent Station with its defaults. State is owned by the unmounted component (`src/shell/AgentStation.jsx:23`). A long unbroken topic produced a brief with **269px client width versus 1,824px scroll width at 390px**. `global.css:1236` clips the station while `global.css:1317` provides no arbitrary wrapping for the brief. A parent reproduction also showed 540px visible width versus 3,669px content width at a 661px browser viewport.

Copy succeeds and the browser clipboard matches the brief, but “Agent brief copied” remains after editing the topic; the status no longer identifies the current brief accurately. The empty-topic fallback works.

**Recommendation:** retain a draft across incident visits, support long-token wrapping, and clear or qualify copied feedback when its source changes. Persistence scope should be deliberate; a backend is unnecessary for these repairs.

**Follow-up:** Impeccable `harden` and `adapt`.

### T6 — [P2] Navigation semantics and lesson orientation need a consistent model

**Category:** accessibility/navigation. **Evidence:** source and browser DOM/keyboard inspection.

Route navigation uses buttons (`App.jsx:76`, `LevelMap.jsx:10`, `LevelPage.jsx:17`), so normal link features such as opening an incident in another tab are unavailable. There is no skip link or route-title focus management (`App.jsx:19`). Lesson sections jump from h1 to h3 (`LevelPage.jsx:75`), and the map has two h1 headings (`LevelMap.jsx:85`, `AgentStation.jsx:60`). Duplicate h1 headings alone are an outline concern, not an automatic claim that the page is invalid.

The four-stage strip is static and highlights Verify before any user action (`LevelPage.jsx:28`); it neither navigates nor reflects measured investigation progress. At 800px, a long Concept, report, and Hints panel precede the live work, with no section shortcuts.

**Recommendation:** use anchors for routes, add a skip path and predictable title focus, correct the heading hierarchy, and provide useful section navigation in narrow working windows. Keep the full concept accessible and optional hints closed.

**Follow-up:** Impeccable `adapt`, `layout`, and `harden`.

### T7 — [P2] Small-screen support is present but incomplete for the intended editor/browser setup

**Category:** responsive design. **Evidence:** live sizing plus source review.

The landing/form view fits all tested default widths. At 320px its three action buttons measured 44px, 44px, and 49px high. However, the desktop-use notice is restricted to widths at or below 700px (`global.css:870`, `:901`), so it is absent at the 800px tablet/working-window size. The notice says editor and browser side by side but does not explicitly explain editing local source and recompilation. Agent fields have a 42px minimum, while Remount and the unpadded Back/Reset controls remain small (`global.css:655`, `:456`, `:204`).

**Recommendation:** retain the notice and explain the real local-source workflow, while keeping lessons browsable. Assess tablet/coarse-pointer visibility and consistently comfortable controls. **44px is a usability target here; being below 44px alone is not proof of a WCAG 2.2 AA target-size failure.** AA has a 24px minimum with exceptions and spacing provisions: [W3C target-size explanation](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Actual 200% text scaling, forced colors, touch hardware, and mobile Safari were not tested.

**Follow-up:** Impeccable `adapt`, `typeset`, and `clarify`.

### T8 — [P2] Infinite growth currently increases the initial executable payload

**Category:** performance. **Evidence:** source and completed production build.

`src/levels/index.js:1` imports official manifests, and line 23 eagerly includes every custom manifest. All consumers therefore share executable exercises/checks at startup instead of reading only metadata. The current build produces one application JS asset of **281.37kB, 91.32kB gzip** and **24.51kB CSS, 5.45kB gzip**. This is not evidence of a current severe speed problem; it is a concrete scaling boundary for an infinite queue and increases the impact of failed exercise imports.

**Recommendation:** investigate a lightweight, validated catalog and per-incident loading with real loading/error states. Use Vite/React-compatible imports, not Next.js APIs copied from Season 2. Do not add blanket memoization or virtualization without profiling meaningful queue sizes. [Vite glob documentation](https://vite.dev/guide/features.html#glob-import) and [React lazy loading](https://react.dev/reference/react/lazy) describe applicable primitives; the installed Vite 7 import-glob types also support the eager option. The exact metadata/check-loading design needs phase-two analysis.

**Follow-up:** Impeccable `optimize` and `harden`.

### T9 — [P2] Saved completion and current verification are visually conflated

**Category:** implementation integrity/status. **Evidence:** source-only; deep reliability verification deferred.

`App.jsx:37` loads completion from storage and passes it as `isComplete`. `LevelPage.jsx:35` then displays “Incident resolved,” while `ChecksRunner.jsx:6` starts with no current results. A revisit can therefore present a present-tense resolution alongside an unrun verifier. The run loop has no cancellation signal or unmount cleanup (`ChecksRunner.jsx:10`), and storage saves/resets have no operation-specific recovery UI (`App.jsx:44`, `:51`; `progress.js:22`).

**Recommendation:** distinguish historically saved completion, completion achieved this visit, and the latest check run. In phase two, reproduce cancellation, timeout, cleanup, storage denial, reset, and stale-tab cases with disposable evidence before changing mechanics. Do not copy Season 2 fixes without checking this React/Vite harness and preserving executable assertions.

**Follow-up:** Impeccable `harden` and `clarify`, backed by the phase-two reliability audit. No failing race or persistence experiment is claimed in this phase.

## Explicit Impeccable critique

### Design specificity and overall impression

The incident metaphor and authentic debugging loop belong to Bugbound. The current visual composition is less distinctive: purple/teal gradients, colored panel edges, dot texture, infinity decoration, and small uppercase labels carry most of the Season 3 differentiation. It currently offers less working sophistication than the documented Season 2 Investigation Desk. The goal should be a clearer relationship between the learner, the agent, and trustworthy exercise evidence, expressed through the structure of the product.

The deterministic scan of `src/shell` completed once with **0 findings**, exit 0. That narrow JSX scan did not certify the separately owned stylesheet, accessibility, lifecycle contracts, or visual quality. Manual inspection supplied the findings. No false positives needed dismissal, and no live detector overlay was produced.

### Design health score

| Heuristic | Score / 4 | Main issue |
| --- | ---: | --- |
| Visibility of system status | 2 | Completion is labeled GENERATED; generation/handoff state is not visible. |
| Match with the real world | 3 | Incident/editor language fits; adaptation depends on an external agent and separately supplied history. |
| User control and freedom | 2 | Back loses track context; source lacks cancellation. |
| Consistency and standards | 2 | Track-aware brand and campaign-only back/completion disagree. |
| Error prevention | 3 | Constrained inputs, explicit hints, reset confirmation, and secret-preserving brief are useful. |
| Recognition rather than recall | 2 | Profile/repository/handoff context must be carried between apps. |
| Flexibility and efficiency | 2 | Continue and native keyboard controls work; narrow lesson navigation is inefficient. |
| Aesthetic and minimalist design | 2 | Clear large headings compete with repeated framed sections and decorative status treatment. |
| Error recovery | 2 | Clipboard fallback and component retry exist; generation recovery is not explained. |
| Help and documentation | 3 | Basic learning loop is documented; agent coordination needs clearer guidance. |
| **Total** | **23/40** | **Acceptable: significant improvements needed.** |

All ten heuristics apply to this Operate/Read interface. These scores originated in Assessment A before detector results were released.

### Five design priorities

1. **[P1] Complete the external-agent handoff.** The brief is functional but only uses topic/difficulty/count; personalized history is a separate export. Explain where the agent works, when the profile is useful, what evidence to request, and how the learner returns. Show actual observed state rather than simulated agent progress. Relevant source: `AgentStation.jsx:13`, `:44`, `:95`; `learning.js:53`. Follow-up: `clarify`, `onboard`.
2. **[P1] Design the lesson for a browser beside an editor.** At 800×900, Concept/report/Hints push preview and checks below the initial viewport. Keep the full reference accessible while reducing repeated scrolling to report, source, and evidence. Relevant source: `LevelPage.jsx:72`, `:102`, `:105`; `global.css:523`. Follow-up: `layout`, `adapt`.
3. **[P1] Preserve context through navigation and completion.** Correct the reproduced wrong-track Back action, generated/resolved labels, and source-confirmed final-season message. This affects confidence more than surface polish. Relevant source: `LevelPage.jsx:17`, `:43`; `App.jsx:99`. Follow-up: `harden`, `clarify`.
4. **[P2] Separate returning practice from commissioning more practice.** The next-level shortcut is useful, but choosing from the queue requires passing a large introduction, workflow strip, and full generation station. Prioritize continuing work when a queue exists and generation when it is empty. Avoid decorative statistics. Relevant source: `LevelMap.jsx:79`, `:117`, `:152`. Follow-up: `distill`, `layout`.
5. **[P2] Establish a mature identity through useful structure and readable detail.** Reduce competing gradients, panel edges, tiny uppercase metadata, and emergency language for ordinary uncompleted practice. Carry forward the family mark and restrained graphite/amber/teal vocabulary where appropriate, while developing a distinct Season 3 workflow. Assets in main/Season 2 are candidates, not copied files. Relevant source: `global.css:48`, `:548`, `:1232`, `:1339`, `:1449`; `LevelMap.jsx:52`. Follow-up: `shape`, `typeset`, `quieter`.

### Strengths to retain

- Three native labeled controls produce an inspectable, spoiler-safe brief. Keyboard selection works and a blank topic has a useful fallback. Copy feedback and actual clipboard content were verified.
- Learners use the real editor, HMR, live exercise, and behavioral checks. Concept prose remains accessible and hints stay deliberately concealed. No planted bug was repaired or explained during the audit.
- Basic responsive adaptation, visible 2px focus outlines with 3px offset, text-based check states, named progress, and live feedback are present. The main generation buttons reach comfortable mobile heights.
- Local learning telemetry excludes solution content and has a clear potential role in learner-controlled personalization. The post-incident reflection prompt is educationally useful even though it is currently static.

### Cognitive load and emotional journey

Assessment A identified three failed checklist items: single focus, visual hierarchy, and working memory. That is moderate load. Repeated hero/station/queue emphasis competes for attention, while the external handoff requires remembering profile and repository context.

The current interface does **not** present a verified wall of options: it has two tracks, three configuration fields, three choices in each select, three station actions, four static workflow steps, and two generated entries with one available. No current Season 3 decision point has more than four simultaneously selectable options. Large-queue overload is an untested scaling candidate.

The visible brief is the confidence-building moment. The emotional low point is handing work to an external agent without a clear return/evidence path. The familiar lesson restores direction, but narrow-window scrolling and wrong-track navigation interrupt it. A completed cycle should make clear what was demonstrated and what can be practiced next; that does not require exposing the solution or automatically scoring reflections.

### Persona checks

- **Alex, returning learner:** Continue helps, but choosing from the queue requires unnecessary scrolling. Narrow-window section navigation and track-preserving returns would reduce interruption.
- **Jordan, first-time agent user:** can build a brief, but must infer how a profile becomes personalized practice and where the agent should operate. Generation status should not imply an agent integration that does not exist.
- **Sam, keyboard/low-vision learner:** native labels and strong focus work. Faint small text, inconsistent headings, and missing skip/route focus support need attention. Actual screen-reader speech was not tested.

### Smaller observations and design decisions for later

Source paths are selectable but have no adjacent copy action. Hint wording can be less judgmental while retaining deliberate disclosure. Check names only appear after starting a run. The header/favicon still use an emoji instead of the supplied family asset. These are subordinate to the priorities above.

Before redesign implementation, settle what an advanced Season 3 learner should be able to demonstrate, what spoiler-safe evidence should accompany a generated exercise, and how newly requested targeted work relates to older unfinished generated levels. A practice history, source-diff view, or reflection journal should be added only when it answers one of these concrete needs.

## React Best Practices and independent Web Design Guidelines review

The [current Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) were fetched for this review. Focused source findings:

| Source | Applicable finding |
| --- | --- |
| `src/shell/App.jsx:19` | Route changes scroll but do not provide a consistent focus/skip strategy. |
| `src/shell/App.jsx:76` | Navigation is a button instead of a link. |
| `src/shell/AgentStation.jsx:60` | Subordinate station is a second page-level heading. |
| `src/shell/AgentStation.jsx:70` | Topic input lacks stable name/autocomplete intent; add them when refining the form. |
| `src/shell/AgentStation.jsx:23` | A brief draft is lost on leaving the map. |
| `src/styles/global.css:1317` | User-controlled brief text does not handle long unbroken content. |
| `src/shell/LevelPage.jsx:75` | Lesson outline skips a heading level. |
| `src/shell/ChecksRunner.jsx:49` | Result live region is inserted with results; keep it mounted when refining announcements and verify with assistive technology. |
| `src/levels/index.js:23` | Eager executable loading is the first useful bundle optimization to investigate. |
| `src/shell/App.jsx:44` | Persistence side effect occurs inside a state updater; review pure updates and error recovery in phase two. |

No missing image dimensions or external font loading problem was invented for an interface using system fonts and an emoji mark. Existing native labels, focus indicators, semantic controls, progress values, and live messages are positives. Plain CSS and a dark-only theme are valid choices. Generic Next.js, SSR, hydration, server-cache, and SWR recommendations do not apply to this Vite SPA. The deliberate StrictMode choice is preserved. Do not introduce memoization, a router, a component library, or virtualization merely to satisfy a checklist.

## Verification and evidence coverage

| Command / action | Exit | Result |
| --- | ---: | --- |
| Frontend installer preview | 0 | Inspected a managed-block addition preserving existing rules. |
| Frontend installer `--write` | 0 | `status=updated`, `git=tracked`; 14 lines added to AGENTS.md. |
| Repeat installer preview | 0 | `status=preview-unchanged`; no duplicate block. |
| `npm.cmd test` | 0 | Two progress sanitization tests passed. |
| `npm.cmd run validate-levels` | 0 | All 17 levels passed the current static validator. |
| `npm.cmd run build` | 0 | Production assets built; 84 modules transformed. |
| `node C:\Users\d69ha\.agents\skills\impeccable\scripts\detect.mjs --json src/shell` | 0 | One run; empty findings array. |
| `git diff --check` | 0 | No whitespace defects. |
| `git diff --quiet HEAD -- src scripts package.json package-lock.json index.html vite.config.js tsconfig.json CONTRIBUTING.md SEASONS.md SOLUTIONS.md` | 0 | Audited product/protected source and dependencies unchanged from the initially clean tracked baseline. |

There is no declared lint, shell typecheck, or browser-test script in this branch. A successful Vite build is not TypeScript typechecking or behavioral red/green proof. No new test suite was written for this audit-only work.

**Browser coverage:** two isolated assessment tabs plus the parent's independent reproduction tab in Codex's in-app browser. Assessment B tested 1280×720, 800×900, 390×844, and 320×740. Assessment A also inspected the generated lesson at full desktop, 800×900, and mobile. The parent verified custom topic/difficulty/count, clipboard content, blank-topic fallback, topic suggestion, wrong-track return, lost draft, and long-topic clipping. Landing/form interactions produced no captured console warnings/errors in B. Exercise check execution was deliberately omitted to avoid solving or recording a playthrough.

**Limitations:** no 17-level solved playthrough, hint disclosure, private red/green generation, malicious-code experiment, progress reset, blocked-storage/cross-tab race experiment, empty queue fixture, successful completion fixture, actual profile-download verification, clipboard-denial test, screen-reader speech test, 200% text scaling, forced colors, cross-browser coverage, throttled benchmark, or large-queue stress test. Source-only observations are labeled above. The Git global-ignore permission warning did not block reading the worktree diff.

## Recommended sequence and remaining phases

1. Shape the Season 3 workspace and capture current product/design truth, using this report as requirements. Resolve the handoff, narrow-window investigation flow, and separate-repository identity before committing to UI structure.
2. Apply approved `clarify`/`harden` repairs for truthful copy, context navigation, drafts, status language, and accessibility. Coordinate the working-window layout with `adapt`/`layout`/`typeset`.
3. Perform the requested phase-two code audit: generation staging and recovery, manifest validation coverage, private verification evidence, loading failures, check lifecycles, progress generations/cross-tab behavior, storage recovery, and telemetry quality. Keep intentional curriculum failures separate from shell failures.
4. After approved reliability work, perform the phase-three structure audit. Candidates are ownership-based shell groups, separated shell/exercise CSS, tests outside maintenance scripts, and clearly identified generated catalog outputs. Compare against the then-current working tree and preserve protected-file hashes; do not use this older baseline after further changes.
5. Finish UI remediation with one bounded Impeccable `polish` and focused desktop/mobile verification, then one targeted audit/critique follow-up.
6. Only after those phases, prepare phase four: transfer Season 3 into the user's dedicated folder/repository, preserving current source and learner work, defining repository identity and history handling, and validating the standalone setup. `main` and Season 2 remain context only.

The user can choose the follow-up order. No recommendation here constitutes approval to redesign, change checks, install dependencies, publish, merge, or move the project.
