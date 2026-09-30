const KEY = 'bugbound:learning:v1';

function emptyStore() {
  return { version: 1, levels: {} };
}

function loadStore() {
  const raw = localStorage.getItem(KEY);
  if (raw === null) return emptyStore();
  const parsed = JSON.parse(raw);
  if (parsed?.version !== 1 || !parsed.levels || typeof parsed.levels !== 'object' || Array.isArray(parsed.levels)) {
    throw new Error('Saved learning history has an invalid format.');
  }
  for (const activity of Object.values(parsed.levels)) {
    if (!activity || typeof activity !== 'object' || Array.isArray(activity)
      || ['checkRuns', 'passedRuns', 'failedRuns'].some((field) => activity[field] !== undefined && (!Number.isSafeInteger(activity[field]) || activity[field] < 0))
      || (activity.hintsRevealed !== undefined && (!Array.isArray(activity.hintsRevealed) || activity.hintsRevealed.some((tier) => ![1, 2, 3].includes(tier))))) {
      throw new Error('Saved learning history contains an invalid activity record.');
    }
  }
  return parsed;
}

function updateLevel(levelId, updater) {
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
  store.levels[levelId] = {
    ...updater(current),
    lastPracticedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
    return { ok: true };
  } catch (error) {
    return { ok: false, operation: 'save', message: `Could not save learning history. ${error.message}` };
  }
}

export function recordCheckRun(levelId, results) {
  const passed = results.length > 0 && results.every((result) => result.pass);
  return updateLevel(levelId, (current) => ({
    ...current,
    checkRuns: (current.checkRuns || 0) + 1,
    passedRuns: (current.passedRuns || 0) + (passed ? 1 : 0),
    failedRuns: (current.failedRuns || 0) + (passed ? 0 : 1),
  }));
}

export function recordHintReveal(levelId, tier) {
  return updateLevel(levelId, (current) => ({
    ...current,
    hintsRevealed: [...new Set([...(current.hintsRevealed || []), tier])].sort(),
  }));
}

export function createLearningProfile(levels, completed, progressFailure = null) {
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
        checkRuns: activity.checkRuns || 0,
        failedRuns: activity.failedRuns || 0,
        hintsRevealed: activity.hintsRevealed || [],
        lastPracticedAt: activity.lastPracticedAt || null,
      };
    }),
  };
}
