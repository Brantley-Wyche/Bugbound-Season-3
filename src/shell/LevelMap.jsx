import { levels } from '../levels/index.js';
import { navigate, isUnlocked } from './App.jsx';

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
    </button>
  );
}

export default function LevelMap({ completed }) {
  const coreLevels = levels.filter((l) => l.number <= 12);
  const tsLevels = levels.filter((l) => l.number > 12 && l.number <= 15);
  const customLevels = levels.filter((l) => l.number > 15);
  const nextLevel = levels.find((l) => !completed.has(l.id) && isUnlocked(l, completed));
  const allDone = completed.size === levels.length;

  const openCount = levels.length - completed.size;
  const statusTone = allDone ? 'ok' : completed.size === 0 ? 'err' : 'warn';
  const statusClass = allDone ? 'state-ok' : completed.size === 0 ? 'state-critical' : 'state-degraded';
  const statusText = allDone
    ? 'ALL SYSTEMS OPERATIONAL'
    : `${completed.size === 0 ? 'CRITICAL' : 'DEGRADED'} — ${openCount} OPEN INCIDENT${openCount === 1 ? '' : 'S'}`;

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Season 1 · Core React · On-Call Rotation</p>
        <h1>Learn React by fixing it.</h1>
        <p className="tagline">
          Every level teaches one React concept — and ships with a real bug. Read the ticket,
          open the file in your editor, fix the code, and run the checks to move on. You're on
          call.
        </p>
        <p className="system-status">
          <span className={`status-dot ${statusTone} ${allDone ? '' : 'live'}`} />
          <span className={statusClass}>SYSTEM STATUS: {statusText}</span>
        </p>
        {allDone ? (
          <span className="chip severity-Low">Season complete — all {levels.length} incidents resolved</span>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => nextLevel && navigate(`/level/${nextLevel.id}`)}
          >
            {completed.size === 0 ? 'Start Level 01' : `Continue → Level ${String(nextLevel.number).padStart(2, '0')}`}
          </button>
        )}
      </section>

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

      <section className="map-section s3-section">
        <h2>Season 3 — Infinite Mode</h2>
        {customLevels.length > 0 ? (
          <div className="level-grid">
            {customLevels.map((level) => (
              <LevelCard key={level.id} level={level} completed={completed} />
            ))}
          </div>
        ) : (
          <div className="s3-empty">
            <p>
              <strong>The campaign is only the beginning.</strong> Your AI coding agent can
              generate brand-new levels for you — fresh bugs, same rules, still a surprise:
            </p>
            <code>"Generate two new hard levels about effect cleanup"</code>
            <p>
              Generated levels land in <code>src/levels/custom/</code> and appear here
              automatically. See <code>AGENTS.md</code> for how it works.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
