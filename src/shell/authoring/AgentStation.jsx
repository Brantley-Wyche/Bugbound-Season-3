import { useState } from 'react';
import { createLearningProfile } from '../progress/learning.js';
import { createAgentBrief } from './brief.js';
import Icon from '../Icon.jsx';
import { ActionSwapRollButton } from '../../components/motion/action-swap-roll';

const TOPICS = ['effect cleanup', 'custom hooks', 'state architecture', 'accessibility in React', 'async UI state', 'component composition'];
const COPY_ITEMS = [
  { id: 'idle', label: 'Copy agent brief', ariaLabel: 'Copy agent brief', icon: <Icon name="copy" /> },
  { id: 'copied', label: 'Brief copied', ariaLabel: 'Brief copied', icon: <Icon name="check" /> },
];

export default function AgentStation({ levels, completed, draft, onDraftChange, progressFailure = null }) {
  const [copiedPrompt, setCopiedPrompt] = useState(null);
  const [error, setError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [contextOpen, setContextOpen] = useState(Boolean(draft.context));
  const prompt = createAgentBrief(draft);
  const copied = copiedPrompt === prompt;

  function update(key, value) {
    onDraftChange({ ...draft, [key]: value });
    setError('');
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(prompt);
      setError('');
    } catch {
      setCopiedPrompt(null);
      setError('Clipboard access was blocked. Select the brief below and copy it manually.');
    }
  }

  function downloadProfile() {
    try {
      const profile = createLearningProfile(levels, completed, progressFailure);
      const url = URL.createObjectURL(new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'bugbound-learning-profile.json';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setProfileMessage('Learning profile downloaded. Attach it to your coding agent when you send the brief.');
    } catch {
      setProfileMessage(progressFailure
        ? 'Resolve the saved completion error above, then download your profile again. No profile was exported.'
        : 'Your practice history could not be read or downloaded. No incomplete profile was exported. Try downloading it again.');
    }
  }

  return (
    <main className="brief-page" id="main-content" tabIndex={-1}>
      <a className="back-link" href="#/"><Icon name="back" size={16} /> Back to practice</a>
      <div className="page-heading">
        <h1 id="page-title" tabIndex={-1}>Create a challenge.</h1>
        <p>Define the practice. Your coding agent authors the bug.</p>
      </div>
      <div className="brief-workspace">
        <section className="brief-controls" aria-labelledby="challenge-settings-title">
          <h2 id="challenge-settings-title">What will you investigate?</h2>
          <label className="field-label" htmlFor="brief-topic">Practice topic</label>
          <input id="brief-topic" className="field-input" value={draft.topic} onChange={(event) => update('topic', event.target.value)} aria-describedby="topic-help" />
          <p className="field-help" id="topic-help">A concept, a behavior, or an area you want to understand more deeply.</p>
          <div className="topic-ideas" aria-label="Practice topic suggestions">
            {TOPICS.map((topic) => <button type="button" key={topic} aria-pressed={draft.topic === topic} onClick={() => update('topic', topic)}>{topic}</button>)}
          </div>
          <div className="brief-options">
            <label className="field-label">Difficulty
              <select value={draft.difficulty} onChange={(event) => update('difficulty', event.target.value)}><option>Beginner</option><option>Intermediate</option><option>Hard</option></select>
            </label>
            <label className="field-label">Challenges
              <select value={draft.count} onChange={(event) => update('count', Number(event.target.value))}><option value={1}>1 challenge</option><option value={2}>2 challenges</option><option value={3}>3 challenges</option></select>
            </label>
          </div>
          <details className="context-details" open={contextOpen} onToggle={(event) => setContextOpen(event.currentTarget.open)}>
            <summary>Add engineering context <span>Optional</span></summary>
            <label className="field-label" htmlFor="brief-context">Scenario or constraints</label>
            <textarea id="brief-context" rows={5} value={draft.context} onChange={(event) => update('context', event.target.value)} placeholder="For example: a search interface with changing inputs, clear loading states, and cleanup requirements." />
            <p className="field-help">Describe the environment you want to practice in. The agent must still follow the repository’s authoring boundaries.</p>
          </details>
          <div className="profile-export">
            <h3>Bring your practice history.</h3>
            <p>Your profile contains completion, check activity, and hint usage. You choose whether to share it with your agent.</p>
            <button className="btn" onClick={downloadProfile}><Icon name="download" /> Download learning profile</button>
            <p className="action-message" role="status">{profileMessage}</p>
          </div>
        </section>

        <section className="prepared-brief" aria-labelledby="prepared-brief-title">
          <div className="section-toolbar"><h2 id="prepared-brief-title">Your agent brief</h2><ActionSwapRollButton className="btn btn-primary" variant="primary" items={COPY_ITEMS} value={copied ? 'copied' : 'idle'} cycle={false} onClick={copyBrief} /></div>
          <label className="sr-only" htmlFor="agent-brief-text">Prepared agent brief</label>
          <textarea id="agent-brief-text" className="brief-output" readOnly value={prompt} rows={15} spellCheck={false} />
          <div className="brief-copy-row">
            <span className="action-message" role="status">{error || (copied ? 'Ready to paste into your coding agent.' : '')}</span>
          </div>
          <div className="handoff-guide">
            <h3>Take it to your coding agent.</h3>
            <ol>
              <li><strong>Send the brief.</strong> Open this repository in your agent and paste the instructions.</li>
              <li><strong>Let the agent author and verify.</strong> It should prove the checks fail against the planted bug and pass with its private fix, then restore the buggy version.</li>
              <li><strong>Return to investigate.</strong> New challenges appear here when their manifests are added. Confirm the agent finished validation before you begin.</li>
            </ol>
            <p>The app prepares this handoff. It does not run your agent.</p>
            <a className="inline-link" href="#/">Return to practice <Icon name="arrow" size={16} /></a>
          </div>
        </section>
      </div>
      <p className="session-note">This draft is kept while you navigate the app. Reloading or closing the tab clears it.</p>
    </main>
  );
}
