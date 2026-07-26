import { useEffect, useState } from 'react';
import { levels } from '../levels/index.js';
import { loadCompleted, saveCompleted, clearProgress } from './progress.js';
import LevelMap from './LevelMap.jsx';
import LevelPage from './LevelPage.jsx';

const levelIds = levels.map((level) => level.id);

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export function navigate(path) {
  window.location.hash = path;
  window.scrollTo(0, 0);
}

export function isUnlocked(level, completed) {
  if (level.number > 15) {
    const customLevels = levels.filter((item) => item.number > 15);
    const index = customLevels.findIndex((item) => item.id === level.id);
    return index === 0 || (index > 0 && completed.has(customLevels[index - 1].id));
  }
  if (level.number === 1) return true;
  const previous = levels.find((l) => l.number === level.number - 1);
  return previous ? completed.has(previous.id) : false;
}

export default function App() {
  const route = useHashRoute();
  const [completed, setCompleted] = useState(() => loadCompleted(levelIds));

  const markComplete = (id) => {
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveCompleted(next);
      return next;
    });
  };

  const resetProgress = () => {
    if (window.confirm('Reset all progress? Every level will lock again.')) {
      clearProgress();
      setCompleted(new Set());
      navigate('/');
    }
  };

  // Beating the 15-level campaign unlocks the Season 3 "aurora" theme app-wide.
  const campaignDone = levels
    .filter((l) => l.number <= 15)
    .every((l) => completed.has(l.id));

  const verifyId = route.startsWith('#/verify/') ? route.slice('#/verify/'.length) : null;
  const levelId = verifyId || (route.startsWith('#/level/') ? route.slice('#/level/'.length) : null);
  const activeLevel = levelId ? levels.find((l) => l.id === levelId) : null;
  const showLevel = activeLevel && (Boolean(verifyId) || isUnlocked(activeLevel, completed));
  const infiniteRoute = route === '#/infinite' || activeLevel?.number > 15;
  const seasonThreeActive = campaignDone || infiniteRoute;
  const progressLevels = infiniteRoute
    ? levels.filter((level) => level.number > 15)
    : levels.filter((level) => level.number <= 15);
  const trackCompletedCount = progressLevels.filter((level) => completed.has(level.id)).length;

  return (
    <div className={`app ${seasonThreeActive ? 'theme-aurora' : ''}`}>
      <header className="app-header">
        <button className="wordmark" onClick={() => navigate(infiniteRoute ? '/infinite' : '/')}>
          <span className="bug">🐛</span>
          <span>BUGBOUND</span>
          <span className="season">{seasonThreeActive ? 'SEASON 3 · ∞' : 'SEASON 1'}</span>
        </button>
        <div className="header-progress">
          <div
            className="uptime-strip"
            title={`${trackCompletedCount} of ${progressLevels.length} ${infiniteRoute ? 'generated' : 'campaign'} incidents resolved`}
            role="progressbar"
            aria-label={infiniteRoute ? 'Infinite Mode progress' : 'Campaign progress'}
            aria-valuemin="0"
            aria-valuemax={progressLevels.length}
            aria-valuenow={trackCompletedCount}
          >
            {progressLevels.map((l) => (
              <span
                key={l.id}
                className={`seg ${l.number > 15 ? 'custom' : ''} ${completed.has(l.id) ? 'done' : ''}`}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="label">
            {trackCompletedCount}/{progressLevels.length} {infiniteRoute ? 'GENERATED' : 'RESOLVED'}
          </span>
        </div>
      </header>

      <aside className="desktop-notice" role="note">
        <span className="desktop-notice-icon" aria-hidden="true">▣</span>
        <span>
          <strong>Best experienced on a computer.</strong> Bugbound works on smaller screens, but
          the intended setup is your editor and this app side by side.
        </span>
      </aside>

      {showLevel ? (
        <LevelPage
          key={activeLevel.id}
          level={activeLevel}
          isComplete={completed.has(activeLevel.id)}
          onComplete={() => markComplete(activeLevel.id)}
          autoRunChecks={Boolean(verifyId)}
        />
      ) : (
        <LevelMap completed={completed} track={infiniteRoute ? 'infinite' : 'campaign'} />
      )}

      <footer className="app-footer">
        <span>
          BUGBOUND · {seasonThreeActive ? 'SEASON 3 · CORE BY CLAUDE · CUSTOM BY YOUR AGENT' : 'SEASON 1 · REACT + VITE · LEVELS & BUGS BY CLAUDE'}
        </span>
        <button className="link-button" onClick={resetProgress}>
          Reset progress
        </button>
      </footer>
    </div>
  );
}
