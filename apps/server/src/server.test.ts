import { getBalanceSet } from '@atacknimal/content';
import {
  applyAction,
  createMatch,
  getLegalActions,
  type MatchState,
  type PlayerView,
} from '@atacknimal/engine';
import type {
  Ack,
  ClientAction,
  ClientToServerEvents,
  MatchUpdate,
  RoomState,
  ServerToClientEvents,
} from '@atacknimal/protocol';
import type { AddressInfo } from 'node:net';
import { io as connect, type Socket } from 'socket.io-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ServerConfig } from './config.ts';
import { openRepository, type MatchRepository } from './db/repository.ts';
import { buildServer, type GameServerHandle } from './server.ts';

const BALANCE = getBalanceSet();
const TEAM = BALANCE.roster.slice(0, BALANCE.ruleset.teamSize).map((p) => p.id);
const WAIT_MS = 5000;

type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/** Cliente de prueba: guarda todo lo que recibe para poder auditarlo. */
interface TestClient {
  readonly socket: ClientSocket;
  token: string | null;
  /** Sala que el servidor dice que tiene esta sesión al conectar. */
  sessionRoom: string | null;
  room: RoomState | null;
  readonly updates: MatchUpdate[];
  view(): PlayerView | null;
  waitFor(check: () => boolean): Promise<void>;
  call<T>(event: string, ...args: unknown[]): Promise<Ack<T>>;
}

let server: GameServerHandle;
let repository: MatchRepository;
let url: string;
const clients: TestClient[] = [];

function config(overrides: Partial<ServerConfig['timers']> = {}): ServerConfig {
  return {
    port: 0,
    host: '127.0.0.1',
    databaseUrl: undefined,
    pgliteDir: undefined,
    corsOrigin: '*',
    timers: { declareMs: 30_000, defendMs: 20_000, reconnectGraceMs: 60_000, ...overrides },
  };
}

async function start(timers: Partial<ServerConfig['timers']> = {}): Promise<void> {
  repository = await openRepository({});
  server = buildServer({ config: config(timers), repository });
  await server.http.listen({ port: 0, host: '127.0.0.1' });
  const { port } = server.http.server.address() as AddressInfo;
  url = `http://127.0.0.1:${String(port)}`;
}

function client(token?: string): Promise<TestClient> {
  const socket: ClientSocket = connect(url, {
    transports: ['websocket'],
    forceNew: true,
    auth: token === undefined ? {} : { token },
  });
  const updates: MatchUpdate[] = [];
  const listeners = new Set<() => void>();
  const notify = (): void => {
    for (const listener of listeners) listener();
  };
  const created: TestClient = {
    socket,
    token: null,
    sessionRoom: null,
    room: null,
    updates,
    view: () => updates.at(-1)?.view ?? null,
    waitFor: (check) =>
      new Promise((resolve, reject) => {
        if (check()) {
          resolve();
          return;
        }
        const timer = setTimeout(() => {
          listeners.delete(listener);
          reject(new Error('Tiempo de espera agotado'));
        }, WAIT_MS);
        const listener = (): void => {
          if (!check()) return;
          clearTimeout(timer);
          listeners.delete(listener);
          resolve();
        };
        listeners.add(listener);
      }),
    call: (event, ...args) =>
      (socket.timeout(WAIT_MS).emitWithAck as (e: string, ...a: unknown[]) => Promise<never>)(
        event,
        ...args,
      ),
  };
  socket.on('session', ({ token: received, roomCode }) => {
    created.token = received;
    created.sessionRoom = roomCode;
    notify();
  });
  socket.on('room:state', (state) => {
    created.room = state;
    notify();
  });
  socket.on('match:update', (update) => {
    updates.push(update);
    notify();
  });
  clients.push(created);
  return created.waitFor(() => created.token !== null).then(() => created);
}

/** Crea una sala con dos jugadores ya dentro. */
async function pair(): Promise<{ a: TestClient; b: TestClient; code: string }> {
  const a = await client();
  const b = await client();
  const created = await a.call<{ code: string }>('room:create', { nickname: 'Ana' });
  if (!created.ok) throw new Error(created.error.message);
  const joined = await b.call<{ code: string }>('room:join', {
    code: created.code.toLowerCase(),
    nickname: 'Beto',
  });
  expect(joined.ok).toBe(true);
  return { a, b, code: created.code };
}

async function pickTeams(a: TestClient, b: TestClient): Promise<void> {
  expect((await a.call('team:select', { animalIds: TEAM })).ok).toBe(true);
  expect((await b.call('team:select', { animalIds: TEAM })).ok).toBe(true);
  await a.waitFor(() => a.view()?.phase === 'declare');
}

/** Primera acción legal según la vista del cliente (sin `playerId`: lo pone el servidor). */
function firstLegal(view: PlayerView): ClientAction | null {
  const [action] = getLegalActions(view, view.viewerId);
  if (action === undefined) return null;
  switch (action.type) {
    case 'declare':
      return {
        type: 'declare',
        habitat: action.habitat,
        cardId: action.cardId,
        attribute: action.attribute,
      };
    case 'defend':
      return { type: 'defend', cardId: action.cardId };
    case 'concede':
    case 'selectTeam':
      return null;
  }
}

let actionCounter = 0;
const nextActionId = (): string => `test-action-${String(++actionCounter)}`;

/** Juega hasta el final: en cada momento actúa quien tiene acciones legales. */
async function playToEnd(a: TestClient, b: TestClient, maxActions = 500): Promise<void> {
  for (let step = 0; step < maxActions; step++) {
    const view = a.view();
    if (view === null || view.phase === 'finished') return;
    const actor = [a, b].find((c) => {
      const v = c.view();
      return v !== null && firstLegal(v) !== null;
    });
    if (actor === undefined) throw new Error('Nadie puede actuar');
    const actorView = actor.view();
    const action = actorView === null ? null : firstLegal(actorView);
    if (action === null) throw new Error('Sin acción legal');
    const seen = a.updates.length;
    const result = await actor.call<{ duplicate: boolean }>('match:act', {
      actionId: nextActionId(),
      action,
    });
    if (!result.ok) throw new Error(result.error.message);
    await a.waitFor(() => a.updates.length > seen);
    await b.waitFor(() => b.updates.length === a.updates.length);
  }
  if (maxActions === 500) throw new Error('La partida no terminó');
}

beforeEach(async () => {
  await start();
});

afterEach(async () => {
  for (const c of clients.splice(0)) c.socket.disconnect();
  await server.close();
  await repository.close();
});

describe('salas', () => {
  it('crea una sala con código y la consulta por HTTP', async () => {
    const a = await client();
    const created = await a.call<{ code: string }>('room:create', { nickname: 'Ana' });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.code).toMatch(/^[A-Z2-9]{6}$/);

    const summary = await fetch(`${url}/api/rooms/${created.code}`).then((r) => r.json());
    expect(summary).toEqual({
      code: created.code,
      status: 'waiting',
      players: 1,
      capacity: 2,
      joinable: true,
    });
    expect((await fetch(`${url}/api/rooms/ZZZZZZ`)).status).toBe(404);
    expect((await fetch(`${url}/api/rooms/x`)).status).toBe(400);
  });

  it('rechaza mensajes mal formados, salas inexistentes y salas llenas', async () => {
    const { code } = await pair();
    const c = await client();
    const bad = await c.call('room:create', { nickname: '<script>' });
    expect(bad).toMatchObject({ ok: false, error: { code: 'INVALID_MESSAGE' } });
    const missing = await c.call('room:join', { code: 'ZZZZZZ', nickname: 'Caro' });
    expect(missing).toMatchObject({ ok: false, error: { code: 'ROOM_NOT_FOUND' } });
    const full = await c.call('room:join', { code, nickname: 'Caro' });
    expect(full).toMatchObject({ ok: false, error: { code: 'ROOM_FULL' } });
  });

  it('pasa a elección de equipo al llegar el segundo jugador', async () => {
    const { a, b } = await pair();
    await a.waitFor(() => a.room?.status === 'team-select');
    expect(a.room?.players.map((p) => [p.playerId, p.nickname, p.isYou])).toEqual([
      ['A1', 'Ana', true],
      ['B1', 'Beto', false],
    ]);
    expect(b.room?.you).toBe('B1');
    expect(a.view()?.viewerId).toBe('A1');
  });
});

describe('partida autoritativa', () => {
  it('juega una partida completa y la guarda de forma reproducible', async () => {
    const { a, b, code } = await pair();
    await pickTeams(a, b);
    await playToEnd(a, b);

    expect(a.view()?.result).not.toBeNull();
    expect(a.view()?.result).toEqual(b.view()?.result);
    await b.waitFor(() => b.room?.status === 'finished');

    // Semilla + acciones guardadas reproducen exactamente la partida del servidor.
    const room = server.rooms.get(code);
    if (room === undefined) throw new Error('Sala no encontrada');
    await room.flush();
    const stored = await repository.findMatchByRoom(room.id);
    if (stored === null) throw new Error('Partida no guardada');
    expect(stored.endReason).toBe(a.view()?.result?.reason);

    let replay: MatchState = createMatch({
      id: stored.id,
      mode: '1v1',
      ruleset: BALANCE.ruleset,
      roster: BALANCE.roster,
      players: [
        { id: 'A1', team: 'A', seat: 1 },
        { id: 'B1', team: 'B', seat: 1 },
      ],
      seed: stored.seed,
    });
    for (const { action } of await repository.loadActions(stored.id)) {
      const result = applyAction(replay, action);
      if (!result.ok) throw new Error(result.error.message);
      replay = result.value.state;
    }
    expect(replay).toEqual(room.matchState);
  });

  it('nunca envía a un jugador información oculta del rival', async () => {
    const { a, b } = await pair();
    await pickTeams(a, b);
    await playToEnd(a, b);

    for (const [viewer, rivalId] of [
      [a, 'B1'],
      [b, 'A1'],
    ] as const) {
      for (const { view, events } of viewer.updates) {
        // Solo cartas rivales ya reveladas en un duelo.
        for (const card of Object.values(view.cards)) {
          if (card.ownerId === rivalId) expect(card.revealed).toBe(true);
        }
        if (view.phase === 'defend' && view.turn?.attackerId === rivalId) {
          expect(view.declaration?.cardId).toBeNull();
        }
        for (const event of events) {
          if (event.type === 'attackDeclared' && event.attackerId === rivalId) {
            expect(event.cardId).toBeNull();
          }
          if (event.type === 'teamConfirmed' && event.playerId === rivalId) {
            expect(event.animalIds).toBeNull();
          }
          if (event.type === 'matchStarted') expect(event.teams[rivalId]).toBeNull();
        }
      }
    }
  });

  it('ignora acciones repetidas y no deja actuar por otro jugador', async () => {
    const { a, b } = await pair();
    await pickTeams(a, b);
    const attacker = a.view()?.turn?.attackerId === 'A1' ? a : b;
    const view = attacker.view();
    const action = view === null ? null : firstLegal(view);
    if (action === null) throw new Error('Sin acción');

    const spoofed = await attacker.call('match:act', {
      actionId: 'spoofed-1',
      action: { ...action, playerId: 'B1' },
    });
    expect(spoofed).toMatchObject({ ok: false, error: { code: 'INVALID_MESSAGE' } });

    const first = await attacker.call('match:act', { actionId: 'repeat-1', action });
    const again = await attacker.call('match:act', { actionId: 'repeat-1', action });
    expect(first).toEqual({ ok: true, duplicate: false });
    expect(again).toEqual({ ok: true, duplicate: true });
    await attacker.waitFor(() => attacker.view()?.phase === 'defend');

    const outOfTurn = await attacker.call('match:act', { actionId: 'too-early-1', action });
    expect(outOfTurn).toMatchObject({ ok: false, error: { code: 'RULE_VIOLATION' } });
  });

  it('reconecta con el mismo token y recupera su vista', async () => {
    const { a, b, code } = await pair();
    await pickTeams(a, b);
    await playToEnd(a, b, 2); // un duelo completo: declarar y defender
    const token = b.token;
    if (token === null) throw new Error('Sin token');
    b.socket.disconnect();
    await a.waitFor(() => a.room?.players.find((p) => p.playerId === 'B1')?.connected === false);

    const back = await client(token);
    expect(back.token).toBe(token);
    expect(back.sessionRoom).toBe(code);
    await back.waitFor(() => back.view() !== null && back.room !== null);
    expect(back.view()?.viewerId).toBe('B1');
    expect(back.room?.status).toBe('playing');
    // La sincronización trae el historial de duelos (público) para rehacer el registro.
    expect(back.updates[0]?.history).toHaveLength(1);
    expect(back.updates[0]?.history?.[0]).toEqual(a.view()?.lastResolution);
    await a.waitFor(() => a.room?.players.every((p) => p.connected) === true);
  });
});

describe('tiempos y abandono', () => {
  it('si se agota el turno, la IA Fácil juega por el jugador', async () => {
    await server.close();
    await repository.close();
    await start({ declareMs: 150, defendMs: 150 });
    const { a, b } = await pair();
    await pickTeams(a, b);
    const remaining = a.updates.at(-1)?.turnEndsInMs;
    expect(remaining).toBeGreaterThanOrEqual(0);
    expect(remaining).toBeLessThanOrEqual(150);
    await b.waitFor(() => (b.view()?.duelNumber ?? 0) >= 2);
    expect(b.view()?.lastResolution).not.toBeNull();
  });

  it('quien no vuelve dentro del margen pierde por abandono', async () => {
    await server.close();
    await repository.close();
    await start({ reconnectGraceMs: 150 });
    const { a, b } = await pair();
    await pickTeams(a, b);
    b.socket.disconnect();
    await a.waitFor(() => a.view()?.result !== null);
    expect(a.view()?.result).toEqual({ winner: 'A', reason: 'concede' });
    expect(a.room?.status).toBe('finished');
  });

  it('si alguien se va antes de empezar, la sala se cierra', async () => {
    const { a, b, code } = await pair();
    expect((await b.call('room:leave')).ok).toBe(true);
    await a.waitFor(() => a.room?.status === 'closed');
    expect(server.rooms.has(code)).toBe(false);
  });
});
