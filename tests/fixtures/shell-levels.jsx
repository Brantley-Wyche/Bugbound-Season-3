import { createElement } from 'react';

function Synthetic() { return createElement('div', null, 'Synthetic working exercise'); }
export const levels = ['a', 'b', 'c'].map((letter, index) => ({
  id: `${900 + index}-audit-${letter}`,
  number: 900 + index,
  title: `Audit ${letter.toUpperCase()}`,
  concept: 'Synthetic persistence case',
  severity: 'low', difficulty: 'Synthetic', source: 'Audit fixture',
  files: ['tests/fixtures/shell-levels.jsx'],
  symptom: 'A synthetic working exercise used to test the shell without changing real challenges.',
  lesson: ['Synthetic metadata only.'],
  Component: Synthetic,
  checks: [{ name: 'Synthetic content exists', async run({ text, ok }) {
    if (letter === 'c') await new Promise(() => {});
    ok(text('div') === 'Synthetic working exercise', 'Synthetic content was absent');
  } }],
}));

export const catalogErrors = [];
export async function loadLevel(id) { return levels.find((level) => level.id === id); }
