# Season 3 beUI integration

Scope: the user approved real npm dependencies and documented component installation for Season 3. The Engineering Lab design remains in place. This is a bounded interaction pass, separate from the remaining general code audit and repository transfer.

## Installed and connected

- Official shadcn registry: `@beui/button-stateful`, `@beui/tabs`, `@beui/action-swap-roll`. Eight upstream source/helper files were installed; provenance and the MIT license are in `THIRD_PARTY_NOTICES.md`.
- Stateful Button displays the actual verification state, disables during a run, and retains an explicit accessible action name during overlapping text transitions.
- Action Swap Roll confirms actual brief/path clipboard success. Brief feedback resets when the draft changes; a clipboard rejection clears earlier success feedback.
- Tabs supplies the shared animated underline. Its small local adaptation accepts native anchors and a navigation landmark, preserving URLs, keyboard activation, and `aria-current`.
- Motion, Lucide, clsx, and tailwind-merge are runtime dependencies. Tailwind/Vite integration and React 19 type definitions are development dependencies. `components.json` records registry configuration.
- Tailwind utility discovery targets installed components; Preflight is omitted. The library uses the existing Engineering Lab tokens and button styling. The DESIGN.md sidecar records the integration.
- AGENTS.md and PRODUCT.md now distinguish permitted Season 3 shell dependencies from the continuing generated-exercise import restriction.

## Verification

| Command | Exit | Evidence |
| --- | --- | --- |
| `node --test tests/component-navigation.test.mjs` | 1 → 0 | The regression first failed against upstream button/tab semantics, then passed with native links and exactly one current-page indication. |
| `npm.cmd test` | 0 | 30 passing shell tests. |
| `npm.cmd run typecheck:components` | 0 | Installed TypeScript components and their helpers pass strict checking. This does not typecheck the exercise curriculum. |
| `npm.cmd run validate-levels` | 0 | 17 levels validated. |
| `npm.cmd run build` | 0 | Vite production build succeeds. JS 465.80 kB / 151.61 kB gzip; CSS 34.56 kB / 7.87 kB gzip. |
| `npm.cmd audit --omit=dev --json` | 0 | No production dependency findings. |
| `npm.cmd audit --json --no-update-notifier` | 1 | 13 development dependency findings: 10 high, 3 moderate. See below. |
| Impeccable detector over installed components and changed UI/styles | 0 | `[]`; no new suppressions. |
| `git diff --check` | 0 | No whitespace errors. |

The previous frontend build was 294.01 kB / 95.09 kB gzip JavaScript. Actual library components add about 56.52 kB gzip to the current eager bundle. Route/curriculum loading optimization remains a candidate for the broader audit.

The independent final Web Design Guidelines and React Best Practices source review approved this bounded change with no remaining actionable findings. It confirmed native navigation, preserved check/copy state, reduced-motion branches, and the omitted Preflight reset. The parent also reviewed the final call sites and upstream motion code against the current primary checklist. Bounded upstream blur and width animation are retained for action feedback under Impeccable's motion guidance; no detector exception was needed. The reviewer's separate navigation-test attempt hit a filesystem sandbox restriction and its retry was cancelled; the parent's completed escalated regression and full suite supply the passing test evidence above.

The complete dependency audit is retained in `.impeccable/review/beui-npm-audit.json`. It reports Babel/Browserslist and Vite/PostCSS/Nanoid development-tool chains, including the new Tailwind Vite plugin through Vite. The underlying Browserslist 4.28.4, PostCSS 8.5.16, and Nanoid 3.3.15 versions are also present in HEAD's original lockfile. No forced dependency upgrades were made. npm's install summary reported four findings; the explicit final JSON audit reported 13 and is the recorded result.

## Browser evidence

Tested in the Codex browser at 1280×720 and 390×844 CSS viewports:

- Native collection navigation, keyboard Enter activation, correct current link, route-heading focus, and no horizontal page overflow.
- The actual shared underline was observed mid-transition (`translate3d(-108.696px, 0px, 0px)`) and settled to `none`.
- Brief clipboard content exactly matches the displayed brief; editing the topic resets the copy state. Source-path copy returns the exact path.
- Synthetic checks cover idle, a deliberate pending interval with a disabled busy button, passing and failing results, replacement of the check definition, and an unchecked revisit with retained fixture completion.
- The synthetic fixture's `?slow=1&reduced-motion=1` option exercises Motion's JavaScript preference branch: no inline spatial transforms during loading and stable action labels. It does not emulate the operating system's CSS media query. Source review confirms the shell's existing reduced-motion media rule suppresses CSS animation.
- Normal initial app interactions produced no console errors. Editing the mounted development fixture produced a createRoot HMR warning; later simulated preference runs produced Motion's expected reduced-motion notice. These are recorded separately from production UI behavior.

Captures are in `.impeccable/review/`: `beui-navigation-desktop-1280.png`, `beui-copy-mobile-390.png`, `beui-verification-mobile-390.png`, and `beui-verification-failed-desktop.png`. Exported bitmap dimensions can differ from the explicitly set CSS viewport. The temporary QA tab was closed and browser viewport/clipboard restored.

## Preservation and limits

All 54 curriculum/harness/maintenance/entry files in the earlier protected baseline remain byte-identical. The baseline's 55th item is `package-lock.json`, now explicitly authorized to change. The preserved exercise stylesheet matches its baseline hash exactly. No exercise assertions, test IDs, encoded hints, or solutions were changed.

No claim is made of an exhaustive curriculum typecheck, assistive-technology certification, all-browser motion performance, or fixed development dependency advisories. The repository has no lint script. Remaining reliability, general structure, and transfer work is outside this interaction pass.
