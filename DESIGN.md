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
  caption:
    fontSize: "0.6875rem"
  small:
    fontSize: "0.75rem"
  heading-compact:
    fontSize: "1rem"
  heading-register:
    fontSize: "1.25rem"
  suggestion-compact:
    fontSize: "1.375rem"
  heading-medium:
    fontSize: "1.5rem"
  suggestion:
    fontSize: "1.625rem"
  title-narrow:
    fontSize: "1.75rem"
  title-investigation:
    fontSize: "1.875rem"
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
  launch-surface:
    backgroundColor: "{colors.lab-surface}"
    rounded: "{rounded.flat}"
    padding: "22px 28px"
  register-row:
    textColor: "{colors.lab-ink}"
    padding: "17px 18px"
  verification-row:
    textColor: "{colors.lab-ink}"
    padding: "13px 0"
---

# Design System: Bugbound Season 3 — Engineering Lab

## Overview

**Creative North Star: "Engineering Lab"**

Engineering Lab is precise, readable, and approachable. Graphite work surfaces, warm text, fine divisions, and deliberate accents support the judgment of an experienced developer. The interface feels like a working instrument: controls are familiar, information aligns, and the live experiment has room to be observed.

The existing Bugbound icon carries the family identity. Flat ruled surfaces and clear typographic steps provide structure; evidence and actions provide the color. This record describes the finished shell in `src/styles/lab.css` and `src/shell/`, with shared font stacks from `src/styles/global.css`. The preserved exercise surface retains its own appearance and is outside this shell system.

**Key Characteristics:**
- Warm graphite surfaces with restrained amber and muted teal.
- Readable sans text paired with monospace technical content.
- Flat panels and ruled registers with precise alignment.
- Explicit state labels and visible keyboard focus.
- Responsive context that gives the experiment room without discarding it.

## Colors

The palette is dark and warm, with pale accents used for practical distinctions.

### Primary

- **Instrument amber** (`lab-amber`) marks primary actions, incident numbers, active navigation, and work awaiting verification. `amber-hover` supplies its brighter hover state; `action-ink` keeps filled actions readable.
- **Focus amber** (`lab-focus`) identifies keyboard focus independently of hover.

### Secondary

- **Evidence teal** (`lab-teal`) marks passed checks, saved register completion, source paths, reference links, and copy feedback. The surrounding words establish what each signal means.

### Tertiary

- **Attention coral** (`lab-error`) identifies failed verification and readable error output.

### Neutral

- **Graphite ground** (`lab-ground`) is the page and editable-field ground.
- **Graphite surface** (`lab-surface`) holds the suggestion, prepared brief, and local hover regions.
- **Raised graphite** (`lab-raised`) distinguishes compact control hover states and the experiment caption by tone.
- **Graphite rule** (`lab-line`) divides adjacent regions and outlines controls.
- **Warm white** (`lab-ink`) carries primary text; **soft sage gray** (`lab-muted`) carries supporting copy and metadata.

**The Labeled Evidence Rule.** Pair state color with text that names its scope; saved completion and verification this visit remain distinct signals.

### Component-specific colors

These values document the implemented states, not additional general-purpose accents. Text selection uses `selection-ground` and `selection-ink`. Storage recovery notices use `storage-notice-ground` and `storage-notice-ink`. Selected topic controls use `topic-selected-ground`, `topic-selected-line`, and `topic-selected-ink`. Prepared instructions use `brief-ink`; the experiment host uses `experiment-ground`; inline reference code uses `reference-code-ink`. The smaller-device notice uses `desktop-notice-line`, `desktop-notice-ink`, and `desktop-notice-strong`. Keep each of these colors within its named component or state.

## Typography

The shell uses the familiar sans stack in the frontmatter for reading, controls, and task headings. Technical text uses the existing Cascadia-led monospace stack. There is no separate display typeface or decorative display treatment.

### Hierarchy

- **Title** names the current task. Investigation titles are slightly smaller (1.875rem); at the narrow breakpoint, the shared heading rule resolves to 1.75rem.
- **Headline** introduces working sections. Local titles range from the compact tertiary heading (0.9375rem) to the suggestion title (1.625rem), giving the active proposition priority without turning it into a hero.
- **Body** supports continuous reading. Reference prose uses more leading (1.85), and explanatory passages use bounded measures where the layout needs them (65–75ch).
- **Label** identifies fields. Navigation and standard buttons use a closely related size, with buttons slightly heavier (600). Supporting labels and metadata range from 0.6875rem to 0.8125rem.
- **Mono** describes the prepared brief. Source paths and error output use smaller monospace text; incident identifiers use larger tabular numerals (2.625rem, falling to 2.125rem at the narrow breakpoint).

**The Technical Text Rule.** Reserve monospace for identifiers, source paths, prepared instructions, and diagnostic output; keep reading and control labels in the sans family.

### Local and responsive size steps

The additional frontmatter size entries record existing variants. They specify size only because family, weight, and leading come from each component's rule. `caption` serves compact metadata and check labels; `small` serves supporting text and hints; `heading-compact` serves mobile section titles and preview errors; `heading-register` serves the register and narrow suggestion; `suggestion-compact` is the compact-desktop suggestion; `heading-medium` serves the empty suggestion heading and the local narrow investigation declaration; `suggestion` is the desktop suggestion; `title-narrow` is the shared narrow heading override; and `title-investigation` is the desktop investigation title. The more-specific shared narrow heading rule wins over the local investigation declaration, as described above. These are the existing responsive variants, not interchangeable sizes for body copy.

## Layout

The shell occupies the viewport vertically, with a compact brand/navigation header and a footer after the content. Practice and brief pages share a centered maximum width (1280px); Investigation expands to a broader maximum (1600px). The header stays part of normal document flow. Main reading surfaces use generous outer padding and tighter internal alignment.

The reusable spatial pattern is a broad working area beside narrower supporting context. Practice uses a flat suggestion surface and a ruled register. The brief builder pairs settings with the exact prepared handoff. Investigation places the experiment and its verification list beside a context column (360px at the base desktop layout). Horizontal and vertical rules show ownership without surrounding every region in a card.

The spacing values in the frontmatter are recurring measurements, not a universal mathematical grid. Standard controls use compact padding; major sections use more separation. Register rows align identifiers, subject, difficulty, and status in shared columns, with long subjects allowed to wrap.

### Responsive behavior

- **Wide desktop** (at least 1500px): context widens (390px), with more experiment inset.
- **Compact desktop** (at most 1100px): outer spacing tightens, the identity descriptor hides, and context narrows (315px).
- **Stacked workspace** (at most 860px): paired panels become one column; Investigation context follows the experiment and checks. The focus control hides, and context is visible even if focus was active before resizing.
- **Narrow screen** (at most 700px): navigation occupies a second header row, page insets become compact (20px), and the register becomes a stacked row layout. A visible notice explains the local editor workflow while the briefs and references remain browsable. Source-copy controls grow to touch targets (44px).

**The Mounted Experiment Rule.** Focus mode changes available space while retaining the experiment and reference state; remount remains a separate, explicitly labeled action.

## Elevation & Depth

The shell uses no box shadows. Depth comes from adjacent graphite tones, one-pixel rules, and spacing. Hover changes the local fill or border without lifting the element. The dark experiment stage is a dedicated host surface; its contained exercise is allowed to retain the preserved curriculum palette.

**The Ruled Surface Rule.** Use flat fills and fine divisions to organize related work; preserve the continuous register and evidence-list structure.

Motion is brief and functional: buttons transition background and border (160ms), register rows transition their background (150ms), and focus mode transitions workspace columns (200ms with `cubic-bezier(.16, 1, .3, 1)`). Reduced-motion preferences remove animation and transitions and restore automatic scrolling. Verification changes are conveyed through current status and list content, without a decorative animation loop.

## Shapes

Large work surfaces are square. Controls use gently eased corners: the control radius for buttons and fields, the compact radius for small controls and count markers, and the option radius for topic suggestions. Thin borders define fields and divisions. State dots are small outlined circles (6px); filled dots distinguish established states in context.

The existing Bugbound SVG remains the brand mark. Utility icons are outlined SVG paths on a 24-unit view box, with a rounded stroke (1.6) and typical rendered sizes of 16–18px. Icons accompany words; icon-only actions receive accessible names.

## Components

### Buttons

Precise, quiet controls with a clear primary action. Primary and secondary buttons share padding and a minimum height (42px); amber fill distinguishes primary actions. Secondary hover uses raised graphite and a stronger rule. Text buttons underline on hover; icon buttons change tone and fill. Disabled controls reduce opacity (0.65). Focus uses an offset outline (2px, offset 4px), and controls retain their semantic button or link role.

### Inputs / Fields

Editable fields sit on graphite ground with a fine rule and control corners. Labels remain visible; placeholders supplement them. Textareas resize vertically, and native selects remain recognizable. Search uses a shared outline around the icon and input, with a focus-within ring. The prepared brief is a square, read-only monospace textarea that remains selectable; feedback follows the exact copied revision.

### Chips

Topic suggestions are compact outlined buttons with a pressed state. Their selected state uses a muted green fill, stronger green border, and pale green text. These local colors belong to the topic control rather than a new global accent family. Collection counts use small outlined markers; verification status is an unboxed text column.

### Cards / Containers

The suggestion is a flat graphite surface with a ruled companion region. Brief output uses another square tonal surface. Context, verification, and optional reflection are separated by rules and spacing. Empty states keep the same structure, with a readable explanation and a relevant next action.

### Navigation

Main and collection navigation use plain links with warm text and an amber underline for the current page. The brand link returns to Practice. Investigation section links move to named, focusable headings. A keyboard skip link reveals itself on focus; route changes focus the task heading.

### Library motion

Season 3 uses actual beUI registry components installed with shadcn: Stateful Button for verification, Action Swap Roll for brief/path copy feedback, and Tabs for the collection underline. The local Tabs adaptation retains native route links and `aria-current`. Component source provenance and the MIT license are in `THIRD_PARTY_NOTICES.md`.

Motion explains an action or a state change. The underline moves between collections; copy labels and icons roll only after clipboard success; verification shows loading and the current result. Reduced-motion paths retain the labels and outcomes while removing spatial movement. Verification uses a restrained 0.98 press scale. Page content and challenge rows do not animate on entry.

Tailwind supplies the installed components' utilities. Its Preflight reset is omitted and utility discovery is restricted to `src/components`; existing exercise styling remains intact. `src/styles/components.css` maps component colors to Engineering Lab tokens. Existing button geometry, amber surfaces, focus outlines, and text hierarchy remain the visual authority.

### Challenge register

Each challenge is a full-row link. An amber monospace identifier anchors the row, followed by the title and concept, difficulty, explicit completion status, and an SVG arrow. Hover fills the whole row. The narrow layout places metadata below the subject while preserving the identifier and action edge. Saved status remains labeled as earlier completion.

### Experiment and evidence

The experiment has a compact toolbar, local-source caption, bounded scrollable stage, and explanatory footnote. Focus widens the stage without remounting it. Checks stay immediately below as ruled rows with a stable status column and a readable name; failure detail wraps in monospace. The list distinguishes Not run, Running, Pending, Pass, and Fail, and an announced summary reports the current run.

### Context and guidance

The brief shows source paths with adjacent copy controls and feedback. Concept reference starts open and uses a native disclosure. Guidance begins concealed behind individually labeled reveal controls; the shell describes the amount of help without evaluating the learner. Optional reflection appears only after a successful current run. Error and storage notices use explicit text and an applicable recovery action.

## Do's and Don'ts

### Do:

- **Do** use the existing Bugbound icon and the Engineering Lab palette for shell surfaces.
- **Do** keep reading and controls in the sans family, with monospace for technical material.
- **Do** align related information with rules, shared columns, and restrained tonal changes.
- **Do** preserve visible keyboard focus, semantic navigation, wrapping, and reduced-motion behavior.
- **Do** label evidence by its actual scope and retain a readable state before the first run.
- **Do** preserve the mounted experiment and disclosure state when focus mode changes its space.

### Don't:

- **Don't** apply shell colors, typography overrides, or new component rules inside the preserved exercise surface.
- **Don't** make color the only distinction between verification states or saved completion.
- **Don't** replace the flat ruled register with independently floating cards or decorative shadows.
- **Don't** imply that preparing a brief ran an agent or validated a discovered challenge.
- **Don't** expose guidance before the learner deliberately reveals it.
