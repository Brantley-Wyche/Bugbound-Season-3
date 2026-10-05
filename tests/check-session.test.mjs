import test from 'node:test';
import assert from 'node:assert/strict';
import { createCheckSession } from '../src/shell/verification/check-session.js';

const checks = Object.freeze([
  Object.freeze({ name: 'First behavior' }),
  Object.freeze({ name: 'Second behavior' }),
]);

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

test('checks run sequentially and expose actual partial and final results', async () => {
  const first = deferred();
  const calls = [];
  const progress = [];
  const complete = [];
  const firstResult = { name: checks[0].name, pass: true };
  const secondResult = { name: checks[1].name, pass: false, message: 'Observed behavior differed.' };
  const session = createCheckSession({
    checks,
    runCheck(check) {
      calls.push(check);
      return check === checks[0] ? first.promise : secondResult;
    },
    onProgress: (results) => progress.push(results),
    onComplete: (outcome) => complete.push(outcome),
  });

  const run = session.run();
  assert.deepEqual(calls, [checks[0]]);
  assert.deepEqual(progress, []);
  first.resolve(firstResult);
  const outcome = await run;

  assert.deepEqual(calls, checks);
  assert.deepEqual(progress, [[firstResult], [firstResult, secondResult]]);
  assert.deepEqual(outcome, { results: [firstResult, secondResult], passed: false });
  assert.deepEqual(complete, [outcome]);
});

test('duplicate starts are ignored synchronously and a completed visit can rerun', async () => {
  const pending = deferred();
  let starts = 0;
  let calls = 0;
  const complete = [];
  const session = createCheckSession({
    checks: [checks[0]],
    onStart: () => { starts += 1; },
    runCheck: () => { calls += 1; return pending.promise; },
    onComplete: (outcome) => complete.push(outcome),
  });

  const firstRun = session.run();
  assert.equal(await session.run(), null);
  assert.equal(starts, 1);
  assert.equal(calls, 1);
  pending.resolve({ name: checks[0].name, pass: true });
  assert.equal((await firstRun).passed, true);
  assert.equal((await session.run()).passed, true);
  assert.equal(calls, 2);
  assert.equal(starts, 2);
  assert.equal(complete.length, 2);
});

test('abandoning a pending run suppresses its results and completion and stops later checks', async () => {
  const pending = deferred();
  const calls = [];
  const progress = [];
  const complete = [];
  const session = createCheckSession({
    checks,
    runCheck: (check) => { calls.push(check); return pending.promise; },
    onProgress: (results) => progress.push(results),
    onComplete: (outcome) => complete.push(outcome),
  });

  const run = session.run();
  session.abandon();
  pending.resolve({ name: checks[0].name, pass: true });

  assert.equal(await run, null);
  assert.equal(await session.run(), null);
  assert.deepEqual(calls, [checks[0]]);
  assert.deepEqual(progress, []);
  assert.deepEqual(complete, []);
});

test('navigation during progress notification also prevents completion and further checks', async () => {
  const calls = [];
  const complete = [];
  const session = createCheckSession({
    checks,
    runCheck: (check) => { calls.push(check); return { name: check.name, pass: true }; },
    onProgress: () => session.abandon(),
    onComplete: (outcome) => complete.push(outcome),
  });

  assert.equal(await session.run(), null);
  assert.deepEqual(calls, [checks[0]]);
  assert.deepEqual(complete, []);
});

test('an empty run never counts as a successful verification', async () => {
  const complete = [];
  const session = createCheckSession({
    checks: [],
    runCheck: () => assert.fail('No check should run.'),
    onComplete: (outcome) => complete.push(outcome),
  });

  const outcome = await session.run();
  assert.deepEqual(outcome, { results: [], passed: false });
  assert.deepEqual(complete, [outcome]);
});

test('a new visit can complete while an abandoned visit is still settling', async () => {
  const oldPending = deferred();
  const oldCompletions = [];
  const newCompletions = [];
  const abandoned = createCheckSession({
    checks: [checks[0]],
    runCheck: () => oldPending.promise,
    onComplete: (outcome) => oldCompletions.push(outcome),
  });
  const oldRun = abandoned.run();
  abandoned.abandon();

  const current = createCheckSession({
    checks: [checks[1]],
    runCheck: (check) => ({ name: check.name, pass: true }),
    onComplete: (outcome) => newCompletions.push(outcome),
  });
  assert.equal((await current.run()).passed, true);
  oldPending.resolve({ name: checks[0].name, pass: true });
  assert.equal(await oldRun, null);
  assert.deepEqual(oldCompletions, []);
  assert.equal(newCompletions.length, 1);
});

test('a rejected check produces a readable failed result without dropping remaining checks', async () => {
  const progress = [];
  const session = createCheckSession({
    checks,
    runCheck(check) {
      if (check === checks[0]) return Promise.reject(new Error('Check could not start.'));
      return { name: check.name, pass: true };
    },
    onProgress: (results) => progress.push(results),
  });

  const outcome = await session.run();
  assert.deepEqual(outcome, {
    results: [
      { name: checks[0].name, pass: false, message: 'Check could not start.' },
      { name: checks[1].name, pass: true },
    ],
    passed: false,
  });
  assert.equal(progress.length, 2);
});

test('abandon aborts the running executor and gives each check its catalog index', async () => {
  let received;
  const pending = deferred();
  const session = createCheckSession({
    checks,
    runCheck(check, options) {
      received = options;
      return pending.promise;
    },
  });
  const running = session.run();
  assert.equal(received?.index, 0);
  assert.equal(received?.signal?.aborted, false);
  session.abandon();
  assert.equal(received.signal.aborted, true);
  pending.resolve({ pass: true });
  assert.equal(await running, null);
});

test('cancel stops the running sequence, reports the checks finished so far, and the visit can run again', async () => {
  const pending = deferred();
  const calls = [];
  const complete = [];
  const cancelled = [];
  const session = createCheckSession({
    checks,
    runCheck: (check, { signal }) => {
      calls.push(check);
      if (check === checks[0]) return { name: check.name, pass: true };
      signal.addEventListener('abort', () => pending.resolve({ name: check.name, pass: false, message: 'Check cancelled.' }));
      return pending.promise;
    },
    onComplete: (outcome) => complete.push(outcome),
    onCancel: (results) => cancelled.push(results),
  });

  const run = session.run();
  await Promise.resolve();
  assert.equal(session.cancel(), true);
  assert.equal(await run, null);
  assert.deepEqual(calls, checks);
  assert.deepEqual(complete, []);
  assert.deepEqual(cancelled, [[{ name: checks[0].name, pass: true }]]);
  assert.equal(session.cancel(), false);

  const rerun = createCheckSession({ checks: [checks[0]], runCheck: (check) => ({ name: check.name, pass: true }) });
  assert.equal((await rerun.run()).passed, true);
  const again = await session.run();
  assert.equal(again.passed, false);
});