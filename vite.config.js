import { defineConfig } from 'vite';

// BASE_PATH lo define el workflow de GitHub Pages (/nombre-del-repo/).
// En un hosting normal o en local queda en '/'.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    target: 'es2020',
    cssMinify: true,
    assetsInlineLimit: 0,
  },
});
