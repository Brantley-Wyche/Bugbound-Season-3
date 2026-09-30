const KEY = 'bugbound:learning:v1';
/** Newest events kept per incident; lifetime counters are kept separately. */
export const MAX_EVENTS = 50;
const MAX_RESETS = 20;
const EVENT_TYPES = ['opened', 'run', 'hint'];

function emptyStore() {
  return { version: 1, levels: {} };
}

const isCount = (value) => Number.isSafeInteger(value) && value >= 0;

function validEvent(event) {
  if (!event || typeof event !== 'object' || !EVENT_TYPES.includes(event.type) || typeof event.at !== 'string') return false;
  if (event.type === 'run') return isCount(event.run) && event.run > 0 && isCount(event.passed) && isCount(event.total) && event.passed <= event.total;
  if (event.type === 'hint') return [1, 2, 3].includes(event.tier);
  return true;
}

function parseStore(raw) {
  if (raw === null) return emptyStore();
  const parsed = JSON.parse(raw);
  if (parsed?.version !== 1 || !parsed.levels || typeof parsed.levels !== 'object' || Array.isArray(parsed.levels)) {
    throw new Error('Saved learning history has an invalid format.');
  }
  if (parsed.resets !== undefined && (!Array.isArray(parsed.resets) || parsed.resets.some((at) => typeof at !== 'string'))) {
    throw new Error('Saved learning history has invalid reset records.');
  }
  for (const activity of Object.values(parsed.levels)) {
    if (!activity || typeof activity !== 'object' || Array.isArray(activity)
      || ['checkRuns', 'passedRuns', 'failedRuns'].some((field) => activity[field] !== undefined && !isCount(activity[field]))
      || (activity.hintsRevealed !== undefined && (!Array.isArray(activity.hintsRevealed) || activity.hintsRevealed.some((tier) => ![1, 2, 3].includes(tier))))
      || (activity.events !== undefined && (!Array.isArray(activity.events) || !activity.events.every(validEvent)))
      || (activity.conclusion !== undefined && typeof activity.conclusion !== 'string')) {
      throw new Error('Saved learning history contains an invalid activity record.');
    }
  }
  return parsed;
}

function loadStore() {
  return parseStore(localStorage.getItem(KEY));
}

const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());

function writeStore(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch (error) {
    return { ok: false, operation: 'save', message: `Could not save learning history. ${error.message}` };
  }
  notify();
  return { ok: true };
}

/** Applies updater to one incident's activity. `worked` marks it as the learner's latest work. */
function updateLevel(levelId, updater, { worked = true } = {}) {
  let store;
  try {
    store = loadStore();
  } catch (error) {
    return { ok: false, operation: 'read', message: `Could not read saved learning history. ${error.message}` };
  }
  const current = store.levels[levelId] || {
    checkRuns: 0,
    passedRuns: 0,
    failedRuns: 0,
    hintsRevealed: [],
  };
  const next = updater(current);
  if (next === current) return { ok: true, activity: current };
  store.levels[levelId] = worked ? { ...next, lastPracticedAt: new Date().toISOString() } : next;
  const result = writeStore(store);
  return result.ok ? { ...result, activity: store.levels[levelId] } : result;
}

const appendEvent = (activity, event) => [...(activity.events || []), event].slice(-MAX_EVENTS);

/** Logs the first visit only, and only for an incident with no earlier activity. */
export function recordVisit(levelId) {
  return updateLevel(levelId, (current) => {
    const touched = current.events?.length || current.checkRuns || current.hintsRevealed?.length;
    if (touched) return current;
    return { ...current, events: appendEvent(current, { type: 'opened', at: new Date().toISOString() }) };
  }, { worked: false });
}

/** Returns { ok, run, at } where run numbers every finished run on the incident across visits. */
export function recordCheckRun(levelId, results) {
  const passedCount = results.filter((result) => result.pass).length;
  const passed = results.length > 0 && passedCount === results.length;
  const at = new Date().toISOString();
  let run = null;
  const result = updateLevel(levelId, (current) => {
    run = (current.checkRuns || 0) + 1;
    return {
      ...current,
      checkRuns: run,
      passedRuns: (current.passedRuns || 0) + (passed ? 1 : 0),
      failedRuns: (current.failedRuns || 0) + (passed ? 0 : 1),
      events: appendEvent(current, { type: 'run', at, run, passed: passedCount, total: results.length }),
    };
  });
  return result.ok ? { ...result, run, at } : { ...result, at };
}

/** Records the tier number the first time it opens; hint text is never stored. */
export function recordHintReveal(levelId, tier) {
  return updateLevel(levelId, (current) => {
    if ((current.hintsRevealed || []).includes(tier)) return current;
    return {
      ...current,
      hintsRevealed: [...new Set([...(current.hintsRevealed || []), tier])].sort(),
      events: appendEvent(current, { type: 'hint', at: new Date().toISOString(), tier }),
    };
  });
}

export const MAX_CONCLUSION = 4000;

/** The learner's optional conclusion, kept with the incident's readings. */
export function saveConclusion(levelId, text) {
  const conclusion = String(text).slice(0, MAX_CONCLUSION);
  return updateLevel(levelId, (current) => (current.conclusion === conclusion ? current : { ...current, conclusion }), { worked: false });
}

/** A progress reset clears repairs; readings are kept and show where the reset happened. */
export function recordReset() {
  let store;
  try {
    store = loadStore();
  } catch (error) {
    return { ok: false, operation: 'read', message: `Could not read saved learning history. ${error.message}` };
  }
  store.resets = [...(store.resets || []), new Date().toISOString()].slice(-MAX_RESETS);
  return writeStore(store);
}

let cached = { raw: undefined, snapshot: null };

/** Stable snapshot for useSyncExternalStore: { store, error }. */
export function getLearningSnapshot() {
  let raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch (error) {
    raw = { error: error.message };
  }
  if (cached.snapshot && (raw === cached.raw || (typeof raw === 'object' && raw?.error === cached.raw?.error))) return cached.snapshot;
  let snapshot;
  if (typeof raw === 'object' && raw !== null) snapshot = { store: emptyStore(), error: `Could not read saved learning history. ${raw.error}` };
  else {
    try {
      snapshot = { store: parseStore(raw), error: null };
    } catch (error) {
      snapshot = { store: emptyStore(), error: `Could not read saved learning history. ${error.message}` };
    }
  }
  cached = { raw, snapshot };
  return snapshot;
}

export function subscribeLearning(listener) {
  listeners.add(listener);
  const onStorage = (event) => {
    if (event.key === null || event.key === KEY) listener();
  };
  globalThis.addEventListener?.('storage', onStorage);
  return () => {
    listeners.delete(listener);
    globalThis.removeEventListener?.('storage', onStorage);
  };
}

/** One incident's readings, newest entry first, with resets placed after its first entry. */
export function readingsFor(store, levelId) {
  const activity = store.levels[levelId] || {};
  const events = [...(activity.events || [])];
  const first = events[0]?.at;
  if (first) {
    for (const at of store.resets || []) if (at > first) events.push({ type: 'reset', at });
  }
  events.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  return {
    runs: activity.checkRuns || 0,
    hints: activity.hintsRevealed || [],
    lastWorked: activity.lastPracticedAt || null,
    conclusion: activity.conclusion || '',
    entries: events,
    runEvents: (activity.events || []).filter((event) => event.type === 'run'),
  };
}

/** The incident the learner worked on most recently, among ids. */
export function lastWorkedId(store, ids) {
  let latest = null;
  for (const id of ids) {
    const at = store.levels[id]?.lastPracticedAt;
    if (at && (!latest || at > latest.at)) latest = { id, at };
  }
  return latest?.id ?? null;
}

export function createLearningProfile(levels, completed, progressFailure = null, records = new Map()) {
  if (progressFailure) throw new Error('Resolve the saved repairs error before exporting your learning profile.');
  let telemetry;
  try {
    telemetry = loadStore();
  } catch (error) {
    throw new Error(`Learning history unavailable for export: could not read saved history. ${error.message}`);
  }
  return {
    format: 'bugbound-learning-profile',
    version: 1,
    exportedAt: new Date().toISOString(),
    summary: {
      completed: levels.filter((level) => completed.has(level.id)).length,
      available: levels.length,
    },
    levels: levels.map((level) => {
      const activity = telemetry.levels[level.id] || {};
      return {
        id: level.id,
        number: level.number,
        title: level.title,
        concept: level.concept,
        completed: completed.has(level.id),
        repairedAt: records.get(level.id)?.at ?? null,
        checkRuns: activity.checkRuns || 0,
        failedRuns: activity.failedRuns || 0,
        hintsRevealed: activity.hintsRevealed || [],
        lastPracticedAt: activity.lastPracticedAt || null,
      };
    }),
  };
}
