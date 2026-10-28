/**
 * Contrato cliente ↔ servidor (docs/API.md). El servidor valida con estos esquemas todo lo
 * que recibe antes de pasarlo al motor; el cliente usa los tipos para lo que envía y recibe.
 */
import {
  ATTRIBUTES,
  HABITATS,
  type CombatResolution,
  type PlayerEvent,
  type PlayerView,
  type TeamId,
} from '@atacknimal/engine';
import { z } from 'zod';

/** Alfabeto de los códigos de sala: sin caracteres ambiguos (0/O, 1/I/L). */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 6;

export const roomCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    new RegExp(`^[${ROOM_CODE_ALPHABET}]{${String(ROOM_CODE_LENGTH)}}$`),
    'Código de sala inválido',
  );

/** Apodo visible para el rival. 🔒 Sanitización completa pendiente (ARCHITECTURE §10). */
export const nicknameSchema = z
  .string()
  .trim()
  .min(1, 'Escribe un apodo')
  .max(20, 'Máximo 20 caracteres')
  .regex(/^[\p{L}\p{N} _.-]+$/u, 'Usa letras, números, espacios, puntos o guiones');

/* ---------- Cliente → servidor ---------- */

export const createRoomSchema = z.strictObject({ nickname: nicknameSchema });
export const joinRoomSchema = z.strictObject({ code: roomCodeSchema, nickname: nicknameSchema });
export const selectTeamSchema = z.strictObject({
  animalIds: z.array(z.string().min(1)).min(1).max(8),
});

/** Acciones de partida que un cliente puede pedir (el equipo se elige con `team:select`). */
export const clientActionSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('declare'),
    habitat: z.enum(HABITATS),
    cardId: z.string().min(1),
    attribute: z.enum(ATTRIBUTES),
  }),
  z.strictObject({ type: z.literal('defend'), cardId: z.string().min(1) }),
  z.strictObject({ type: z.literal('concede') }),
]);

/** Cada acción lleva un id: el servidor ignora los duplicados (reintentos tras reconexión). */
export const actSchema = z.strictObject({
  actionId: z.string().min(8).max(64),
  action: clientActionSchema,
});

export type CreateRoomRequest = z.infer<typeof createRoomSchema>;
export type JoinRoomRequest = z.infer<typeof joinRoomSchema>;
export type SelectTeamRequest = z.infer<typeof selectTeamSchema>;
export type ClientAction = z.infer<typeof clientActionSchema>;
export type ActRequest = z.infer<typeof actSchema>;

/* ---------- Servidor → cliente ---------- */

export const PROTOCOL_ERRORS = [
  'INVALID_MESSAGE',
  'ROOM_NOT_FOUND',
  'ROOM_FULL',
  'ROOM_CLOSED',
  'NOT_IN_ROOM',
  'ALREADY_IN_ROOM',
  'MATCH_NOT_STARTED',
  'RULE_VIOLATION',
  'INTERNAL_ERROR',
] as const;
export type ProtocolErrorCode = (typeof PROTOCOL_ERRORS)[number];

export type Ack<T = Record<string, never>> =
  ({ ok: true } & T) | { ok: false; error: { code: ProtocolErrorCode; message: string } };

/** `closed`: alguien abandonó antes de empezar la partida (no hay resultado). */
export type RoomStatus = 'waiting' | 'team-select' | 'playing' | 'finished' | 'closed';

export interface RoomPlayer {
  readonly playerId: string;
  readonly team: TeamId;
  readonly nickname: string;
  readonly connected: boolean;
  readonly teamConfirmed: boolean;
  readonly isYou: boolean;
}

export interface RoomState {
  readonly code: string;
  readonly mode: '1v1';
  readonly status: RoomStatus;
  readonly players: readonly RoomPlayer[];
  /** Tu identificador de jugador en la partida, o `null` si aún no estás en la sala. */
  readonly you: string | null;
}

export interface MatchUpdate {
  /** Lo que tú puedes ver de la partida (vista redactada por el motor). */
  readonly view: PlayerView;
  /** Eventos nuevos, también redactados para ti. */
  readonly events: readonly PlayerEvent[];
  /** Milisegundos que le quedan al turno actual al enviar el mensaje, o `null` si no hay turno. */
  readonly turnEndsInMs: number | null;
  /**
   * Todos los duelos resueltos hasta ahora (información pública) cuando el mensaje es una
   * sincronización completa: al empezar o al reconectar. `null` en las actualizaciones normales.
   */
  readonly history: readonly CombatResolution[] | null;
}

export interface SessionInfo {
  readonly token: string;
  /** Sala en la que sigue esta sesión, o `null` (por ejemplo, si la sala ya no existe). */
  readonly roomCode: string | null;
}

/** Nombres de los mensajes de Socket.IO. */
export const EVENTS = {
  session: 'session',
  roomCreate: 'room:create',
  roomJoin: 'room:join',
  roomLeave: 'room:leave',
  roomState: 'room:state',
  teamSelect: 'team:select',
  matchAct: 'match:act',
  matchUpdate: 'match:update',
} as const;

export interface ServerToClientEvents {
  session: (info: SessionInfo) => void;
  'room:state': (state: RoomState) => void;
  'match:update': (update: MatchUpdate) => void;
}

export interface ClientToServerEvents {
  'room:create': (request: unknown, ack: (response: Ack<{ code: string }>) => void) => void;
  'room:join': (request: unknown, ack: (response: Ack<{ code: string }>) => void) => void;
  'room:leave': (ack: (response: Ack) => void) => void;
  'team:select': (request: unknown, ack: (response: Ack) => void) => void;
  'match:act': (request: unknown, ack: (response: Ack<{ duplicate: boolean }>) => void) => void;
}

/** Respuesta de `GET /api/rooms/:code` (la usa el enlace o el QR antes de entrar). */
export interface RoomSummary {
  readonly code: string;
  readonly status: RoomStatus;
  readonly players: number;
  readonly capacity: number;
  readonly joinable: boolean;
}
