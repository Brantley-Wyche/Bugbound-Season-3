# Bugbound Season 1 audit and design handoff for Claude

Prepared September 24, 2026, for Brantley Wyche. This document consolidates the Season 1 frontend audit, approved redesign, two formal critiques, code audit and fixes, file restructuring, and subsequent brand-asset update. Its purpose is to support an independent second opinion, with particular attention to the new frontend styling.

## Review request

Please review the Season 1 application in the browser and its source, then give Brantley your independent opinion on the design, usability, accessibility, reliability, and maintainability. Assess whether the **on-call field notebook** direction gives this React learning project a distinctive identity while keeping the first season simple.

Separate reproducible defects from aesthetic preferences. Cite files/selectors and, where relevant, viewport, interaction, and reproduction evidence. Explain what works as well as what deserves improvement. The earlier reviews and passing checks below are historical evidence, not proof that the result is flawless.

This is a review request. Recommend changes before implementing them; no application edits, curriculum fixes, commits, pushes, or deployment are requested. Preserve the intentional exercise bugs and avoid revealing their causes, encoded hints, or solutions. This document contains no solutions.

## 1. Current project and Git state

| Item | Review target |
| --- | --- |
| Product | Bugbound, Season 1 |
| Repository | [Brantley-Wyche/React-Practice-Site](https://github.com/Brantley-Wyche/React-Practice-Site) |
| Owner's local repository | `C:\Users\d69ha\Desktop\react-practice-site` |
| Season 1 branch | `main` |
| Exact reviewed source | `7a299cf0c27925610827783983911d611cae23db` |
| Pre-audit source baseline | `7aa07bf07423a61a595b908d663fdc80e5f96fb1` |
| Runtime | React 19, React DOM, Vite 7, JavaScript with a final TypeScript arc |
| Package manager | npm; committed `package-lock.json` |
| Styling | Plain CSS; no Tailwind, SCSS system, or component-library dependency |
| Routes | `#/` and `#/level/<level-id>` |
| Persistence | Local browser storage; no backend or account system |

**Branch caution:** When this handoff was prepared, the physical checkout was on `season-3` with substantial ongoing edits. Season 1 was inspected using committed `main` files without switching branches or altering that work. Do not evaluate the current checkout or assume an already-running server is Season 1. Use a clean, separate checkout of the exact Season 1 commit. The source, scripts, and styling described below belong to that commit.

The completed Season 1 work is organized into three commits:

| Commit | Date | Contents |
| --- | --- | --- |
| `768e2ab0340e76428247c72b488a6fd387c61ced` | September 5 | Notebook redesign, frontend workflow, critique fixes, code-audit remediation, learning infrastructure, design and audit records |
| `a0e1ed94b3f2b00b13e6b726c538042eff5cf3b6` | September 5 | Progression helper extraction, CSS separation, tests directory, file guide, structure validation |
| `7a299cf0c27925610827783983911d611cae23db` | September 12 | Owner-supplied header icon and favicon |

These changes were committed and pushed during the original work. This handoff freshly checked local `main` and its history; it did not query GitHub again or verify a deployed site.

Useful comparisons, from a repository containing these commits:

```powershell
git diff 7aa07bf 768e2ab -- src index.html exercise.html vite.config.js package.json package-lock.json public AGENTS.md PRODUCT.md DESIGN.md .impeccable docs/audits
git diff 768e2ab a0e1ed9 -- src scripts tests package.json README.md DESIGN.md .impeccable
git diff a0e1ed9 7a299cf -- src/shell/App.jsx index.html public DESIGN.md
```

## 2. Product intent and owner decisions

Bugbound was created with Claude to help Brantley re-learn React by debugging real source files. Season 1 contains fifteen sequential incidents: twelve core React lessons and three TypeScript lessons. The player reads the report and concept, reproduces the problem, edits the exercise in their own editor, lets Vite recompile, then runs checks to unlock the next incident.

The original terminal-like presentation had too many generic dashboard treatments for the owner's taste, especially repeated cards with colored side borders. The approved replacement was an **on-call field notebook**: a legible incident register, large folio numbers, readable lesson prose, restrained operational references, and a continuous working document.

The owner explicitly wanted:

- A simple first season, both visually and in its implementation. Plain CSS remains the foundation. Base UI was conditionally approved if a concrete interaction needed it; no such dependency was introduced.
- A distinctive identity connected to debugging, without making every surface another card, badge, or decorative terminal panel.
- A prominent mobile/tablet message explaining that actual code editing and compilation require the desktop workflow. Browsing should remain possible.
- Frontend findings and recommendations before fixes, then a broader code audit, then a separate file-structure pass. Those three stages were completed in that order.
- Formal Impeccable critique as a distinct, permissioned review step, rather than treating routine implementation QA as the critique.

The learning contract matters more than general cleanup advice. Preserve deliberately broken exercise implementations, executable manifest checks, `data-testid` attributes, encoded hints, and encoded solutions. Two explicitly approved narrative corrections are described later; they did not solve those exercises. The absence of React `StrictMode` is deliberate because the harness measures renders and effect firings.

Season 2 lives in `react-practice-site-s2`. The owner wants it to look more advanced as the learner's skills increase. Season 3 is the agent-assisted, more interactive direction and is being developed separately. Neither season was part of this Season 1 audit; their features, styling, and dependencies should not be assumed here.

## 3. Frontend workflow and implementation context

The installing-frontend-workflow skill added a managed workflow to `AGENTS.md`; its repeated installation was checked for idempotence. A separate learning-boundary section protects the curriculum. The later required-design-review section explicitly instructs agents to offer a formal critique after substantive UI changes and wait for the owner's go-ahead.

The workflow uses:

| Tool or guidance | Role in this work |
| --- | --- |
| Impeccable technical audit | Initial source/browser findings on contrast, focus, navigation, layout, copy, and design consistency |
| Impeccable design and remediation guidance | Notebook shaping and applicable `layout`, `adapt`, `colorize`, `clarify`, `harden`, and `polish` guidance; optimization recommendations were evaluated against actual need |
| Formal Impeccable critique | Two authorized passes after the redesign, with separate design and detector/source assessments before synthesis |
| Vercel React Best Practices | Focused review of rendering, state purity, cancellation, cleanup, loading, and dependencies, using React/Vite constraints |
| Web Design Guidelines | Independent review of semantics, navigation, focus, disclosures, announcements, wrapping, and responsive behavior |
| Repository checks and browser QA | Evidence for each approved implementation stage |

Do not read this as a claim that every named Impeccable command was independently executed. Some provided remediation guidance. The initial technical audit was not a formal critique. The two actual critique records are discussed in section 9.

`PRODUCT.md` records the product boundaries. `DESIGN.md` and `.impeccable/design.json` describe the design system and detector context. The actual React/CSS source is the implementation authority; known documentation drift is identified in section 8.

Production dependencies remain React and React DOM. The code audit added React TypeScript declarations as development dependencies and supported verification scripts. No routing library, global state framework, component library, or animation library was added. The fifteen-level registry remains eagerly loaded; no measured bottleneck justified per-level lazy loading, virtualization, or blanket memoization.

## 4. Final visual system

### Visual idea and materials

This is a dark working notebook: slightly green graphite surfaces, warm paper-like text, subdued amber, thin horizontal rules, and carefully separated type roles. The notebook idea comes primarily from document structure and the incident workflow. There is no graph-paper background, tape, handwriting font, paper texture, shadow stack, or decorative animation.

The map's grid of repeatedly framed cards became a continuous ruled register. Lessons use a report, concept disclosure, preview, verification log, and optional hints. The preview has a stronger enclosing border because it contains the intentionally unreliable exercise. Most surrounding content uses spacing and rules without its own box.

### Typography

Source: `src/styles/shell.css`; loading/preload: `index.html`; font files and license: `public/fonts/`.

| Role | Final treatment |
| --- | --- |
| Main face | Locally hosted variable Public Sans, weights 100–900, `font-display: swap`; Segoe UI/system sans fallbacks |
| Reference face | Cascadia Mono, Consolas, platform monospace; no separate downloaded mono font |
| Body | 15px, line height 1.65 |
| Concept prose | Body size, line height 1.85, maximum measure 70ch, 16px between paragraphs |
| Register introduction | `clamp(42px, 5vw, 66px)`, weight 650, tight tracking, line height 1.08 |
| Lesson title | `clamp(30px, 4vw, 44px)`, weight 650; 30px on small screens |
| Assignment number | 92px light Public Sans, weight 250, tabular numerals; responsive reductions |
| Lesson folio | 62px light Public Sans, weight 250; 44px on small screens |
| Section headings | Generally 21px/600; contextual sizes include register 22px, assignment 25px, hints 18px, resolution 28px |
| Incident row title | 15px; current incident gains weight 650; 14px on small screens |
| Metadata and references | Usually 11–13px; mono for IDs, compact statuses, progress counts, paths, and check errors |
| Verification | Check names 13px/550; wrapping error messages 12px mono, line height 1.75 |

Some mobile metadata and footer roles still reach 10–11px. They are documented contextual roles, not proof of optimal legibility. The critique retained this as an area for an independent low-vision assessment.

### Color

These are implemented CSS tokens, not a proposed palette:

| Role | Value | Use |
| --- | --- | --- |
| Canvas | `#191c1a` | Page background; dark text on amber actions/notice |
| Soft surface | `#1f2420` | Preview ground, inline code, linked-row hover |
| Panel / secondary panel | `#252b26` / `#2c332e` | Disabled controls and shared/exercise surface tokens |
| Rule / stronger rule | `#414940` / `#697464` | Document divisions; stronger register headings, preview outline, secondary controls |
| Main text | `#edece5` | Warm off-white reading text and headings |
| Secondary / faint token | `#b0b5ab` / `#a0aa9b` | Supporting text and shared subdued roles |
| Accent / warning | `#dbbd86` | Primary action, current folio, open state, focus, disclosure marker, desktop notice |
| Success | `#a4c39b` | Resolved incidents and passing checks |
| Error | `#f3a398` | Check failures, caught crashes, persistence-error outline |
| Information | `#b6ccdf` | Code references |
| High severity | `#e8b491` | Shared severity token |

Companion dim feedback tokens remain in the stylesheet for shared/exercise use. A defined token does not imply that every shell section uses it. Status also appears as text: Open, Locked, Resolved, PASS, FAIL, PEND, Completion saved, or Completed this visit.

### Shapes, spacing, and motion

The app has a centered 1200px maximum width and 48px horizontal desktop padding. The header and footer are ruled and non-sticky. The register intro has two columns with a 64px gap. The lesson uses a 1:1.1 column ratio, also with a 64px gap, before its responsive collapse.

Controls use a 3px radius, the preview and desktop notice 4px, inline code 2px. The shell has no box shadows, pill-card system, hover lift, or thick colored side-border cards. Primary buttons have an amber fill and graphite text, changing to warm off-white on hover. Secondary controls use an outline; quiet actions use underlined text with useful hit areas.

Color/background/border transitions last 150ms. Reduced-motion CSS removes those transitions. Focus-visible uses a 2px amber outline, generally offset 4px; register links bring it inside the row with a -2px offset.

## 5. Section-by-section styling changes

### Header and season progress

Files: `src/shell/App.jsx`, `src/styles/shell.css`.

The header combines the supplied Bugbound symbol, wordmark, “Season 01 / React field notes,” and a compact progress strip. A single horizontal rule establishes the page rather than an enclosing navigation card. The wordmark is a real link back to the incident register.

Fifteen small rectangular segments are paired with “N / 15 resolved.” Completed marks use sage; incomplete marks use the rule color. The strip has progressbar semantics and numeric values. On mobile, progress moves to its own row and the segments become short horizontal marks. The long season descriptor disappears at intermediate widths.

### Register introduction and current assignment

File: `src/shell/LevelMap.jsx`.

The lead is “Learn React by fixing it.” Supporting copy explains fifteen incidents, a working notebook, and editing the fix in the learner's editor. “Browse the incidents” scrolls to and focuses the register.

The adjacent current assignment uses a large, light amber number, the next available title and concept, and one Start/Continue action. The small “Learn · Reproduce · Repair · Verify” line is a neutral process description. It does not claim to track which learning step the user has reached.

When all incidents are complete, the assignment becomes “15/15,” “A season well resolved,” and an invitation to revisit entries. This state was inspected with isolated fixtures; it was not obtained by solving the player's curriculum.

### Incident register

The fifteen repeated cards became aligned, horizontally ruled rows grouped into “Core React” / Act I and “The TypeScript arc” / Act II. Each row has a number, title, concept, and right-aligned text status. Desktop rows are at least 64px high.

Available incidents are links. Locked incidents are readable non-interactive rows, without dimming the entire row to low opacity. The next incident gains amber numbering and stronger title weight. Resolved rows show their earned state while remaining revisit-able. Mobile places the concept under the title and retains aligned number/status columns.

The complete curriculum stays visible. Earlier critiques explicitly rejected hiding or artificially regrouping it merely to satisfy a generic limit on visible choices: this is an ordered curriculum with one recommended next assignment.

### Lesson heading, navigation, report, and concept

File: `src/shell/LevelPage.jsx`; prose renderer: `src/shell/Prose.jsx`.

The page begins with a back link, large folio number, title, and compact concept/severity/completion metadata. Four quiet section actions lead to the concept, preview, checks, and hints. They are buttons that scroll and focus their destination without overwriting the hash route; the concept action also opens its native `details` element.

The report pairs “Bug report” with a `BUG-NNN` reference, readable symptom text, and the relevant source paths. File references wrap rather than widening the page. The concept begins closed, with a native disclosure marker and topic label. Its expanded text reads as part of the continuous document between horizontal rules.

On wide screens, the report, concept, and hints occupy the left column while the preview and verification occupy the right. At 900px and below, the DOM sequence is report, concept, preview/checks, then hints. Optional hints no longer sit in front of the main debugging workspace when the layout stacks.

### Live preview and crash recovery

Files: `src/shell/ExercisePreview.jsx`, `src/shell/ErrorBoundary.jsx`, `src/shell/exercise-frame.js`, `src/shell/exercise-runtime.jsx`.

The preview is the main outlined inset surface: soft graphite background, stronger 1px border, 4px radius, 22px padding, reduced to 16px on mobile. It contains a titled, borderless iframe that resizes to its content. The deliberately broken component is visually separated from the reliable instructional shell.

“Remount preview” became “Restart preview.” A connected description explains that restarting reloads the exercise and clears its component state and timers while preserving source files and progress. The caught-crash panel uses coral text, a wrapping mono error, and “Retry after editing.” These actions do not promise to repair the planted bug.

The later code audit strengthened the actual restart behavior through frame disposal. The initial redesign's component-remount implementation was superseded; current source reloads the exercise realm.

### Verification log, completion, and reflection

Files: `src/shell/ChecksRunner.jsx`, `src/shell/LevelPage.jsx`.

Checks appear as a ruled log beneath the preview. Each row pairs PEND/PASS/FAIL with its name and a wrapping error when applicable. The primary action changes from Run checks to Running… to Re-run checks. The region exposes busy/live semantics.

The first formal critique identified a real ambiguity: earned completion could look like proof that the current code still passed. The implementation now separates these concepts. A finished run shows “Last run: N of M checks passed” and tells the learner to rerun after editing. Returning to a completed incident does not restore old results or pretend that it does; the empty log says, “No checks run in this visit. Run the checks to verify your current source.”

The completion summary uses a sage “Resolution recorded” heading and explicitly distinguishes saved progress from completion earned only in the current visit. A later failing run does not erase earned progress. An additional next-incident link sits beside the verification workflow while the incident is complete and checks are idle, avoiding a long scroll back to the top.

That continuation also exists for unsaved in-memory completion. It is not gated on successful persistence; the separate status and retry UI explain the saving problem. The current implementation should be reviewed on that basis.

Below the workspace, “Make the fix stick” asks the learner to explain React's behavior, their correction, and the signal that helped. Existing check names serve as reflection prompts. No new solution content was exposed.

### Optional hints

File: `src/shell/HintBox.jsx`.

Hints became unboxed, ruled disclosure rows with 52px minimum button height. The copy now says “A little help, when you need it” and “Start with a nudge. Each hint reveals a little more; open only as much as you need.” Encoding details and judgmental language were removed from the learning flow.

The three tiers remain Gentle nudge, Closer look, and Basically the answer. Buttons expose `aria-expanded` and `aria-controls`; panels start hidden, and hint text is decoded only when that tier is revealed. Removing the old clipping treatment made the keyboard outline visible. Existing encoded hints were preserved.

### Desktop requirement, storage feedback, and footer

File: `src/shell/App.jsx`.

The owner requested a modal or similarly obvious message for mobile/tablet users. The implementation uses a full amber notice below the header, with a monitor symbol and dark text. It is a labelled aside, not a blocking dialog, and says:

> **Use a desktop to work on the exercises.**
>
> Bugbound is a desktop-first project. To fix bugs, edit the actual source files in a local code editor, let Vite recompile the app, then run the checks in a desktop browser.
>
> You can still browse the lessons here.

It appears at 1100px and below, or when both `hover: none` and `pointer: coarse` match, including wider touch-first tablets. This is a layout/input heuristic, not precise device identification: a narrow desktop browser also shows it. Its prominence was requested; the effect on an editor-sized browser remains a useful tradeoff to assess.

Storage failures use a separate status notice with a full coral outline and an explicit Retry saving progress or Retry reset button. The footer retains the project/season and React + Vite / Claude credit, plus a quiet Reset progress action. Reset confirmation accurately explains that later levels lock again while Level 1 remains available.

## 6. Responsive, interaction, and accessibility details

| Condition | Implemented behavior |
| --- | --- |
| Above 1100px with ordinary mouse input | Desktop notice hidden; full header and two-column notebook composition |
| At/below 1100px, or no hover plus coarse pointer | Prominent desktop-workflow notice displayed |
| At/below 1050px | Long season descriptor hidden; column gaps reduce to 36px; assignment number reduces |
| At/below 900px | Page padding becomes 32px; lesson becomes one column in its meaningful DOM order |
| At/below 600px | Page padding becomes 20px; intro stacks; progress moves to its own row; concepts move under row titles; section navigation becomes two columns; notice stacks its icon/text; preview padding reduces |

The register intro and lesson have separate responsive behavior: collapsing the lesson at 900px does not mean every two-column composition collapses there.

Navigation uses native links for routes and buttons for actions. Route changes update the document title, focus the page heading, and return the viewport to the top. A focus-visible skip link targets the main content. The section actions preserve the incident route and focus their targets. Heading structure uses peer H2 sections under the page H1.

Primary, secondary, back, and quiet actions generally have at least 44px height; hint buttons and concept summaries are larger. Text statuses supplement color, paths and errors wrap, and the preview has a title. Check updates and completion/persistence feedback use live/status semantics. These are implemented behaviors, not a claim of full assistive-technology conformance.

Desktop CSS positions hints in the left column, while DOM/tab order reaches them after the preview and checks. Please assess that tradeoff in a real keyboard session. Small metadata, frame focus, long lesson content, large text, and the notice's effect on narrow desktop working space deserve fresh review.

## 7. Audit findings, code fixes, and file restructuring

### Frontend findings and resulting changes

| Original finding | Result |
| --- | --- |
| Functional secondary text had insufficient contrast | Replaced the faint blue-grey treatment with the warmer, more legible shell palette; sampled post-redesign contrast was recorded |
| Hint focus outline was clipped | Removed the problematic enclosure/clipping and retained a visible amber keyboard outline |
| Route navigation lacked ordinary link behavior and orientation | Native route links, route-specific titles, heading focus, skip link, and corrected heading hierarchy |
| Workflow strip falsely marked Verify as the current step | Replaced with a neutral process description and actual section actions |
| Narrow layout put hints before preview/checks | Reordered the lesson's DOM and responsive layout around the debugging loop |
| Locked lessons were excessively dimmed in repeated cards | Replaced with readable ruled rows and explicit lock status |
| Several controls had very small hit areas | Increased action/disclosure hit areas while keeping compact typography |
| Hint copy exposed implementation details and discouraged help | Supportive copy and explicit optional tiers |
| Past completion could imply current verification | Historical completion copy, per-visit empty state, last-run labels, and rerun instruction |
| Continuation was remote from the verification work | Added an adjacent next-incident link |
| Restart terminology was unclear | Clearer action and associated explanation; later upgraded to actual frame reload |
| Section fragment links conflicted with the hash router | Converted in-page jumps to buttons with focus/scroll behavior |
| Reset copy incorrectly implied Level 1 would lock | Corrected confirmation wording |
| Initial bundle eagerly included every lesson | Evaluated and deferred; no measured performance problem justified more loading infrastructure |

### Broader code audit: seven approved findings

The code audit reviewed all 50 JS/JSX/TS/TSX source files then present, the registry and fifteen manifests, CSS, configuration, dependencies, documentation, and existing tests. It distinguished shell defects from intentional exercise behavior. It did not perform a solved playthrough of every lesson.

| Finding | Implemented remediation and boundary |
| --- | --- |
| Missing React TypeScript declarations obscured compiler feedback | Added React 19 declaration packages as dev dependencies and `typecheck:lessons`. The original diagnostic run had 93 errors; the starting cartridge later typechecked cleanly. Intentional runtime bugs remain |
| Async checks could complete after navigation/unmount/reset | Added AbortController-based run cancellation, unmount cleanup, generation-keyed lesson remounting, guarded completion/telemetry, and error/finally cleanup. Checks remain sequential |
| A stale browser tab could overwrite newer progress | Replaced whole-set overwrites with additive per-level completion records, reset generations, and storage-event synchronization. Legacy progress remains readable; stale generations cannot resurrect reset progress |
| Storage write/reset failures escaped and success could be misreported | Explicit persistence results, pure React state updaters, separate saved/in-memory completion, actionable save/reset retries, and recovery after storage events/read failures |
| React/DOM teardown did not dispose faulty exercise resources | Disposable same-origin preview and per-check frames, a separate Vite entry point, frame cleanup on result/abort/failure, a 15-second asynchronous check timeout, and preview reload/resize coordination |
| Malformed telemetry stores could corrupt/drop updates | Normalized record/container shape, counters, timestamps, and hint tiers; telemetry errors remain nonfatal |
| Two lesson descriptions did not match their starting behavior | Corrected narrative in lessons 14 and 15 and one conceptual explanation in lesson 14. No exercise implementation, executable check, hint, or solution was changed |

Frame disposal is lifecycle isolation for trusted local exercise code. It is not a security sandbox, and a timeout cannot reliably interrupt synchronous infinite JavaScript running on the same browser thread. The README documents full reload/closing a frozen tab as a possible recovery limit. No claim of adversarial-code containment is made.

Additional cleanup promoted structural curriculum validation to a supported script, corrected README setup/reset/testing claims, removed the obsolete screenshot embed and absolute “bug-free shell” claim, and clarified that base64 is spoiler concealment rather than security. Compatible transitive development-tool updates resulted in zero npm-reported vulnerabilities at the time; that is not a current security audit.

### File restructuring

This was deliberately modest and occurred after the fixes were committed:

- Extracted `isUnlocked(level, completed, levels)` into `src/shell/progression.js`. App and LevelMap pass the registry explicitly, removing their circular import without changing prerequisites.
- Moved the three existing test files from `scripts/` to `tests/` unchanged and added four focused progression tests. `scripts/` now owns the runnable curriculum validator.
- Split CSS into `shell.css` and preserved `exercises.css`. `global.css` remains the ordered entry point, importing shell defaults first and exercise rules second. Both app and frame runtime keep using it.
- Updated detector exception paths to the exercise stylesheet without broadening their values or reasons, and documented file ownership in README/DESIGN.
- Kept the shell mostly flat and retained one folder per lesson. No wholesale component hierarchy, generic state abstraction, or feature framework was introduced.

Relevant final layout:

```text
AGENTS.md                    Frontend workflow, critique gate, curriculum boundaries
PRODUCT.md / DESIGN.md       Product and visual decisions
index.html                   Application entry, metadata, font preload, favicon
exercise.html                Disposable exercise runtime entry
vite.config.js               Production entries
public/
  bugbound-icon.svg
  bugbound-favicon.svg
  fonts/                     Public Sans, license, provenance
src/
  main.jsx
  shell/
    App.jsx                  Routing, progress state, header/notices/footer
    LevelMap.jsx / LevelPage.jsx
    ChecksRunner.jsx / HintBox.jsx / Prose.jsx / ErrorBoundary.jsx
    ExercisePreview.jsx
    exercise-frame.js / exercise-runtime.jsx
    progress.js              Persistence and reset-generation rules
    progression.js           Pure unlock selector
    learning.js              Local learning telemetry
    harness.jsx              Preserved exercise check harness
  levels/                    Existing registry, 15 lesson folders, encoded hints
  styles/
    global.css               Ordered imports
    shell.css                Notebook UI and shared defaults
    exercises.css            Preserved .lv-* teaching styles
scripts/
  validate-levels.mjs
tests/
  progress.test.mjs
  reliability.test.mjs
  exercise-frame.test.mjs
  progression.test.mjs
docs/audits/                 Historical audit and validation reports
```

Structure validation found the built CSS byte-identical to its pre-restructure baseline and the moved existing tests unchanged. Exercise implementations, checks, encoded hints, harness behavior, and exercise CSS were preserved across the relevant comparisons, with only the approved narrative exceptions.

## 8. Metadata, brand assets, design records, and detector exceptions

The document metadata now matches the notebook presentation: dark color scheme, graphite theme color, a learning-focused description, and a route-specific browser title. Public Sans is local and preloaded; its license and provenance are committed. No analytics or external font dependency was added by this work.

On September 12, the owner supplied `bugbound-icon.svg` and `bugbound-favicon.svg`. These were copied unchanged into `public/`. The header uses the 30×30 image alongside the wordmark, with empty alt text/`aria-hidden` because the link already has a useful name. The favicon uses its dedicated SVG.

The header asset URL uses `import.meta.env.BASE_URL`; the favicon uses Vite's `%BASE_URL%` substitution. This does not establish arbitrary-base support for the entire app: the font URLs, for example, remain root-relative. The supplied symbol retains its own gold/dark colors; the shell palette was not changed to force an exact match.

The supplied symbol replaced the earlier inline notebook-outline mark. **Known documentation drift:** the current `DESIGN.md` overview records the new assets, but its Shapes section still describes the old book-outline SVG. Its continuation paragraph also says “whenever completion is saved,” while `LevelPage.jsx` uses earned `isComplete`, including unsaved in-memory completion. Treat the source and this handoff's distinctions as authoritative when reviewing those points. These documentation discrepancies were observed during handoff preparation, not silently edited in the active Season 3 checkout.

`.impeccable/design.json` is supporting design metadata with illustrative samples and synthesized ramps, not a second runtime token source. Verify actual computed styles rather than inferring implementation from its previews.

The detector configuration contains **nine value-specific exceptions scoped only to `src/styles/exercises.css`**: one `5px` radius and eight preserved exercise color values (`#04180a`, `rgba(63, 185, 80, 0.3)`, `#f4f6fa`, `#d4dae4`, `#5a677a`, `#0a0d12`, `#dbe4ee`, `#4cc75e`). They account for repeated findings in existing teaching examples. No entire file or rule was disabled. The restructuring changed only their file scope from the old combined stylesheet to the exercise stylesheet.

These are sanctioned preservation exceptions, not instructions to copy exercise styling into the shell. Likewise, a detector flag is review input, not automatic authorization to alter the curriculum. Early reports describing 50 or 13 advisories predate the final documentation/exception reconciliation; they should not be mistaken for current unaddressed shell findings.

## 9. Verification evidence and its limits

**Historical application verification:** September 5 for the completed redesign, reliability fixes, and restructuring; September 12 for the supplied icon/favicon change. **This handoff preparation:** read-only inspection of committed Season 1 source/history and earlier records, followed by document checks. Application tests and browser QA were not rerun against the unrelated active Season 3 checkout.

| Check | Recorded result |
| --- | --- |
| `npm.cmd test` | Exit 0; 14 tests after reliability remediation, then 18/18 after restructuring |
| `npm.cmd run typecheck:lessons` | Exit 0; no TypeScript diagnostics after declaration installation and at restructuring |
| `npm.cmd run validate:levels` | Exit 0; 15 lessons, 43 named executable checks, 45 encoded hints validated without decoding |
| `npm.cmd run build` | Exit 0; both app and exercise entries built; repeated for the icon update |
| `git diff --check` | Exit 0 at implementation checkpoints; line-ending notices were not whitespace failures |
| Impeccable whole-source detector | Final recorded exit 0; no unignored findings, with the narrow exercise exceptions described above |
| Learning-boundary comparison | Exit 0; preserved exercise/check/hint/harness/style boundaries, with approved narrative differences |
| Restructure comparison | Exit 0; built CSS byte-identical to baseline; split source reassembled after line-ending normalization; existing tests unchanged |
| September 12 brand verification | Build/typecheck/whitespace checks passed; supplied/public/built SVG bytes matched; favicon request returned HTTP 200; header inspected at desktop/mobile widths |

No lint script is declared on this Season 1 commit. A Vite build is not a substitute for the separate TypeScript check. Passing shell tests and structural validation do not mean the intentionally broken exercises pass their behavioral checks.

The tests cover progress sanitization and persistence/recovery, stale writes and reset generations, malformed telemetry, frame disposal/cancellation/timeout, and progression behavior. Frame unit tests use a DOM stub; browser integration evidence supplements them. Private temporary probes under ignored `docs/superpowers/` reproduced selected failures and compared preservation boundaries. They are not portable public test commands and should not be assumed present in a fresh clone.

Recorded browser evidence across the stages includes:

- Register and lesson inspection at desktop, tablet, editor-sized, and narrow phone widths, including 320, 390, 768, 820, 1024, and 1440px. Not every state was tested at every width.
- No horizontal document overflow in the inspected samples. Final structure QA measured a 375px scroll width in a 390px viewport and 1425px in a 1440px viewport; scrollbar space accounts for the difference.
- Native route navigation, page title and heading focus, skip/section navigation, concept opening, keyboard hint focus, wrapping error text, and prominent narrow-layout desktop guidance.
- The expected Level 1 crash and failed checks remained contained. They were classified as intentional behavior, not regressions.
- Isolated partial/all-completion fixtures, historical completion followed by a failing current run, and an empty log on a completed revisit. These did not solve or overwrite the user's curriculum.
- A working preview control changed state and Restart preview restored its initial state. A baseline check ran through the frame entry and left no check frames behind.
- A deterministic fixture unmounted the check runner while a check frame was active; completion callbacks and surviving check frames were both zero afterward.
- Isolated blocked-save/reset scenarios displayed the correct unsaved state and retry action; restoration of fixture storage allowed recovery. Test storage was kept separate from the learner's real completion.

The initial post-redesign report recorded sampled contrast ratios of 14.51:1 for body text, 8.22:1 for secondary text, 10.38:1 for code references, and 9.52:1 for the sampled amber primary/open treatment. These are historical samples, not an exhaustive fresh contrast matrix.

Two formal critiques were performed. The first reported 31/40 and the follow-up 32/40, both heuristic judgments, with no P0/P1 established in their reviewed scope. The follow-up's independent browser connections stalled; its assessments used source/detector evidence, and the parent supplied subsequent browser inspection. Do not interpret either score as user testing, accessibility certification, or fully independent browser coverage. Their actionable findings were followed by the approved fixes summarized above.

Later focused React and Web Interface Guidelines reviews found no additional applicable blocker in the changed scope. Independent source review of the reliability work identified additional reset/retry issues that were fixed before its final re-review. Structure review checked imports, scripts, CSS ordering, exception scope, and curriculum preservation. These narrower reviews were not additional formal visual critiques.

The final recorded CSS bundle was 16.34kB / 4.21kB gzip. The frame architecture produces multiple JavaScript entries/shared code, so comparing one emitted file with the original single app bundle would be misleading. No measured startup-speed or Core Web Vitals improvement is claimed.

**Not established:** a solved playthrough of all fifteen lessons, pass/fail validation against every private solution, full screen-reader speech, physical-device testing, native browser zoom or comprehensive 200% text behavior, a cross-browser suite, production-host behavior, throttled-network/font performance, or exhaustive accessibility conformance. Reduced-motion support was inspected in source; no broad animation/device test is claimed. Earlier Vite/npm sandbox and cache failures were environment restrictions; authorized retries succeeded.

## 10. Where an independent opinion would be useful

Please inspect the app first and form your own view. These are review questions, not predetermined defects:

1. **Identity:** Do the register, folios, document structure, and verification log make Bugbound feel authored? Is the notebook metaphor evident without needing literal paper decoration? Does the new bug symbol fit that language?
2. **Season progression:** Is this an appropriately simple visual starting point for a later, more advanced Season 2? Which identity elements should carry forward without making the seasons look interchangeable?
3. **Typography and density:** Are Public Sans prose and mono references balanced? Are 10–12px roles too small, and do long paths, long lesson names, expanded concepts, and enlarged text remain comfortable?
4. **Core workflow:** Does the report → reproduce → edit → verify loop remain obvious beside an editor? Assess the desktop two-column reading/tab order, concept disclosure, and repeated movement between preview and checks.
5. **Desktop notice:** Is its prominence effective without adding excessive scroll at 700–1100px desktop working widths? Preserve the owner's requirement to clearly explain desktop editing/compilation when proposing alternatives.
6. **Feedback and continuation:** Can learners distinguish earned completion, saved completion, this visit's last run, and unsaved progress? Is the nearby continuation useful and its behavior clear after a later failing run or saving failure?
7. **Actual accessibility:** Test focus visibility/order, frame entry/exit, section jumps, live announcements, state labels, target sizes, contrast, and large text. Source semantics and historical screenshots cannot establish all of these.
8. **Reliability:** Challenge cancellation, frame disposal, timeout behavior, cross-tab progress, reset generations, and storage recovery with isolated fixtures. Protect real learner progress and distinguish intentional exercise behavior from infrastructure faults.
9. **Simplicity:** Does the reliability benefit justify the frame coordination? Are there concrete simplifications or hidden bugs in the current boundaries? Avoid introducing a library or abstraction merely because it is available.
10. **Scope discipline:** Which recommendations address a demonstrated issue, which are optional visual preferences, and which should wait for later seasons or measured growth?

Requested output: a short overall assessment; what should be preserved; prioritized findings with file/selector, reproduction or visual evidence, impact, and a concrete recommendation; separate optional aesthetic alternatives; and explicit verification limits. Do not manufacture findings to meet a quota. Bring recommendations back to Brantley before implementing them.

## 11. Getting started and source pointers

First confirm that the review checkout is Season 1 at the stated commit. Do not switch or reset the owner's dirty Season 3 folder to obtain it. Use a separate clean clone/worktree arranged under the owner's environment policy, and start a server from that checkout. Do not assume that the existing `127.0.0.1:5173` tab serves this version.

In Windows PowerShell, set the working directory explicitly to that checkout. Use its existing dependencies if present; if absent, use `npm.cmd ci` under the owner's installation policy. Then run the following commands separately so results and exit codes remain attributable:

```powershell
git branch --show-current
git rev-parse HEAD
npm.cmd test
npm.cmd run typecheck:lessons
npm.cmd run validate:levels
npm.cmd run build
```

Run the development server in its own persistent terminal. Port 5187 was used for an earlier isolated audit; check that it is free rather than stopping another task's process:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5187 --strictPort
```

Inspect `http://127.0.0.1:5187/#/` and the first available incident. Other states can be reviewed with isolated fixtures when needed; do not clear real storage or decode solutions to manufacture evidence. A different port is a different storage origin, but it may still contain prior audit data and should not automatically be treated as disposable.

Suggested source order: `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `README.md`, `src/shell/App.jsx`, `LevelMap.jsx`, `LevelPage.jsx`, and `src/styles/shell.css`; then `ChecksRunner.jsx`, preview/frame/runtime files, `progress.js`, `progression.js`, `learning.js`, tests, and the validator. Read exercise source only as needed to distinguish intentional behavior; no solution decoding is required for this review.

Committed historical records on Season 1 `main`:

- [Initial frontend audit](audits/2026-09-04-season-1-frontend-audit.md): original findings, baseline measurements, recommendations.
- [Redesign validation](audits/2026-09-05-redesign-validation.md): first notebook implementation and pre-critique evidence.
- [First critique fixes](audits/2026-09-05-critique-fixes-validation.md): completion/current-run distinction, nearby continuation, restart wording, desktop notice.
- [Code audit and final critique fixes](audits/2026-09-05-season-1-code-audit.md): follow-up copy/navigation fixes and seven code findings before remediation.
- [Audit fixes validation](audits/2026-09-05-audit-fixes-validation.md): reliability implementation, regression evidence, browser fixtures, limits.
- [File-structure validation](audits/2026-09-05-file-structure-validation.md): final 18-test checkpoint, CSS equivalence, source-boundary and browser evidence.

Read these in sequence. Statements such as “not yet fixed,” “no commit performed,” “critique pending,” or “restructuring deferred” describe each report's historical checkpoint, not the final state consolidated here. Old line numbers and `global.css` references predate extraction into `shell.css` and `exercises.css`.

The formal critique working notes were kept locally at `.impeccable/critique/2026-09-05T16-05-45Z__src-shell.md` and `.impeccable/critique/2026-09-05T17-48-52Z__src-shell.md`; they were not committed to Season 1. Local design experiments and private verification probes are also not required clone contents. This handoff preserves their important decisions, findings, and limitations so Claude does not need those files.

The owner originally offered [Collect UI](https://collectui.com/), [recent.design](https://recent.design/?category=web), [beUI motion](https://beui.dev/components/motion), [Beautiful UI](https://www.beautifului.dev/), and [coss UI](https://coss.com/ui/docs/get-started) as optional inspiration or component sources. `PRODUCT.md` also records Field Notes, Linear, and Carbon as research references for the approved direction. These were references, not adopted dependencies or requirements to imitate their sites. Their current contents were not re-researched for this handoff.

The three original Season 1 stages and the later supplied-icon update are complete at the cited commit. This handoff requests an independent opinion on that result; it does not start another redesign or extend the audit into Seasons 2 or 3.
