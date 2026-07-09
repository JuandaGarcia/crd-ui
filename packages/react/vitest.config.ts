import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      // Test against the core sources so tests don't require a prior build.
      kardz: fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
    },
  },
});
