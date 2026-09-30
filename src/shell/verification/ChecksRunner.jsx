import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createCheckSession } from './check-session.js';
import { runExerciseCheck } from '../runtime/frame-check.js';
import { recordCheckRun } from '../progress/learning.js';
import { StatefulButton } from '../../components/motion/button/stateful';

const shortcutKey = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

export default function ChecksRunner({ level, onAllPass, autoRun = false, onStateChange }) {
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [historyFailure, setHistoryFailure] = useState(null);
  const sessionRef = useRef(null);
  const callbacksRef = useRef({ onAllPass, onStateChange });
  const { id, checks } = level;

  useLayoutEffect(() => {
    callbacksRef.current = { onAllPass, onStateChange };
  }, [onAllPass, onStateChange]);

  useLayoutEffect(() => {
    const session = createCheckSession({
      checks,
      runCheck: (check, { signal, index }) => runExerciseCheck(id, index, { signal, name: check.name }),
      onStart() {
        setResults([]);
        setRunning(true);
        callbacksRef.current.onStateChange?.('running');
      },
      onProgress: setResults,
      onComplete({ results: finished, passed }) {
        setRunning(false);
        const history = recordCheckRun(id, finished);
        if (!history.ok) setHistoryFailure(history.message);
        callbacksRef.current.onStateChange?.(passed ? 'passed' : 'failed');
        if (passed) callbacksRef.current.onAllPass?.();
      },
    });
    sessionRef.current = session;
    return () => {
      session.abandon();
      sessionRef.current = null;
    };
  }, [id, checks]);

  const runAll = useCallback(() => {
    sessionRef.current?.run();
  }, []);

  useEffect(() => {
    if (autoRun) runAll();
  }, [autoRun, id, checks, runAll]);

  // Ctrl+Enter (⌘ Enter on macOS) runs the checks from anywhere on the page;
  // the preview frame forwards the same chord from inside the experiment.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
      // Leave the chord to fields on this page, such as the reflection draft.
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return;
      event.preventDefault();
      runAll();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [runAll]);

  const passedCount = results?.filter((result) => result.pass).length ?? 0;
  const summary = results === null
    ? 'Not checked this visit.'
    : running
      ? `${results.length} of ${checks.length} checks finished.`
      : `${passedCount} of ${results.length} checks passed this run.`;

  return (
    <section
      className="verification-panel"
      id="verification"
      aria-labelledby="verification-title"
      aria-busy={running}
    >
      <div className="section-toolbar">
        <h2 id="verification-title" tabIndex={-1}>Verification</h2>
        <StatefulButton
          className="btn btn-primary"
          aria-label={running ? 'Running checks…' : results?.length ? 'Re-run checks' : 'Run checks'}
          state={running ? 'loading' : results?.length ? (passedCount === checks.length ? 'success' : 'error') : 'idle'}
          loadingText="Running checks…"
          successText="Re-run checks"
          errorText="Re-run checks"
          pressScale={0.98}
          onClick={runAll}
          aria-keyshortcuts={`${shortcutKey === '⌘' ? 'Meta' : 'Control'}+Enter`}
          disabled={checks.length === 0}
        >
          Run checks
        </StatefulButton>
      </div>
      <p className="verification-summary" role="status" aria-live="polite" aria-atomic="true">
        {summary}
      </p>
      {historyFailure && (
        <p className="verification-note" role="status">
          A check run could not be added to learning history. {historyFailure} Saved completion is handled separately.
        </p>
      )}
      {autoRun && (
        <p className="verification-note">
          Verification mode is active. Checks run automatically after each reload.
        </p>
      )}

      {checks.length > 0 ? (
        <ul className="checks-list">
          {checks.map((check, index) => {
            const result = results?.[index];
            const status = result ? (result.pass ? 'Pass' : 'Fail')
              : results === null ? 'Not run'
                : running && index === results.length ? 'Running' : 'Pending';
            return (
              <li
                key={check.name}
                className={`check-row ${result ? (result.pass ? 'pass' : 'fail') : 'pending'}`}
              >
                <span className="check-chip">{status}</span>
                <div className="check-body">
                  <div className="check-name">{check.name}</div>
                  {result && !result.pass && <div className="check-error">{result.message}</div>}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="verification-note">No behavioral checks are available for this challenge.</p>
      )}
      <p className="verification-note">
        Edit the source in your editor, then run the checks to verify its behavior
        (<kbd>{shortcutKey}</kbd>{' '}<kbd>Enter</kbd>).
      </p>
    </section>
  );
}
