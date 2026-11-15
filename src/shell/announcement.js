const REPEAT_MARK = ' ';

/**
 * The text to put in a live region so a repeated message is still announced.
 * React skips an identical update and some screen readers skip an identical
 * message even after the region was emptied, so a repeat gains a no-break space,
 * which is not read aloud. An empty message clears the region.
 */
export function nextAnnouncement(lastMessage, message) {
  if (!message) return '';
  return message === lastMessage ? `${message}${REPEAT_MARK}` : message;
}
