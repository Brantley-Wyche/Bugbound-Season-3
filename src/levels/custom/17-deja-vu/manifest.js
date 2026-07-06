import Component from './RecentlyViewedProducts.jsx';

export default {
  id: '17-deja-vu',
  number: 17,
  title: 'Deja Vu',
  concept: 'Custom Hooks',
  severity: 'Medium',
  Component,
  vague: true,
  files: ['src/levels/custom/17-deja-vu/'],
  symptom:
    'Viewing a product you already viewed adds a second, duplicate entry to Recently Viewed instead of just moving it back to the top. And "Clear recents" is a dead button — click it all day, the list never empties.',
  lesson: [
    'A custom hook is just a function whose name starts with `use` that calls other hooks inside it — `useRecentItems` here wraps a `useState` and hands back both the data and the actions that update it. Because the logic lives in one place, every component that calls the hook gets its own independent copy of that state and behavior, with a clean, reusable API instead of copy-pasted state logic.',
    'Extracting logic into a hook does not change the rules of state updates — it just moves them somewhere shared. An updater function is still responsible for producing the exact next value: if a new entry needs to replace an existing one before it gets prepended, the hook has to filter the old one out itself. Nothing about "it is a hook now" does that filtering automatically.',
    'The same goes for reset-style actions: setting state "to itself" (passing back the current value instead of the actual desired next value) is a no-op that silently accomplishes nothing. When a hook action seems to do nothing at all, check exactly what value it is handing to the setter — copy-paste mistakes here are easy to make and easy to miss because there is no crash to flag them.',
  ],
  checks: [
    {
      name: 'Viewing a product adds it to Recently Viewed',
      run: async (h) => {
        await h.click('[data-testid="view-btn-p1"]');
        const names = h.all('[data-testid="recent-name"]').map((el) => el.textContent.trim());
        h.ok(
          names.includes('Trail Runner Jacket'),
          `Expected "Trail Runner Jacket" in Recently Viewed, got [${names.join(', ')}].`,
        );
      },
    },
    {
      name: 'Viewing the same product twice keeps only one entry, moved to the top',
      run: async (h) => {
        await h.click('[data-testid="view-btn-p1"]');
        await h.click('[data-testid="view-btn-p2"]');
        await h.click('[data-testid="view-btn-p1"]');
        const names = h.all('[data-testid="recent-name"]').map((el) => el.textContent.trim());
        h.ok(
          names.length === 2,
          `Expected 2 entries after re-viewing the same product, got ${names.length}: [${names.join(', ')}].`,
        );
        h.ok(
          names[0] === 'Trail Runner Jacket',
          `Expected "Trail Runner Jacket" to be moved to the top, got [${names.join(', ')}].`,
        );
      },
    },
    {
      name: 'Recently Viewed never grows past the cap',
      run: async (h) => {
        await h.click('[data-testid="view-btn-p1"]');
        await h.click('[data-testid="view-btn-p2"]');
        await h.click('[data-testid="view-btn-p3"]');
        await h.click('[data-testid="view-btn-p4"]');
        const names = h.all('[data-testid="recent-name"]').map((el) => el.textContent.trim());
        h.ok(
          names.length === 3,
          `Expected at most 3 recent entries, got ${names.length}: [${names.join(', ')}].`,
        );
        h.ok(
          names[0] === 'Cast Iron Skillet',
          `Expected the most recently viewed product first, got [${names.join(', ')}].`,
        );
      },
    },
    {
      name: 'Clear recents empties the list',
      run: async (h) => {
        await h.click('[data-testid="view-btn-p1"]');
        await h.click('[data-testid="view-btn-p2"]');
        await h.click('[data-testid="clear-btn"]');
        const empty = h.query('[data-testid="recents-empty"]');
        h.ok(empty !== null, 'Clicked "Clear recents" but the recent items list is still populated.');
      },
    },
  ],
};
