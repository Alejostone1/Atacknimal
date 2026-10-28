import { z } from 'zod';

/**
 * Configuración por variables de entorno, validada al arrancar (ver .env.example).
 * 🔒 SEGURIDAD PENDIENTE: autenticación, rate limiting y orígenes estrictos (ARCHITECTURE §10).
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().default('0.0.0.0'),
  /** PostgreSQL de producción. Sin valor, se usa PGlite (PostgreSQL embebido). */
  DATABASE_URL: z.url().optional(),
  /** Carpeta de datos de PGlite. Sin valor, PGlite trabaja en memoria. */
  PGLITE_DIR: z.string().optional(),
  /** Origen permitido para Socket.IO cuando el cliente no pasa por el proxy de Vite. */
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  /** Tiempos de turno online (docs/GAME_RULES.md §16). */
  DECLARE_SECONDS: z.coerce.number().positive().default(30),
  DEFEND_SECONDS: z.coerce.number().positive().default(20),
  RECONNECT_GRACE_SECONDS: z.coerce.number().positive().default(60),
});

export interface ServerConfig {
  readonly port: number;
  readonly host: string;
  readonly databaseUrl: string | undefined;
  readonly pgliteDir: string | undefined;
  readonly corsOrigin: string;
  readonly timers: TimerConfig;
}

export interface TimerConfig {
  readonly declareMs: number;
  readonly defendMs: number;
  readonly reconnectGraceMs: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const parsed = envSchema.parse(env);
  return {
    port: parsed.PORT,
    host: parsed.HOST,
    databaseUrl: parsed.DATABASE_URL,
    pgliteDir: parsed.PGLITE_DIR,
    corsOrigin: parsed.CORS_ORIGIN,
    timers: {
      declareMs: parsed.DECLARE_SECONDS * 1000,
      defendMs: parsed.DEFEND_SECONDS * 1000,
      reconnectGraceMs: parsed.RECONNECT_GRACE_SECONDS * 1000,
    },
  };
}
