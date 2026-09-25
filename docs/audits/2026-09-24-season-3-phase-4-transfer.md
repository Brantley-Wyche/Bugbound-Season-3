# Season 3 standalone repository transfer

September 24, 2026.

## Destination and provenance

- Local home: `C:/Users/d69ha/Desktop/bugbound-season-3` (renamed from the user's empty `react-practice-site-s3` folder).
- Repository: https://github.com/Brantley-Wyche/Bugbound-Season-3.git
- Branch: `main`, the pristine cartridge; generation and learner repairs use their own branches.
- Source checkpoint: `2a562fd49a545297faea82122d00a390ebe182c9` on the original repository's `season-3` branch.

The new checkout preserves the full ancestry of the source branch with independent Git objects (`--no-hardlinks`, no object alternates). The original checkout, remote, branch, and retained stash were preserved. The destination folder and remote repository were both empty before transfer. Local settings, caches, ignored plans, and the old dependency directory were not copied; dependencies were installed afresh from the unchanged lockfile.

## Migration changes

Current README identity, clone instructions, family repository links, and screenshots now describe the standalone Engineering Lab. PRODUCT and ARCHITECTURE identify its main branch and new repository. SEASONS is explicitly marked as historical planning; active contracts take precedence. CI runs on main pushes and pull requests.

Application code, curriculum, test IDs, encoded hints/solutions, styles, package manifests, lockfile, and agent contracts match the validated source checkpoint. No planted bugs were repaired or explained.

## Verification in the new root

Node v24.18.0 and npm 11.16.0.

| Command | Exit | Result |
| --- | --- | --- |
| `npm.cmd ci` | 0 | Fresh install: 312 packages; npm reported 0 vulnerabilities |
| `npm.cmd test` | 0 | 65 tests passed |
| `npm.cmd run lint` | 0 | Passed |
| `npm.cmd run typecheck:components` | 0 | Passed within the component boundary |
| `npm.cmd run validate-levels` | 0 | 17 levels validated |
| `npm.cmd run build` | 0 | Production build passed |
| `git diff --check` | 0 | Migration diff has no whitespace errors |
| Scoped `git diff --exit-code 2a562fd -- ...` | 0 | Application, tooling, tests, configuration, curriculum, assets and dependency files unchanged |

A production preview launched from this new checkout on `127.0.0.1:5193`. The challenge register loaded, an investigation loaded its actual exercise frame, and its check run completed with the expected planted failures. No completion was saved and no hints were opened. This is a transfer smoke test, not a new full curriculum correctness audit or a rerun of the prior responsive matrix.

## Independent review

A read-only GPT-6 Sol review confirmed source preservation, independent Git objects, intended documentation/CI scope, existing screenshot targets, and intact cartridge rules. It caught the inherited single-branch fetch refspec still naming season-3. That setting was corrected to `+refs/heads/*:refs/remotes/origin/*`, and the obsolete remote-tracking season-3 reference was removed while its commit history remained on main. Publication will establish origin/main as the new upstream.

## Limits

Browser progress is stored per origin, not in the Git repository. This transfer does not export, reset, or migrate existing browser records. The component typecheck intentionally excludes planted curriculum typing mistakes. Dated earlier audits retain their original branch/path context. A passing local check does not establish a remote CI result.
