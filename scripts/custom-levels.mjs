import { cpSync, existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverLevelFolders } from './curriculum/inspect.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

function solutionRanges(source) {
  const headings = [...source.matchAll(/^## Level (\d{2,})\b[^\r\n]*(?:\r?\n|$)/gm)];
  return headings.map((match, index) => ({ number: Number(match[1]), start: match.index, end: headings[index + 1]?.index ?? source.length }));
}

export function removeLevels(root, names, options = {}) {
  const levels = discoverLevelFolders(root).filter((entry) => entry.custom);
  const targets = names.map((name) => {
    const level = levels.find((entry) => entry.id === name);
    if (!level) throw new Error(`Refusing to remove unknown custom level '${name}'.`);
    return level;
  });
  if (new Set(names).size !== names.length) throw new Error('Duplicate level id in removal request.');
  if (!targets.length) return { removed: [], backupPath: null };
  const hintsPath = join(root, 'src', 'levels', 'hints.json');
  const solutionsPath = join(root, 'SOLUTIONS.md');
  const backupRoot = join(root, '.bugbound-backups');
  const canonicalRoot = realpathSync(root);
  for (const path of [hintsPath, solutionsPath, backupRoot]) {
    if (existsSync(path) && relative(join(canonicalRoot, relative(root, path)), realpathSync(path)) !== '') {
      throw new Error(`Refusing to modify linked path outside its canonical location: ${path}`);
    }
  }
  const hints = JSON.parse(readFileSync(hintsPath, 'utf8'));
  const solutions = readFileSync(solutionsPath, 'utf8');
  const ranges = solutionRanges(solutions);
  for (const target of targets) {
    if (!Object.hasOwn(hints, target.id)) throw new Error(`Missing hint entry for '${target.id}'.`);
    if (ranges.filter((range) => range.number === target.number).length !== 1) throw new Error(`Expected one complete solution section for '${target.id}'.`);
  }
  const removeNumbers = new Set(targets.map((entry) => entry.number));
  const updatedSolutions = ranges.filter((range) => removeNumbers.has(range.number))
    .reduceRight((text, range) => text.slice(0, range.start) + text.slice(range.end), solutions)
    .replace(/\n{3,}/g, '\n\n');
  const updatedHints = { ...hints };
  for (const target of targets) delete updatedHints[target.id];
  const backupPath = join(backupRoot, `remove-${Date.now()}-${process.pid}`);
  mkdirSync(backupPath, { recursive: true });
  writeFileSync(join(backupPath, 'hints.json'), readFileSync(hintsPath));
  writeFileSync(join(backupPath, 'SOLUTIONS.md'), readFileSync(solutionsPath));
  for (const target of targets) cpSync(target.path, join(backupPath, target.id), { recursive: true, errorOnExist: true });
  const stagedHints = join(backupPath, 'staged-hints.json');
  const stagedSolutions = join(backupPath, 'staged-SOLUTIONS.md');
  writeFileSync(stagedHints, `${JSON.stringify(updatedHints, null, 2)}\n`);
  writeFileSync(stagedSolutions, updatedSolutions);
  try {
    writeFileSync(hintsPath, readFileSync(stagedHints));
    options.afterWrite?.('hints');
    writeFileSync(solutionsPath, readFileSync(stagedSolutions));
    options.afterWrite?.('solutions');
    for (const target of targets) {
      rmSync(target.path, { recursive: true });
      options.afterWrite?.(target.id);
    }
  } catch (error) {
    try {
      writeFileSync(hintsPath, readFileSync(join(backupPath, 'hints.json')));
      writeFileSync(solutionsPath, readFileSync(join(backupPath, 'SOLUTIONS.md')));
      for (const target of targets) {
        if (existsSync(target.path)) rmSync(target.path, { recursive: true });
        cpSync(join(backupPath, target.id), target.path, { recursive: true });
      }
    } catch (restoreError) {
      throw new Error(`Removal failed and automatic restore failed: ${restoreError.message}. Restore from ${backupPath}`, { cause: error });
    }
    throw new Error(`Removal failed; original files restored. Backup: ${backupPath}. Cause: ${error.message}`, { cause: error });
  }
  return { removed: names, backupPath };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [command = 'list', target] = process.argv.slice(2);
  const folders = discoverLevelFolders(ROOT).filter((entry) => entry.custom).map((entry) => entry.id);
  if (command === 'list') console.log(folders.length ? folders.join('\n') : 'No custom levels.');
  else if (command === 'remove' || command === 'reset') {
    if (!process.argv.includes('--confirm')) throw new Error('Removal requires --confirm.');
    const outcome = removeLevels(ROOT, command === 'reset' ? folders : [target]);
    console.log(`Removed ${outcome.removed.length} custom level(s). Backup: ${outcome.backupPath || 'none'}`);
    console.log('Reset browser progress from the Bugbound footer if needed.');
  } else throw new Error(`Unknown command '${command}'. Use list, remove, or reset.`);
}
