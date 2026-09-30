import { useEffect, useState } from 'react';
import { levels, catalogErrors } from '../levels/index.js';
import { useProgress } from './progress/useProgress.js';
import { parseRoute } from './workspace/navigation.js';
import LevelMap from './workspace/LevelMap.jsx';
import LevelPage from './investigation/LevelPage.jsx';
import AgentStation from './authoring/AgentStation.jsx';
import Icon from './Icon.jsx';

const levelIds = levels.map((level) => level.id);
const generatedCount = levels.filter((level) => level.number > 15).length;

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
  const { completed, markComplete, resetProgress, retry, failure: storageFailure, revision } = useProgress(levelIds);
  const [draft, setDraft] = useState({ topic: 'effect cleanup', difficulty: 'Hard', count: 1, context: '' });
  const [filters, setFilters] = useState({ query: '', status: 'all' });
  const [reflections, setReflections] = useState({});
  const [sourceRevision, setSourceRevision] = useState(0);
  const savedCount = levels.filter((level) => level.number > 15 && completed.has(level.id)).length;

  useEffect(() => {
    const title = activeLevel?.title || (route.page === 'brief' ? 'Create a challenge' : route.page === 'practice' ? 'Practice' : 'Challenge not found');
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
    if (window.confirm('Reset saved completion for all challenges in this browser? Exercise files, learning-profile activity, and this session’s notes will stay unchanged.')) resetProgress();
  }

  return (
    <div className="lab-shell">
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault();
        document.getElementById('main-content')?.focus();
      }}>Skip to content</a>
      <header className="lab-header">
        <a className="lab-wordmark" href="#/" aria-label="Bugbound Season 3, Practice">
          <img src="/bugbound-icon.svg" width="36" height="36" alt="" />
          <span>Bugbound <small>Season 3</small></span>
        </a>
        <nav className="primary-nav" aria-label="Main navigation">
          <a href="#/" aria-current={route.page === 'practice' || route.page === 'level' ? 'page' : undefined}>Practice</a>
          <a href="#/brief" aria-current={route.page === 'brief' ? 'page' : undefined}>Create challenge</a>
        </nav>
        <span className="lab-identity">Engineering Lab</span>
        <span className="header-saved" aria-label={`${savedCount} of ${generatedCount} generated challenges have saved completion`}>
          <Icon name="check" size={15} /> {savedCount}<span> / {generatedCount} saved</span>
        </span>
      </header>

      <aside className="desktop-notice" role="note">
        <Icon name="monitor" size={22} />
        <p><strong>Use a desktop to work on the exercises.</strong> Edit actual source files in your local editor, let Vite reload the app, then run the checks. You can still browse the challenges and references here.</p>
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
        <p>Some challenge files need attention. Run <code>npm run validate-levels</code> in your editor terminal, then reload. Available challenges remain browsable.</p>
        <button className="btn" onClick={() => window.location.reload()}>Reload challenges</button>
      </div>}

      {route.page === 'practice' ? (
        <LevelMap levels={levels} completed={completed} collection={route.collection} lastId={lastId}
          filters={filters} onFiltersChange={setFilters} />
      ) : route.page === 'brief' ? (
        <AgentStation levels={levels} completed={completed} draft={draft} onDraftChange={setDraft} progressFailure={storageFailure} />
      ) : activeLevel ? (
        <LevelPage key={`${activeLevel.id}:${revision}`} level={activeLevel} levels={levels} completed={completed} sourceRevision={sourceRevision}
          onComplete={() => markComplete(activeLevel.id)} autoRunChecks={route.verify && revision === 0}
          reflection={reflections[activeLevel.id] || ''}
          onReflectionChange={(value) => setReflections((current) => ({ ...current, [activeLevel.id]: value }))} />
      ) : (
        <main className="practice-page missing-page" id="main-content" tabIndex={-1}>
          <Icon name="file" size={38} />
          <h1 id="page-title" tabIndex={-1}>Challenge not found.</h1>
          <p>This link does not match a challenge in the current repository. If your agent is adding one, finish the generation and reload.</p>
          <a className="btn btn-primary" href="#/">Return to practice <Icon name="arrow" /></a>
        </main>
      )}

      <footer className="lab-footer">
        <span>Bugbound <span aria-hidden="true">/</span> Engineering Lab</span>
        <span className="footer-context">Your editor. Your agent. Your investigation.</span>
        <button className="text-button" onClick={confirmReset}>Reset saved completion</button>
      </footer>
    </div>
  );
}
