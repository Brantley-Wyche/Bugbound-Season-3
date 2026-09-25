import { useEffect, useRef, useState } from 'react';
import { startExerciseRuntime } from '../../src/shell/runtime/exercise-runtime.jsx';

let mounts = 0;
function Good() { return <div data-testid="good">Ready</div>; }
function Controls() {
  const input = useRef(null);
  const [value, setValue] = useState('');
  const [choice, setChoice] = useState('a');
  useEffect(() => { input.current.focus(); }, []);
  return <div><input ref={input} data-testid="input" value={value} onChange={(event) => setValue(event.target.value)} />
    <select data-testid="select" value={choice} onChange={(event) => setChoice(event.target.value)}><option>a</option><option>b</option></select>
    <output data-testid="output">{value}:{choice}</output></div>;
}
function Crash() { throw new Error('Synthetic render failure'); }
function CleanupCrash() {
  useEffect(() => () => { throw new Error('Synthetic cleanup failure'); }, []);
  return <Good />;
}
function GlobalCrash() {
  useEffect(() => {
    const timer = setTimeout(() => { throw new Error('Synthetic async failure'); }, 20);
    return () => clearTimeout(timer);
  }, []);
  return <Good />;
}
function Fresh() {
  const [value, setValue] = useState(0);
  useEffect(() => { mounts++; setValue(mounts); }, []);
  return <span data-testid="mounts">{value}</span>;
}
const cases = {
  good: { Component: Good, run: async (h) => h.waitFor(() => h.text('[data-testid="good"]') === 'Ready') },
  controls: { Component: Controls, run: async (h) => {
    h.ok(h.get('[data-testid="input"]') === document.activeElement, 'Focus is owned by the exercise document.');
    await h.type('[data-testid="input"]', 'typed');
    await h.selectOption('[data-testid="select"]', 'b');
    h.ok(h.text('[data-testid="output"]') === 'typed:b', 'Native input/select helpers update React state.');
  } },
  crash: { Component: Crash, run: async () => {} },
  cleanup: { Component: CleanupCrash, run: async () => {} },
  async: { Component: GlobalCrash, run: async (h) => h.pause(80) },
  pending: { Component: Good, run: () => new Promise(() => {}) },
  fresh: { Component: Fresh, run: async (h) => h.waitFor(() => h.text('[data-testid="mounts"]') === '1') },
};
startExerciseRuntime(async (id) => {
  if (id === 'invalid') return { id, Component: null, checks: [] };
  if (!cases[id]) throw new Error('Synthetic module load failure');
  return { id, Component: cases[id].Component, checks: [{ name: id, run: cases[id].run }] };
});
