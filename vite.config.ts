import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Set backend origin via env or fall back to localhost:8000
const backend = process.env.VITE_BACKEND_ORIGIN || 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy WebSocket and HTTP calls to your backend
      '/ws': {
        target: backend,
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: backend,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
