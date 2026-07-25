import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://crd-ui.juanda.co',
  integrations: [react(), sitemap()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 4321,
  },
  vite: {
    // border-beam resolves its react peer through pnpm's store; dedupe keeps a
    // single React instance across islands (avoids "Invalid hook call").
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      // border-beam is only reached from inside an island, so Vite's startup
      // scan misses it, discovers it mid-page, re-optimizes and forces a full
      // reload ("optimized dependencies changed. reloading") while the islands
      // are still hydrating — which surfaces as a spurious "Invalid hook call".
      // Pre-bundling it up front keeps the first cold load stable.
      //
      // Deliberately NOT listing crd-ui here: pre-bundling the linked workspace
      // package freezes it in .vite/deps, so rebuilding it stops reaching the
      // site until the cache is cleared.
      include: ['border-beam'],
    },
  },
});
