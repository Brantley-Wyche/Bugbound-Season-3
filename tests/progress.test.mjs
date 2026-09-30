import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeCompleted, createProgressController } from '../src/shell/progress/progress.js';
import {
  recordCheckRun, recordHintReveal, recordVisit, recordReset, createLearningProfile,
  getLearningSnapshot, readingsFor, lastWorkedId, MAX_EVENTS,
} from '../src/shell/progress/learning.js';

class MemoryStorage {
  constructor(values = {}) {
    this.values = new Map(Object.entries(values));
    this.failReads = false;
    this.failWrites = false;
  }

  get length() {
    if (this.failReads) throw new Error('storage read denied');
    return this.values.size;
  }

  key(index) {
    if (this.failReads) throw new Error('storage read denied');
    return [...this.values.keys()][index] ?? null;
  }

  getItem(key) {
    if (this.failReads) throw new Error('storage read denied');
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    if (this.failWrites) throw new Error('storage write denied');
    this.values.set(key, String(value));
  }

  removeItem(key) {
    if (this.failWrites) throw new Error('storage write denied');
    this.values.delete(key);
  }
}

test('completed progress keeps only levels in the active cartridge', () => {
  const completed = sanitizeCompleted(
    ['01-broken-badge', '16-generated-level', 'deleted-level'],
    ['01-broken-badge', '16-generated-level'],
  );

  assert.deepEqual([...completed], ['01-broken-badge', '16-generated-level']);
});

test('completed progress remains compatible when no cartridge is supplied', () => {
  const completed = sanitizeCompleted(['01-broken-badge'], []);
  assert.deepEqual([...completed], ['01-broken-badge']);
});

test('independent completions from separate controllers both survive', () => {
  const storage = new MemoryStorage();
  const first = createProgressController(['a', 'b'], { storage });
  const second = createProgressController(['a', 'b'], { storage });

  first.markComplete('a');
  second.markComplete('b');

  assert.deepEqual([...first.reload().completed].sort(), ['a', 'b']);
  assert.deepEqual([...second.reload().completed].sort(), ['a', 'b']);
});

test('a completion saved by a stale controller cannot resurrect a reset generation', () => {
  const storage = new MemoryStorage();
  const stale = createProgressController(['a', 'b'], { storage });
  const fresh = createProgressController(['a', 'b'], { storage });

  stale.markComplete('a');
  fresh.resetProgress();
  stale.markComplete('b');

  assert.deepEqual([...fresh.reload().completed], []);
});

test('an unreadable legacy value blocks completion writes until retry can read it', () => {
  const storage = new MemoryStorage({ 'bugbound:progress:v1': JSON.stringify(['a']) });
  const controller = createProgressController(['a', 'b'], { storage });
  storage.failReads = true;

  controller.reload();
  controller.markComplete('b');

  assert.equal(controller.getSnapshot().failure.operation, 'read');
  assert.equal(storage.values.has('bugbound:progress:v2:meta'), false);

  storage.failReads = false;
  controller.retry();

  assert.deepEqual([...controller.getSnapshot().completed].sort(), ['a', 'b']);
});

test('retry saves every pending completion after a transient write failure', () => {
  const storage = new MemoryStorage();
  const controller = createProgressController(['a', 'b'], { storage });
  storage.failWrites = true;

  controller.markComplete('a');
  controller.markComplete('b');
  assert.equal(controller.getSnapshot().failure.operation, 'save');

  storage.failWrites = false;
  controller.retry();

  assert.deepEqual([...controller.getSnapshot().completed].sort(), ['a', 'b']);
  assert.equal(controller.getSnapshot().failure, null);
});

test('a result without a readable initial generation cannot be saved across a reset', () => {
  const storage = new MemoryStorage();
  storage.failReads = true;
  const uncertain = createProgressController(['a'], { storage });
  uncertain.markComplete('a');
  storage.failReads = false;
  const otherTab = createProgressController(['a'], { storage });
  otherTab.resetProgress();
  uncertain.retry();
  assert.deepEqual([...uncertain.getSnapshot().completed], []);
  assert.equal(uncertain.getSnapshot().revision, 1);
  uncertain.markComplete('a');
  assert.deepEqual([...uncertain.getSnapshot().completed], ['a']);
});

test('retry preserves already saved records after a partial save outage', () => {
  const storage = new MemoryStorage();
  const controller = createProgressController(['a', 'b', 'c'], { storage });
  controller.markComplete('a');
  storage.failWrites = true;
  controller.markComplete('b');
  controller.markComplete('c');
  storage.failWrites = false;
  controller.retry();
  assert.deepEqual([...controller.getSnapshot().completed].sort(), ['a', 'b', 'c']);
  assert.equal(controller.getSnapshot().failure, null);
});

test('a successful reset discards pending pre-reset completions', () => {
  const storage = new MemoryStorage();
  const controller = createProgressController(['a'], { storage });
  storage.failWrites = true;
  controller.markComplete('a');

  storage.failWrites = false;
  controller.resetProgress();
  controller.retry();

  assert.deepEqual([...controller.getSnapshot().completed], []);
  assert.equal(controller.getSnapshot().revision, 1);
});

test('denied reads prevent reset metadata from hiding unread progress', () => {
  const storage = new MemoryStorage({ 'bugbound:progress:v1': JSON.stringify(['a']) });
  const controller = createProgressController(['a'], { storage });
  storage.failReads = true;
  controller.resetProgress();
  assert.equal(controller.getSnapshot().failure.operation, 'reset');
  assert.equal(storage.values.has('bugbound:progress:v2:meta'), false);
  storage.failReads = false;
  controller.retry();
  assert.deepEqual([...controller.getSnapshot().completed], []);
});

test('corrupt legacy progress remains untouched and blocks new completion writes', () => {
  const storage = new MemoryStorage({ 'bugbound:progress:v1': '{broken' });
  const controller = createProgressController(['a'], { storage });
  controller.markComplete('a');
  assert.equal(controller.getSnapshot().failure.operation, 'read');
  assert.equal(storage.values.has('bugbound:progress:v2:meta'), false);
  assert.equal([...storage.values.keys()].some((key) => key.includes(':event:')), false);
});

test('learning history is not overwritten when its read fails', () => {
  const storage = new MemoryStorage({ 'bugbound:learning:v1': JSON.stringify({ version: 1, levels: { a: { checkRuns: 2 } } }) });
  storage.failReads = true;
  const original = globalThis.localStorage;
  globalThis.localStorage = storage;
  try {
    const result = recordCheckRun('b', [{ pass: true }]);
    assert.equal(result.ok, false);
    assert.equal(result.operation, 'read');
    assert.equal(JSON.parse(storage.values.get('bugbound:learning:v1')).levels.a.checkRuns, 2);
    assert.throws(() => createLearningProfile([{ id: 'a', number: 1, title: 'A', concept: 'A' }], new Set()), /read|unavailable/i);
  } finally {
    globalThis.localStorage = original;
  }
});

test('legacy completion is visible until reset and legacy bytes remain intact', () => {
  const raw = JSON.stringify(['a']);
  const storage = new MemoryStorage({ 'bugbound:progress:v1': raw });
  const controller = createProgressController(['a', 'b'], { storage });
  assert.deepEqual([...controller.getSnapshot().completed], ['a']);
  controller.markComplete('b');
  assert.deepEqual([...controller.reload().completed].sort(), ['a', 'b']);
  controller.resetProgress();
  assert.deepEqual([...controller.getSnapshot().completed], []);
  assert.equal(storage.values.get('bugbound:progress:v1'), raw);
});

test('cross-tab reload publishes completion and reset revision', () => {
  const storage = new MemoryStorage();
  const first = createProgressController(['a'], { storage });
  const second = createProgressController(['a'], { storage });
  let notifications = 0;
  const unsubscribe = second.subscribe(() => { notifications++; });
  first.markComplete('a');
  second.reload();
  assert.equal(second.getSnapshot().completed.has('a'), true);
  first.resetProgress();
  second.reload();
  assert.equal(second.getSnapshot().completed.has('a'), false);
  assert.equal(second.getSnapshot().revision, 1);
  assert.ok(notifications >= 2);
  unsubscribe();
});

test('learning save failure reports failure without dropping previous history', () => {
  const raw = JSON.stringify({ version: 1, levels: { a: { checkRuns: 2 } } });
  const storage = new MemoryStorage({ 'bugbound:learning:v1': raw });
  storage.failWrites = true;
  const original = globalThis.localStorage;
  globalThis.localStorage = storage;
  try {
    const result = recordCheckRun('a', [{ pass: true }]);
    assert.equal(result.operation, 'save');
    assert.equal(storage.values.get('bugbound:learning:v1'), raw);
  } finally {
    globalThis.localStorage = original;
  }
});

test('malformed learning history is never replaced by an empty record', () => {
  const storage = new MemoryStorage({ 'bugbound:learning:v1': '{broken' });
  const original = globalThis.localStorage;
  globalThis.localStorage = storage;
  try {
    assert.equal(recordCheckRun('a', [{ pass: true }]).operation, 'read');
    assert.equal(storage.values.get('bugbound:learning:v1'), '{broken');
    assert.throws(() => createLearningProfile([], new Set()), /history unavailable/i);
  } finally {
    globalThis.localStorage = original;
  }
});

test('unavailable browser storage becomes a recoverable read failure', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() { throw new Error('storage unavailable'); },
  });
  try {
    const controller = createProgressController(['a']);
    assert.equal(controller.getSnapshot().failure.operation, 'read');
    assert.match(controller.getSnapshot().failure.message, /unavailable/);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('malformed per-level learning history never breaks the practice interaction', () => {
  const raw = JSON.stringify({ version: 1, levels: { a: { hintsRevealed: 42 } } });
  const original = globalThis.localStorage;
  const storage = new MemoryStorage({ 'bugbound:learning:v1': raw });
  globalThis.localStorage = storage;
  try {
    assert.equal(recordHintReveal('a', 1).operation, 'read');
    assert.equal(storage.getItem('bugbound:learning:v1'), raw);
  } finally { globalThis.localStorage = original; }
});

test('profile export refuses an uncertain completion snapshot', () => {
  const original = globalThis.localStorage;
  globalThis.localStorage = new MemoryStorage();
  try { assert.throws(() => createLearningProfile([], new Set(), { operation: 'read' }), /saved repairs/i); }
  finally { globalThis.localStorage = original; }
});

function withLocalStorage(storage, run) {
  const original = globalThis.localStorage;
  globalThis.localStorage = storage;
  try { return run(); } finally { globalThis.localStorage = original; }
}

test('a repair is recorded with its time and run number and survives a reload', () => {
  const storage = new MemoryStorage();
  const controller = createProgressController(['a'], { storage });
  controller.markComplete('a', { at: '2026-09-24T14:31:00.000Z', run: 4 });
  const other = createProgressController(['a'], { storage });
  assert.deepEqual(other.getSnapshot().records.get('a'), { at: '2026-09-24T14:31:00.000Z', run: 4 });
  assert.equal(other.getSnapshot().unsaved.size, 0);
});

test('the earliest record of a repair wins when two tabs recorded it', () => {
  const storage = new MemoryStorage({
    'bugbound:progress:v2:event:initial:x': JSON.stringify({ version: 2, generation: 'initial', id: 'a', at: '2026-09-24T15:00:00.000Z', run: 5 }),
    'bugbound:progress:v2:event:initial:y': JSON.stringify({ version: 2, generation: 'initial', id: 'a', at: '2026-09-24T14:31:00.000Z', run: 4 }),
  });
  assert.deepEqual(createProgressController(['a'], { storage }).getSnapshot().records.get('a'), { at: '2026-09-24T14:31:00.000Z', run: 4 });
});

test('a second tab does not record a repair that is already saved', () => {
  const storage = new MemoryStorage();
  const first = createProgressController(['a'], { storage });
  const second = createProgressController(['a'], { storage });
  first.markComplete('a', { at: '2026-09-24T14:31:00.000Z', run: 4 });
  second.markComplete('a', { at: '2026-09-24T15:00:00.000Z', run: 5 });
  assert.equal([...storage.values.keys()].filter((key) => key.includes(':event:')).length, 1);
  assert.equal(second.getSnapshot().records.get('a').run, 4);
});

test('a repair that could not be saved stays visible as unsaved until retry', () => {
  const storage = new MemoryStorage();
  const controller = createProgressController(['a'], { storage });
  storage.failWrites = true;
  controller.markComplete('a', { at: '2026-09-24T14:31:00.000Z', run: 2 });
  assert.equal(controller.getSnapshot().completed.has('a'), true);
  assert.equal(controller.getSnapshot().unsaved.has('a'), true);
  assert.equal(controller.getSnapshot().records.get('a').run, 2);
  storage.failWrites = false;
  controller.retry();
  assert.equal(controller.getSnapshot().unsaved.size, 0);
  assert.equal(createProgressController(['a'], { storage }).getSnapshot().records.get('a').run, 2);
});

test('older completion records without a time still read as repaired', () => {
  const storage = new MemoryStorage({
    'bugbound:progress:v2:event:initial:x': JSON.stringify({ version: 2, generation: 'initial', id: 'a' }),
  });
  const snapshot = createProgressController(['a'], { storage }).getSnapshot();
  assert.equal(snapshot.completed.has('a'), true);
  assert.deepEqual(snapshot.records.get('a'), { at: null, run: null });
});

test('a record with an invalid run number is reported, not trusted', () => {
  const storage = new MemoryStorage({
    'bugbound:progress:v2:event:initial:x': JSON.stringify({ version: 2, generation: 'initial', id: 'a', run: 0 }),
  });
  assert.equal(createProgressController(['a'], { storage }).getSnapshot().failure.operation, 'read');
});

test('runs are numbered across visits and logged with their pass counts', () => {
  withLocalStorage(new MemoryStorage(), () => {
    assert.equal(recordCheckRun('a', [{ pass: true }, { pass: false }]).run, 1);
    const second = recordCheckRun('a', [{ pass: true }, { pass: true }]);
    assert.equal(second.run, 2);
    const { runEvents, runs } = readingsFor(getLearningSnapshot().store, 'a');
    assert.equal(runs, 2);
    assert.deepEqual(runEvents.map(({ run, passed, total }) => [run, passed, total]), [[1, 1, 2], [2, 2, 2]]);
  });
});

test('a hint tier is logged the first time it opens, by number only', () => {
  withLocalStorage(new MemoryStorage(), () => {
    recordHintReveal('a', 1);
    recordHintReveal('a', 1);
    recordHintReveal('a', 2);
    const hints = readingsFor(getLearningSnapshot().store, 'a').entries.filter((entry) => entry.type === 'hint');
    assert.deepEqual(hints.map((entry) => entry.tier).sort(), [1, 2]);
    assert.deepEqual(Object.keys(hints[0]).sort(), ['at', 'tier', 'type']);
  });
});

test('only a first visit is logged, and it does not count as work', () => {
  withLocalStorage(new MemoryStorage(), () => {
    recordVisit('a');
    recordVisit('a');
    const readings = readingsFor(getLearningSnapshot().store, 'a');
    assert.deepEqual(readings.entries.map((entry) => entry.type), ['opened']);
    assert.equal(readings.lastWorked, null);
    recordCheckRun('b', [{ pass: false }]);
    recordVisit('b');
    assert.equal(readingsFor(getLearningSnapshot().store, 'b').entries.some((entry) => entry.type === 'opened'), false);
  });
});

test('the event log keeps the newest entries while the run count keeps growing', () => {
  withLocalStorage(new MemoryStorage(), () => {
    for (let index = 0; index < MAX_EVENTS + 5; index++) recordCheckRun('a', [{ pass: false }]);
    const readings = readingsFor(getLearningSnapshot().store, 'a');
    assert.equal(readings.entries.length, MAX_EVENTS);
    assert.equal(readings.runs, MAX_EVENTS + 5);
    assert.equal(readings.runEvents.at(-1).run, MAX_EVENTS + 5);
  });
});

test('a reset appears only in readings that began before it', () => {
  const storage = new MemoryStorage({ 'bugbound:learning:v1': JSON.stringify({
    version: 1,
    levels: { a: { checkRuns: 1, events: [{ type: 'run', at: '2026-09-20T10:00:00.000Z', run: 1, passed: 0, total: 1 }] } },
  }) });
  withLocalStorage(storage, () => {
    recordReset();
    const store = getLearningSnapshot().store;
    assert.equal(readingsFor(store, 'a').entries[0].type, 'reset');
    assert.deepEqual(readingsFor(store, 'b').entries, []);
  });
});

test('the latest work names the most recently worked incident', () => {
  withLocalStorage(new MemoryStorage({ 'bugbound:learning:v1': JSON.stringify({
    version: 1,
    levels: { a: { lastPracticedAt: '2026-09-20T10:00:00.000Z' }, b: { lastPracticedAt: '2026-09-24T10:00:00.000Z' } },
  }) }), () => {
    assert.equal(lastWorkedId(getLearningSnapshot().store, ['a', 'b', 'c']), 'b');
    assert.equal(lastWorkedId(getLearningSnapshot().store, ['c']), null);
  });
});

test('malformed readings surface as an error snapshot without throwing', () => {
  withLocalStorage(new MemoryStorage({ 'bugbound:learning:v1': JSON.stringify({ version: 1, levels: { a: { events: [{ type: 'run', at: 'x' }] } } }) }), () => {
    const snapshot = getLearningSnapshot();
    assert.match(snapshot.error, /could not read/i);
    assert.deepEqual(snapshot.store.levels, {});
    assert.equal(getLearningSnapshot(), snapshot);
  });
});
