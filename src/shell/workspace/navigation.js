export function parseRoute(hash = '') {
  if (['', '#', '#/', '#/infinite'].includes(hash)) return { page: 'practice', collection: 'generated' };
  if (hash === '#/foundations') return { page: 'practice', collection: 'foundations' };
  if (hash === '#/brief') return { page: 'brief' };
  const match = /^#\/(level|verify)\/([^/]+)$/.exec(hash);
  if (match) {
    try {
      const id = decodeURIComponent(match[2]);
      if (!id.includes('/')) return { page: 'level', id, verify: match[1] === 'verify' };
    } catch { /* Malformed links use the recovery screen. */ }
  }
  return { page: 'missing' };
}

export function levelHref(id) {
  return `#/level/${encodeURIComponent(id)}`;
}
