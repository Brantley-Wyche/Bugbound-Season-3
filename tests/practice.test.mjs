import test from 'node:test';
import assert from 'node:assert/strict';
import { getPracticeLevels, recommendChallenge, filterChallenges, groupBatches, benchIncident } from '../src/shell/workspace/practice.js';

const levels = Object.freeze([
  Object.freeze({ id: '01-first', number: 1, title: 'First challenge', concept: 'Rendering' }),
  Object.freeze({ id: '15-capstone', number: 15, title: 'Capstone', concept: 'TypeScript' }),
  Object.freeze({ id: '16-timer', number: 16, title: 'Timer desk', concept: 'Effect cleanup' }),
  Object.freeze({ id: '17-search', number: 17, title: 'Search panel', concept: 'Async UI state' }),
]);

const ids = (items) => items.map((level) => level.id);

test('generated practice includes every generated entry without completion gates', () => {
  assert.deepEqual(ids(getPracticeLevels(levels)), ['16-timer', '17-search']);
});

test('foundations includes the boundary level and all returns the full catalog', () => {
  assert.deepEqual(ids(getPracticeLevels(levels, 'foundations')), ['01-first', '15-capstone']);
  assert.deepEqual(ids(getPracticeLevels(levels, 'all')), [
    '01-first', '15-capstone', '16-timer', '17-search',
  ]);
  assert.notEqual(getPracticeLevels(levels, 'all'), levels);
});

test('collections preserve supplied order and level identities', () => {
  const reordered = Object.freeze([levels[3], levels[0], levels[2]]);
  const result = getPracticeLevels(reordered);
  assert.deepEqual(ids(result), ['17-search', '16-timer']);
  assert.equal(result[0], levels[3]);
});

test('recommendations choose the first unfinished entry in supplied order', () => {
  const completed = new Set(['01-first', '15-capstone']);
  const result = recommendChallenge(levels, completed);
  assert.equal(result.level, levels[2]);
  assert.match(result.reason, /next available/i);
  assert.match(result.reason, /Effect cleanup/);
  assert.deepEqual([...completed], ['01-first', '15-capstone']);
});

test('recommendations prefer a different unfinished challenge from the last opened one', () => {
  const result = recommendChallenge(levels, new Set(['01-first', '15-capstone']), '16-timer');
  assert.equal(result.level, levels[3]);
});

test('the last opened challenge remains recommendable when it is the only unfinished entry', () => {
  const result = recommendChallenge(levels, new Set(['01-first', '15-capstone', '17-search']), '16-timer');
  assert.equal(result.level, levels[2]);
});

test('recommendations return null for empty or fully completed catalogs', () => {
  assert.equal(recommendChallenge([], new Set()), null);
  assert.equal(recommendChallenge(levels, new Set(ids(levels)), '17-search'), null);
});

test('search matches titles, concepts, and ids without case or surrounding-space sensitivity', () => {
  assert.deepEqual(ids(filterChallenges(levels, { query: ' TIMER DESK ' }, new Set())), ['16-timer']);
  assert.deepEqual(ids(filterChallenges(levels, { query: 'cleanup' }, new Set())), ['16-timer']);
  assert.deepEqual(ids(filterChallenges(levels, { query: '17-SEARCH' }, new Set())), ['17-search']);
});

test('status filters use saved completion while retaining catalog order', () => {
  const completed = new Set(['15-capstone', '17-search', 'removed-id']);
  assert.deepEqual(ids(filterChallenges(levels, { status: 'open' }, completed)), ['01-first', '16-timer']);
  assert.deepEqual(ids(filterChallenges(levels, { status: 'completed' }, completed)), ['15-capstone', '17-search']);
  assert.deepEqual(ids(filterChallenges(levels, { status: 'all' }, completed)), [
    '01-first', '15-capstone', '16-timer', '17-search',
  ]);
  assert.deepEqual([...completed], ['15-capstone', '17-search', 'removed-id']);
});

test('search and status filters combine and support empty or unmatched results', () => {
  assert.deepEqual(filterChallenges(levels, { query: 'cleanup', status: 'completed' }, new Set()), []);
  assert.deepEqual(filterChallenges(levels, { query: 'missing' }, new Set()), []);
  assert.deepEqual(filterChallenges([], {}, new Set()), []);
  assert.deepEqual(ids(filterChallenges(levels, {}, new Set())), ['01-first', '15-capstone', '16-timer', '17-search']);
});

test('generated incidents group by generation date, newest batch first', () => {
  const generated = [
    { id: '16-a', number: 16, generatedAt: '2026-07-04' },
    { id: '17-b', number: 17, generatedAt: '2026-07-04' },
    { id: '18-c', number: 18, generatedAt: '2026-09-02' },
    { id: '19-d', number: 19 },
  ];
  const batches = groupBatches(generated);
  assert.deepEqual(batches.map((batch) => [batch.date, ids(batch.levels)]), [
    ['2026-09-02', ['18-c']], ['2026-07-04', ['16-a', '17-b']], [null, ['19-d']],
  ]);
});

test('the bench holds the unrepaired incident worked last, else the next open one', () => {
  assert.equal(benchIncident(levels, new Set(), '01-first').level.id, '01-first');
  assert.equal(benchIncident(levels, new Set(), '01-first').continuing, true);
  const next = benchIncident(levels, new Set(['16-timer']), '16-timer');
  assert.equal(next.level.id, '17-search');
  assert.equal(next.continuing, false);
  assert.equal(benchIncident(levels, new Set(['16-timer', '17-search']), null).level.id, '01-first');
  assert.equal(benchIncident(levels, new Set(ids(levels)), '16-timer'), null);
});