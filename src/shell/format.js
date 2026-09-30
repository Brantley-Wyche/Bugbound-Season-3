/** Two-digit folio or count: 3 → "03". */
export const pad2 = (value) => String(value).padStart(2, '0');

/** "BUG-016" for incident 16. */
export const bugId = (number) => `BUG-${String(number).padStart(3, '0')}`;

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "2:14 PM" in the learner's locale. */
export function formatTime(iso) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
}

/** "2:13:48 PM", for readouts that change within a minute. */
export function formatClock(iso) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(new Date(iso));
}

/** A calendar date such as a manifest's "2026-07-04", read in local time: "Jul 4" or "Jul 4, 2025". */
export function formatDate(dateOnly, now = new Date()) {
  const [year, month, day] = dateOnly.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const options = year === now.getFullYear() ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' };
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

/** The day inside a sentence: "Repaired today", "Repaired Sep 24". */
export function formatDayInline(iso, now = new Date()) {
  const day = formatDay(iso, now);
  return day === 'Today' ? 'today' : day;
}

/** "Today", "Sep 24", or "Sep 24, 2025" outside the current year. */
export function formatDay(iso, now = new Date()) {
  const date = new Date(iso);
  if (sameDay(date, now)) return 'Today';
  const options = date.getFullYear() === now.getFullYear()
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
  return new Intl.DateTimeFormat(undefined, options).format(date);
}
