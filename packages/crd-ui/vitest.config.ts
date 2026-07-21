import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    // Svelte 5 needs its client (browser) build to mount components in jsdom.
    conditions: ['browser'],
  },
  test: {
    environment: 'jsdom',
  },
});
