import { levels } from '../levels/index.js';
import { navigate, isUnlocked } from './App.jsx';
import AgentStation from './AgentStation.jsx';

function LevelCard({ level, completed }) {
  const unlocked = isUnlocked(level, completed);
  const done = completed.has(level.id);

  return (
    <button
      className={`level-card sev-${level.severity} ${level.number > 15 ? 's3-card' : ''} ${done ? 'complete' : ''} ${unlocked ? '' : 'locked'}`}
      onClick={() => unlocked && navigate(`/level/${level.id}`)}
      disabled={!unlocked}
      title={unlocked ? level.title : 'Fix the previous level to unlock'}
    >
      <div className="top-row">
        <span className="level-num">BUG-{String(level.number).padStart(3, '0')}</span>
        <span className={`level-status ${done ? 'done' : unlocked ? 'open' : 'lock'}`}>
          {done ? '✓ RESOLVED' : unlocked ? 'OPEN' : 'LOCKED'}
        </span>
      </div>
      <span className="name">{level.title}</span>
      <span className="chip">{level.concept}</span>
      {level.number > 15 && (
        <span className="custom-card-meta">
          <span>{level.difficulty || level.severity}</span>
          <span>{level.generatedAt || 'Agent generated'}</span>
        </span>
      )}
    </button>
  );
}

const workflowSteps = [
  ['01', 'Learn', 'Read the concept'],
  ['02', 'Reproduce', 'Trigger the symptom'],
  ['03', 'Repair', 'Work in your editor'],
  ['04', 'Verify', 'Run the checks'],
];

export default function LevelMap({ completed, track = 'campaign' }) {
  const coreLevels = levels.filter((level) => level.number <= 12);
  const tsLevels = levels.filter((level) => level.number > 12 && level.number <= 15);
  const customLevels = levels.filter((level) => level.number > 15);
  const trackLevels = track === 'infinite'
    ? customLevels
    : levels.filter((level) => level.number <= 15);
  const completedCount = trackLevels.filter((level) => completed.has(level.id)).length;
  const nextLevel = trackLevels.find((level) => !completed.has(level.id) && isUnlocked(level, completed));
  const allDone = trackLevels.length > 0 && completedCount === trackLevels.length;
  const openCount = trackLevels.length - completedCount;
  const statusTone = allDone ? 'ok' : completedCount === 0 ? 'err' : 'warn';
  const statusClass = allDone ? 'state-ok' : completedCount === 0 ? 'state-critical' : 'state-degraded';
  const statusText = allDone
    ? 'ALL SYSTEMS OPERATIONAL'
    : `${completedCount === 0 ? 'CRITICAL' : 'DEGRADED'} — ${openCount} OPEN INCIDENT${openCount === 1 ? '' : 'S'}`;

  return (
    <main>
      <nav className="track-switcher" aria-label="Bugbound tracks">
        <button
          className={track === 'campaign' ? 'active' : ''}
          aria-pressed={track === 'campaign'}
          onClick={() => navigate('/')}
        >
          <span>Season 1</span>
          Campaign
        </button>
        <button
          className={track === 'infinite' ? 'active' : ''}
          aria-pressed={track === 'infinite'}
          onClick={() => navigate('/infinite')}
        >
          <span>Season 3</span>
          Infinite Mode
        </button>
      </nav>

      <section className={`hero ${track === 'infinite' ? 'hero-infinite' : ''}`}>
        <p className="eyebrow">
          {track === 'infinite'
            ? 'Season 3 · Bring your own agent · Infinite practice'
            : 'Season 1 · Core React · On-call rotation'}
        </p>
        <h1>{track === 'infinite' ? 'Practice that adapts to you.' : 'Learn React by fixing it.'}</h1>
        <p className="tagline">
          {track === 'infinite'
            ? 'Turn a topic, a difficulty, or your learning history into a fresh debugging challenge. Your agent authors the incident; you still do the repair.'
            : "Every level teaches one React concept — and ships with a real bug. Read the ticket, open the file in your editor, fix the code, and run the checks to move on. You're on call."}
        </p>

        {trackLevels.length > 0 && (
          <>
            <p className="system-status">
              <span className={`status-dot ${statusTone} ${allDone ? '' : 'live'}`} />
              <span className={statusClass}>SYSTEM STATUS: {statusText}</span>
            </p>
            {allDone ? (
              <span className="chip severity-Low">
                {track === 'infinite'
                  ? 'Current queue resolved'
                  : 'Season complete — all 15 incidents resolved'}
              </span>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => nextLevel && navigate(`/level/${nextLevel.id}`)}
              >
                {completedCount === 0
                  ? track === 'infinite' ? 'Open first generated level' : 'Start Level 01'
                  : `Continue → Level ${String(nextLevel.number).padStart(2, '0')}`}
              </button>
            )}
          </>
        )}

        <div className="workflow-overview" aria-label="The Bugbound debugging loop">
          {workflowSteps.map(([number, title, detail]) => (
            <div className="workflow-step" key={number}>
              <span className="workflow-number">{number}</span>
              <span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      {track === 'campaign' ? (
        <>
          <section className="map-section">
            <h2>Act I — Core React</h2>
            <div className="level-grid">
              {coreLevels.map((level) => (
                <LevelCard key={level.id} level={level} completed={completed} />
              ))}
            </div>
          </section>

          <section className="map-section">
            <h2>Act II — The TypeScript Arc</h2>
            <div className="level-grid">
              {tsLevels.map((level) => (
                <LevelCard key={level.id} level={level} completed={completed} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <AgentStation levels={levels} completed={completed} />
          <section className="map-section s3-section">
            <h2>Generated incident queue</h2>
            {customLevels.length > 0 ? (
              <div className="level-grid">
                {customLevels.map((level) => (
                  <LevelCard key={level.id} level={level} completed={completed} />
                ))}
              </div>
            ) : (
              <div className="s3-empty">
                <p>
                  <strong>Your queue is clear.</strong> Build an agent brief above to generate a
                  new challenge.
                </p>
                <p>New levels appear automatically after your agent validates them.</p>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
