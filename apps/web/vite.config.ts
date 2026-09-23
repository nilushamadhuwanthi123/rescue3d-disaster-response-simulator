import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages serves this app from /rescue3d-disaster-response-simulator/,
  // not the domain root, so every asset URL needs that prefix baked in.
  // GITHUB_PAGES is set only by the deploy workflow; local dev/preview and
  // any other host (Vercel, Render static, etc.) still build at "/".
  base: process.env.GITHUB_PAGES ? '/rescue3d-disaster-response-simulator/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
});
