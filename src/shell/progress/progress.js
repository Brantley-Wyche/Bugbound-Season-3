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
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(`${EVENT_PREFIX}${generation}:`)) continue;
    const value = JSON.parse(storage.getItem(key));
    if (!value || value.version !== 2 || value.generation !== generation || typeof value.id !== 'string') {
      throw new Error('Saved progress contains an invalid completion record.');
    }
    if (!validIds.length || validIds.includes(value.id)) completed.add(value.id);
  }
  return { completed, generation };
}

function failure(operation, error) {
  const action = operation === 'read' ? 'read' : operation === 'save' ? 'save' : 'reset';
  return { operation, message: `Could not ${action} saved completion in this browser. ${error?.message || 'Please retry.'}` };
}

/** Independent completion records prevent concurrent tabs from overwriting each other's saves. */
export function createProgressController(validIds = [], { storage = browserStorage } = {}) {
  const listeners = new Set();
  const pending = new Set();
  let resetPending = false;
  let knownGeneration = null;
  let awaitingFirstRead = false;
  let revision = 0;
  let snapshot = { completed: new Set(), failure: null, revision };
  const emit = () => {
    snapshot = { ...snapshot, revision };
    listeners.forEach((listener) => listener());
    return snapshot;
  };
  const fail = (operation, error) => {
    snapshot = { ...snapshot, failure: failure(operation, error) };
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
      snapshot = { completed: state.completed, failure: resetPending ? snapshot.failure : pending.size ? failure('save') : null, revision };
      return emit();
    } catch (error) {
      if (knownGeneration === null) awaitingFirstRead = true;
      return fail(resetPending ? 'reset' : 'read', error);
    }
  };
  const writePending = () => {
    if (resetPending) return snapshot;
    for (const id of [...pending]) {
      let state;
      try { state = readState(storage, validIds); }
      catch (error) { return fail('read', error); }
      if (state.generation !== knownGeneration) {
        reload();
        return snapshot;
      }
      try {
        storage.setItem(`${EVENT_PREFIX}${knownGeneration}:${newId()}`, JSON.stringify({ version: 2, generation: knownGeneration, id }));
        pending.delete(id);
      } catch (error) {
        return fail('save', error);
      }
    }
    return reload();
  };
  const markComplete = (id) => {
    if (validIds.length && !validIds.includes(id)) return snapshot;
    const previous = knownGeneration;
    reload();
    // A result cannot be assigned to a reset generation we never observed.
    // The first successful read invalidates the visit so verification can run again.
    if (resetPending || previous === null || knownGeneration !== previous) return snapshot;
    if (snapshot.completed.has(id)) return snapshot;
    pending.add(id);
    if (snapshot.failure?.operation === 'read') return snapshot;
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
      resetPending = false;
      revision++;
      snapshot = { completed: new Set(), failure: null, revision };
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
