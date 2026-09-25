import test from 'node:test';
import assert from 'node:assert/strict';
import { runExerciseCheck } from '../src/shell/runtime/frame-check.js';

function environment() {
  const listeners = new Set();
  const frames = [];
  const win = { location: { href: 'http://localhost/index.html', origin: 'http://localhost' }, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn) };
  const doc = { createElement: () => ({ style: {}, contentWindow: {}, setAttribute() {}, remove() { this.removed = true; } }), body: { appendChild: (frame) => frames.push(frame) } };
  function send(data, { source = frames[0].contentWindow, origin = win.location.origin } = {}) {
    const channel = new URL(frames[0].src).searchParams.get('channel');
    for (const listener of listeners) listener({ source, origin, data: { channel, ...data } });
  }
  return { win, doc, frames, listeners, send };
}

test('a valid result removes its frame and listener before resolving', async () => {
  const env = environment();
  const pending = runExerciseCheck('100-demo', 0, { ...env, frameUrl: '/exercise.html', name: 'Behavior' });
  env.send({ type: 'result', result: { pass: true } });
  assert.deepEqual(await pending, { name: 'Behavior', pass: true });
  assert.equal(env.frames[0].removed, true);
  assert.equal(env.listeners.size, 0);
});

test('abandonment releases a pending frame immediately', async () => {
  const env = environment();
  const controller = new AbortController();
  const pending = runExerciseCheck('100-demo', 0, { ...env, frameUrl: '/exercise.html', signal: controller.signal });
  controller.abort();
  assert.equal(env.frames[0].removed, true);
  assert.equal((await pending).pass, false);
  assert.equal(env.listeners.size, 0);
});

test('wrong source, origin, channel, and malformed success cannot complete a check', async () => {
  const env = environment();
  const pending = runExerciseCheck('100-demo', 0, { ...env, frameUrl: '/exercise.html', timeoutMs: 15 });
  env.send({ type: 'result', result: { pass: true } }, { source: {} });
  env.send({ type: 'result', result: { pass: true } }, { origin: 'http://elsewhere' });
  env.send({ channel: 'stale', type: 'result', result: { pass: true } });
  env.send({ type: 'result', result: { pass: 'true' } });
  const result = await pending;
  assert.equal(result.pass, false);
  assert.match(result.message, /timed out/i);
  assert.equal(env.frames[0].removed, true);
});

test('load failures return an explicit failed result and release the frame', async () => {
  const env = environment();
  const pending = runExerciseCheck('100-demo', 0, { ...env, frameUrl: '/exercise.html' });
  env.send({ type: 'error', message: 'Exercise could not load.' });
  assert.match((await pending).message, /could not load/);
  assert.equal(env.frames[0].removed, true);
});
