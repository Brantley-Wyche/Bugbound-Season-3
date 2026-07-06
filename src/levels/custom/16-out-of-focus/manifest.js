import Component from './InlineRename.jsx';

export default {
  id: '16-out-of-focus',
  number: 16,
  title: 'Out of Focus',
  concept: 'Refs & Timing',
  severity: 'Medium',
  Component,
  files: ['src/levels/custom/16-out-of-focus/InlineRename.jsx'],
  symptom:
    'Clicking Edit swaps in the rename field, but it never receives focus — users have to click into it manually every time. The console also complains loudly the moment Edit is pressed.',
  lesson: [
    'A ref like ' +
      '`useRef(null)` starts empty and React fills in ' +
      '`.current` only when the element it is attached to is COMMITTED to the DOM. For an element behind a condition, the ref is null for as long as the condition is false.',
    'Calling ' +
      '`setState` does not re-render on the spot — it schedules a render. So on the very next line after ' +
      '`setEditing(true)`, the input still does not exist, and nothing you queued has appeared yet. Code that needs the NEW DOM cannot live in the same event handler tick.',
    'The tool for "run this after React has committed the update" is an effect: ' +
      '`useEffect` runs after the commit, when refs attached during that render are guaranteed to be filled. Imperative follow-ups — focusing, scrolling, measuring — belong there (or in a ref callback), not immediately after a setState call.',
  ],
  checks: [
    {
      name: 'The display name renders initially',
      run: async (h) => {
        const name = h.text('[data-testid="display-name"]');
        h.ok(
          name === 'galaxy-brain-dev',
          'Expected the display name "galaxy-brain-dev", got "' + name + '".',
        );
      },
    },
    {
      name: 'Edit reveals the rename field pre-filled with the current name',
      run: async (h) => {
        await h.click('[data-testid="edit-btn"]');
        const value = h.value('[data-testid="name-input"]');
        h.ok(
          value === 'galaxy-brain-dev',
          'Expected the field to be pre-filled with the current name, got "' + value + '".',
        );
      },
    },
    {
      name: 'The rename field is focused, ready to type',
      run: async (h) => {
        await h.click('[data-testid="edit-btn"]');
        await h.pause(60);
        const input = h.get('[data-testid="name-input"]');
        h.ok(
          document.activeElement === input,
          'The field appears but is not focused — the user still has to click into it.',
        );
      },
    },
    {
      name: 'Typing and saving updates the display name',
      run: async (h) => {
        await h.click('[data-testid="edit-btn"]');
        await h.type('[data-testid="name-input"]', '-jr');
        await h.click('[data-testid="save-btn"]');
        const name = h.text('[data-testid="display-name"]');
        h.ok(
          name === 'galaxy-brain-dev-jr',
          'Expected the saved name "galaxy-brain-dev-jr", got "' + name + '".',
        );
      },
    },
  ],
};
