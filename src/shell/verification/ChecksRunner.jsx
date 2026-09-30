import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createCheckSession } from './check-session.js';
import { runExerciseCheck } from '../runtime/frame-check.js';
import { recordCheckRun } from '../progress/learning.js';
import { StatefulButton } from '../../components/motion/button/stateful';
import { levelHref } from '../workspace/navigation.js';
import { bugId, formatDay, formatDayInline, formatTime, pad2 } from '../format.js';
import Icon from '../Icon.jsx';

const shortcutKey = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** "today at 2:31 PM" or "Sep 24 at 2:31 PM". */
function when(iso) {
  return `${formatDayInline(iso)} at ${formatTime(iso)}`;
}

function RepairedEntry({ level, record, unsaved, fresh, headingRef, conclusion, onConclusionChange }) {
  const [saveError, setSaveError] = useState('');
  const day = record.at ? formatDayInline(record.at) : null;
  return (
    <div className={`repaired-entry ${fresh ? 'is-fresh' : ''}`}>
      <h3 ref={headingRef} tabIndex={-1} className="repaired-heading">
        <Icon name="check" size={18} />Repaired
        {!fresh && day && <span className="readout repaired-day">{day}</span>}
        {unsaved && <span className="status-qualifier">· not saved yet</span>}
      </h3>
      <p className="repaired-line">
        <span className="readout">{bugId(level.number)}</span>{' '}
        {record.at ? <>repaired {when(record.at)}</> : 'was repaired in an earlier visit'}
        {record.run && <> on run <span className="readout">{pad2(record.run)}</span></>}.{' '}
        {unsaved ? 'Not saved yet: use Retry saving above.' : 'Saved in this browser.'}
      </p>
      {fresh && <p className="verification-note">A later run checks your current source. It never undoes this record.</p>}
      <label className="conclusion-label" htmlFor={`${level.id}-conclusion`}>Conclusion <span className="plain-label">Optional</span></label>
      <textarea
        id={`${level.id}-conclusion`}
        rows={3}
        value={conclusion}
        onChange={(event) => {
          const result = onConclusionChange(event.target.value);
          setSaveError(result.ok ? '' : result.message);
        }}
        placeholder="What made the repair hold? The observation that mattered, why the change works, and what still needs care."
      />
      <p className="field-help" role={saveError ? 'alert' : undefined}>{saveError || 'Saved with this record in this browser.'}</p>
    </div>
  );
}

/**
 * The verification record and the instrument bar pinned below the experiment column.
 * Children (the incident's readings) render between the record and the bar.
 */
export default function ChecksRunner({ level, record = null, unsaved = false, next = null, onAllPass, autoRun = false, conclusion = '', onConclusionChange, children }) {
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [repairedHere, setRepairedHere] = useState(false);
  const [historyFailure, setHistoryFailure] = useState(null);
  const sessionRef = useRef(null);
  const repairedRef = useRef(null);
  const callbacksRef = useRef({ onAllPass, record });
  const { id, checks } = level;

  useLayoutEffect(() => {
    callbacksRef.current = { onAllPass, record };
  }, [onAllPass, record]);

  useLayoutEffect(() => {
    const session = createCheckSession({
      checks,
      runCheck: (check, { signal, index }) => runExerciseCheck(id, index, { signal, name: check.name }),
      onStart() {
        setResults([]);
        setRunning(true);
        setLastRun(null);
      },
      onProgress: setResults,
      onComplete({ results: finished, passed }) {
        setRunning(false);
        const history = recordCheckRun(id, finished);
        if (!history.ok) setHistoryFailure(history.message);
        setLastRun({ run: history.run ?? null, at: history.at });
        if (passed) {
          const firstRepair = !callbacksRef.current.record;
          callbacksRef.current.onAllPass?.({ at: history.at, run: history.run });
          if (firstRepair) setRepairedHere(true);
        }
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
      // Leave the chord to fields on this page, such as the conclusion.
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return;
      event.preventDefault();
      runAll();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [runAll]);

  // The repairing run moves the reader to its record.
  useEffect(() => {
    if (!repairedHere || !repairedRef.current) return;
    repairedRef.current.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'center' });
    repairedRef.current.focus({ preventScroll: true });
  }, [repairedHere]);

  const showRecord = () => {
    const header = document.getElementById(`${id}-run-header`);
    header?.scrollIntoView({ behavior: 'instant', block: 'center' });
    header?.focus({ preventScroll: true });
  };

  const total = checks.length;
  const passedCount = results?.filter((result) => result.pass).length ?? 0;
  const finished = results !== null && !running;
  const failing = finished && passedCount < total;
  const repairedDay = record?.at ? formatDayInline(record.at) : null;
  const runLabel = lastRun?.run ? `Run ${pad2(lastRun.run)}` : 'This run';

  const runHeader = running
    ? `Running check ${Math.min(results.length + 1, total)} of ${total}…`
    : finished
      ? `${runLabel} · ${formatDay(lastRun.at)} ${formatTime(lastRun.at)} · ${passedCount} of ${results.length} passed`
      : 'Not run this visit';
  const announcement = running
    ? `Running check ${Math.min(results.length + 1, total)} of ${total}.`
    : finished
      ? `${runLabel}: ${passedCount} of ${results.length} checks passed.${repairedHere ? ` ${bugId(level.number)} repaired.` : ''}`
      : '';

  const entryProps = { level, record, unsaved, conclusion, onConclusionChange };

  return (
    <>
      <section className="verification-panel" id="verification" aria-labelledby="verification-title" aria-busy={running}>
        <div className="section-toolbar">
          <h2 id="verification-title" tabIndex={-1}>Verification</h2>
          <span className="plain-label"><span className="readout">{total}</span> {total === 1 ? 'check' : 'checks'}{lastRun?.run && <> · last run <span className="readout">{pad2(lastRun.run)}</span></>}</span>
        </div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
        {historyFailure && (
          <p className="verification-note" role="status">
            A check run could not be added to your readings. {historyFailure} The repair record is saved separately.
          </p>
        )}
        {autoRun && <p className="verification-note">Verification mode is active. Checks run automatically after each reload.</p>}

        {record && !repairedHere && <RepairedEntry {...entryProps} fresh={false} />}

        {total > 0 ? (
          <>
            <p className="run-header" id={`${id}-run-header`} tabIndex={-1}>{runHeader}</p>
            <ul className="checks-list">
              {checks.map((check, index) => {
                const result = results?.[index];
                const status = result ? (result.pass ? 'Pass' : 'Fail')
                  : results === null ? 'Not run'
                    : running && index === results.length ? 'Running' : 'Pending';
                return (
                  <li key={check.name} className={`check-row ${result ? (result.pass ? 'pass' : 'fail') : 'pending'}`}>
                    <span className="check-chip">{status}</span>
                    <div className="check-body">
                      <div className="check-name">{check.name}</div>
                      {result && !result.pass && <div className="check-error">{result.message}</div>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="verification-note">No behavioral checks are available for this incident.</p>
        )}

        {record && !repairedHere && finished && (
          <p className="verification-note">
            Repaired{repairedDay && <> <span className="readout">{repairedDay}</span></>} still stands. This run checked your current source: <span className="readout">{passedCount}</span> of <span className="readout">{results.length}</span> passed.
          </p>
        )}
        {record && repairedHere && <RepairedEntry {...entryProps} fresh headingRef={repairedRef} />}
      </section>

      {children}

      <div className="instrument-bar" role="region" aria-label="Verification controls">
        <div className="bar-readout">
          {running ? (
            <span className="readout" aria-hidden="true">{runHeader}</span>
          ) : finished ? (
            <button type="button" className="bar-reading" onClick={showRecord}>
              {repairedHere ? (
                <>
                  <span className="status-repaired"><Icon name="check" size={16} />Repaired</span>
                  <span className="readout">{runLabel} · {passedCount}/{total}</span>
                </>
              ) : (
                <>
                  <span className="readout">{runLabel}</span>
                  <span className={failing ? 'is-fail' : 'is-pass'}>{passedCount} of {results.length} passed</span>
                </>
              )}
              <span className="readout bar-time">{formatTime(lastRun.at)}</span>
            </button>
          ) : record ? (
            <span><span className="status-repaired"><Icon name="check" size={16} />Repaired{repairedDay && <> <span className="readout">{repairedDay}</span></>}</span> <span className="bar-muted">· Not run this visit</span></span>
          ) : (
            <span><span className="readout">{total}</span> {total === 1 ? 'check' : 'checks'} <span className="bar-muted">· Not run this visit</span></span>
          )}
          {record && finished && !repairedHere && <span className="status-repaired bar-stands">Repaired{repairedDay && <> <span className="readout">{repairedDay}</span></>} still stands</span>}
          {unsaved && <span className="status-qualifier">Not saved yet</span>}
        </div>
        <span className="bar-shortcut" aria-hidden="true"><kbd>{shortcutKey}</kbd>{' '}<kbd>Enter</kbd></span>
        <StatefulButton
          className={`btn ${record && !failing ? '' : 'btn-primary'}`}
          aria-label={running ? 'Running checks…' : results?.length ? 'Re-run checks' : 'Run checks'}
          aria-keyshortcuts={`${shortcutKey === '⌘' ? 'Meta' : 'Control'}+Enter`}
          state={running ? 'loading' : results?.length ? (passedCount === total ? 'success' : 'error') : 'idle'}
          loadingText="Running checks…"
          successText="Re-run checks"
          errorText="Re-run checks"
          pressScale={0.98}
          onClick={runAll}
          disabled={total === 0}
        >
          Run checks
        </StatefulButton>
        {record && (
          next
            ? <a className={`btn ${failing ? '' : 'btn-primary'}`} href={levelHref(next.level.id)}>Next: <span className="readout">{pad2(next.level.number)}</span> {next.level.title}<Icon name="arrow" size={16} /></a>
            : <a className={`btn ${failing ? '' : 'btn-primary'}`} href="#/brief">Brief an incident<Icon name="arrow" size={16} /></a>
        )}
      </div>
    </>
  );
}
