export function getPracticeLevels(levels, collection = 'generated') {
  return levels.filter((level) => {
    if (collection === 'all') return true;
    return collection === 'foundations' ? level.number <= 15 : level.number > 15;
  });
}

export function recommendChallenge(levels, completed, lastId) {
  const unfinished = levels.filter((level) => !completed.has(level.id));
  const level = unfinished.find((candidate) => candidate.id !== lastId) || unfinished[0];
  if (!level) return null;

  return {
    level,
    reason: `Next available incident in ${level.concept || 'React'}, not yet repaired.`,
  };
}

/** Generated incidents grouped by their generation date, newest batch first; catalog order within a batch. */
export function groupBatches(levels) {
  const batches = new Map();
  for (const level of levels) {
    const date = level.generatedAt || 'undated';
    if (!batches.has(date)) batches.set(date, []);
    batches.get(date).push(level);
  }
  return [...batches].map(([date, members]) => ({ date: date === 'undated' ? null : date, levels: members }))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

/**
 * The incident on the bench: the unrepaired one the learner worked on last,
 * else the suggested next open incident (generated first). Null when every incident is repaired.
 */
export function benchIncident(levels, completed, lastWorked) {
  const worked = levels.find((level) => level.id === lastWorked && !completed.has(level.id));
  if (worked) return { level: worked, continuing: true };
  const suggestion = recommendChallenge(getPracticeLevels(levels, 'generated'), completed, null)
    || recommendChallenge(getPracticeLevels(levels, 'foundations'), completed, null);
  return suggestion ? { level: suggestion.level, continuing: false, reason: suggestion.reason } : null;
}

export function filterChallenges(levels, { query = '', status = 'all' }, completed) {
  const search = query.trim().toLowerCase();
  return levels.filter((level) => {
    const done = completed.has(level.id);
    if (status === 'open' && done) return false;
    if (status === 'completed' && !done) return false;
    return [level.title, level.concept, level.id].join(' ').toLowerCase().includes(search);
  });
}
