/**
 * Estado de la partida local. Guarda el estado completo del motor internamente, pero la
 * interfaz solo lee `view` (la PlayerView del jugador): igual que cuando juegue contra el
 * servidor, React nunca ve la carta atacante del rival ni sus cartas sin revelar.
 */
import {
  applyAction,
  getPlayerView,
  type Action,
  type CombatResolution,
  type MatchState,
  type PlayerView,
  type RngState,
} from '@atacknimal/engine';
import { create } from 'zustand';
import type { Difficulty } from '../state/stores.ts';
import { createLocalMatch, HUMAN, randomSeed, RIVAL } from './localMatch.ts';
import { chooseOpponentAction } from './opponent.ts';

/** Un duelo listo para presentarse: la resolución del motor y la vitalidad previa de cada carta. */
export interface PresentedDuel {
  readonly resolution: CombatResolution;
  readonly hpBefore: { readonly attacker: number; readonly defender: number };
}

interface MatchStoreState {
  view: PlayerView | null;
  difficulty: Difficulty;
  /** Duelo resuelto que la interfaz aún está mostrando: el juego espera a que se reconozca. */
  presenting: PresentedDuel | null;
  log: PresentedDuel[];
  error: string | null;
  start: (team: readonly string[], difficulty: Difficulty, seed?: number) => void;
  act: (action: Action) => void;
  acknowledge: () => void;
  opponentStep: () => void;
  concede: () => void;
  leave: () => void;
}

// Estado del motor y RNG del rival: fuera del store para que ningún componente los lea.
let engineState: MatchState | null = null;
let opponentRng: RngState | null = null;

function apply(
  action: Action,
  set: (partial: Partial<MatchStoreState>) => void,
  get: () => MatchStoreState,
): void {
  if (engineState === null) return;
  const before = engineState;
  const result = applyAction(before, action);
  if (!result.ok) {
    set({ error: result.error.message });
    return;
  }
  engineState = result.value.state;
  const resolved = result.value.events.flatMap((event) =>
    event.type === 'combatResolved' ? [event.resolution] : [],
  );
  const duels = resolved.map((resolution): PresentedDuel => ({
    resolution,
    hpBefore: {
      attacker: before.cards[resolution.attacker.cardId]?.hp ?? 0,
      defender: before.cards[resolution.defender.cardId]?.hp ?? 0,
    },
  }));
  set({
    view: getPlayerView(engineState, HUMAN),
    error: null,
    log: [...get().log, ...duels],
    presenting: duels.at(-1) ?? get().presenting,
  });
}

export const useMatch = create<MatchStoreState>()((set, get) => ({
  view: null,
  difficulty: 'normal',
  presenting: null,
  log: [],
  error: null,

  start: (team, difficulty, seed = randomSeed()) => {
    const { state, rng } = createLocalMatch(team, seed);
    engineState = state;
    opponentRng = rng;
    set({ view: getPlayerView(state, HUMAN), difficulty, presenting: null, log: [], error: null });
  },

  act: (action) => {
    apply(action, set, get);
  },

  acknowledge: () => {
    set({ presenting: null });
  },

  opponentStep: () => {
    if (engineState === null || opponentRng === null || get().presenting !== null) return;
    if (engineState.result !== null) return;
    const turn = engineState.turn;
    const actor = engineState.phase === 'declare' ? turn?.attackerId : turn?.defenderId;
    if (actor !== RIVAL) return;
    const [action, next] = chooseOpponentAction(getPlayerView(engineState, RIVAL), opponentRng);
    opponentRng = next;
    apply(action, set, get);
  },

  concede: () => {
    apply({ type: 'concede', playerId: HUMAN }, set, get);
  },

  leave: () => {
    engineState = null;
    opponentRng = null;
    set({ view: null, presenting: null, log: [], error: null });
  },
}));

/** A quién le toca actuar ahora según la vista del jugador. */
export function currentActor(view: PlayerView): string | null {
  if (view.turn === null || view.result !== null) return null;
  return view.phase === 'declare' ? view.turn.attackerId : view.turn.defenderId;
}

export { HUMAN, RIVAL };
