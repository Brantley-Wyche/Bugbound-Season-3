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
    reason: `Next available practice in ${level.concept || 'React'}, with no saved completion.`,
  };
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
