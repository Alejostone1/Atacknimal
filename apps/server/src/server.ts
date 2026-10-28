/**
 * Servidor HTTP (Fastify) + tiempo real (Socket.IO). Valida la forma de cada mensaje con
 * @atacknimal/protocol y delega las reglas en la sala, que a su vez delega en el motor.
 */
import { getBalanceSet, type BalanceSet } from '@atacknimal/content';
import {
  actSchema,
  createRoomSchema,
  joinRoomSchema,
  roomCodeSchema,
  selectTeamSchema,
  type Ack,
  type ClientToServerEvents,
  type ProtocolErrorCode,
  type ServerToClientEvents,
} from '@atacknimal/protocol';
import Fastify, { type FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { Server, type Socket } from 'socket.io';
import type { z } from 'zod';
import { generateRoomCode } from './codes.ts';
import type { ServerConfig } from './config.ts';
import type { MatchRepository } from './db/repository.ts';
import { Room, type RoomResult } from './room.ts';

interface SocketData {
  token: string;
}

type GameServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;
type GameSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

/**
 * Sesión de invitado: un token aleatorio que el cliente guarda y presenta al reconectar.
 * 🔒 SEGURIDAD PENDIENTE: tokens en memoria y sin firmar; cuentas y expiración (ARCHITECTURE §10).
 */
interface Session {
  readonly token: string;
  roomCode: string | null;
  sockets: number;
}

export interface GameServerHandle {
  readonly http: FastifyInstance;
  readonly io: GameServer;
  /** Salas activas por código (expuesto para tests). */
  readonly rooms: ReadonlyMap<string, Room>;
  close(): Promise<void>;
}

export interface BuildOptions {
  readonly config: ServerConfig;
  readonly repository: MatchRepository;
  readonly balance?: BalanceSet;
  readonly logger?: boolean;
}

const sessionChannel = (token: string): string => `session:${token}`;

export function buildServer(options: BuildOptions): GameServerHandle {
  const { config, repository } = options;
  const balance = options.balance ?? getBalanceSet();
  const http = Fastify({ logger: options.logger ?? false });
  const io: GameServer = new Server(http.server, {
    cors: { origin: [...config.corsOrigins] },
    // 🔒 Límite de tamaño de mensaje; el rate limiting por socket sigue pendiente.
    maxHttpBufferSize: 16 * 1024,
  });
  const rooms = new Map<string, Room>();
  const sessions = new Map<string, Session>();
  const logError = (error: unknown): void => {
    http.log.error(error);
  };

  const createRoom = (): Room => {
    const code = generateRoomCode((candidate) => rooms.has(candidate));
    const room = new Room(code, {
      balance,
      repository,
      timers: config.timers,
      onError: logError,
      onDisposed: (disposed) => {
        if (rooms.get(disposed.code) === disposed) rooms.delete(disposed.code);
        for (const session of sessions.values()) {
          if (session.roomCode === disposed.code) session.roomCode = null;
        }
      },
      transport: {
        roomState: (token, state) => io.to(sessionChannel(token)).emit('room:state', state),
        matchUpdate: (token, update) => io.to(sessionChannel(token)).emit('match:update', update),
      },
    });
    rooms.set(code, room);
    return room;
  };

  /* ---------- HTTP ---------- */

  http.get('/health', () => ({ status: 'ok', rooms: rooms.size }));

  http.get<{ Params: { code: string } }>('/api/rooms/:code', async (request, reply) => {
    const code = roomCodeSchema.safeParse(request.params.code);
    if (!code.success) return reply.code(400).send({ error: 'INVALID_MESSAGE' });
    const room = rooms.get(code.data);
    if (room === undefined) return reply.code(404).send({ error: 'ROOM_NOT_FOUND' });
    return room.summary();
  });

  /* ---------- Tiempo real ---------- */

  io.on('connection', (socket: GameSocket) => {
    const session = resolveSession(sessions, socket.handshake.auth);
    session.sockets++;
    socket.data.token = session.token;
    void socket.join(sessionChannel(session.token));

    const current = (): Room | undefined =>
      session.roomCode === null ? undefined : rooms.get(session.roomCode);

    // Reconexión: vuelve a la sala y recibe el estado actual completo (su vista).
    const rejoined = current();
    if (rejoined === undefined) session.roomCode = null;
    socket.emit('session', { token: session.token, roomCode: session.roomCode });
    rejoined?.reconnected(session.token);

    // Cada manejador devuelve su respuesta; `handle` la entrega y contiene cualquier fallo.
    const handle = <T>(ack: unknown, run: () => Ack<T>): void => {
      let response: Ack<T>;
      try {
        response = run();
      } catch (thrown) {
        logError(thrown);
        response = error('INTERNAL_ERROR', 'Error interno del servidor.');
      }
      if (typeof ack === 'function') (ack as (r: Ack<T>) => void)(response);
    };

    const enter = (room: Room, nickname: string): Ack<{ code: string }> => {
      if (room.hasMember(session.token)) {
        room.reconnected(session.token);
      } else {
        if (current() !== undefined) return error('ALREADY_IN_ROOM', 'Ya estás en una sala.');
        const joined = room.join(session.token, nickname);
        if (!joined.ok) return failure(joined);
      }
      session.roomCode = room.code;
      return { ok: true, code: room.code };
    };

    socket.on('room:create', (request: unknown, ack: unknown) => {
      handle(ack, () => {
        const parsed = createRoomSchema.safeParse(request);
        if (!parsed.success) return invalid(parsed.error);
        if (current() !== undefined) return error('ALREADY_IN_ROOM', 'Ya estás en una sala.');
        return enter(createRoom(), parsed.data.nickname);
      });
    });

    socket.on('room:join', (request: unknown, ack: unknown) => {
      handle(ack, () => {
        const parsed = joinRoomSchema.safeParse(request);
        if (!parsed.success) return invalid(parsed.error);
        const room = rooms.get(parsed.data.code);
        if (room === undefined) return error('ROOM_NOT_FOUND', 'No existe esa sala.');
        return enter(room, parsed.data.nickname);
      });
    });

    socket.on('room:leave', (ack: unknown) => {
      handle(ack, () => {
        const room = current();
        if (room === undefined) return error('NOT_IN_ROOM', 'No estás en una sala.');
        const left = room.leave(session.token);
        session.roomCode = null;
        return left.ok ? { ok: true } : failure(left);
      });
    });

    socket.on('team:select', (request: unknown, ack: unknown) => {
      handle(ack, () => {
        const parsed = selectTeamSchema.safeParse(request);
        if (!parsed.success) return invalid(parsed.error);
        const room = current();
        if (room === undefined) return error('NOT_IN_ROOM', 'No estás en una sala.');
        const result = room.selectTeam(session.token, parsed.data.animalIds);
        return result.ok ? { ok: true } : failure(result);
      });
    });

    socket.on('match:act', (request: unknown, ack: unknown) => {
      handle(ack, () => {
        const parsed = actSchema.safeParse(request);
        if (!parsed.success) return invalid(parsed.error);
        const room = current();
        if (room === undefined) return error('NOT_IN_ROOM', 'No estás en una sala.');
        const result = room.act(session.token, parsed.data.actionId, parsed.data.action);
        return result.ok ? { ok: true, duplicate: result.value.duplicate } : failure(result);
      });
    });

    socket.on('disconnect', () => {
      session.sockets--;
      if (session.sockets > 0) return;
      current()?.disconnected(session.token);
    });
  });

  return {
    http,
    io,
    rooms,
    async close() {
      for (const room of rooms.values()) room.dispose();
      await Promise.all([...rooms.values()].map((room) => room.flush()));
      await io.close();
      await http.close();
    },
  };
}

function resolveSession(sessions: Map<string, Session>, auth: unknown): Session {
  const token =
    typeof auth === 'object' && auth !== null && 'token' in auth && typeof auth.token === 'string'
      ? auth.token
      : null;
  const existing = token === null ? undefined : sessions.get(token);
  if (existing !== undefined) return existing;
  const session: Session = { token: randomUUID(), roomCode: null, sockets: 0 };
  sessions.set(session.token, session);
  return session;
}

function error(code: ProtocolErrorCode, message: string): Ack<never> {
  return { ok: false, error: { code, message } };
}

function invalid(zodError: z.ZodError): Ack<never> {
  return error('INVALID_MESSAGE', zodError.issues[0]?.message ?? 'Mensaje inválido.');
}

function failure(result: Extract<RoomResult<unknown>, { ok: false }>): Ack<never> {
  return error(result.code, result.message);
}
