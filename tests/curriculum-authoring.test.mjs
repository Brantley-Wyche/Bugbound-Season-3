import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, renameSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { inspectCurriculum } from '../scripts/curriculum/inspect.mjs';
import { removeLevels } from '../scripts/custom-levels.mjs';
import { curriculumPlugin } from '../scripts/vite/curriculum-plugin.mjs';

function write(root, relativePath, contents) {
  const path = join(root, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'bugbound-authoring-'));
  write(root, 'src/levels/hints.json', JSON.stringify({
    '100-valid': ['Ynl0ZXMtb25l', 'Ynl0ZXMtdHdv', 'Ynl0ZXMtdGhyZWU='],
  }));
  write(root, 'SOLUTIONS.md', '# Solutions\n\n## Level 100 — Valid\n\n```\nYnl0ZXM=\n```\n');
  write(root, 'src/levels/custom/100-valid/Widget.jsx', 'export default function Widget() { return <button data-testid="ok" />; }');
  write(root, 'src/levels/custom/100-valid/manifest.js', `import Component from './Widget.jsx';
export default { id: '100-valid', number: 100, title: 'Valid', concept: 'Testing', severity: 'Low', difficulty: 'Beginner', source: 'agent', generatedAt: '2026-09-24', Component, files: ['src/levels/custom/100-valid/Widget.jsx'], symptom: 'Visible symptom.', lesson: ['One'], checks: [{ name: 'It works', run: async () => {} }] };`);
  return root;
}

test('inspectCurriculum statically returns metadata and permits gaps', () => {
  const root = fixture();
  try {
    const result = inspectCurriculum(root);
    assert.deepEqual(result.errors, []);
    assert.equal(result.levels[0].id, '100-valid');
    assert.deepEqual(result.levels[0].checks, [{ name: 'It works' }]);
    assert.equal(result.levels[0].manifestPath, 'src/levels/custom/100-valid/manifest.js');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the catalog uses lazy loaders and rejects malformed metadata in production', () => {
  const root = fixture();
  try {
    const plugin = curriculumPlugin();
    plugin.configResolved({ root, command: 'serve' });
    const id = plugin.resolveId('virtual:bugbound-curriculum');
    const context = { addWatchFile() {}, error(message) { throw new Error(message); } };
    const valid = plugin.load.call(context, id);
    assert.match(valid, /\(\) => import\("\/src\/levels\/custom\/100-valid\/manifest.js"\)/);
    assert.doesNotMatch(valid, /import\s+\w+\s+from/);
    write(root, 'src/levels/custom/100-valid/manifest.js', 'throw new Error("must never execute in Node"); export default null;');
    const invalid = plugin.load.call(context, id);
    assert.match(invalid, /export const levels = \[\]/);
    assert.match(invalid, /default export must be a literal object/);
    plugin.configResolved({ root, command: 'build' });
    assert.throws(() => plugin.load.call(context, id), /Curriculum validation failed/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('maintenance rejects a backup directory linked outside its canonical location', () => {
  const root = fixture();
  try {
    const external = join(root, 'external-backup');
    mkdirSync(external);
    symlinkSync(external, join(root, '.bugbound-backups'), 'junction');
    const before = readFileSync(join(root, 'SOLUTIONS.md'), 'utf8');
    assert.throws(() => removeLevels(root, ['100-valid']), /linked|canonical/i);
    assert.equal(readFileSync(join(root, 'SOLUTIONS.md'), 'utf8'), before);
    assert.ok(readFileSync(join(root, 'src/levels/custom/100-valid/Widget.jsx'), 'utf8'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('inspectCurriculum rejects dynamic metadata and boundary escaping imports', () => {
  const root = fixture();
  try {
    write(root, 'src/levels/custom/100-valid/manifest.js', `import Component from '../outside.jsx';
export default { id: id, number: 100, title: 'Valid', concept: 'Testing', severity: 'Low', difficulty: 'Beginner', source: 'agent', generatedAt: '2026-99-99', Component, files: ['../outside.jsx'], symptom: 'Visible symptom.', lesson: ['One'], checks: [{ name: label, run: async () => {} }] };`);
    const result = inspectCurriculum(root);
    assert.match(result.errors.join('\n'), /literal/);
    assert.match(result.errors.join('\n'), /escapes its level folder/);
    assert.match(result.errors.join('\n'), /valid calendar date/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('removeLevels removes complete solution sections and rolls back a failed write', () => {
  const root = fixture();
  try {
    const outcome = removeLevels(root, ['100-valid']);
    assert.ok(outcome.backupPath);
    assert.doesNotMatch(readFileSync(join(root, 'SOLUTIONS.md'), 'utf8'), /Level 100/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('inspectCurriculum rejects unusable manifest contracts', () => {
  const root = fixture();
  try {
    write(root, 'src/levels/custom/100-valid/manifest.js', `export default { id: '100-valid', number: 100, title: 'Valid', concept: 'Testing', severity: 'Low', difficulty: 'Beginner', source: 'agent', generatedAt: '2026-02-30', Component: null, files: [], symptom: 'Visible symptom.', lesson: [], checks: [] };`);
    const errors = inspectCurriculum(root).errors.join('\n');
    assert.match(errors, /valid calendar date/);
    assert.match(errors, /Component must reference/);
    assert.match(errors, /files must be a nonempty/);
    assert.match(errors, /lesson must be a nonempty/);
    assert.match(errors, /checks must be a nonempty/);
    assert.deepEqual(inspectCurriculum(root).levels, [], 'invalid metadata must not reach shell navigation');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('instructional strings and comments may name restricted browser APIs', () => {
  const root = fixture();
  try {
    const file = join(root, 'src/levels/custom/100-valid/manifest.js');
    writeFileSync(file, readFileSync(file, 'utf8').replace("lesson: ['One']", "lesson: ['Avoid fetch and localStorage in an exercise.']") + '\n// eval and Function are prohibited.\n');
    assert.deepEqual(inspectCurriculum(root).errors, []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('linked level directories outside the curriculum are rejected', () => {
  const root = fixture();
  try {
    const path = join(root, 'src/levels/custom/100-valid');
    const outside = join(root, 'external-level');
    renameSync(path, outside);
    symlinkSync(outside, path, 'junction');
    const result = inspectCurriculum(root);
    assert.match(result.errors.join('\n'), /linked|outside|escape/i);
    assert.equal(result.levels.length, 0);
    assert.throws(() => removeLevels(root, ['100-valid']), /unknown|linked|outside|escape/i);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('displayed source references cannot escape through a linked directory', () => {
  const root = fixture();
  try {
    const outside = join(root, 'external-source');
    mkdirSync(outside);
    writeFileSync(join(outside, 'Other.js'), 'export const value = 1;');
    symlinkSync(outside, join(root, 'src/levels/custom/100-valid/linked'), 'junction');
    const file = join(root, 'src/levels/custom/100-valid/manifest.js');
    writeFileSync(file, readFileSync(file, 'utf8').replace("files: ['src/levels/custom/100-valid/Widget.jsx']", "files: ['src/levels/custom/100-valid/linked/Other.js']"));
    assert.match(inspectCurriculum(root).errors.join('\n'), /files.*escape/i);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('inspectCurriculum scans side-effect and nested import graph', () => {
  const root = fixture();
  try {
    write(root, 'src/levels/custom/100-valid/Widget.jsx', `import './nested.js'; export default function Widget() { return <button data-testid="ok" />; }`);
    write(root, 'src/levels/custom/100-valid/nested.js', `import 'outside-package';`);
    const errors = inspectCurriculum(root).errors.join('\n');
    assert.match(errors, /external import 'outside-package'/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('inspectCurriculum rejects CommonJS imports and re-export escapes', () => {
  const root = fixture();
  try {
    write(root, 'src/levels/custom/100-valid/Widget.jsx', `export * from '../other.js'; const packageValue = require('outside-package'); export default function Widget() { return <button data-testid="ok" />; }`);
    const errors = inspectCurriculum(root).errors.join('\n');
    assert.match(errors, /import escapes its level folder/);
    assert.match(errors, /CommonJS require is not allowed/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('removeLevels restores metadata and folder after an injected write failure', () => {
  const root = fixture();
  try {
    const beforeHints = readFileSync(join(root, 'src/levels/hints.json'), 'utf8');
    const beforeSolutions = readFileSync(join(root, 'SOLUTIONS.md'), 'utf8');
    assert.throws(() => removeLevels(root, ['100-valid'], { afterWrite(step) { if (step === '100-valid') throw Error('simulated failure'); } }), /original files restored/);
    assert.equal(readFileSync(join(root, 'src/levels/hints.json'), 'utf8'), beforeHints);
    assert.equal(readFileSync(join(root, 'SOLUTIONS.md'), 'utf8'), beforeSolutions);
    assert.ok(readFileSync(join(root, 'src/levels/custom/100-valid/Widget.jsx'), 'utf8').includes('data-testid'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('inspectCurriculum rejects an orphan encoded solution body without a heading', () => {
  const root = fixture();
  try {
    write(root, 'SOLUTIONS.md', '# Solutions\n\n```\nYnl0ZXM=\n```\n\n## Level 100 — Valid\n\n```\nYnl0ZXM=\n```\n');
    assert.match(inspectCurriculum(root).errors.join('\n'), /orphaned encoded solution body/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
