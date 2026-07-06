import { useState } from 'react';

/**
 * Tracks a most-recently-used list of item names, capped at `maxItems`.
 * Viewing an item moves it to the front; the list never exceeds the cap.
 */
export function useRecentItems(maxItems) {
  const [items, setItems] = useState([]);

  function addItem(name) {
    setItems((prev) => [name, ...prev].slice(0, maxItems));
  }

  function clear() {
    setItems(items);
  }

  return { items, addItem, clear };
}
