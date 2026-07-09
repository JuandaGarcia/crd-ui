import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: true,
  },
});
