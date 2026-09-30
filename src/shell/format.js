/** Two-digit folio or count: 3 → "03". */
export const pad2 = (value) => String(value).padStart(2, '0');

/** "BUG-016" for incident 16. */
export const bugId = (number) => `BUG-${String(number).padStart(3, '0')}`;

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "2:14 PM" in the learner's locale. */
export function formatTime(iso) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
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
