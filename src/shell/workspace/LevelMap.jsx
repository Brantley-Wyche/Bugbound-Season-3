import { getPracticeLevels, filterChallenges, groupBatches, benchIncident } from './practice.js';
import { levelHref } from './navigation.js';
import { useLearning } from '../progress/useLearning.js';
import { lastWorkedId, readingsFor } from '../progress/learning.js';
import { bugId, formatDate, formatDay, formatDayInline, formatTime, pad2 } from '../format.js';
import ReadingsRow from '../investigation/ReadingsRow.jsx';
import Icon from '../Icon.jsx';

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

function activityFor(store, id) {
  const activity = store.levels[id];
  const runs = activity?.checkRuns || 0;
  const hints = activity?.hintsRevealed?.length || 0;
  return [runs && plural(runs, 'run'), hints && plural(hints, 'hint')].filter(Boolean).join(' · ');
}

function RegisterRow({ level, record, unsaved, onBench, activity }) {
  const href = levelHref(level.id);
  // A plain click anywhere on the row opens it; the title stays the real link.
  const openRow = (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.target.closest('a')) return;
    window.location.hash = href;
  };
  return (
    <tr className={`register-row ${onBench ? 'is-bench' : ''}`} onClick={openRow}>
      <td className="col-case readout">{bugId(level.number)}</td>
      <th scope="row" className="col-title">
        <a href={href}>{level.title}</a>
        <span className="row-concept">{level.concept}</span>
      </th>
      <td className="col-concept">{level.concept}</td>
      <td className="col-severity">{level.severity}</td>
      <td className="col-activity readout">
        {activity || <><span aria-hidden="true">—</span><span className="sr-only">No activity yet</span></>}
      </td>
      <td className="col-status">
        {record ? (
          <span className="status-repaired"><Icon name="check" size={14} />Repaired{record.at && <> <span className="readout">{formatDayInline(record.at)}</span></>}</span>
        ) : (
          <span className={`status-open ${onBench ? '' : 'is-quiet'}`}><span className="state-dot" aria-hidden="true" />Open</span>
        )}
        {unsaved && <span className="status-qualifier row-qualifier">Not saved yet</span>}
      </td>
      <td className="col-go" aria-hidden="true"><Icon name="arrow" size={16} /></td>
    </tr>
  );
}

function RegisterTable({ labelledBy, levels, records, unsaved, benchId, store }) {
  return (
    <table className="register-table" aria-labelledby={labelledBy}>
      <thead>
        <tr>
          <th scope="col" className="col-case">Case</th>
          <th scope="col" className="col-title">Incident</th>
          <th scope="col" className="col-concept">Concept</th>
          <th scope="col" className="col-severity">Severity</th>
          <th scope="col" className="col-activity">Activity</th>
          <th scope="col" className="col-status">Status</th>
          <td className="col-go" />
        </tr>
      </thead>
      <tbody>
        {levels.map((level) => (
          <RegisterRow key={level.id} level={level} record={records.get(level.id)} unsaved={unsaved.has(level.id)}
            onBench={level.id === benchId} activity={activityFor(store, level.id)} />
        ))}
      </tbody>
    </table>
  );
}

function Bench({ bench, store }) {
  const { level } = bench;
  return (
    <section className="bench" aria-labelledby="bench-title">
      <span className="incident-index">{pad2(level.number)}</span>
      <div className="bench-body">
        <h2 id="bench-title">{level.title}</h2>
        <p className="bench-report">{level.symptom}</p>
        <ReadingsRow className="is-compact" level={level} record={null} unsaved={false} readings={readingsFor(store, level.id)} />
        <div className="bench-actions">
          <a className="btn btn-primary" href={levelHref(level.id)}>{bench.continuing ? 'Continue' : 'Start'} incident <span className="readout">{pad2(level.number)}</span><Icon name="arrow" size={16} /></a>
          <span className="quiet">{bench.continuing ? 'You worked on it last.' : bench.reason} Every incident is open to choose.</span>
        </div>
      </div>
    </section>
  );
}

function LabRecord({ levels, records, store }) {
  const times = [...records.values()].map((record) => record.at).filter(Boolean).sort();
  const runs = levels.reduce((sum, level) => sum + (store.levels[level.id]?.checkRuns || 0), 0);
  const hints = levels.reduce((sum, level) => sum + (store.levels[level.id]?.hintsRevealed?.length || 0), 0);
  const batches = groupBatches(getPracticeLevels(levels, 'generated')).length;
  return (
    <section className="lab-record" aria-labelledby="record-title">
      <h2 id="record-title"><Icon name="check" size={18} />Every incident repaired</h2>
      <p><span className="readout">{levels.length}</span> of <span className="readout">{levels.length}</span> incidents repaired. Revisit any incident to check your current source.</p>
      <dl className="readings-row is-compact">
        {times.length > 0 && <>
          <div className="readings-field"><dt>First repaired</dt><dd className="readout">{formatDay(times[0])}</dd></div>
          <div className="readings-field"><dt>Last repaired</dt><dd className="readout">{formatDay(times.at(-1))}</dd></div>
        </>}
        <div className="readings-field"><dt>Runs</dt><dd className="readout">{pad2(runs)}</dd></div>
        <div className="readings-field"><dt>Hints opened</dt><dd className="readout">{pad2(hints)}</dd></div>
        <div className="readings-field"><dt>Batches</dt><dd className="readout">{pad2(batches)}</dd></div>
      </dl>
      <div className="bench-actions">
        <a className="btn btn-primary" href="#/brief">Brief an incident<Icon name="arrow" size={16} /></a>
        <span className="quiet">The lab stays open. Each brief adds a batch to the register.</span>
      </div>
    </section>
  );
}

export default function LevelMap({ levels, completed, records, unsaved, filters, onFiltersChange }) {
  const { store } = useLearning();
  const generated = getPracticeLevels(levels, 'generated');
  const foundations = getPracticeLevels(levels, 'foundations');
  const bench = benchIncident(levels, completed, lastWorkedId(store, levels.map((level) => level.id)));
  const allRepaired = levels.length > 0 && levels.every((level) => completed.has(level.id));
  const visible = new Set(filterChallenges(levels, filters, completed).map((level) => level.id));
  const batches = groupBatches(generated.filter((level) => visible.has(level.id)));
  const shownFoundations = foundations.filter((level) => visible.has(level.id));
  const filtering = Boolean(filters.query.trim()) || filters.status !== 'all';
  const changeFilter = (key, value) => onFiltersChange({ ...filters, [key]: value });
  const tableProps = { records, unsaved, benchId: bench?.level.id, store };

  const repairTimes = [...records.values()].map((record) => record.at).filter(Boolean);
  const latestRepair = repairTimes.sort().at(-1);
  const latestReset = store.resets?.at(-1);
  const showReset = latestReset && (!latestRepair || latestReset > latestRepair);

  return (
    <main className="practice-page" id="main-content" tabIndex={-1}>
      <div className="practice-heading">
        <h1 id="page-title" tabIndex={-1}>Practice</h1>
        <a href="#/brief" className="btn"><Icon name="plus" /> Brief an incident</a>
      </div>

      {allRepaired ? <LabRecord levels={levels} records={records} store={store} /> : bench && <Bench bench={bench} store={store} />}

      <section className="register" aria-labelledby="register-title">
        <div className="register-heading">
          <div className="register-title">
            <h2 id="register-title">Incident register</h2>
            <span className="register-count"><span className="readout">{levels.length}</span> incidents · <span className="readout">{levels.filter((level) => completed.has(level.id)).length}</span> repaired</span>
          </div>
          <div className="register-filters">
            <label className="search-field"><Icon name="search" size={17} /><span className="sr-only">Search incidents</span>
              <input type="search" value={filters.query} onChange={(event) => changeFilter('query', event.target.value)} placeholder="Search title or concept…" />
            </label>
            <label className="status-filter"><span className="sr-only">Filter by status</span>
              <select value={filters.status} onChange={(event) => changeFilter('status', event.target.value)}>
                <option value="all">All statuses</option><option value="open">Open</option><option value="completed">Repaired</option>
              </select>
            </label>
          </div>
        </div>
        {showReset && (
          <p className="register-reset"><Icon name="refresh" size={16} />Repairs reset {formatDayInline(latestReset)} at <span className="readout">{formatTime(latestReset)}</span>. Readings were kept.</p>
        )}

        <h3 id="generated-title" className="register-group">Generated</h3>
        {generated.length === 0 ? (
          <div className="register-empty">
            <p>No generated incidents yet. Write a brief, hand it to your coding agent, and have it follow the repository’s authoring and verification instructions.</p>
            <a className="btn" href="#/brief">Brief an incident</a>
          </div>
        ) : batches.length === 0 ? (
          <p className="register-caption">No generated incidents match these filters.</p>
        ) : batches.map((batch) => {
          const captionId = `batch-${batch.date ?? 'undated'}`;
          return (
            <div key={captionId} className="register-batch">
              <p className="register-caption" id={captionId}>
                {batch.date ? <>Batch <span className="readout">{formatDate(batch.date, { year: true })}</span></> : 'Undated batch'} · {plural(batch.levels.length, 'incident')}
              </p>
              <RegisterTable labelledBy={`generated-title ${captionId}`} levels={batch.levels} {...tableProps} />
            </div>
          );
        })}

        <h3 id="foundations-title" className="register-group" tabIndex={-1}>Foundations</h3>
        <p className="register-caption" id="foundations-caption">
          The original curriculum · {plural(foundations.length, 'incident')} · <span className="readout">{foundations.filter((level) => completed.has(level.id)).length}</span> repaired
        </p>
        {shownFoundations.length ? (
          <RegisterTable labelledBy="foundations-title foundations-caption" levels={shownFoundations} {...tableProps} />
        ) : (
          <p className="register-caption">No foundations match these filters.</p>
        )}

        {filtering && visible.size === 0 && (
          <button className="btn register-clear" onClick={() => onFiltersChange({ query: '', status: 'all' })}>Clear filters</button>
        )}
        <p className="register-footnote" aria-live="polite">Showing {visible.size} of {plural(levels.length, 'incident')}. Repaired records an earlier successful run; a revisit starts unchecked.</p>
      </section>
      <div className="practice-endnote"><Icon name="file" size={20} /><p>New incidents are discovered from your local repository. Have your agent validate them and prove their checks in both directions before you begin.</p></div>
    </main>
  );
}
