import { createElement, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { runCheck } from './harness.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

export function validateExecutableLevel(level, expectedId) {
  if (!level || level.id !== expectedId || !level.Component || !['function', 'object'].includes(typeof level.Component)
    || !Array.isArray(level.checks) || !level.checks.length
    || level.checks.some((check) => typeof check.name !== 'string' || !check.name.trim() || typeof check.run !== 'function')) {
    throw new Error('The incident manifest is incomplete. Ask your agent to validate it before continuing.');
  }
  return level;
}

export async function startExerciseRuntime(loadLevel) {
  const params = new URLSearchParams(location.search);
  const channel = params.get('channel');
  const id = params.get('id');
  if (!channel || !id || window.parent === window) return;
  const post = (data) => window.parent.postMessage({ channel, ...data }, location.origin);
  try {
    const level = validateExecutableLevel(await loadLevel(id), id);
    if (params.get('mode') === 'check') {
      const index = Number(params.get('check'));
      if (!Number.isInteger(index) || !level.checks[index]) throw new Error('The requested behavioral check is missing.');
      post({ type: 'ready' });
      const requestedTimeout = Number(params.get('timeout'));
      const timeoutMs = requestedTimeout > 0 ? Math.min(15000, requestedTimeout) : 15000;
      const result = await runCheck(level.Component, level.checks[index], { timeoutMs });
      post({ type: 'result', result });
      return;
    }
    const root = createRoot(document.getElementById('exercise-root'), {
      onUncaughtError: (error) => post({ type: 'error', message: String(error?.message || error) }),
    });
    function Preview() {
      useEffect(() => {
        const resize = () => post({ type: 'resize', height: document.getElementById('exercise-root').getBoundingClientRect().height });
        const observer = new ResizeObserver(resize);
        observer.observe(document.getElementById('exercise-root'));
        resize();
        post({ type: 'ready' });
        return () => observer.disconnect();
      }, []);
      return createElement(ErrorBoundary, null, createElement(level.Component));
    }
    root.render(createElement(Preview));
  } catch (error) {
    post({ type: 'error', message: `The incident could not load: ${String(error?.message || error)}` });
  }
}
