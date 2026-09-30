import Icon from '../Icon.jsx';
import { bugId, formatDate, formatDay, formatDayInline, formatTime, pad2 } from '../format.js';

function Field({ label, children }) {
  return <div className="readings-field"><dt>{label}</dt><dd>{children}</dd></div>;
}

/** The ruled row under an incident's title: what it is, where it came from, and the learner's readings. */
export default function ReadingsRow({ level, record, unsaved, readings, className = '' }) {
  const worked = readings.runs > 0 || readings.hints.length > 0;
  return (
    <dl className={`readings-row ${className}`}>
      <Field label="Case"><span className="readout">{bugId(level.number)}</span></Field>
      <Field label="Concept">{level.concept}</Field>
      <Field label="Severity">{level.severity}</Field>
      {level.difficulty && <Field label="Difficulty">{level.difficulty}</Field>}
      <Field label="Origin">{level.generatedAt ? <>Generated <span className="readout">{formatDate(level.generatedAt)}</span></> : 'Foundations'}</Field>
      <Field label="Status">
        {record ? (
          <span className="status-repaired"><Icon name="check" size={14} />Repaired{record.at && <> <span className="readout">{formatDayInline(record.at)}</span></>}{unsaved && <span className="status-qualifier"> · not saved yet</span>}</span>
        ) : (
          <span className="status-open"><span className="state-dot" aria-hidden="true" />Open</span>
        )}
      </Field>
      {worked && <>
        <Field label="Runs"><span className="readout">{pad2(readings.runs)}</span></Field>
        <Field label="Hints opened">{readings.hints.length ? <span className="readout">{readings.hints.map(pad2).join(' ')}</span> : 'None'}</Field>
        {readings.lastWorked && <Field label="Last worked">{formatDay(readings.lastWorked)} <span className="readout">{formatTime(readings.lastWorked)}</span></Field>}
      </>}
    </dl>
  );
}
