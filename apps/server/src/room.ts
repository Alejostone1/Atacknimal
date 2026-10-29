/**
 * Una sala online (1 vs 1 o 2 vs 2). El servidor es la autoridad: guarda el estado completo,
 * aplica cada acción con el motor y envía a cada jugador solo su vista redactada (docs/API.md).
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
  type Seat,
  type TeamId,
} from '@atacknimal/engine';
import type {
  ClientAction,
  CloseReason,
  MatchUpdate,
  ProtocolErrorCode,
  RoomMode,
  RoomState,
  RoomStatus,
  RoomSummary,
  SignalNotice,
  TeamSignal,
} from '@atacknimal/protocol';
import { randomInt, randomUUID } from 'node:crypto';
import type { TimerConfig } from './config.ts';
import type { ActionSource, MatchRepository } from './db/repository.ts';

interface SeatSpec {
  readonly playerId: PlayerId;
  readonly team: TeamId;
  readonly seat: Seat;
}

/**
 * Asientos por modo, en orden de llegada. En 2 vs 2 se alternan equipos (A1, B1, A2, B2) y,
 * mientras se espera, cada jugador puede pasarse a un asiento libre del otro equipo.
 */
const SEATS: Readonly<Record<RoomMode, readonly SeatSpec[]>> = {
  '1v1': [
    { playerId: 'A1', team: 'A', seat: 1 },
    { playerId: 'B1', team: 'B', seat: 1 },
  ],
  '2v2': [
    { playerId: 'A1', team: 'A', seat: 1 },
    { playerId: 'B1', team: 'B', seat: 1 },
    { playerId: 'A2', team: 'A', seat: 2 },
    { playerId: 'B2', team: 'B', seat: 2 },
  ],
};

/** Tiempo que una sala terminada sigue disponible para ver el resultado o reconectar. */
const FINISHED_RETENTION_MS = 10 * 60 * 1000;

/** Intervalo mínimo entre marcadores rápidos de un mismo jugador (evita inundar al compañero). */
const SIGNAL_COOLDOWN_MS = 1000;

export interface RoomTransport {
  roomState(token: string, state: RoomState): void;
  matchUpdate(token: string, update: MatchUpdate): void;
  teamSignal(token: string, notice: SignalNotice): void;
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
  /** El asiento puede cambiar mientras la sala espera (cambio de equipo en 2 vs 2). */
  spec: SeatSpec;
  readonly nickname: string;
  readonly token: string;
  connected: boolean;
  graceTimer: NodeJS.Timeout | null;
  lastSignalAt: number;
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
  /** Caducidad de la fase previa a la partida: completar la sala o elegir equipo. */
  private phaseTimer: NodeJS.Timeout | null = null;
  private phaseDeadline: number | null = null;
  private closeReason: CloseReason | null = null;
  /** Escrituras encadenadas: se guardan en orden y nunca frenan la partida. */
  private persistence: Promise<void> = Promise.resolve();

  readonly code: string;
  readonly mode: RoomMode;
  private readonly deps: RoomDeps;

  constructor(code: string, mode: RoomMode, deps: RoomDeps) {
    this.code = code;
    this.mode = mode;
    this.deps = deps;
    this.persist((repo) => repo.roomCreated({ id: this.id, code, mode }));
    this.schedulePhase(deps.timers.roomWaitMs, 'expired');
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
      mode: this.mode,
      status: this.status,
      players: this.members.length,
      capacity: this.seats.length,
      joinable: this.status === 'waiting' && this.members.length < this.seats.length,
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
    const spec = this.freeSeats()[0];
    if (spec === undefined || this.status !== 'waiting') {
      return fail('ROOM_FULL', 'La sala está completa.');
    }

    this.members.push({
      spec,
      nickname,
      token,
      connected: true,
      graceTimer: null,
      lastSignalAt: 0,
      seenActions: new Set(),
    });
    if (this.members.length === this.seats.length) this.startMatch();
    this.broadcastRoom();
    return ok(spec.playerId);
  }

  /** 2 vs 2, antes de empezar: pasa al primer asiento libre del otro equipo. */
  switchTeam(token: string): RoomResult {
    const member = this.member(token);
    if (member === undefined) return fail('NOT_IN_ROOM', 'No estás en esta sala.');
    if (this.mode !== '2v2' || this.status !== 'waiting') {
      return fail(
        'MATCH_NOT_STARTED',
        'Solo puedes cambiar de equipo mientras esperáis en 2 vs 2.',
      );
    }
    const target = this.freeSeats().find((seat) => seat.team !== member.spec.team);
    if (target === undefined) return fail('ROOM_FULL', 'El otro equipo ya está completo.');
    member.spec = target;
    this.broadcastRoom();
    return ok(undefined);
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
      { type: 'selectTeam', playerId: member.spec.playerId, animalIds },
      'player',
    );
    // Confirmar equipo no siempre cambia la fase, pero los demás deben ver que ya estás listo.
    if (result.ok) this.broadcastRoom();
    return result;
  }

  act(token: string, actionId: string, request: ClientAction): RoomResult<{ duplicate: boolean }> {
    const member = this.member(token);
    if (member === undefined) return fail('NOT_IN_ROOM', 'No estás en esta sala.');
    if (member.seenActions.has(actionId)) return ok({ duplicate: true });
    if (this.status !== 'playing') return fail('MATCH_NOT_STARTED', 'La partida no está en curso.');

    // El jugador nunca elige en nombre de otro: el id sale de la sesión, no del mensaje.
    const result = this.apply({ ...request, playerId: member.spec.playerId }, 'player');
    if (!result.ok) return result;
    member.seenActions.add(actionId);
    return ok({ duplicate: false });
  }

  /** Marcador rápido para el compañero (2 vs 2). El rival nunca lo recibe. */
  signal(token: string, signal: TeamSignal): RoomResult {
    const member = this.member(token);
    if (member === undefined) return fail('NOT_IN_ROOM', 'No estás en esta sala.');
    if (this.mode !== '2v2' || this.state === null || this.status === 'closed') {
      return fail('MATCH_NOT_STARTED', 'Los marcadores solo existen en partidas 2 vs 2.');
    }
    if ('cardId' in signal) {
      const card = this.state.cards[signal.cardId];
      const owner = this.members.find((m) => m.spec.playerId === card?.ownerId);
      if (owner?.spec.team !== member.spec.team) {
        return fail('INVALID_MESSAGE', 'Solo puedes señalar cartas de tu equipo.');
      }
    }
    const now = Date.now();
    if (now - member.lastSignalAt < SIGNAL_COOLDOWN_MS) {
      return fail('RATE_LIMITED', 'Espera un momento antes de enviar otro marcador.');
    }
    member.lastSignalAt = now;
    for (const mate of this.members) {
      if (mate.spec.team !== member.spec.team) continue;
      this.deps.transport.teamSignal(mate.token, { from: member.spec.playerId, signal });
    }
    return ok(undefined);
  }

  /** Detiene temporizadores (apagado del servidor). */
  dispose(): void {
    clearTimer(this.turnTimer);
    clearTimer(this.retentionTimer);
    clearTimer(this.phaseTimer);
    for (const member of this.members) clearTimer(member.graceTimer);
  }

  /* ---------- Internos ---------- */

  private get seats(): readonly SeatSpec[] {
    return SEATS[this.mode];
  }

  private freeSeats(): SeatSpec[] {
    return this.seats.filter(
      (seat) => !this.members.some((m) => m.spec.playerId === seat.playerId),
    );
  }

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
      mode: this.mode,
      ruleset,
      roster,
      players: this.members.map(({ spec }) => ({
        id: spec.playerId,
        team: spec.team,
        seat: spec.seat,
      })),
      seed,
    });
    this.matchId = matchId;
    // La IA que juega por un jugador sin tiempo usa su propia semilla, derivada de la partida.
    this.aiRng = createRng(seed ^ 0x5bd1e995);
    this.status = 'team-select';
    this.schedulePhase(this.deps.timers.teamSelectMs, 'team-select-timeout');
    // Los asientos quedan fijos al empezar: se guardan ahora (antes podían cambiar de equipo).
    for (const { spec, nickname } of this.members) {
      this.persist((repo) => repo.playerJoined(this.id, spec.playerId, nickname));
    }
    this.persist((repo) =>
      repo.matchCreated({
        id: matchId,
        roomId: this.id,
        mode: this.mode,
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
    if (this.status !== 'team-select') this.clearPhase();
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
      // En 2 vs 2 abandonar hace perder a todo el equipo (GAME_RULES §10.3): lo decide el motor.
      this.apply({ type: 'concede', playerId: member.spec.playerId }, 'abandon');
      return;
    }
    this.close('abandoned');
  }

  /** Antes de empezar no hay resultado que registrar: la sala se cierra para todos. */
  private close(reason: CloseReason): void {
    if (this.isOver()) return;
    this.status = 'closed';
    this.closeReason = reason;
    this.clearPhase();
    this.dispose();
    this.persist((repo) => repo.roomClosed(this.id));
    this.broadcastRoom();
    this.deps.onDisposed(this);
  }

  /** Plazo de la fase previa a la partida; al vencer, la sala se cierra con `reason`. */
  private schedulePhase(ms: number, reason: CloseReason): void {
    this.clearPhase();
    this.phaseDeadline = Date.now() + ms;
    this.phaseTimer = unrefTimer(
      setTimeout(() => {
        this.phaseTimer = null;
        this.close(reason);
      }, ms),
    );
  }

  private clearPhase(): void {
    clearTimer(this.phaseTimer);
    this.phaseTimer = null;
    this.phaseDeadline = null;
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
    const viewer = member.spec.playerId;
    this.deps.transport.matchUpdate(member.token, {
      view: getPlayerView(state, viewer),
      events: events.map((event) => redactEvent(event, state, viewer)),
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
    const you = this.member(token)?.spec.playerId ?? null;
    // Orden estable por asiento para que la interfaz no salte al cambiar de equipo.
    const order = this.seats.map((seat) => seat.playerId);
    const members = [...this.members].sort(
      (a, b) => order.indexOf(a.spec.playerId) - order.indexOf(b.spec.playerId),
    );
    return {
      code: this.code,
      mode: this.mode,
      status: this.status,
      you,
      phaseEndsInMs:
        this.phaseDeadline === null ? null : Math.max(0, this.phaseDeadline - Date.now()),
      closeReason: this.closeReason,
      players: members.map(({ spec, nickname, connected }) => ({
        playerId: spec.playerId,
        team: spec.team,
        nickname,
        connected,
        teamConfirmed:
          (this.state?.players.find((p) => p.id === spec.playerId)?.cardIds ?? null) !== null,
        isYou: spec.playerId === you,
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
