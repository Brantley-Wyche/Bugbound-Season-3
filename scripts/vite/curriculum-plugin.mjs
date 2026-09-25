import { resolve, relative } from 'node:path';
import { inspectCurriculum } from '../curriculum/inspect.mjs';

const PUBLIC_ID = 'virtual:bugbound-curriculum';
const INTERNAL_ID = `\0${PUBLIC_ID}`;

export function curriculumPlugin() {
  let root;
  let building = false;
  return {
    name: 'bugbound-curriculum',
    configResolved(config) { root = config.root; building = config.command === 'build'; },
    resolveId(id) { if (id === PUBLIC_ID) return INTERNAL_ID; },
    load(id) {
      if (id !== INTERNAL_ID) return;
      let catalog;
      try { catalog = inspectCurriculum(root); }
      catch (error) { catalog = { levels: [], errors: [`Curriculum could not be read: ${error.message}`] }; }
      const { levels, errors } = catalog;
      if (building && errors.length) this.error(`Curriculum validation failed:\n${errors.join('\n')}`);
      for (const level of levels) this.addWatchFile(resolve(root, level.manifestPath));
      const loaders = levels.map((level) => `${JSON.stringify(level.id)}: () => import(${JSON.stringify(`/${level.manifestPath}`)})`).join(',\n');
      return `export const levels = ${JSON.stringify(levels)};
export const catalogErrors = ${JSON.stringify(errors)};
const loaders = {${loaders}};
export async function loadLevel(id) {
  if (!loaders[id]) throw new Error('Challenge is unavailable. Validate the generated files and reload.');
  return (await loaders[id]()).default;
}`;
    },
    configureServer(server) {
      const refresh = (file) => {
        const path = relative(root, file).replaceAll('\\', '/');
        if (!path.startsWith('src/levels/')) return;
        const module = server.moduleGraph.getModuleById(INTERNAL_ID);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', refresh);
      server.watcher.on('unlink', refresh);
      server.httpServer?.once('close', () => {
        server.watcher.off('add', refresh);
        server.watcher.off('unlink', refresh);
      });
    },
    handleHotUpdate({ file, server }) {
      const path = relative(root, file).replaceAll('\\', '/');
      if (!path.startsWith('src/levels/')) return;
      if (path.endsWith('/manifest.js') || path.endsWith('/hints.json')) {
        const module = server.moduleGraph.getModuleById(INTERNAL_ID);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload' });
      } else {
        server.ws.send({ type: 'custom', event: 'bugbound:exercise-change' });
      }
      return [];
    },
  };
}
