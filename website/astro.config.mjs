import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [react()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 4321,
  },
  vite: {
    // border-beam resolves its react peer through pnpm's store; dedupe keeps a
    // single React instance across islands (avoids "Invalid hook call").
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  },
});
