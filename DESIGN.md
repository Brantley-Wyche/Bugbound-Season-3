---
name: Bugbound Season 3 — Engineering Lab
description: A precise, readable workspace for self-directed React investigations.
colors:
  lab-ground: "#191c1d"
  lab-surface: "#222627"
  lab-raised: "#2a2f30"
  lab-line: "#3b4242"
  lab-ink: "#edece6"
  lab-muted: "#afb6b2"
  lab-amber: "#ddbd79"
  lab-teal: "#a4cbc0"
  lab-error: "#f0b1a2"
  lab-focus: "#e6ce9d"
  action-ink: "#25271f"
  amber-hover: "#ebce93"
  header-ground: "#151819"
  selection-ground: "#665736"
  selection-ink: "#fff6e2"
  storage-notice-ground: "#392f24"
  storage-notice-ink: "#f0d6a6"
  topic-selected-ground: "#303d37"
  topic-selected-line: "#657f74"
  topic-selected-ink: "#cae1d7"
  brief-ink: "#d4ddd5"
  experiment-ground: "#11171b"
  reference-code-ink: "#d1dcd6"
  reading-empty-line: "#5a6360"
  desktop-notice-ground: "#2c2b24"
  desktop-notice-line: "#454133"
  desktop-notice-ink: "#ded2b6"
  desktop-notice-strong: "#f0dfba"
typography:
  title:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 620
    lineHeight: 1.22
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 620
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  body:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 550
    lineHeight: 1.6
  mono:
    fontFamily: "'Cascadia Code', 'Cascadia Mono', ui-monospace, 'JetBrains Mono', Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.85
  readout:
    fontFamily: "'Cascadia Code', 'Cascadia Mono', ui-monospace, 'JetBrains Mono', Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
  caption:
    fontSize: "0.75rem"
  small:
    fontSize: "0.8125rem"
  heading-compact:
    fontSize: "1rem"
  heading-register:
    fontSize: "1.25rem"
  heading-bench:
    fontSize: "1.5rem"
  title-narrow:
    fontSize: "1.75rem"
  title-investigation:
    fontSize: "1.875rem"
  folio:
    fontSize: "2.625rem"
rounded:
  flat: "0"
  compact: "4px"
  option: "5px"
  control: "6px"
spacing:
  tight: "8px"
  small: "12px"
  related: "16px"
  group: "20px"
  section: "24px"
  inset: "28px"
  broad: "32px"
  page: "36px"
  wide: "40px"
components:
  button-primary:
    backgroundColor: "{colors.lab-amber}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.control}"
    padding: "9px 15px"
  button-primary-hover:
    backgroundColor: "{colors.amber-hover}"
    textColor: "{colors.action-ink}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.lab-ink}"
    rounded: "{rounded.control}"
    padding: "9px 15px"
  button-secondary-hover:
    backgroundColor: "{colors.lab-raised}"
    textColor: "{colors.lab-ink}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.lab-muted}"
    rounded: "{rounded.compact}"
    padding: "8px 4px"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.lab-muted}"
    rounded: "{rounded.compact}"
  field:
    backgroundColor: "{colors.lab-ground}"
    textColor: "{colors.lab-ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  navigation:
    textColor: "{colors.lab-muted}"
  topic-option:
    backgroundColor: "transparent"
    textColor: "{colors.lab-muted}"
    rounded: "{rounded.option}"
    padding: "7px 10px"
  readings-row:
    textColor: "{colors.lab-ink}"
    padding: "12px 0 12px 88px"
  instrument-bar:
    backgroundColor: "{colors.lab-ground}"
    textColor: "{colors.lab-ink}"
    padding: "12px 0"
  repaired-entry:
    textColor: "{colors.lab-teal}"
    padding: "20px 0 0"
  register-row:
    textColor: "{colors.lab-ink}"
    padding: "12px 12px 12px 0"
  verification-row:
    textColor: "{colors.lab-ink}"
    padding: "13px 0"
---

# Design System: Bugbound Season 3 — Engineering Lab

## Overview

**Creative North Star: "Engineering Lab"**

Engineering Lab is precise, readable, and approachable. Graphite work surfaces, warm text, fine divisions, and deliberate accents support the judgment of an experienced developer. The interface works like an instrument: it measures the investigation and shows the readings back. Controls are familiar, information aligns, and the live experiment has room to be observed.

Season 1's field notebook resolved incidents; Season 2's investigation desk closed cases in a record. The lab repairs them and keeps readings: every run is a measurement with a number, a time and a pass count, and the learner's history feeds the next brief they write. The family constants in `FAMILY.md` hold throughout. The unit is the incident; Season 3's one finished word is **Repaired**, with "not saved yet" as its only qualifier.

The existing Bugbound icon carries the family identity. Flat ruled surfaces and clear typographic steps provide structure; evidence and actions provide the color. This record describes the finished shell in `src/styles/lab.css` and `src/shell/`, with shared font stacks from `src/styles/global.css`. The preserved exercise surface retains its own appearance and is outside this shell system.

**Key Characteristics:**
- Warm graphite surfaces with restrained amber and muted teal.
- Readable sans text; monospace readouts for every identifier and measured quantity.
- Ruled rows and tables with precise alignment; no cards, no banners.
- Status as words, and the finish recorded where verification happens.
- The live experiment as the one framed element, with Run always in view.

## Colors

The palette is dark and warm, with pale accents used for practical distinctions.

### Primary

- **Instrument amber** (`lab-amber`) marks the next thing to do: the primary command, the incident on the bench, its folio and Open status, and the active navigation. On an incident page it is Run checks while the incident is open or a later run fails, and Next once it is repaired. `amber-hover` supplies the brighter hover state; `action-ink` keeps filled actions readable.
- **Focus amber** (`lab-focus`) identifies keyboard focus independently of hover.

### Secondary

- **Evidence teal** (`lab-teal`) marks measured success: passed checks, filled run-trace cells, the Repaired record and status, and the repaired counts in the brief's readings. Source paths and copy feedback also use it, always beside words that name them.

### Tertiary

- **Attention coral** (`lab-error`) identifies failed checks, a failing reading and readable error output.

### Neutral

- **Graphite ground** (`lab-ground`) is the page, the instrument bar and editable-field ground; the header sits on the darker `header-ground`.
- **Graphite surface** (`lab-surface`) holds the prepared brief, the conclusion field and row hover.
- **Raised graphite** (`lab-raised`) distinguishes compact control hover states and the experiment caption.
- **Graphite rule** (`lab-line`) divides adjacent regions and outlines controls.
- **Warm white** (`lab-ink`) carries primary text; **soft sage gray** (`lab-muted`) carries supporting copy and metadata.

**The Labeled Evidence Rule.** Pair state color with text that names its scope. A repair is history; only a run verifies the current source, and a later run never undoes the record.

### Component-specific colors

These values document the implemented states, not additional general-purpose accents. Text selection uses `selection-ground` and `selection-ink`. Storage recovery notices use `storage-notice-ground` and `storage-notice-ink`. Selected topic controls use `topic-selected-ground`, `topic-selected-line`, and `topic-selected-ink`. Prepared instructions use `brief-ink`; the experiment host uses `experiment-ground`; inline reference code uses `reference-code-ink`. Unfilled run-trace cells and the bar reading's dotted underline use `reading-empty-line`. The desktop notice uses `desktop-notice-ground`, `desktop-notice-line`, `desktop-notice-ink`, and `desktop-notice-strong`. Keep each of these colors within its named component or state.

## Typography

The shell uses the familiar sans stack in the frontmatter for reading, controls, and task headings. Technical text uses the existing Cascadia-led monospace stack. There is no separate display typeface or decorative display treatment.

**The 12px floor.** No shell text is smaller than 12px (0.75rem) at any width, including labels, column heads, check states, source paths, readouts and inline reference code.

### Hierarchy

- **Title** names the current task: Practice, Brief an incident, or the incident's title (1.875rem beside its folio; 1.5rem at the narrow breakpoint).
- **Headline** introduces working sections. The bench title is 1.5rem, the register heading 1.25rem, group headings 1rem.
- **Body** supports continuous reading. The incident report and Concept prose read at 0.875rem with generous leading; explanatory passages keep 65–75ch measures.
- **Label** identifies fields. Navigation and standard buttons use a closely related size, with buttons slightly heavier (600). Field labels in the readings row and table column heads are 0.75rem.
- **Readout** is the lab's voice for measurement: `BUG-###` IDs, run numbers, pass counts, times, dates, counts and paths, in tabular monospace. Folios are large readouts (2.625rem; 2.125rem at the narrow breakpoint).

**The Technical Text Rule.** Monospace is for references and readings: identifiers, measured quantities, source paths, the prepared brief and diagnostic output. Prose, labels and status words stay in the sans family.

### Local and responsive size steps

`caption` (12px) serves labels, column heads, check states and captions; `small` (13px) serves supporting copy and table text; `heading-compact`, `heading-register` and `heading-bench` serve group, register and bench headings; `title-narrow` is the shared narrow heading override; `title-investigation` is the desktop incident title; `folio` is the incident numeral. These are the existing variants, not interchangeable sizes for body copy.

## Layout

The shell occupies the viewport vertically, with a 64px header (mark, wordmark, navigation, and a readout of repairs in each collection) and a footer after the content. Practice and brief pages share a centered maximum width (1280px); Investigation expands to 1600px. The header stays in normal document flow.

The reusable spatial pattern is a broad working area beside narrower supporting context, divided by rules. The incident's folio sits in an 88px lead column; the readings row, the bench and the lab record align to it.

### Responsive behavior

- **Wide desktop** (at least 1500px): context widens (390px), with more experiment inset.
- **Compact desktop** (at most 1100px): outer spacing tightens, context narrows (315px), and the register's Concept column moves under each title.
- **Stacked workspace** (at most 860px): paired panels become one column; Investigation context follows the experiment and verification. The focus control hides, and context is visible even if focus was active before resizing.
- **Narrow screen** (at most 700px): navigation occupies a second header row, page insets become compact (20px), the readings row drops its lead column, and register tables keep Case, Incident and Status. Source-copy controls grow to touch targets (44px).
- **Desktop notice** (at most 600px, or with both `hover: none` and `pointer: coarse`): a visible notice explains the local editor workflow while the briefs and references remain browsable. A narrow fine-pointer desktop window beside an editor does not get it, matching the family rule.

**The Mounted Experiment Rule.** Focus mode changes available space while retaining the experiment and reference state; Remount remains a separate, explicitly labeled action. Saving a source file reloads only the experiment and clears the last run.

## Elevation & Depth

The shell uses no box shadows. Depth comes from adjacent graphite tones, one-pixel rules, and spacing. Hover changes the local fill or border without lifting the element. The experiment frame is the one framed element; its contained exercise retains the preserved curriculum palette.

**The Ruled Surface Rule.** Use flat fills and fine divisions to organize related work: ruled rows, real tables, and the verification record. No cards, colored side borders or banners.

## Motion

Motion shows state. Buttons transition background and border (160ms), register rows their background (150ms), and focus mode the workspace columns (200ms with `cubic-bezier(.16, 1, .3, 1)`).

**The one authored moment** is the repair: on the run that first passes every check, the teal rule above the Repaired entry draws across once (320ms, ease-out), and focus moves to its heading. Reduced-motion preferences remove animation and transitions, so the rule simply appears.

The installed Stateful Button and Action Swap Roll keep their library transitions for the run and copy states (see Library motion). Page content and register rows do not animate on entry.

## Shapes

Large work surfaces are square. Controls use gently eased corners: the control radius for buttons, fields and the experiment frame, the compact radius for small controls and key caps, and the option radius for topic suggestions. State dots are small outlined circles (6px); a filled dot marks the live experiment. Run-trace cells are 16×6px, filled for a passed check and outlined otherwise.

The existing Bugbound SVG remains the brand mark. Utility icons are outlined SVG paths on a 24-unit view box, with a rounded stroke (1.6) and typical rendered sizes of 16–18px. Icons accompany words; icon-only actions receive accessible names.

## Components

### Buttons

Precise, quiet controls with a clear primary action. Primary and secondary buttons share padding and a minimum height (42px); amber fill distinguishes the one primary action on a surface. Secondary hover uses raised graphite and a stronger rule. Text buttons underline on hover; icon buttons change tone and fill. Disabled controls reduce opacity (0.65). A busy control (Run checks while running) dims the same way but uses `aria-disabled`, so it keeps keyboard focus and takes no hover fill. Focus uses an offset outline (2px, offset 4px), and controls retain their semantic button or link role.

### Inputs / Fields

Editable fields sit on graphite ground with a fine rule and control corners. Labels remain visible; placeholders supplement them. Textareas resize vertically, and native selects remain recognizable. Search uses a shared outline around the icon and input, with a focus-within ring. The prepared brief is a square, read-only monospace textarea that remains selectable; feedback follows the exact copied revision.

### Chips

Topic suggestions are compact outlined buttons with a pressed state. Their selected state uses a muted green fill, stronger green border, and pale green text. These local colors belong to the topic control rather than a new global accent family.

### Readings row

Under an incident's title, a ruled row of fields: Incident (`BUG-###`), Concept, Severity, Origin (Generated with its date, or Foundations) and Status (Open in amber with a dot, or Repaired with its day in teal, plus "not saved yet" when the save failed). Once there is work it adds Runs, Hints opened (tier numbers) and Last worked. The bench reuses it without the rules.

### Instrument bar

Pinned to the foot of the experiment column while the column scrolls, so Run is in view on arrival at desktop heights. It holds the latest reading (Not run this visit, Running check N of M, or a dotted-underlined "Run 03 · 2 of 4 passed · 2:14 PM" that jumps to that run's record), the Ctrl Enter key caps, Run checks, and once the incident is repaired, Next (the next suggested incident, or Brief an incident). Amber goes to Run checks while the incident is open or a later run fails, otherwise to Next. Ctrl+Enter (⌘ Enter on macOS) runs the checks from anywhere on the page, including inside the experiment, but not while typing in a page field.

### Verification record

Checks are listed before any run with Not run states. A run's header reads "Run 03 · Today 2:14 PM · 2 of 4 passed"; rows keep a stable status column (Not run, Running, Pending, Pass, Fail) and wrap failure detail in monospace. Run numbers count every finished run on the incident across visits. A polite status region announces progress and outcomes.

**The Repaired entry.** The run that first passes every check ends with a teal-ruled entry: a Repaired heading, "BUG-016 repaired today at 2:31 PM on run 04. Saved in this browser.", the note that a later run never undoes the record, and an optional **Conclusion** saved with it in this browser. On later visits the entry stands first in Verification, and a later run adds "Repaired Sep 24 still stands" with its own pass count. There is no completion banner.

### Readings

Below Verification, the incident's history in this browser, from real events only: the first visit, every finished run with its pass count, each hint tier the first time it opens (its number, never its text), and resets. A run trace shows the latest runs as rows of cells with "2/4" readouts and marks the repairing run. The log is grouped by day, newest first, shows six entries with a toggle for the rest, and keeps the newest 50 per incident. Repairs are reset per generation; readings and conclusions survive a reset.

### Practice: bench and register

Practice leads with **the bench**: the unrepaired incident worked on last (Continue incident NN) or the next open one (Start incident NN), drawn like its investigation heading with its report and readings row. When every incident is repaired, the bench becomes **the lab record**: first and last repair, runs, hints opened and batches, with Brief an incident as the next step.

**The register** is real tables. Generated incidents are grouped by generation date ("Batch Jul 4, 2026 · 2 incidents"), newest first; Foundations follows. Columns: Case (`BUG-###`), Incident (the row header and link), Concept, Severity, Activity ("3 runs · 1 hint" or a dash read as "No activity yet") and Status (Repaired with its day, or Open). Only the bench incident gets amber. A plain click anywhere on a row opens it; the title stays the real link. Search and a status filter apply to both groups. After a reset, a muted line under the heading says when repairs were reset and that readings were kept, until the next repair. `#/foundations` opens the register at its Foundations table.

### Brief

The brief builder pairs settings with the exact prepared handoff. **Your readings** summarizes by concept what the learning profile carries (incidents, repaired, runs, hints opened), most runs first, and counts the concepts left out; the profile download stays optional and never includes hint or solution text.

### Navigation

Main navigation uses plain links with warm text and an amber underline for the current page. The brand link returns to Practice. Investigation section links move to named, focusable headings. A keyboard skip link reveals itself on focus; route changes focus the task heading.

### Library motion

Season 3 uses actual beUI registry components installed with shadcn: Stateful Button for Run checks and Action Swap Roll for brief and path copy feedback. The installed Tabs component is no longer rendered, because the register shows both collections. Component source provenance, local adaptations and the MIT license are in `THIRD_PARTY_NOTICES.md`.

Copy labels and icons roll only after clipboard success; Run checks shows loading and the current result with a restrained 0.98 press scale. Reduced-motion paths retain the labels and outcomes while removing spatial movement.

Tailwind supplies the installed components' utilities. Its Preflight reset is omitted and utility discovery is restricted to `src/components`; existing exercise styling remains intact. `src/styles/components.css` maps component colors to Engineering Lab tokens. Existing button geometry, amber surfaces, focus outlines, and text hierarchy remain the visual authority.

### Context and guidance

The incident report shows source paths with adjacent copy controls and feedback. Concept reference starts open and uses a native disclosure. Guidance begins concealed behind individually labeled reveal controls; the shell describes the amount of help without evaluating the learner. Error and storage notices use explicit text and an applicable recovery action.

## Do's and Don'ts

### Do:

- **Do** say "incident" for the unit and "Repaired" for the finished state, with "not saved yet" as its only qualifier.
- **Do** record the repair in the verification record, with its time and run.
- **Do** show readings only from real events, and never record hint text.
- **Do** keep Run in view and give amber to the one next action.
- **Do** keep reading and controls in the sans family, with monospace readouts for references and measurements.
- **Do** preserve visible keyboard focus, semantic navigation, wrapping, reduced motion and the 12px floor.
- **Do** preserve the mounted experiment and disclosure state when focus mode changes its space.

### Don't:

- **Don't** apply shell colors, typography overrides, or new component rules inside the preserved exercise surface.
- **Don't** make color the only distinction between verification states or the repair record.
- **Don't** announce a repair in a banner, or let a later run undo it.
- **Don't** replace the ruled register and record with cards, colored side borders, decorative shadows, or lab costume (beakers, grid paper, oscilloscope glow, terminal chrome).
- **Don't** imply that preparing a brief ran an agent or validated a discovered incident.
- **Don't** expose guidance before the learner deliberately reveals it.
