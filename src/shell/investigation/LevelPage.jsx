import { useState } from 'react';
import { getPracticeLevels, recommendChallenge } from '../workspace/practice.js';
import { levelHref } from '../workspace/navigation.js';
import Prose from './Prose.jsx';
import ExercisePreview from '../runtime/ExercisePreview.jsx';
import ChecksRunner from '../verification/ChecksRunner.jsx';
import HintBox from './HintBox.jsx';
import Icon from '../Icon.jsx';
import { ActionSwapRollIcon } from '../../components/motion/action-swap-roll';

function SourceFile({ path }) {
  const [copyState, setCopyState] = useState('idle');
  async function copy() {
    try {
      await navigator.clipboard.writeText(path);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }
  return (
    <li>
      <div className="source-file"><code>{path}</code><button className="icon-button" aria-label={`Copy source path ${path}`} onClick={copy}><ActionSwapRollIcon value={copyState}><Icon name={copyState === 'copied' ? 'check' : 'copy'} size={16} /></ActionSwapRollIcon></button></div>
      {copyState !== 'idle' && <span className="copy-feedback" role="status">{copyState === 'copied' ? 'Path copied.' : 'Select the path and copy it manually.'}</span>}
    </li>
  );
}

export default function LevelPage({ level, levels, completed, sourceRevision = 0, onComplete, autoRunChecks = false, reflection, onReflectionChange }) {
  const [demoKey, setDemoKey] = useState(0);
  const [focused, setFocused] = useState(false);
  const [verification, setVerification] = useState('idle');
  const [checkedSource, setCheckedSource] = useState(sourceRevision);
  // A source save reloads the preview and clears the last run, since that run
  // described the previous source. Hints, Focus and the reflection stay put.
  if (checkedSource !== sourceRevision) {
    setCheckedSource(sourceRevision);
    setVerification('idle');
  }
  const isSaved = completed.has(level.id);
  const collection = level.number > 15 ? 'generated' : 'foundations';
  const next = recommendChallenge(getPracticeLevels(levels, collection), new Set([...completed, level.id]), level.id);
  const stateLabel = { idle: 'Not checked this visit', running: 'Checking current code', passed: 'Verified this visit', failed: 'Checks need attention' }[verification];

  function jumpTo(id) {
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: 'instant', block: 'start' });
    target?.focus({ preventScroll: true });
  }

  return (
    <main className={`investigation-page ${focused ? 'is-focused' : ''}`} id="main-content" tabIndex={-1}>
      <div className="investigation-header">
        <a className="back-link" href={collection === 'generated' ? '#/' : '#/foundations'}><Icon name="back" size={16} />{collection === 'generated' ? 'Back to practice' : 'Back to foundations'}</a>
        <div className="investigation-title-row">
          <span className="incident-index">{String(level.number).padStart(2, '0')}</span>
          <div className="investigation-title">
            <h1 id="page-title" tabIndex={-1}>{level.title}</h1>
            <div className="investigation-meta"><span>{level.concept}</span><span>{level.difficulty || level.severity} difficulty</span><span>{level.number > 15 ? 'Agent-generated' : 'Foundations'}</span></div>
          </div>
          <div className="investigation-state">
            <span className={`visit-state state-${verification}`}><span className="state-dot" />{stateLabel}</span>
            {isSaved && <span className="saved-state"><Icon name="check" size={14} /> Completion saved</span>}
          </div>
        </div>
        <nav className="investigation-jumps" aria-label="Investigation sections">
          <button onClick={() => jumpTo('experiment-title')}>Experiment</button>
          <button onClick={() => jumpTo('verification-title')}>Verification</button>
          <button onClick={() => { setFocused(false); requestAnimationFrame(() => jumpTo('incident-brief-title')); }}>Brief & reference</button>
        </nav>
      </div>

      <div className="investigation-workspace">
        <div className="experiment-column">
          <section className="experiment-panel" aria-labelledby="experiment-title">
            <div className="experiment-toolbar">
              <h2 id="experiment-title" tabIndex={-1}>Live experiment</h2>
              <div className="experiment-actions">
                <button className="text-button" onClick={() => setDemoKey((value) => value + 1)}><Icon name="refresh" size={16} /> Remount</button>
                <button className="btn focus-button" onClick={() => setFocused((value) => !value)} aria-pressed={focused} aria-controls="investigation-context"><Icon name={focused ? 'collapse' : 'expand'} size={16} />{focused ? 'Show context' : 'Focus experiment'}</button>
              </div>
            </div>
            <div className="experiment-caption"><span className="state-dot" /><span>Running your local source</span><span className="experiment-caption-detail">Edits hot-reload here</span></div>
            <div className="demo-stage exercise-surface">
              <ExercisePreview key={`${demoKey}:${sourceRevision}`} levelId={level.id} title={level.title} />
            </div>
            <p className="experiment-footnote">Reproduce the reported behavior, then make your repair in your editor. Remount resets this preview’s component state.</p>
          </section>

          <ChecksRunner key={sourceRevision} level={level} onAllPass={onComplete} autoRun={autoRunChecks} onStateChange={setVerification} />

          {verification === 'passed' && (
            <section className="resolution-review" aria-labelledby="reflection-title">
              <div className="section-toolbar"><h2 id="reflection-title">What made the repair hold?</h2><span className="plain-label">Optional reflection</span></div>
              <p>Capture the observation that mattered, why your change works, and any remaining tradeoffs.</p>
              <label className="sr-only" htmlFor="reflection">Investigation reflection</label>
              <textarea id="reflection" rows={4} value={reflection} onChange={(event) => onReflectionChange(event.target.value)} placeholder="The evidence that changed my understanding was…" />
              <p className="field-help">Kept for this app session. Copy your notes before reloading or closing the tab.</p>
              <div className="resolution-actions">
                {next ? <a className="btn btn-primary" href={levelHref(next.level.id)}>Next suggestion <Icon name="arrow" /></a> : <a className="btn btn-primary" href="#/brief">Create another challenge <Icon name="plus" /></a>}
                <a className="inline-link" href={collection === 'generated' ? '#/' : '#/foundations'}>Choose from the register</a>
              </div>
            </section>
          )}
        </div>

        <aside className="investigation-context" id="investigation-context" aria-label="Incident context" hidden={focused}>
          <section className="incident-brief" aria-labelledby="incident-brief-title">
            <div className="section-toolbar"><h2 id="incident-brief-title" tabIndex={-1}>Incident brief</h2><span className="source-id">BUG-{String(level.number).padStart(3, '0')}</span></div>
            <p className="symptom">{level.symptom}</p>
            <h3>Source files</h3>
            <p className="field-help">{level.vague ? 'Investigate within these files.' : 'Open these files in your editor.'}</p>
            <ul className="source-files">{level.files.map((path) => <SourceFile key={path} path={path} />)}</ul>
          </section>
          <details className="concept-reference" open>
            <summary><Icon name="book" /> Concept reference</summary>
            <h3>{level.concept}</h3>
            <Prose paragraphs={level.lesson} />
          </details>
          <HintBox levelId={level.id} />
        </aside>
      </div>
    </main>
  );
}
