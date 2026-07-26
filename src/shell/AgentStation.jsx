import { useMemo, useState } from 'react';
import { createLearningProfile } from './learning.js';

const SURPRISE_TOPICS = [
  'effect cleanup',
  'custom hooks',
  'state architecture',
  'accessibility in React',
  'async UI state',
  'component composition',
];

function makePrompt(topic, difficulty, count) {
  const levelWord = count === 1 ? 'level' : 'levels';
  return [
    `Generate ${count} ${difficulty.toLowerCase()} Bugbound ${levelWord} about ${topic.trim() || 'a React concept I should practice'}.`,
    'Keep every planted bug secret, follow AGENTS.md and the levelsmith skill, and work on a new branch.',
    'Validate the level, prove its checks fail before the private fix and pass after it, then restore the buggy version.',
  ].join(' ');
}

export default function AgentStation({ levels, completed }) {
  const [topic, setTopic] = useState('effect cleanup');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [count, setCount] = useState(1);
  const [message, setMessage] = useState('');
  const prompt = useMemo(() => makePrompt(topic, difficulty, count), [topic, difficulty, count]);

  const copyText = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(successMessage);
    } catch {
      setMessage('Clipboard access was blocked. Select the brief and copy it manually.');
    }
  };

  const surpriseMe = () => {
    const currentIndex = SURPRISE_TOPICS.indexOf(topic);
    setTopic(SURPRISE_TOPICS[(currentIndex + 1 + SURPRISE_TOPICS.length) % SURPRISE_TOPICS.length]);
    setMessage('A new practice topic is ready.');
  };

  const downloadProfile = () => {
    const profile = createLearningProfile(levels, completed);
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'bugbound-learning-profile.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Learning profile downloaded. Attach it when you ask your agent for personalized practice.');
  };

  return (
    <section className="agent-station" aria-labelledby="agent-station-title">
      <div className="agent-station-intro">
        <span className="agent-kicker">S3 // Agent station</span>
        <h1 id="agent-station-title">Generate your next incident.</h1>
        <p>
          Shape a spoiler-safe brief, copy it into your coding agent, and let the repository
          turn your weak spots into fresh practice.
        </p>
      </div>

      <div className="agent-controls">
        <label>
          Topic
          <input value={topic} onChange={(event) => setTopic(event.target.value)} />
        </label>
        <label>
          Difficulty
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Hard</option>
          </select>
        </label>
        <label>
          Levels
          <select value={count} onChange={(event) => setCount(Number(event.target.value))}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </label>
      </div>

      <div className="agent-brief">
        <span>Ready-to-send brief</span>
        <p>{prompt}</p>
      </div>

      <div className="agent-actions">
        <button className="btn btn-primary" onClick={() => copyText(prompt, 'Agent brief copied.')}>
          Copy agent brief
        </button>
        <button className="btn" onClick={surpriseMe}>Surprise me</button>
        <button className="btn" onClick={downloadProfile}>Download learning profile</button>
      </div>

      <p className="agent-message" aria-live="polite">{message}</p>
      <p className="agent-safety">
        Generated levels stay local, may not use network or environment data, and are validated
        before they appear here.
      </p>
    </section>
  );
}
