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
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'canvas-confetti'],
        },
      },
    },
  },
});

