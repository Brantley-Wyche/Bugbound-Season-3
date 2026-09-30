const LEGACY_KEY = 'bugbound:progress:v1';
const META_KEY = 'bugbound:progress:v2:meta';
const EVENT_PREFIX = 'bugbound:progress:v2:event:';
const INITIAL_GENERATION = 'initial';
const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
const browserStorage = {
  get length() { return globalThis.localStorage.length; },
  key(index) { return globalThis.localStorage.key(index); },
  getItem(key) { return globalThis.localStorage.getItem(key); },
  setItem(key, value) { return globalThis.localStorage.setItem(key, value); },
};

export function sanitizeCompleted(values, validIds = []) {
  const saved = Array.isArray(values) ? values : [];
  if (!validIds.length) return new Set(saved);
  const valid = new Set(validIds);
  return new Set(saved.filter((id) => valid.has(id)));
}

function readState(storage, validIds) {
  const metaRaw = storage.getItem(META_KEY);
  const meta = metaRaw === null ? null : JSON.parse(metaRaw);
  if (metaRaw !== null && (!meta || meta.version !== 2 || typeof meta.generation !== 'string')) {
    throw new Error('Saved progress has invalid reset metadata.');
  }
  const generation = meta?.generation ?? INITIAL_GENERATION;
  const legacyRaw = storage.getItem(LEGACY_KEY);
  let legacy = [];
  if (!meta && legacyRaw !== null) {
    legacy = JSON.parse(legacyRaw);
    if (!Array.isArray(legacy) || legacy.some((id) => typeof id !== 'string')) {
      throw new Error('Saved progress has an invalid legacy value.');
    }
  }
  const completed = sanitizeCompleted(legacy, validIds);
  const records = new Map([...completed].map((id) => [id, { at: null, run: null }]));
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(`${EVENT_PREFIX}${generation}:`)) continue;
    const value = JSON.parse(storage.getItem(key));
    if (!value || value.version !== 2 || value.generation !== generation || typeof value.id !== 'string'
      || (value.at !== undefined && typeof value.at !== 'string')
      || (value.run !== undefined && (!Number.isSafeInteger(value.run) || value.run < 1))) {
      throw new Error('Saved progress contains an invalid completion record.');
    }
    if (validIds.length && !validIds.includes(value.id)) continue;
    completed.add(value.id);
    // Two tabs can record the same repair; the earliest record is the repair.
    const known = records.get(value.id);
    if (!known || (value.at && (!known.at || value.at < known.at))) {
      records.set(value.id, { at: value.at ?? null, run: value.run ?? null });
    }
  }
  return { completed, records, generation };
}

function failure(operation, error) {
  const action = operation === 'read' ? 'read' : operation === 'save' ? 'save' : 'reset';
  return { operation, message: `Could not ${action} saved repairs in this browser. ${error?.message || 'Please retry.'}` };
}

/**
 * Independent completion records prevent concurrent tabs from overwriting each other's saves.
 * The snapshot's `completed` includes repairs that could not be saved yet; `unsaved` names them,
 * and `records` holds each repair's time and run number when they were recorded.
 */
export function createProgressController(validIds = [], { storage = browserStorage } = {}) {
  const listeners = new Set();
  const pending = new Map();
  let saved = { completed: new Set(), records: new Map() };
  let resetPending = false;
  let knownGeneration = null;
  let awaitingFirstRead = false;
  let revision = 0;
  const withPending = () => {
    const completed = new Set(saved.completed);
    const records = new Map(saved.records);
    for (const [id, details] of pending) {
      completed.add(id);
      if (!records.has(id)) records.set(id, details);
    }
    return { completed, records, unsaved: new Set(pending.keys()) };
  };
  let snapshot = { ...withPending(), failure: null, revision };
  const emit = () => {
    snapshot = { ...snapshot, revision };
    listeners.forEach((listener) => listener());
    return snapshot;
  };
  const fail = (operation, error) => {
    snapshot = { ...snapshot, ...withPending(), failure: failure(operation, error) };
    return emit();
  };
  const reload = () => {
    try {
      const state = readState(storage, validIds);
      if (awaitingFirstRead || (knownGeneration !== null && knownGeneration !== state.generation)) {
        revision++;
        pending.clear();
        resetPending = false;
      }
      awaitingFirstRead = false;
      knownGeneration = state.generation;
      saved = { completed: state.completed, records: state.records };
      snapshot = { ...withPending(), failure: resetPending ? snapshot.failure : pending.size ? failure('save') : null, revision };
      return emit();
    } catch (error) {
      if (knownGeneration === null) awaitingFirstRead = true;
      return fail(resetPending ? 'reset' : 'read', error);
    }
  };
  const writePending = () => {
    if (resetPending) return snapshot;
    for (const [id, details] of [...pending]) {
      let state;
      try { state = readState(storage, validIds); }
      catch (error) { return fail('read', error); }
      if (state.generation !== knownGeneration) {
        reload();
        return snapshot;
      }
      const record = { version: 2, generation: knownGeneration, id, at: details.at };
      if (details.run) record.run = details.run;
      try {
        storage.setItem(`${EVENT_PREFIX}${knownGeneration}:${newId()}`, JSON.stringify(record));
        pending.delete(id);
      } catch (error) {
        return fail('save', error);
      }
    }
    return reload();
  };
  /** details: { at, run } of the repairing run; `at` defaults to now, `run` may be unknown. */
  const markComplete = (id, details = {}) => {
    if (validIds.length && !validIds.includes(id)) return snapshot;
    const previous = knownGeneration;
    reload();
    // A result cannot be assigned to a reset generation we never observed.
    // The first successful read invalidates the visit so verification can run again.
    if (resetPending || previous === null || knownGeneration !== previous) return snapshot;
    if (snapshot.completed.has(id)) return snapshot;
    pending.set(id, {
      at: details.at ?? new Date().toISOString(),
      run: Number.isSafeInteger(details.run) && details.run > 0 ? details.run : null,
    });
    if (snapshot.failure?.operation === 'read') {
      snapshot = { ...snapshot, ...withPending() };
      return emit();
    }
    return writePending();
  };
  const resetProgress = () => {
    resetPending = true;
    try {
      readState(storage, validIds);
      const generation = newId();
      storage.setItem(META_KEY, JSON.stringify({ version: 2, generation }));
      knownGeneration = generation;
      pending.clear();
      saved = { completed: new Set(), records: new Map() };
      resetPending = false;
      revision++;
      snapshot = { ...withPending(), failure: null, revision };
      return emit();
    } catch (error) {
      return fail('reset', error);
    }
  };
  const retry = () => {
    if (resetPending) return resetProgress();
    reload();
    if (snapshot.failure?.operation === 'read') return snapshot;
    return writePending();
  };
  reload();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    reload, markComplete, resetProgress, retry,
  };
}
