import test from 'node:test';
import assert from 'node:assert/strict';
import { createAgentBrief } from '../src/shell/authoring/brief.js';

test('an empty draft produces one intermediate effect-cleanup challenge for an external agent', () => {
  const brief = createAgentBrief({});
  assert.match(brief, /Generate 1 intermediate Bugbound level about effect cleanup\./);
  assert.match(brief, /external (AI )?coding agent/i);
  assert.ok(brief.split('\n').length > 1);
});

test('the brief includes trimmed topic, selected difficulty, count, and optional context', () => {
  const draft = Object.freeze({
    topic: '  custom hooks  ', difficulty: 'Hard', count: 3,
    context: '  A keyboard-operated dashboard with slow responses.  ',
  });
  const brief = createAgentBrief(draft);
  assert.match(brief, /Generate 3 hard Bugbound levels about custom hooks\./);
  assert.match(brief, /Engineering context: A keyboard-operated dashboard with slow responses\./);
  assert.equal(draft.topic, '  custom hooks  ');
});

test('blank topic and difficulty use defaults and blank context adds no empty section', () => {
  const brief = createAgentBrief({ topic: '  ', difficulty: '  ', context: '\n ' });
  assert.match(brief, /Generate 1 intermediate Bugbound level about effect cleanup\./);
  assert.doesNotMatch(brief, /Engineering context:/);
});

test('the level count is an integer within one to three', () => {
  for (const [count, expected] of [[0, 1], [9, 3], [2.8, 2], ['2', 2], ['invalid', 1], [Infinity, 1]]) {
    assert.match(createAgentBrief({ count }), new RegExp(`Generate ${expected} intermediate Bugbound levels? about`));
  }
});

test('the generated handoff preserves blind mode and repository authoring constraints', () => {
  const brief = createAgentBrief({ topic: 'custom hooks' });
  assert.match(brief, /AGENTS\.md/);
  assert.match(brief, /\.claude\/skills\/bugbound-levelsmith\/SKILL\.md/);
  assert.match(brief, /new .*branch/i);
  assert.match(brief, /blind mode/i);
  assert.match(brief, /never reveal .*cause/i);
  assert.match(brief, /base64/i);
});

test('the generated handoff requires private fail-before and pass-after evidence and restoration', () => {
  const brief = createAgentBrief({});
  assert.match(brief, /checks fail .*planted/i);
  assert.match(brief, /pass .*private.*fix/i);
  assert.match(brief, /restore .*planted.*discard .*fix/i);
  assert.match(brief, /npm run validate-levels/);
  assert.match(brief, /npm test/);
  assert.match(brief, /npm run build/);
  assert.match(brief, /npm run verify-level -- <id>/);
});
