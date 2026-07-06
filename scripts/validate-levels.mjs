// Validates the structure of all Bugbound levels (official + custom).
// Static analysis only — behavioral verification happens in the app.
// Usage: npm run validate-levels
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LEVELS_DIR = join(ROOT, 'src', 'levels');
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const BASE64_RE = /^[A-Za-z0-9+/]+=*$/;

const errors = [];
const warnings = [];

function levelDirs(base) {
  if (!existsSync(base)) return [];
  return readdirSync(base)
    .map((name) => join(base, name))
    .filter((p) => statSync(p).isDirectory() && /^\d{2}-/.test(p.split(/[\\/]/).pop()))
    .filter((p) => existsSync(join(p, 'manifest.js')));
}

const dirs = [
  ...levelDirs(LEVELS_DIR).filter((p) => !p.includes('custom')),
  ...levelDirs(join(LEVELS_DIR, 'custom')),
];

if (dirs.length === 0) {
  console.error('No level folders found — is this running from the repo root?');
  process.exit(1);
}

const hints = JSON.parse(readFileSync(join(LEVELS_DIR, 'hints.json'), 'utf8'));
const solutions = readFileSync(join(ROOT, 'SOLUTIONS.md'), 'utf8');

const seenIds = new Set();
const seenNumbers = new Set();

for (const dir of dirs) {
  const folder = dir.split(/[\\/]/).pop();
  const label = dir.includes('custom') ? `custom/${folder}` : folder;
  const src = readFileSync(join(dir, 'manifest.js'), 'utf8');

  const id = src.match(/id:\s*'([^']+)'/)?.[1];
  const number = src.match(/number:\s*(\d+)/)?.[1];
  const severity = src.match(/severity:\s*'([^']+)'/)?.[1];

  if (!id) errors.push(`${label}: manifest has no id`);
  else {
    if (id !== folder) errors.push(`${label}: id '${id}' does not match folder name`);
    if (seenIds.has(id)) errors.push(`${label}: duplicate id '${id}'`);
    seenIds.add(id);
  }

  if (!number) errors.push(`${label}: manifest has no number`);
  else {
    if (seenNumbers.has(number)) errors.push(`${label}: duplicate number ${number}`);
    seenNumbers.add(number);
  }

  if (!severity) errors.push(`${label}: manifest has no severity`);
  else if (!SEVERITIES.includes(severity))
    errors.push(`${label}: severity '${severity}' is not one of ${SEVERITIES.join('/')}`);

  for (const field of ['title:', 'concept:', 'symptom:', 'lesson:', 'checks:', 'files:', 'Component']) {
    if (!src.includes(field)) errors.push(`${label}: manifest is missing ${field.replace(':', '')}`);
  }

  // hints: exactly 3 base64 entries per level
  if (id) {
    const h = hints[id];
    if (!Array.isArray(h) || h.length !== 3) {
      errors.push(`${label}: hints.json needs exactly 3 hints for '${id}' (found ${Array.isArray(h) ? h.length : 'none'})`);
    } else if (!h.every((s) => typeof s === 'string' && s.length > 8 && BASE64_RE.test(s))) {
      errors.push(`${label}: hints for '${id}' don't look base64-encoded — never store plaintext hints`);
    }
  }

  // solution section present
  if (number && !solutions.includes(`## Level ${String(number).padStart(2, '0')}`)) {
    errors.push(`${label}: SOLUTIONS.md has no "## Level ${String(number).padStart(2, '0')}" section`);
  }

  // component files should expose testids for checks
  const sources = readdirSync(dir).filter((f) => /\.(jsx|tsx|js|ts)$/.test(f) && f !== 'manifest.js');
  if (sources.length === 0) {
    errors.push(`${label}: no component source files next to the manifest`);
  } else if (!sources.some((f) => readFileSync(join(dir, f), 'utf8').includes('data-testid'))) {
    warnings.push(`${label}: no data-testid found in any component — how will checks reach the DOM?`);
  }
}

// numbering should be contiguous from 1
const nums = [...seenNumbers].map(Number).sort((a, b) => a - b);
for (let i = 0; i < nums.length; i++) {
  if (nums[i] !== i + 1) {
    warnings.push(`level numbering has a gap or offset at ${nums[i]} (expected ${i + 1}) — unlock gating may strand players`);
    break;
  }
}

console.log(`Checked ${dirs.length} level(s).`);
for (const w of warnings) console.warn(`  WARN  ${w}`);
for (const e of errors) console.error(`  ERROR ${e}`);

if (errors.length) {
  console.error(`\n${errors.length} error(s). Fix them before shipping the level.`);
  process.exit(1);
}
console.log(warnings.length ? `Passed with ${warnings.length} warning(s).` : 'All good. ✔');
