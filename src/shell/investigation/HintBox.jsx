import { useState } from 'react';
import hints from '../../levels/hints.json';
import { recordHintReveal } from '../progress/learning.js';

export const TIER_LABELS = ['Gentle nudge', 'Closer look', 'Basically the answer'];

function decode(b64) {
  return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
}

export default function HintBox({ levelId }) {
  const [revealed, setRevealed] = useState([false, false, false]);
  const [historyFailure, setHistoryFailure] = useState(null);
  const encoded = hints[levelId] || [];

  const toggleHint = (index) => {
    if (!revealed[index]) {
      const history = recordHintReveal(levelId, index + 1);
      if (!history.ok) setHistoryFailure(history.message);
    }
    setRevealed((prev) => prev.map((value, itemIndex) => (itemIndex === index ? !value : value)));
  };

  return (
    <section className="hints-section" aria-labelledby="hints-title">
      <h2 id="hints-title">Optional guidance</h2>
      <p className="hints-note">
        Choose the amount of help you need. Each tier reveals more; all hints stay hidden until you open them.
      </p>
      {historyFailure && <p className="hints-note" role="status">This hint use could not be added to learning history. {historyFailure}</p>}
      <div className="hint-list">
        {encoded.map((b64, i) => (
          <div className="hint-item" key={i}>
            <button
              className="hint-toggle"
              onClick={() => toggleHint(i)}
              aria-expanded={revealed[i]}
              aria-controls={revealed[i] ? `${levelId}-hint-${i + 1}` : undefined}
            >
              <span>Hint {i + 1}</span>
              <span className="tier">{revealed[i] ? `Hide · ${TIER_LABELS[i]}` : TIER_LABELS[i]}</span>
            </button>
            {revealed[i] && (
              <div className="hint-body" id={`${levelId}-hint-${i + 1}`}>
                {decode(b64)}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
