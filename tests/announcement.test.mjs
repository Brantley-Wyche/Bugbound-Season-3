import test from 'node:test';
import assert from 'node:assert/strict';
import { nextAnnouncement } from '../src/shell/announcement.js';

test('a first message is announced as written', () => {
  assert.equal(nextAnnouncement('', 'Path copied.'), 'Path copied.');
});

test('a repeated message gains a no-break space so the live region changes', () => {
  assert.equal(nextAnnouncement('Path copied.', 'Path copied.'), 'Path copied. ');
});

test('repeats alternate, so every copy produces different region text', () => {
  let last = '';
  const texts = [];
  for (let i = 0; i < 4; i += 1) {
    last = nextAnnouncement(last, 'Ready to paste into your coding agent.');
    texts.push(last);
  }
  for (let i = 1; i < texts.length; i += 1) assert.notEqual(texts[i], texts[i - 1]);
  assert.ok(texts.every((text) => text.trim() === 'Ready to paste into your coding agent.'));
});

test('a different message is announced as written', () => {
  assert.equal(nextAnnouncement('Path copied. ', 'Select the path and copy it manually.'), 'Select the path and copy it manually.');
});

test('an empty message clears the region', () => {
  assert.equal(nextAnnouncement('Path copied.', ''), '');
});
