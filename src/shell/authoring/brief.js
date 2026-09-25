export function createAgentBrief({ topic = '', difficulty = '', count = 1, context = '' } = {}) {
  const practiceTopic = topic.trim() || 'effect cleanup';
  const practiceDifficulty = (difficulty.trim() || 'Intermediate').toLowerCase();
  const requestedCount = Number(count);
  const levelCount = Number.isFinite(requestedCount)
    ? Math.min(3, Math.max(1, Math.trunc(requestedCount)))
    : 1;
  const engineeringContext = context.trim();

  return [
    'For my external AI coding agent working in this Bugbound repository:',
    `Generate ${levelCount} ${practiceDifficulty} Bugbound ${levelCount === 1 ? 'level' : 'levels'} about ${practiceTopic}.`,
    ...(engineeringContext ? [`Engineering context: ${engineeringContext}`] : []),
    'Read and follow AGENTS.md and .claude/skills/bugbound-levelsmith/SKILL.md. Work on a new generation branch unless I have already provided one.',
    'Keep blind mode: never reveal a planted bug\'s cause in chat, comments, or commit messages. Keep hints and solutions base64-encoded only.',
    'Prove the checks fail against the planted version and pass after a privately applied fix, then restore the planted version and discard the fix.',
    'Use npm run verify-level -- <id> for browser verification. Run npm run validate-levels, npm test, and npm run build.',
    'Report the verification evidence without revealing the fix; do not claim validation that you have not performed.',
  ].join('\n\n');
}
