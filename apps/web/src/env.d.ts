/** Variables de entorno de Vite usadas por la web (ver apps/web/.env.example). */
interface ImportMetaEnv {
  /** Origen del servidor de juego en producción. Sin valor, el mismo origen (proxy de Vite). */
  readonly VITE_GAME_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
