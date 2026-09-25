---
name: bugbound-levelsmith
description: Generate new Bugbound levels — React debugging challenges with a lesson, a live buggy component, behavioral checks, and encoded hints. Use whenever the player asks for new levels, challenges, or practice bugs (e.g. "make me 3 new levels about effects", "generate a hard level on context", "I finished the game, give me more"). The planted bugs must stay secret from the player.
---

# Bugbound Levelsmith

You are authoring new levels for Bugbound, a debugging game where the player learns React by fixing intentionally planted bugs. You write the bugs; the player you are talking to is the one who must find them. That shapes everything below.

## Rule zero: blind mode

The game only works if the bugs are a surprise to the player.

- **Never** reveal a planted bug's cause in chat, code comments, commit messages, or file names. Describing the *symptom* (what the player will observe) is fine and necessary; naming the cause is forbidden.
- Never echo hint or solution plaintext into the conversation. Draft them in private agent memory or an OS temporary location outside the repo, encode with `npm run encode -- "text"` (base64), and put only the encoded strings in the repo.
- If the player asks for help on a level later, coach at the current hint tier. Reveal the fix only if they explicitly ask to be spoiled.
- After verifying a level (step 7), your private fix must be discarded — never left in the working tree, never shown in chat.

## What a level is

Each level lives in its own folder and consists of:

1. **Buggy component(s)** — a small, realistic mini-app (a form, a dashboard widget, a cart…) written in clean, idiomatic React with 1–3 planted bugs modeled on real-world failure modes. No comments that point at the bug. Use the shared `lv-*` CSS classes from `src/styles/exercises.css` so it matches the game's look, and put `data-testid` attributes on everything your checks will reach.
2. **A manifest** — the level's contract with the game shell (see below).
3. **Three encoded hints** — added to `src/levels/hints.json` under the level's id.
4. **An encoded solution** — appended to `SOLUTIONS.md`.

## Where new levels go

- Folder: `src/levels/custom/<NN-kebab-slug>/` where `NN` continues numbering after the highest existing level (officials are 01–15; the first custom level is 16). IDs can use three or more digits, and removed levels may leave gaps. Do not renumber survivors.
- Discovery is automatic: the Vite curriculum plugin validates discovered manifests and supplies the catalog through `src/levels/index.js`. **Do not edit the registry, the shell (`src/shell/`), or official levels 01–15.**
- Every level is selectable immediately. The app may suggest a next challenge, but progress does not gate selection.

## The manifest contract

`src/levels/custom/<NN-slug>/manifest.js`:

```js
import Component from './YourComponent.jsx';   // .tsx also supported

export default {
  id: 'NN-kebab-slug',            // MUST equal the folder name
  number: NN,                     // unique; gaps after removal are allowed
  title: 'Display Title',
  concept: 'Concept Chip Text',   // e.g. 'Effect Cleanup'
  severity: 'Low' | 'Medium' | 'High' | 'Critical',
  difficulty: 'Beginner' | 'Intermediate' | 'Hard',
  source: 'agent',
  generatedAt: 'YYYY-MM-DD',
  Component,
  vague: true,                    // optional: point at the folder, not exact files
  files: ['src/levels/custom/NN-slug/YourComponent.jsx'],  // folder path if vague
  symptom: 'QA-ticket-style description of OBSERVABLE behavior only.',
  lesson: ['para 1', 'para 2', 'para 3'],  // teach the concept; `code` spans render as <code>
  checks: [
    { name: 'Readable behavioral assertion', run: async (h) => { /* … */ } },
  ],
};
```

### Check harness helpers (`h`)

Checks run against a fresh, isolated mount of `Component` per check, with real DOM events:

| Helper | Behavior |
|---|---|
| `h.get(selOrEl)` | querySelector within the mount; throws a readable error if missing |
| `h.query(sel)` / `h.all(sel)` | nullable single / array |
| `h.text(t)` / `h.value(t)` / `h.attr(t, name)` | read trimmed text / input value / attribute |
| `await h.click(t)` | click + settle |
| `await h.type(t, 'text')` | per-character native-setter typing (fires React onChange) |
| `await h.selectOption(t, value)` | set a `<select>` + change event |
| `await h.pause(ms)` | wait (for effects, timers, fake fetches) |
| `await h.waitFor(assertion, { timeout: 3000, interval: 25 })` | retry an assertion until it succeeds or its deadline expires; prefer this for asynchronous readiness |
| `h.ok(cond, msg)` | assert with a player-facing failure message |
| `h.ensureNoCrash()` | fail if the component crashed while rendering |

### Check design rules

- Assert **behavior the player can observe**, never implementation. Failure messages should read like a good QA report ("Expected the total to be $59.75, got \"$05910.5…\"").
- Checks must **fail** with the planted bug present and **pass** after *any reasonable fix* — don't assume one specific fix.
- Timing-sensitive checks (timers, races) need generous margins; look at official levels 09 and 10 for calibrated examples.
- Every check runs in a fresh same-origin frame, separate from the preview. Module state does not persist across checks. Rendering/effect/cleanup errors fail the run even without `ensureNoCrash`. The runner allows up to 15 seconds after loading and 20 seconds overall; navigation/reset disposes abandoned frames. These are asynchronous limits, not a security sandbox or protection from synchronous infinite loops.
- The app deliberately runs without `<StrictMode>` (double-invocation would break render-counting checks). Do not add it.

## Authoring procedure

1. **Protect the cartridge**: confirm the current branch is not `main`; create a focused generation branch if needed. Then scope topic(s), difficulty, and level count without discussing candidate bugs.
2. **Study one official level** of similar difficulty (component + manifest) to match style and tone.
3. **Design in private**: realistic scenario, 1–3 bugs drawn from real failure modes of the topic, escalating hiddenness with difficulty (exact file named → `vague: true` folder-only).
4. **Write the component and manifest.** Lesson paragraphs teach the underlying mechanism, not the bug's location.
5. **Hints and solution**: three tiers — gentle nudge (mechanism-shaped question), closer look (names the guilty area), basically-the-answer (near-explicit). Encode each (`npm run encode -- "hint text"`), add to `src/levels/hints.json` under the level id, and append the encoded solution to `SOLUTIONS.md` as `## Level NN — Title` with the base64 in a code fence.
6. **Static validation**: `npm run validate-levels`, `npm test`, and `npm run build` must pass.
7. **Behavioral verification (mandatory)**: run `npm run verify-level -- <id>` and open the printed verification URL. The checks must FAIL against your planted bug with readable messages. Then apply your fix privately, reload, and confirm all checks PASS. **Restore the buggy version and discard the fix.** A level that was never verified in both directions is not done.
8. **Review and commit when requested** with a neutral message, e.g. `Add custom level 16: The Vanishing Draft` — title and concept are fine, cause is not.

Exercise-specific styling belongs in `src/styles/exercises.css`. To remove generated levels, use `npm run custom-levels -- remove <id> --confirm` or `npm run custom-levels -- reset --confirm`. The command prints a backup path under `.bugbound-backups/`; inspect the result and preserve that backup until recovery is no longer needed. A write failure triggers an automatic restore attempt. Run `npm run validate-levels` afterward. `verify-level` fails if port 4173 is occupied; verify the printed project path and level ID before testing. Static validation cannot replace the browser red/green check.

## Constraints

- Generated exercises may not add npm dependencies. Shell development may add maintained dependencies when separately authorized.
- Custom components may not access the network, browser storage, cookies, environment variables, dynamic code execution, or non-relative packages other than React. Keep all data fake and local to the level.
- Never modify `src/shell/`, `src/levels/01-…` through `15-…`, existing hints, or existing solutions.
- Never remove or rename `data-testid` attributes anywhere.
- Keep components small (one screen, ≤ ~120 lines) and self-contained within the level folder (a `fakeApi.js` sibling is the established pattern for async levels — keep fake APIs bug-free and label them so).
