import { useState } from 'react';
import { bugId, formatDay, formatTime, pad2 } from '../format.js';
import { TIER_LABELS } from './HintBox.jsx';

const SHOWN = 6;

/** The change in passing checks since the previous run of the same checks: "+1 since Run 02". */
function change(entry, previous) {
  if (!previous || previous.total !== entry.total) return null;
  const delta = entry.passed - previous.passed;
  const since = `since Run ${pad2(previous.run)}`;
  return delta === 0 ? `no change ${since}` :`${delta > 0 ? '+' : '−'}${Math.abs(delta)} ${since}`;
}

function describe(entry, level, record, previous) {
  if (entry.type === 'opened') return { event: 'Opened', detail: <>First visit to <span className="readout">{bugId(level.number)}</span></> };
  if (entry.type === 'hint') return { event: `Hint ${pad2(entry.tier)}`, detail: `${TIER_LABELS[entry.tier - 1]} opened` };
  if (entry.type === 'reset') return { event: 'Reset', detail: 'Repairs were reset. This log was kept.' };
  const repaired = record?.run === entry.run;
  const delta = change(entry, previous);
  return {
    event: `Run ${pad2(entry.run)}`,
    detail: <>{entry.passed} of {entry.total} passed{delta && <span className="readings-delta"> · {delta}</span>}{repaired && <span className="readings-repaired"> · Repaired</span>}</>,
  };
}

/** The incident's history in this browser, from real events only: visits, runs, hint tiers and resets. */
export default function Readings({ level, record, readings, error }) {
  const [showAll, setShowAll] = useState(false);
  const { entries, runEvents } = readings;
  const previousRun = new Map(runEvents.map((entry, index) => [entry.run, runEvents[index - 1]]));
  const shown = showAll ? entries : entries.slice(0, SHOWN);
  const days = [];
  for (const entry of shown) {
    const day = formatDay(entry.at);
    if (days.at(-1)?.day !== day) days.push({ day, entries: [] });
    days.at(-1).entries.push(entry);
  }
  const onlyVisit = entries.length === 0 || entries.every((entry) => entry.type === 'opened');

  return (
    <section className="readings" aria-labelledby="readings-title">
      <div className="section-toolbar">
        <h2 id="readings-title">Readings</h2>
        <span className="plain-label">
          {error ? 'Not readable in this browser' : <><span className="readout">{entries.length}</span> {entries.length === 1 ? 'entry' : 'entries'} · kept in this browser</>}
        </span>
      </div>
      {error && <p className="verification-note" role="status">{error}</p>}
      {days.map(({ day, entries: dayEntries }) => (
        <div key={day} className="readings-day">
          <h3>{day}</h3>
          <ol className="readings-log">
            {dayEntries.map((entry) => {
              const { event, detail } = describe(entry, level, record, previousRun.get(entry.run));
              return (
                <li key={`${entry.type}:${entry.at}:${entry.run ?? entry.tier ?? ''}`}>
                  <span className="readout readings-time">{formatTime(entry.at)}</span>
                  <span className={`readings-event ${entry.type === 'run' || entry.type === 'hint' ? 'readout' : ''}`}>{event}</span>
                  <span className="readings-detail">{detail}</span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
      {onlyVisit && !error && <p className="verification-note">Runs and hint tiers are logged here as you work. Hint text is never recorded.</p>}
      {entries.length > SHOWN && (
        <button type="button" className="text-button" aria-expanded={showAll} onClick={() => setShowAll((value) => !value)}>
          {showAll ? 'Show the latest entries' : `Show all ${entries.length} entries`}
        </button>
      )}
    </section>
  );
}
