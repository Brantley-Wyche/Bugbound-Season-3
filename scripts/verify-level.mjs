import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { discoverLevelFolders } from './curriculum/inspect.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const requested = process.argv[2];

if (!requested) {
  throw new Error('Usage: npm run verify-level -- <level-id-or-number>');
}

const available = discoverLevelFolders(ROOT);
const level = available.find((entry) => (
  entry.id === requested || String(Number(entry.id.split('-')[0])) === String(Number(requested))
));

if (!level) {
  throw new Error(`Could not find a level matching '${requested}'.`);
}

const server = await createServer({
  root: ROOT,
  server: { host: '127.0.0.1', port: 4173, strictPort: true },
});
await server.listen();

console.log('\nBugbound verification mode is ready:');
console.log(`http://127.0.0.1:4173/#/verify/${level.id}`);
console.log(`Project: ${resolve(ROOT)}`);
console.log(`Level: ${level.id}`);
console.log('\nOpen that URL in a browser. Checks run automatically against the current code.');
console.log('Use Ctrl+C to stop the verification server.\n');

const shutdown = async () => {
  await server.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
