import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CUSTOM_DIR = join(ROOT, 'src', 'levels', 'custom');
const HINTS_PATH = join(ROOT, 'src', 'levels', 'hints.json');
const SOLUTIONS_PATH = join(ROOT, 'SOLUTIONS.md');
const [command = 'list', target, ...flags] = process.argv.slice(2);
const confirmed = flags.includes('--confirm') || target === '--confirm';

function folders() {
  if (!existsSync(CUSTOM_DIR)) return [];
  return readdirSync(CUSTOM_DIR)
    .filter((name) => /^\d{2,}-[a-z0-9-]+$/.test(name))
    .sort((a, b) => Number(a.split('-')[0]) - Number(b.split('-')[0]));
}

function removeSolutionSections(source, numbers) {
  return source.replace(/^## Level (\d{2,}).*?(?=^## Level |\s*$)/gms, (section, number) => (
    numbers.has(Number(number)) ? '' : section
  )).replace(/\n{3,}/g, '\n\n');
}

function removeLevels(names) {
  const hints = JSON.parse(readFileSync(HINTS_PATH, 'utf8'));
  const numbers = new Set();

  for (const name of names) {
    const exactPath = join(CUSTOM_DIR, name);
    if (!existsSync(exactPath) || !/^\d{2,}-[a-z0-9-]+$/.test(name)) {
      throw new Error(`Refusing to remove unknown custom level '${name}'.`);
    }
    numbers.add(Number(name.split('-')[0]));
    delete hints[name];
    rmSync(exactPath, { recursive: true, force: false });
  }

  writeFileSync(HINTS_PATH, `${JSON.stringify(hints, null, 2)}\n`);
  const solutions = readFileSync(SOLUTIONS_PATH, 'utf8');
  writeFileSync(SOLUTIONS_PATH, removeSolutionSections(solutions, numbers));
}

if (command === 'list') {
  const available = folders();
  console.log(available.length ? available.join('\n') : 'No custom levels.');
} else if (command === 'remove') {
  if (!target || target === '--confirm') {
    throw new Error('Usage: npm run custom-levels -- remove <level-id> --confirm');
  }
  if (!confirmed) {
    throw new Error(`Refusing to remove '${target}' without --confirm.`);
  }
  removeLevels([target]);
  console.log(`Removed ${target}. Reset browser progress from the Bugbound footer if needed.`);
} else if (command === 'reset') {
  const available = folders();
  if (!confirmed) {
    throw new Error(`Refusing to remove ${available.length} custom level(s) without --confirm.`);
  }
  if (available.length) removeLevels(available);
  console.log(`Removed ${available.length} custom level(s). Reset browser progress from the Bugbound footer.`);
} else {
  throw new Error(`Unknown command '${command}'. Use list, remove, or reset.`);
}
