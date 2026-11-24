import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { authApiPlugin } from './server/viteAuthPlugin.js';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), authApiPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});

