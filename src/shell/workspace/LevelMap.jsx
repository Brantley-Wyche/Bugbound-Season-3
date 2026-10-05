import { useEffect, useState } from 'react';
import { getPracticeLevels, filterChallenges, groupBatches, benchIncident } from './practice.js';
import { levelHref } from './navigation.js';
import { useLearning } from '../progress/useLearning.js';
import { lastWorkedId, readingsFor } from '../progress/learning.js';
import { bugId, formatDate, formatDay, formatDayInline, formatTime, pad2 } from '../format.js';
import ReadingsRow from '../investigation/ReadingsRow.jsx';
import Icon from '../Icon.jsx';

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** The value once it has stopped changing for `delay` ms. */
function useSettled(value, delay) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
}

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

/** A repair record for a set of incidents: dates, runs, hints and conclusions, drawn like the Repaired entry. */
function RecordBand({ title, lead, levels, records, store, extraFields = null, aside }) {
  const times = levels.map((level) => records.get(level.id)?.at).filter(Boolean).sort();
  const runs = levels.reduce((sum, level) => sum + (store.levels[level.id]?.checkRuns || 0), 0);
  const hints = levels.reduce((sum, level) => sum + (store.levels[level.id]?.hintsRevealed?.length || 0), 0);
  const conclusions = levels.filter((level) => store.levels[level.id]?.conclusion?.trim()).length;
  return (
    <section className="lab-record" aria-labelledby="record-title">
      <h2 id="record-title"><Icon name="check" size={18} />{title}</h2>
      <p>{lead}</p>
      <dl className="readings-row is-compact">
        {times.length > 0 && <>
          <div className="readings-field"><dt>First repaired</dt><dd className="readout">{formatDay(times[0])}</dd></div>
          <div className="readings-field"><dt>Last repaired</dt><dd className="readout">{formatDay(times.at(-1))}</dd></div>
        </>}
        <div className="readings-field"><dt>Runs</dt><dd className="readout">{pad2(runs)}</dd></div>
        <div className="readings-field"><dt>Hints opened</dt><dd className="readout">{pad2(hints)}</dd></div>
        <div className="readings-field"><dt>Conclusions</dt><dd className="readout">{pad2(conclusions)}</dd></div>
        {extraFields}
      </dl>
      <div className="bench-actions">
        <a className="btn btn-primary" href="#/brief">Brief an incident<Icon name="arrow" size={16} /></a>
        {aside}
      </div>
    </section>
  );
}

function LabRecord({ levels, records, store }) {
  const batches = groupBatches(getPracticeLevels(levels, 'generated')).length;
  return (
    <RecordBand
      title="Every incident repaired"
      lead={<><span className="readout">{levels.length}</span> of <span className="readout">{levels.length}</span> incidents repaired. Revisit any incident to check your current source.</>}
      levels={levels} records={records} store={store}
      extraFields={<div className="readings-field"><dt>Batches</dt><dd className="readout">{pad2(batches)}</dd></div>}
      aside={<span className="quiet">The lab stays open. Each brief adds a batch to the register.</span>}
    />
  );
}

/** Every generated incident is repaired: the latest batch's record, and the next brief as the next step. */
function BatchRecord({ generated, foundationsNext, records, store }) {
  const batches = groupBatches(generated);
  const latest = batches[0];
  const count = latest.levels.length;
  return (
    <RecordBand
      title={latest.date ? <>Batch <span className="readout">{formatDate(latest.date, { year: true })}</span> repaired</> : 'Batch repaired'}
      lead={<>
        <span className="readout">{count}</span> of <span className="readout">{count}</span> incidents in this batch repaired
        {batches.length > 1 && <>, and all <span className="readout">{batches.length}</span> batches before it</>}. Brief your agent for the next batch.
      </>}
      levels={latest.levels} records={records} store={store}
      aside={foundationsNext && (
        <a className="inline-link" href={levelHref(foundationsNext.level.id)}>
          {foundationsNext.continuing ? 'Or continue' : 'Or revisit Foundations with'} incident <span className="readout">{pad2(foundationsNext.level.number)}</span> {foundationsNext.level.title}
        </a>
      )}
    />
  );
}

export default function LevelMap({ levels, completed, records, unsaved, filters, onFiltersChange }) {
  const { store } = useLearning();
  const generated = getPracticeLevels(levels, 'generated');
  const foundations = getPracticeLevels(levels, 'foundations');
  const bench = benchIncident(levels, completed, lastWorkedId(store, levels.map((level) => level.id)));
  const allRepaired = levels.length > 0 && levels.every((level) => completed.has(level.id));
  // Generated practice leads: once every generated incident is repaired, the season's end is that batch's record.
  const generatedRepaired = generated.length > 0 && generated.every((level) => completed.has(level.id));
  const visible = new Set(filterChallenges(levels, filters, completed).map((level) => level.id));
  const batches = groupBatches(generated.filter((level) => visible.has(level.id)));
  const shownFoundations = foundations.filter((level) => visible.has(level.id));
  const filtering = Boolean(filters.query.trim()) || filters.status !== 'all';
  // Announce the result count once typing pauses, not on every keystroke.
  const announcedCount = useSettled(`Showing ${visible.size} of ${plural(levels.length, 'incident')}.`, 700);
  const changeFilter = (key, value) => onFiltersChange({ ...filters, [key]: value });
  const showBench = !allRepaired && !generatedRepaired;
  const tableProps = { records, unsaved, benchId: showBench ? bench?.level.id : undefined, store };

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

      {allRepaired ? <LabRecord levels={levels} records={records} store={store} />
        : generatedRepaired ? <BatchRecord generated={generated} foundationsNext={bench} records={records} store={store} />
          : bench && <Bench bench={bench} store={store} />}

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
        <p className="register-footnote">Showing {visible.size} of {plural(levels.length, 'incident')}. Repaired records an earlier successful run; a revisit starts unchecked.</p>
        <p className="sr-only" role="status">{filtering ? announcedCount : ''}</p>
      </section>
      <div className="practice-endnote"><Icon name="file" size={20} /><p>New incidents are discovered from your local repository. Have your agent validate them and prove their checks in both directions before you begin.</p></div>
    </main>
  );
}
