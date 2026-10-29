/**
 * Cliente online: conexión Socket.IO con el servidor de juego (docs/API.md).
 * El servidor decide; aquí solo se envían intenciones y se guarda lo que llega.
 */
import type {
  Ack,
  ClientAction,
  ClientToServerEvents,
  RoomMode,
  RoomState,
  ServerToClientEvents,
  SignalNotice,
  TeamSignal,
} from '@atacknimal/protocol';
import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';
import { bindOnlineSender, useMatch } from './matchStore.ts';
import {
  hasActiveRoom,
  readSession as read,
  ROOM_KEY,
  TOKEN_KEY,
  writeSession as write,
} from './session.ts';

/**
 * Servidor de juego. En producción la web (Vercel) y el servidor (Render) están en dominios
 * distintos; en desarrollo se usa el mismo origen y Vite reenvía /socket.io (vite.config.ts).
 */
const configuredUrl = import.meta.env.VITE_GAME_SERVER_URL?.trim() ?? '';
const SERVER_URL = configuredUrl === '' ? undefined : configuredUrl;

/** Espera máxima de una respuesta del servidor. */
const ACK_TIMEOUT_MS = 8000;

export type Connection = 'idle' | 'connecting' | 'online' | 'offline';

/** Cuántos marcadores recientes se muestran a la vez. */
const SIGNALS_SHOWN = 4;

export interface ReceivedSignal extends SignalNotice {
  readonly id: number;
  /** Hora local de llegada (ms), para retirarlo de pantalla pasado un rato. */
  readonly at: number;
}

interface RoomStoreState {
  connection: Connection;
  room: RoomState | null;
  /** Marcadores rápidos recientes de tu equipo (2 vs 2), el más nuevo al final. */
  signals: ReceivedSignal[];
}

export const useRoom = create<RoomStoreState>()(() => ({
  connection: 'idle',
  room: null,
  signals: [],
}));
let signalCounter = 0;

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
let socket: GameSocket | null = null;

function connect(): GameSocket {
  if (socket !== null) return socket;
  useRoom.setState({ connection: 'connecting' });
  const options = {
    auth: (send: (data: object) => void) => {
      const token = read(TOKEN_KEY);
      send(token === null ? {} : { token });
    },
  };
  const created: GameSocket = SERVER_URL === undefined ? io(options) : io(SERVER_URL, options);
  created.on('connect', () => {
    useRoom.setState({ connection: 'online' });
  });
  created.on('disconnect', () => {
    useRoom.setState({ connection: 'offline' });
  });
  created.on('connect_error', () => {
    useRoom.setState({ connection: 'offline' });
  });
  created.on('session', ({ token, roomCode }) => {
    write(TOKEN_KEY, token);
    // La sala ya no existe para el servidor (expiró o se reinició): se olvida aquí también.
    if (roomCode === null) {
      write(ROOM_KEY, null);
      useRoom.setState({ room: null });
      if (useMatch.getState().source?.kind === 'online') useMatch.getState().leave();
    }
  });
  created.on('room:state', (room) => {
    const over = room.status === 'closed';
    write(ROOM_KEY, over ? null : room.code);
    useRoom.setState({ room });
  });
  created.on('match:update', (update) => {
    useMatch.getState().receive(update);
  });
  created.on('team:signal', (notice) => {
    const signals = [
      ...useRoom.getState().signals,
      { ...notice, id: ++signalCounter, at: Date.now() },
    ];
    useRoom.setState({ signals: signals.slice(-SIGNALS_SHOWN) });
  });
  socket = created;
  return created;
}

function offline<T>(): Ack<T> {
  return {
    ok: false,
    error: { code: 'INTERNAL_ERROR', message: 'El servidor no responde. Inténtalo de nuevo.' },
  };
}

async function request<T>(send: (s: GameSocket) => Promise<Ack<T>>): Promise<Ack<T>> {
  try {
    return await send(connect().timeout(ACK_TIMEOUT_MS));
  } catch {
    return offline<T>();
  }
}

export function createRoom(nickname: string, mode: RoomMode): Promise<Ack<{ code: string }>> {
  return request((s) => s.emitWithAck('room:create', { nickname, mode }));
}

/** 2 vs 2, mientras se espera: pasar al otro equipo si tiene un asiento libre. */
export function switchTeam(): Promise<Ack> {
  return request((s) => s.emitWithAck('room:switch-team'));
}

/** Marcador rápido para tu compañero. */
export function sendSignal(signal: TeamSignal): Promise<Ack> {
  return request((s) => s.emitWithAck('team:signal', signal));
}

export function joinRoom(code: string, nickname: string): Promise<Ack<{ code: string }>> {
  return request((s) => s.emitWithAck('room:join', { code, nickname }));
}

export function selectTeam(animalIds: readonly string[]): Promise<Ack> {
  return request((s) => s.emitWithAck('team:select', { animalIds }));
}

/** Cada acción lleva un id único: si se reenvía tras un corte, el servidor no la repite. */
async function act(action: ClientAction): Promise<void> {
  const response = await request((s) =>
    s.emitWithAck('match:act', { actionId: crypto.randomUUID(), action }),
  );
  if (!response.ok) useMatch.setState({ error: response.error.message });
}

bindOnlineSender((action) => {
  void act(action);
});

/** Sale de la sala (si la partida está en curso, cuenta como abandono). */
export async function leaveRoom(): Promise<void> {
  if (socket !== null) await request((s) => s.emitWithAck('room:leave'));
  write(ROOM_KEY, null);
  useRoom.setState({ room: null, signals: [] });
  useMatch.getState().leave();
}

/** Al abrir la app: si esta pestaña estaba en una sala, vuelve a ella. */
export function resumeOnline(): void {
  if (hasActiveRoom()) connect();
}

/** Enlace para invitar a la sala. */
export function roomLink(code: string): string {
  return `${location.origin}/sala/${code}`;
}
