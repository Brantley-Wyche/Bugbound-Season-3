// Static curriculum validation. Generated exercise code is never imported into Node.
import { fileURLToPath } from 'node:url';
import { inspectCurriculum } from './curriculum/inspect.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const { levels, errors, warnings } = inspectCurriculum(root);
console.log(`Checked ${levels.length} level(s).`);
for (const warning of warnings) console.warn(`  WARN  ${warning}`);
for (const error of errors) console.error(`  ERROR ${error}`);
if (errors.length) {
  console.error(`\n${errors.length} error(s). Fix them before shipping the level.`);
  process.exitCode = 1;
} else console.log(warnings.length ? `Passed with ${warnings.length} warning(s).` : 'All good. ✔');
