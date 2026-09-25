---
target: Season 3 frontend and Agent Station
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-09-12T22-07-47Z
slug: src-shell-agentstation-jsx
---
Method: dual-agent (A: /root/critique_design; B: /root/critique_evidence)

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
