# Post-documentation hook triage

Date: 2026-09-12 (local). The stop hook ran after DESIGN.md was created and reported 48 advisory mismatches. All were reviewed against the unchanged final CSS and approved finish-review evidence.

47 findings were documentation omissions: 34 references to nine existing size steps, and 13 colors used by selection, notices, selected topics, prepared instructions, inline reference code, and the experiment host. DESIGN.md now records those actual values and their restricted roles; the schema 2 sidecar is synchronized. This does not add new visual choices or change rendered styles.

The remaining finding is the original cartridge inline-code color `#9ecbff` in `src/styles/global.css`. Its appearance is explicitly protected by the user and outside the shell design system. `hook-admin.mjs ignore-value design-system-color "#9ecbff" --file src/styles/global.css --reason ...` recorded one shared value/file exception (exit 0). No file-wide or rule-wide ignore was added.

| Location | Rule | Value | Disposition |
| --- | --- | --- | --- |
| lab.css:22 | design-system-color | `#665736` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:22 | design-system-color | `#fff6e2` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:54 | design-system-font-size | `.6875rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:64 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:67 | design-system-color | `#392f24` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:67 | design-system-color | `#f0d6a6` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:76 | design-system-font-size | `1.5rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:79 | design-system-font-size | `1.625rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:89 | design-system-font-size | `1.25rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:97 | design-system-font-size | `.6875rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:106 | design-system-font-size | `.6875rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:115 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:122 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:140 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:144 | design-system-color | `#303d37` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:144 | design-system-color | `#657f74` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:144 | design-system-color | `#cae1d7` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:149 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:156 | design-system-color | `#d4ddd5` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:159 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:165 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:172 | design-system-font-size | `1.875rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:173 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:176 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:181 | design-system-font-size | `.6875rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:191 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:192 | design-system-font-size | `.6875rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:195 | design-system-color | `#11171b` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:197 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:199 | design-system-font-size | `1rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:206 | design-system-font-size | `.6875rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:209 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:219 | design-system-font-size | `.6875rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:226 | design-system-color | `#d1dcd6` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:229 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:233 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:253 | design-system-font-size | `1.375rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:287 | design-system-font-size | `1.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:291 | design-system-color | `#454133` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:291 | design-system-color | `#ded2b6` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:291 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:293 | design-system-color | `#f0dfba` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:300 | design-system-font-size | `1.25rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:328 | design-system-font-size | `1.5rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:334 | design-system-font-size | `1rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:339 | design-system-font-size | `1rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| lab.css:340 | design-system-font-size | `.75rem` | Documented existing component color or local/responsive type step; sidecar synchronized. |
| global.css:40 | design-system-color | `#9ecbff` | Scoped exception: preserved exercise inline-code color. |

Validation: detector over `src/shell`, `src/styles/lab.css`, and `src/styles/global.css` returned `[]`, exit 0. Sidecar JSON/token-reference validation and `git diff --check` exited 0. SHA256 comparison confirms both stylesheets unchanged during this reconciliation. No findings left standing. Tests/build/browser screenshots were not repeated because only design documentation and detector metadata changed.

