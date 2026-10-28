/**
 * Una sala 1 vs 1. El servidor es la autoridad: guarda el estado completo, aplica cada acción
 * con el motor y envía a cada jugador solo su vista redactada (docs/API.md).
 * El servidor nunca calcula reglas: valida forma (protocolo) y deja el resto al motor.
 */
import type { BalanceSet } from '@atacknimal/content';
import {
  applyAction,
  createMatch,
  createRng,
  decideAI,
  getPlayerView,
  redactEvent,
  type Action,
  type CombatResolution,
  type DomainEvent,
  type MatchState,
  type PlayerId,
  type RngState,
  type TeamId,
} from '@atacknimal/engine';
import type {
  ClientAction,
  MatchUpdate,
  ProtocolErrorCode,
  RoomState,
  RoomStatus,
  RoomSummary,
} from '@atacknimal/protocol';
import { randomInt, randomUUID } from 'node:crypto';
import type { TimerConfig } from './config.ts';
import type { ActionSource, MatchRepository } from './db/repository.ts';

/** Asientos de una sala 1 vs 1, en orden de llegada. */
const SEATS: readonly { readonly playerId: PlayerId; readonly team: TeamId }[] = [
  { playerId: 'A1', team: 'A' },
  { playerId: 'B1', team: 'B' },
];

/** Tiempo que una sala terminada sigue disponible para ver el resultado o reconectar. */
const FINISHED_RETENTION_MS = 10 * 60 * 1000;

export interface RoomTransport {
  roomState(token: string, state: RoomState): void;
  matchUpdate(token: string, update: MatchUpdate): void;
}

export interface RoomDeps {
  readonly balance: BalanceSet;
  readonly repository: MatchRepository;
  readonly transport: RoomTransport;
  readonly timers: TimerConfig;
  readonly onError: (error: unknown) => void;
  /** Se llama cuando la sala deja de existir (cerrada o terminada y retenida). */
  readonly onDisposed: (room: Room) => void;
}

export type RoomResult<T = undefined> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly code: ProtocolErrorCode; readonly message: string };

interface Member {
  readonly playerId: PlayerId;
  readonly team: TeamId;
  readonly nickname: string;
  readonly token: string;
  connected: boolean;
  graceTimer: NodeJS.Timeout | null;
  /** Ids de acción ya aceptados (idempotencia ante reintentos). */
  readonly seenActions: Set<string>;
}

const ok = <T>(value: T): RoomResult<T> => ({ ok: true, value });
const fail = (code: ProtocolErrorCode, message: string): RoomResult<never> => ({
  ok: false,
  code,
  message,
});

export class Room {
  readonly id = randomUUID();
  private status: RoomStatus = 'waiting';
  private readonly members: Member[] = [];
  private state: MatchState | null = null;
  private matchId: string | null = null;
  private actionSeq = 0;
  private aiRng: RngState = createRng(1);
  /** Duelos resueltos (públicos): se reenvían completos a quien se sincroniza. */
  private readonly history: CombatResolution[] = [];
  private turnTimer: NodeJS.Timeout | null = null;
  private turnDeadline: number | null = null;
  private retentionTimer: NodeJS.Timeout | null = null;
  /** Escrituras encadenadas: se guardan en orden y nunca frenan la partida. */
  private persistence: Promise<void> = Promise.resolve();

  readonly code: string;
  private readonly deps: RoomDeps;

  constructor(code: string, deps: RoomDeps) {
    this.code = code;
    this.deps = deps;
    this.persist((repo) => repo.roomCreated({ id: this.id, code, mode: '1v1' }));
  }

  /* ---------- Consultas ---------- */

  get currentStatus(): RoomStatus {
    return this.status;
  }

  /** Identificador de la partida guardada (para auditoría y tests). */
  get currentMatchId(): string | null {
    return this.matchId;
  }

  /** Estado completo de la partida. Solo para el servidor: nunca se envía a un cliente. */
  get matchState(): MatchState | null {
    return this.state;
  }

  hasMember(token: string): boolean {
    return this.member(token) !== undefined;
  }

  summary(): RoomSummary {
    return {
      code: this.code,
      status: this.status,
      players: this.members.length,
      capacity: SEATS.length,
      joinable: this.status === 'waiting' && this.members.length < SEATS.length,
    };
  }

  /** Espera a que terminen las escrituras pendientes (tests y apagado ordenado). */
  flush(): Promise<void> {
    return this.persistence;
  }

  /* ---------- Entrada y salida ---------- */

  join(token: string, nickname: string): RoomResult<PlayerId> {
    if (this.hasMember(token)) return fail('ALREADY_IN_ROOM', 'Ya estás en esta sala.');
    if (this.status === 'closed' || this.status === 'finished') {
      return fail('ROOM_CLOSED', 'La sala ya no está disponible.');
    }
    const seat = SEATS[this.members.length];
    if (seat === undefined) return fail('ROOM_FULL', 'La sala está completa.');

    this.members.push({
      ...seat,
      nickname,
      token,
      connected: true,
      graceTimer: null,
      seenActions: new Set(),
    });
    this.persist((repo) => repo.playerJoined(this.id, seat.playerId, nickname));
    if (this.members.length === SEATS.length) this.startMatch();
    this.broadcastRoom();
    return ok(seat.playerId);
  }

  /** Salida voluntaria: equivale a rendirse (o a cerrar la sala si aún no se jugaba). */
  leave(token: string): RoomResult {
    const member = this.member(token);
    if (member === undefined) return fail('NOT_IN_ROOM', 'No estás en esta sala.');
    this.abandon(member);
    return ok(undefined);
  }

  disconnected(token: string): void {
    const member = this.member(token);
    if (member === undefined || this.isOver()) return;
    member.connected = false;
    clearTimer(member.graceTimer);
    member.graceTimer = unrefTimer(
      setTimeout(() => {
        member.graceTimer = null;
        this.abandon(member);
      }, this.deps.timers.reconnectGraceMs),
    );
    this.broadcastRoom();
  }

  reconnected(token: string): void {
    const member = this.member(token);
    if (member === undefined) return;
    clearTimer(member.graceTimer);
    member.graceTimer = null;
    member.connected = true;
    this.broadcastRoom();
    if (this.state !== null) this.sendMatch(member, [], true);
  }

  /* ---------- Partida ---------- */

  selectTeam(token: string, animalIds: readonly string[]): RoomResult {
    const member = this.member(token);
    if (member === undefined) return fail('NOT_IN_ROOM', 'No estás en esta sala.');
    if (this.status !== 'team-select') {
      return fail('MATCH_NOT_STARTED', 'Ahora no se puede elegir equipo.');
    }
    const result = this.apply(
      { type: 'selectTeam', playerId: member.playerId, animalIds },
      'player',
    );
    // Confirmar equipo no siempre cambia la fase, pero el rival debe ver que ya estás listo.
    if (result.ok) this.broadcastRoom();
    return result;
  }

  act(token: string, actionId: string, request: ClientAction): RoomResult<{ duplicate: boolean }> {
    const member = this.member(token);
    if (member === undefined) return fail('NOT_IN_ROOM', 'No estás en esta sala.');
    if (member.seenActions.has(actionId)) return ok({ duplicate: true });
    if (this.status !== 'playing') return fail('MATCH_NOT_STARTED', 'La partida no está en curso.');

    // El jugador nunca elige en nombre de otro: el id sale de la sesión, no del mensaje.
    const result = this.apply({ ...request, playerId: member.playerId }, 'player');
    if (!result.ok) return result;
    member.seenActions.add(actionId);
    return ok({ duplicate: false });
  }

  /** Detiene temporizadores (apagado del servidor). */
  dispose(): void {
    clearTimer(this.turnTimer);
    clearTimer(this.retentionTimer);
    for (const member of this.members) clearTimer(member.graceTimer);
  }

  /* ---------- Internos ---------- */

  private member(token: string): Member | undefined {
    return this.members.find((m) => m.token === token);
  }

  private isOver(): boolean {
    return this.status === 'finished' || this.status === 'closed';
  }

  private startMatch(): void {
    const seed = randomInt(1, 2 ** 32);
    const matchId = randomUUID();
    const { ruleset, roster, version } = this.deps.balance;
    this.state = createMatch({
      id: matchId,
      mode: '1v1',
      ruleset,
      roster,
      players: this.members.map((m) => ({ id: m.playerId, team: m.team, seat: 1 })),
      seed,
    });
    this.matchId = matchId;
    // La IA que juega por un jugador sin tiempo usa su propia semilla, derivada de la partida.
    this.aiRng = createRng(seed ^ 0x5bd1e995);
    this.status = 'team-select';
    this.persist((repo) =>
      repo.matchCreated({
        id: matchId,
        roomId: this.id,
        mode: '1v1',
        rulesetVersion: version,
        seed,
      }),
    );
    for (const member of this.members) this.sendMatch(member, [], true);
  }

  /** Única puerta al motor: aplica, guarda, programa el turno y difunde. */
  private apply(action: Action, source: ActionSource): RoomResult {
    const { state, matchId } = this;
    if (state === null || matchId === null) {
      return fail('MATCH_NOT_STARTED', 'La partida aún no ha empezado.');
    }
    const result = applyAction(state, action);
    if (!result.ok) return fail('RULE_VIOLATION', result.error.message);

    this.state = result.value.state;
    for (const event of result.value.events) {
      if (event.type === 'combatResolved') this.history.push(event.resolution);
    }
    const seq = this.actionSeq++;
    this.persist((repo) => repo.actionAccepted(matchId, { seq, source, action }));

    const previous = this.status;
    const next = this.state;
    if (next.result !== null) {
      this.finish(matchId, next.result);
    } else if (next.phase !== 'setup') {
      this.status = 'playing';
    }
    this.scheduleTurn();
    for (const member of this.members) this.sendMatch(member, result.value.events);
    if (this.status !== previous) this.broadcastRoom();
    return ok(undefined);
  }

  private finish(matchId: string, result: NonNullable<MatchState['result']>): void {
    this.status = 'finished';
    for (const member of this.members) clearTimer(member.graceTimer);
    this.persist((repo) => repo.matchFinished(matchId, result));
    this.persist((repo) => repo.roomClosed(this.id));
    this.retentionTimer = unrefTimer(
      setTimeout(() => {
        this.deps.onDisposed(this);
      }, FINISHED_RETENTION_MS),
    );
  }

  private abandon(member: Member): void {
    if (this.isOver()) return;
    if (this.status === 'playing') {
      this.apply({ type: 'concede', playerId: member.playerId }, 'abandon');
      return;
    }
    // Antes de empezar no hay resultado que registrar: la sala se cierra para ambos.
    this.status = 'closed';
    this.dispose();
    this.persist((repo) => repo.roomClosed(this.id));
    this.broadcastRoom();
    this.deps.onDisposed(this);
  }

  /** Temporizador del turno: si vence, la IA Fácil juega por quien debía actuar (GAME_RULES §16). */
  private scheduleTurn(): void {
    clearTimer(this.turnTimer);
    this.turnTimer = null;
    this.turnDeadline = null;
    const state = this.state;
    if (state === null || state.turn === null) return;
    if (state.phase !== 'declare' && state.phase !== 'defend') return;

    const actor = state.phase === 'declare' ? state.turn.attackerId : state.turn.defenderId;
    const ms = state.phase === 'declare' ? this.deps.timers.declareMs : this.deps.timers.defendMs;
    this.turnDeadline = Date.now() + ms;
    this.turnTimer = unrefTimer(
      setTimeout(() => {
        this.turnTimer = null;
        this.playForTimeout(actor);
      }, ms),
    );
  }

  private playForTimeout(actor: PlayerId): void {
    if (this.state === null || this.isOver()) return;
    const [action, rng] = decideAI(getPlayerView(this.state, actor), 'easy', this.aiRng);
    this.aiRng = rng;
    const result = this.apply(action, 'timeout');
    if (!result.ok) this.deps.onError(new Error(`IA por tiempo rechazada: ${result.message}`));
  }

  private sendMatch(member: Member, events: readonly DomainEvent[], sync = false): void {
    const state = this.state;
    if (state === null) return;
    this.deps.transport.matchUpdate(member.token, {
      view: getPlayerView(state, member.playerId),
      events: events.map((event) => redactEvent(event, state, member.playerId)),
      history: sync ? this.history : null,
      turnEndsInMs: this.turnDeadline === null ? null : Math.max(0, this.turnDeadline - Date.now()),
    });
  }

  private broadcastRoom(): void {
    for (const member of this.members) {
      this.deps.transport.roomState(member.token, this.roomStateFor(member.token));
    }
  }

  roomStateFor(token: string): RoomState {
    const you = this.member(token)?.playerId ?? null;
    return {
      code: this.code,
      mode: '1v1',
      status: this.status,
      you,
      players: this.members.map((m) => ({
        playerId: m.playerId,
        team: m.team,
        nickname: m.nickname,
        connected: m.connected,
        teamConfirmed:
          (this.state?.players.find((p) => p.id === m.playerId)?.cardIds ?? null) !== null,
        isYou: m.playerId === you,
      })),
    };
  }

  private persist(write: (repo: MatchRepository) => Promise<void>): void {
    this.persistence = this.persistence
      .then(() => write(this.deps.repository))
      .catch(this.deps.onError);
  }
}

function clearTimer(timer: NodeJS.Timeout | null): void {
  if (timer !== null) clearTimeout(timer);
}

/** Los temporizadores de sala no deben mantener vivo el proceso por sí solos. */
function unrefTimer(timer: NodeJS.Timeout): NodeJS.Timeout {
  timer.unref();
  return timer;
}
