import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** Servidor de juego en desarrollo (`npm run dev:server`). El proxy evita CORS en local. */
const GAME_SERVER = 'http://localhost:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': GAME_SERVER,
      '/socket.io': { target: GAME_SERVER, ws: true },
    },
  },
  preview: { port: 4173, host: true },
});
