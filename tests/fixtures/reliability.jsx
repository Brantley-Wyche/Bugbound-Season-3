import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { runExerciseCheck } from '../../src/shell/runtime/frame-check.js';
import ExercisePreview from '../../src/shell/runtime/ExercisePreview.jsx';
import { levels } from '../../src/levels/index.js';

function App() {
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  async function synthetic() {
    setBusy(true);
    const results = [];
    const frameUrl = '/tests/fixtures/exercise.html';
    for (const [id, expected] of [['good', true], ['controls', true], ['crash', false], ['cleanup', false], ['async', false], ['pending', false], ['fresh', true], ['fresh', true], ['missing', false], ['invalid', false]]) {
      const result = await runExerciseCheck(id, 0, { frameUrl, timeoutMs: id === 'pending' ? 600 : 8000, name: id });
      results.push({ id, expected, ...result, matched: result.pass === expected });
      setResults([...results]);
    }
    const notReady = await runExerciseCheck('good', 0, { frameUrl: '/tests/fixtures/no-ready.html', timeoutMs: 400 });
    results.push({ id: 'missing readiness', ...notReady, matched: !notReady.pass });
    const controller = new AbortController();
    const abandoned = runExerciseCheck('pending', 0, { frameUrl, signal: controller.signal });
    controller.abort();
    const cancellation = await abandoned;
    results.push({ id: 'cancel', ...cancellation, matched: !cancellation.pass && !document.querySelector('iframe[aria-hidden="true"]') });
    setResults([...results]);
    setBusy(false);
  }
  async function curriculum() {
    setBusy(true);
    const results = [];
    for (const level of levels) {
      const checks = [];
      for (let index = 0; index < level.checks.length; index++) {
        const { pass } = await runExerciseCheck(level.id, index, { name: level.checks[index].name });
        checks.push(pass);
      }
      results.push({ id: level.id, checks: checks.length, passed: checks.filter(Boolean).length, failed: checks.filter((pass) => !pass).length });
      setResults([...results]);
    }
    setBusy(false);
  }
  return <main>
    <h1>Season 3 reliability checks</h1>
    <p>Disposable synthetic exercises test the actual frame/harness modules. Curriculum runs never save completion, reveal hints, or edit source.</p>
    <button disabled={busy} onClick={synthetic}>Run synthetic regression suite</button>
    <button disabled={busy} onClick={curriculum}>Check protected curriculum compatibility</button>
    <p role="status">{busy ? 'Running' : 'Ready'}</p>
    <h2>Independent preview</h2>
    <ExercisePreview levelId="fresh" title="Fresh module state" frameUrl="/tests/fixtures/exercise.html" />
    <pre aria-label="Regression results">{JSON.stringify(results, null, 2)}</pre>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
