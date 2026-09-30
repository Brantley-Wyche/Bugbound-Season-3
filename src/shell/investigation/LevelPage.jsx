import { useEffect, useState } from 'react';
import { readingsFor, recordVisit, saveConclusion } from '../progress/learning.js';
import { useLearning } from '../progress/useLearning.js';
import { formatClock, pad2 } from '../format.js';
import { getPracticeLevels, recommendChallenge } from '../workspace/practice.js';
import Prose from './Prose.jsx';
import ReadingsRow from './ReadingsRow.jsx';
import Readings from './Readings.jsx';
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

export default function LevelPage({ level, levels, completed, record = null, unsaved = false, sourceRevision = 0, onComplete, autoRunChecks = false }) {
  useEffect(() => { recordVisit(level.id); }, [level.id]);
  const { store, error: readingsError } = useLearning();
  const readings = readingsFor(store, level.id);
  const [demoKey, setDemoKey] = useState(0);
  const [focused, setFocused] = useState(false);
  const [mounts, setMounts] = useState(1);
  const [reloadedAt, setReloadedAt] = useState(null);
  const [seenSource, setSeenSource] = useState(sourceRevision);
  // A source save reloads the experiment and, through the keyed runner, clears
  // the last run, which described the previous source. Hints and Focus stay put.
  if (seenSource !== sourceRevision) {
    setSeenSource(sourceRevision);
    setMounts((value) => value + 1);
    setReloadedAt(new Date().toISOString());
  }
  const collection = level.number > 15 ? 'generated' : 'foundations';
  const next = recommendChallenge(getPracticeLevels(levels, collection), new Set([...completed, level.id]), level.id);
  const sourceName = level.files[0]?.split('/').pop();

  function jumpTo(id) {
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: 'instant', block: 'start' });
    target?.focus({ preventScroll: true });
  }

  return (
    <main className={`investigation-page ${focused ? 'is-focused' : ''}`} id="main-content" tabIndex={-1}>
      <div className="investigation-header">
        <a className="back-link" href={collection === 'generated' ? '#/' : '#/foundations'}><Icon name="back" size={16} />{collection === 'generated' ? 'Practice' : 'Foundations'}</a>
        <div className="investigation-title-row">
          <span className="incident-index">{pad2(level.number)}</span>
          <h1 id="page-title" tabIndex={-1}>{level.title}</h1>
        </div>
        <ReadingsRow level={level} record={record} unsaved={unsaved} readings={readings} />
        <nav className="investigation-jumps" aria-label="Investigation sections">
          <button onClick={() => jumpTo('experiment-title')}>Experiment</button>
          <button onClick={() => jumpTo('verification-title')}>Verification</button>
          <button onClick={() => { setFocused(false); requestAnimationFrame(() => jumpTo('incident-brief-title')); }}>Report & reference</button>
        </nav>
      </div>

      <div className="investigation-workspace">
        <div className="experiment-column">
          <section className="experiment-panel" aria-labelledby="experiment-title">
            <div className="experiment-toolbar">
              <h2 id="experiment-title" tabIndex={-1}>Live experiment</h2>
              <div className="experiment-actions">
                <button className="text-button" onClick={() => { setDemoKey((value) => value + 1); setMounts((value) => value + 1); }}><Icon name="refresh" size={16} /> Remount</button>
                <button className="btn focus-button" onClick={() => setFocused((value) => !value)} aria-pressed={focused} aria-controls="investigation-context"><Icon name={focused ? 'collapse' : 'expand'} size={16} />{focused ? 'Show context' : 'Focus experiment'}</button>
              </div>
            </div>
            <div className="experiment-frame">
              <div className="experiment-caption">
                <span className="experiment-live"><span className="state-dot" aria-hidden="true" />Live</span>
                {sourceName && <span className="readout">{sourceName}</span>}
                <span className="readout experiment-caption-detail">Mount {pad2(mounts)}{reloadedAt && ` · Reloaded ${formatClock(reloadedAt)}`}</span>
              </div>
              <div className="demo-stage exercise-surface">
                <ExercisePreview key={`${demoKey}:${sourceRevision}`} levelId={level.id} title={level.title} />
              </div>
            </div>
            <p className="experiment-footnote">Reproduce the report here, repair the source in your editor, then run the checks. Remount resets this preview’s component state.</p>
          </section>

          <ChecksRunner
            key={sourceRevision}
            level={level}
            record={record}
            unsaved={unsaved}
            next={next}
            onAllPass={onComplete}
            autoRun={autoRunChecks}
            conclusion={readings.conclusion}
            onConclusionChange={(text) => saveConclusion(level.id, text)}
          >
            <Readings level={level} record={record} readings={readings} error={readingsError} />
          </ChecksRunner>
        </div>

        <aside className="investigation-context" id="investigation-context" aria-label="Incident context" hidden={focused}>
          <section className="incident-brief" aria-labelledby="incident-brief-title">
            <h2 id="incident-brief-title" tabIndex={-1}>Incident report</h2>
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
