import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { curriculumPlugin } from './scripts/vite/curriculum-plugin.mjs';

export default defineConfig({
  plugins: [curriculumPlugin(), react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { rollupOptions: { input: {
    main: fileURLToPath(new URL('./index.html', import.meta.url)),
    exercise: fileURLToPath(new URL('./exercise.html', import.meta.url)),
  } } },
});
