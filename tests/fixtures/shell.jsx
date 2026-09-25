import { createRoot } from 'react-dom/client';
import App from '../../src/shell/App.jsx';
import { levels } from '../../src/levels/index.js';
import '../../src/styles/global.css';

if (levels.length !== 3 || levels[0]?.id !== '900-audit-a') {
  throw new Error('Use the synthetic fixture server: npm run dev -- --config tests/fixtures/vite.shell.config.mjs');
}

const realSet = Storage.prototype.setItem;
let denySave = false;
Storage.prototype.setItem = function (key, value) {
  if (denySave && key.startsWith('bugbound:progress:v2:')) throw new Error('Synthetic save failure');
  return realSet.call(this, key, value);
};

const controls = document.getElementById('audit-controls');
controls.style.cssText = 'padding:12px;display:flex;gap:12px;align-items:center';
const toggle = document.createElement('button');
toggle.textContent = 'Deny completion saves';
toggle.onclick = () => {
  denySave = !denySave;
  toggle.textContent = denySave ? 'Allow completion saves' : 'Deny completion saves';
};
const status = document.createElement('output');
status.textContent = 'Isolated audit origin; synthetic challenges only';
controls.append(toggle, status);
createRoot(document.getElementById('root')).render(<App />);

