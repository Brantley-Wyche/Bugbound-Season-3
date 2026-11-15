import { useCallback, useRef, useState } from 'react';
import { nextAnnouncement } from './announcement.js';

/**
 * Text for an always-present role="status" region, and a function that sets it.
 * Clearing does not forget the last message, so the next identical one still differs.
 */
export function useAnnouncement() {
  const [text, setText] = useState('');
  const lastRef = useRef('');
  const announce = useCallback((message) => {
    const next = nextAnnouncement(lastRef.current, message);
    if (next) lastRef.current = next;
    setText(next);
  }, []);
  return [text, announce];
}
