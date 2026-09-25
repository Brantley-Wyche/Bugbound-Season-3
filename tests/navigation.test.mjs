import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../src/shell/workspace/navigation.js';

test('the root and existing infinite-mode links open generated practice', () => {
  for (const hash of ['', '#', '#/', '#/infinite']) {
    assert.deepEqual(parseRoute(hash), { page: 'practice', collection: 'generated' });
  }
});

test('foundations and the brief builder have distinct routes', () => {
  assert.deepEqual(parseRoute('#/foundations'), { page: 'practice', collection: 'foundations' });
  assert.deepEqual(parseRoute('#/brief'), { page: 'brief' });
});

test('direct challenge and author verification links retain the exact ID', () => {
  assert.deepEqual(parseRoute('#/level/17-example'), { page: 'level', id: '17-example', verify: false });
  assert.deepEqual(parseRoute('#/verify/17-example'), { page: 'level', id: '17-example', verify: true });
});

test('unknown and malformed routes are recoverable instead of looking like practice', () => {
  for (const hash of ['#/missing', '#/level/', '#/level/a/b', '#/level/%zz']) {
    assert.equal(parseRoute(hash).page, 'missing');
  }
});
