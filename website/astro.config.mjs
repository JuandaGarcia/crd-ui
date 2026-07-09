import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [react()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 4321,
  },
});
