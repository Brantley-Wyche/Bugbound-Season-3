import { useEffect, useState } from 'react';
import { levels, catalogErrors } from '../levels/index.js';
import { useProgress } from './progress/useProgress.js';
import { recordReset } from './progress/learning.js';
import { parseRoute } from './workspace/navigation.js';
import LevelMap from './workspace/LevelMap.jsx';
import LevelPage from './investigation/LevelPage.jsx';
import AgentStation from './authoring/AgentStation.jsx';
import Icon from './Icon.jsx';

const levelIds = levels.map((level) => level.id);
const foundationIds = levels.filter((level) => level.number <= 15).map((level) => level.id);
const generatedIds = levels.filter((level) => level.number > 15).map((level) => level.id);
const pad = (value) => String(value).padStart(2, '0');

function useHashRoute() {
  const [navigation, setNavigation] = useState(() => ({ hash: window.location.hash, lastId: parseRoute(window.location.hash).id || null }));
  useEffect(() => {
    const onChange = () => {
      const hash = window.location.hash;
      const route = parseRoute(hash);
      setNavigation((previous) => ({ hash, lastId: route.page === 'level' && levelIds.includes(route.id) ? route.id : previous.lastId }));
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return navigation;
}

export default function App() {
  const { hash, lastId } = useHashRoute();
  const route = parseRoute(hash);
  const activeLevel = route.page === 'level' ? levels.find((level) => level.id === route.id) : null;
  const { completed, records, unsaved, markComplete, resetProgress, retry, failure: storageFailure, revision } = useProgress(levelIds);
  const [draft, setDraft] = useState({ topic: 'effect cleanup', difficulty: 'Hard', count: 1, context: '' });
  const [filters, setFilters] = useState({ query: '', status: 'all' });
  const [sourceRevision, setSourceRevision] = useState(0);
  const repairedFoundations = foundationIds.filter((id) => completed.has(id)).length;
  const repairedGenerated = generatedIds.filter((id) => completed.has(id)).length;

  useEffect(() => {
    const title = activeLevel?.title || (route.page === 'brief' ? 'Brief an incident' : route.page === 'practice' ? 'Practice' : 'Incident not found');
    document.title = `${title} · Bugbound Season 3`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('page-title')?.focus({ preventScroll: true });
  }, [hash, activeLevel, route.page]);

  useEffect(() => {
    const onSourceChange = () => setSourceRevision((value) => value + 1);
    import.meta.hot?.on('bugbound:exercise-change', onSourceChange);
    return () => import.meta.hot?.off('bugbound:exercise-change', onSourceChange);
  }, []);

  function confirmReset() {
    if (window.confirm('Reset every repair saved in this browser? Incidents reopen. Source files, readings, and conclusions stay unchanged.')) {
      if (!resetProgress().failure) recordReset();
    }
  }

  return (
    <div className="lab-shell">
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        document.getElementById('main-content')?.focus();
      }}>Skip to content</a>
      <header className="lab-header">
        <a className="lab-wordmark" href="#/" aria-label="Bugbound Season 3, Practice">
          <img src="/bugbound-icon.svg" width="32" height="32" alt="" />
          <span>Bugbound <small>Season 3</small></span>
        </a>
        <nav className="primary-nav" aria-label="Main navigation">
          <a href="#/" aria-current={route.page === 'practice' || route.page === 'level' ? 'page' : undefined}>Practice</a>
          <a href="#/brief" aria-current={route.page === 'brief' ? 'page' : undefined}>Brief an incident</a>
        </nav>
        <p className="header-readout">
          <span>Foundations <span className="readout">{pad(repairedFoundations)}/{pad(foundationIds.length)}</span></span>
          <span>Generated <span className="readout">{pad(repairedGenerated)}/{pad(generatedIds.length)}</span></span>
          <span>repaired</span>
        </p>
      </header>

      <aside className="desktop-notice" role="note">
        <Icon name="monitor" size={22} />
        <p><strong>Use a desktop to work on the incidents.</strong> Edit the actual source files in your local editor, let Vite reload the app, then run the checks. You can still browse the incidents and references here.</p>
      </aside>

      {storageFailure && (
        <div className="storage-notice" role="alert">
          <p>{storageFailure.message}</p>
          <button className="btn" onClick={retry}>
            {storageFailure.operation === 'save' ? 'Retry saving' : storageFailure.operation === 'reset' ? 'Retry reset' : 'Retry reading progress'}
          </button>
        </div>
      )}

      {catalogErrors.length > 0 && <div className="storage-notice" role="alert">
        <p>Some incident files need attention. Run <code>npm run validate-levels</code> in your editor terminal, then reload. Available incidents remain browsable.</p>
        <button className="btn" onClick={() => window.location.reload()}>Reload incidents</button>
      </div>}

      {route.page === 'practice' ? (
        <LevelMap levels={levels} completed={completed} collection={route.collection} lastId={lastId}
          filters={filters} onFiltersChange={setFilters} />
      ) : route.page === 'brief' ? (
        <AgentStation levels={levels} completed={completed} records={records} draft={draft} onDraftChange={setDraft} progressFailure={storageFailure} />
      ) : activeLevel ? (
        <LevelPage key={`${activeLevel.id}:${revision}`} level={activeLevel} levels={levels} completed={completed} sourceRevision={sourceRevision}
          record={records.get(activeLevel.id) ?? null} unsaved={unsaved.has(activeLevel.id)}
          onComplete={(details) => markComplete(activeLevel.id, details)} autoRunChecks={route.verify && revision === 0} />
      ) : (
        <main className="practice-page missing-page" id="main-content" tabIndex={-1}>
          <Icon name="file" size={38} />
          <h1 id="page-title" tabIndex={-1}>Incident not found.</h1>
          <p>This link does not match an incident in the current repository. If your agent is adding one, finish the generation and reload.</p>
          <a className="btn btn-primary" href="#/">Return to practice <Icon name="arrow" /></a>
        </main>
      )}

      <footer className="lab-footer">
        <span>Bugbound <span aria-hidden="true">/</span> Engineering Lab</span>
        <span className="footer-context">Your editor. Your agent. Your investigation.</span>
        <button className="text-button" onClick={confirmReset}>Reset repairs</button>
      </footer>
    </div>
  );
}
