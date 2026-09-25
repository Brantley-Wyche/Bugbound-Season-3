import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('animated collections keep native links and current-page semantics', async () => {
  const server = await createServer({
    cacheDir: 'node_modules/.vite-component-tests',
    server: { middlewareMode: true, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
    appType: 'custom',
  });
  try {
    const { Tabs, TabsList, TabsTrigger } = await server.ssrLoadModule('/src/components/motion/tabs.tsx');
    for (const current of ['generated', 'foundations']) {
      const html = renderToStaticMarkup(h(Tabs, { value: current, variant: 'underline' },
        h(TabsList, { navigation: true, 'aria-label': 'Challenge collections' },
          h(TabsTrigger, { value: 'generated', href: '#/' }, 'Generated'),
          h(TabsTrigger, { value: 'foundations', href: '#/foundations' }, 'Foundations'))));
      assert.match(html, /<nav[^>]*aria-label="Challenge collections"/);
      assert.match(html, /<a[^>]*href="#\/"/);
      assert.match(html, /<a[^>]*href="#\/foundations"/);
      assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
      assert.doesNotMatch(html, /role="tab(?:list)?"|aria-selected|<button/);
      const currentHref = current === 'generated' ? '#/' : '#/foundations';
      assert.ok(html.match(/<a\b[^>]*>/g).find((tag) => tag.includes(`href="${currentHref}"`) && tag.includes('aria-current="page"')));
    }
  } finally {
    await server.close();
  }
});
