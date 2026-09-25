import { mergeConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import base from '../../vite.config.js';

export default mergeConfig(base, {
  cacheDir: 'node_modules/.vite-shell-fixture',
  resolve: { alias: { 'virtual:bugbound-curriculum': fileURLToPath(new URL('./shell-levels.jsx', import.meta.url)) } },
  server: { host: '127.0.0.1', port: 5187, strictPort: true },
});
