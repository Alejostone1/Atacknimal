/**
 * Estado de la partida que ve la interfaz. Tiene dos orígenes con la misma forma:
 * - local: el motor corre en el navegador contra la IA; el estado completo vive fuera del store.
 * - online: el servidor es la autoridad y solo envía la PlayerView de este jugador.
 * En ambos casos React solo lee `view`: nunca ve la carta atacante del rival ni sus cartas ocultas.
 */
import {
  applyAction,
  decideAI,
  getPlayerView,
  type Action,
  type CombatResolution,
  type CombatSide,
  type MatchState,
  type PlayerEvent,
  type PlayerView,
  type RngState,
} from '@atacknimal/engine';
import type { ClientAction, MatchUpdate } from '@atacknimal/protocol';
import { create } from 'zustand';
import type { Difficulty } from '../state/stores.ts';
import { createLocalMatch, HUMAN, randomSeed, RIVAL } from './localMatch.ts';

/** Un duelo listo para presentarse: la resolución del motor y la vitalidad previa de cada carta. */
export interface PresentedDuel {
  readonly resolution: CombatResolution;
  readonly hpBefore: { readonly attacker: number; readonly defender: number };
}

export type MatchSource =
  { readonly kind: 'local'; readonly difficulty: Difficulty } | { readonly kind: 'online' };

interface MatchStoreState {
  view: PlayerView | null;
  source: MatchSource | null;
  /** Duelo resuelto que la interfaz aún está mostrando: el juego espera a que se reconozca. */
  presenting: PresentedDuel | null;
  log: PresentedDuel[];
  error: string | null;
  /** Hora local (ms) en que vence el turno online, o `null`. */
  turnDeadline: number | null;
  start: (team: readonly string[], difficulty: Difficulty, seed?: number) => void;
  /** Actualización del servidor (partida online). */
  receive: (update: MatchUpdate) => void;
  /** Acción del jugador; el `playerId` lo pone el motor local o el servidor, nunca la interfaz. */
  act: (action: ClientAction) => void;
  acknowledge: () => void;
  opponentStep: () => void;
  concede: () => void;
  leave: () => void;
}

// Estado del motor y RNG del rival (solo local): fuera del store para que ningún componente los lea.
let engineState: MatchState | null = null;
let opponentRng: RngState | null = null;
/** Envío al servidor; lo registra el cliente online (game/online.ts). */
let sendOnline: ((action: ClientAction) => void) | null = null;

export function bindOnlineSender(send: (action: ClientAction) => void): void {
  sendOnline = send;
}

function resolutions(events: readonly PlayerEvent[]): CombatResolution[] {
  return events.flatMap((event) => (event.type === 'combatResolved' ? [event.resolution] : []));
}

/**
 * Vitalidad de una carta antes del duelo. Una carta que aún no se veía nunca había combatido
 * (las cartas se revelan al entrar en su primer duelo), así que estaba con la vitalidad completa.
 */
function hpBefore(previous: PlayerView | null, next: PlayerView, cardId: string): number {
  return previous?.cards[cardId]?.hp ?? next.cards[cardId]?.maxHp ?? next.ruleset.baseHp;
}

function present(
  previous: PlayerView | null,
  next: PlayerView,
  events: readonly PlayerEvent[],
): PresentedDuel[] {
  return resolutions(events).map((resolution) => ({
    resolution,
    hpBefore: {
      attacker: hpBefore(previous, next, resolution.attacker.cardId),
      defender: hpBefore(previous, next, resolution.defender.cardId),
    },
  }));
}

/**
 * Duelos pasados recibidos al sincronizar: no se animan, solo alimentan el registro y el resumen.
 * La vitalidad previa se estima desde la propia resolución (el daño es nominal: se acota al máximo).
 */
function fromHistory(view: PlayerView, history: readonly CombatResolution[]): PresentedDuel[] {
  const before = (side: CombatSide, damage: CombatResolution['damage']): number => {
    const lost = damage?.targetCardId === side.cardId ? damage.amount : 0;
    const max = view.cards[side.cardId]?.maxHp ?? view.ruleset.baseHp;
    return Math.min(max, side.hpAfter + lost);
  };
  return history.map((resolution) => ({
    resolution,
    hpBefore: {
      attacker: before(resolution.attacker, resolution.damage),
      defender: before(resolution.defender, resolution.damage),
    },
  }));
}

function applyLocal(
  action: Action,
  set: (partial: Partial<MatchStoreState>) => void,
  get: () => MatchStoreState,
): void {
  if (engineState === null) return;
  const result = applyAction(engineState, action);
  if (!result.ok) {
    set({ error: result.error.message });
    return;
  }
  engineState = result.value.state;
  const previous = get().view;
  const view = getPlayerView(engineState, HUMAN);
  const duels = present(previous, view, result.value.events);
  set({
    view,
    error: null,
    log: [...get().log, ...duels],
    presenting: duels.at(-1) ?? get().presenting,
  });
}

export const useMatch = create<MatchStoreState>()((set, get) => ({
  view: null,
  source: null,
  presenting: null,
  log: [],
  error: null,
  turnDeadline: null,

  start: (team, difficulty, seed = randomSeed()) => {
    const { state, rng } = createLocalMatch(team, seed);
    engineState = state;
    opponentRng = rng;
    set({
      view: getPlayerView(state, HUMAN),
      source: { kind: 'local', difficulty },
      presenting: null,
      log: [],
      error: null,
      turnDeadline: null,
    });
  },

  receive: ({ view, events, turnEndsInMs, history }) => {
    const current = get();
    const sameMatch = current.view?.matchId === view.matchId;
    const deadline = turnEndsInMs === null ? null : Date.now() + turnEndsInMs;
    engineState = null;
    opponentRng = null;
    // Sincronización completa (al empezar o reconectar): el registro sale del servidor.
    if (history !== null) {
      set({
        view,
        source: { kind: 'online' },
        error: null,
        log: fromHistory(view, history),
        presenting: sameMatch ? current.presenting : null,
        turnDeadline: deadline,
      });
      return;
    }
    const previous = sameMatch ? current.view : null;
    const duels = present(previous, view, events);
    set({
      view,
      source: { kind: 'online' },
      error: null,
      log: [...current.log, ...duels],
      presenting: duels.at(-1) ?? current.presenting,
      turnDeadline: deadline,
    });
  },

  act: (action) => {
    if (get().source?.kind === 'online') {
      sendOnline?.(action);
      return;
    }
    applyLocal({ ...action, playerId: HUMAN }, set, get);
  },

  acknowledge: () => {
    set({ presenting: null });
  },

  opponentStep: () => {
    if (engineState === null || opponentRng === null || get().presenting !== null) return;
    const source = get().source;
    if (source?.kind !== 'local' || engineState.result !== null) return;
    const turn = engineState.turn;
    const actor = engineState.phase === 'declare' ? turn?.attackerId : turn?.defenderId;
    if (actor !== RIVAL) return;
    // La IA decide con su propia vista: no ve tu carta atacante ni tus cartas sin revelar.
    const [action, next] = decideAI(
      getPlayerView(engineState, RIVAL),
      source.difficulty,
      opponentRng,
    );
    opponentRng = next;
    applyLocal(action, set, get);
  },

  concede: () => {
    get().act({ type: 'concede' });
  },

  leave: () => {
    engineState = null;
    opponentRng = null;
    set({ view: null, source: null, presenting: null, log: [], error: null, turnDeadline: null });
  },
}));

/** A quién le toca actuar ahora según la vista del jugador. */
export function currentActor(view: PlayerView): string | null {
  if (view.turn === null || view.result !== null) return null;
  return view.phase === 'declare' ? view.turn.attackerId : view.turn.defenderId;
}

/** El otro jugador de una partida 1 vs 1, visto desde quien mira. */
export function rivalOf(view: PlayerView): string | undefined {
  return view.players.find((p) => p.team !== view.players.find((q) => q.id === view.viewerId)?.team)
    ?.id;
}
