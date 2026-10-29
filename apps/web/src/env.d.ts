/** Variables de entorno de Vite usadas por la web (ver apps/web/.env.example). */
interface ImportMetaEnv {
  /** Origen del servidor de juego en producción. Sin valor, el mismo origen (proxy de Vite). */
  readonly VITE_GAME_SERVER_URL?: string;
  /**
   * Dirección pública de la web para enlaces y QR. Sin valor, la dirección con la que se abrió
   * la página. En desarrollo sirve para que el QR apunte a la IP de la red local.
   */
  readonly VITE_PUBLIC_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
