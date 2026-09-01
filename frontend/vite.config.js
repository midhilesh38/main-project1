import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    // Forward API calls to the backend (default http://localhost:5000, see
    // backend/src/server.js) so the app works locally with zero .env setup.
    // Override the target with VITE_BACKEND_URL if your backend runs
    // elsewhere.
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
