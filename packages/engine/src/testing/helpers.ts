import type { Action } from '../actions.ts';
import { applyAction } from '../apply.ts';
import type { Result } from '../errors.ts';
import type { DomainEvent, Transition } from '../events.ts';
import { getLegalActions } from '../legal.ts';
import { createMatch, type PlayerConfig } from '../match.ts';
import { createRng, nextInt } from '../rng.ts';
import type { AnimalId } from '../roster.ts';
import type { Ruleset } from '../ruleset.ts';
import type { CardId, CardState, MatchMode, MatchState, PlayerId } from '../state.ts';
import { RULESET_V0_1, ROSTER_V0_1 } from './fixtures.ts';

export const PLAYERS: Readonly<Record<MatchMode, readonly PlayerConfig[]>> = {
  '1v1': [
    { id: 'p1', team: 'A', seat: 1 },
    { id: 'p2', team: 'B', seat: 1 },
  ],
  '2v2': [
    { id: 'a1', team: 'A', seat: 1 },
    { id: 'a2', team: 'A', seat: 2 },
    { id: 'b1', team: 'B', seat: 1 },
    { id: 'b2', team: 'B', seat: 2 },
  ],
};

export const TEAMS_1V1: Readonly<Record<PlayerId, readonly AnimalId[]>> = {
  p1: ['cheetah', 'tiger', 'golden-eagle', 'brown-bear'],
  p2: ['wolf', 'crocodile', 'elephant', 'rhinoceros'],
};

export const TEAMS_2V2: Readonly<Record<PlayerId, readonly AnimalId[]>> = {
  a1: ['cheetah', 'brown-bear'],
  a2: ['great-white-shark', 'golden-eagle'],
  b1: ['elephant', 'wolf'],
  b2: ['penguin', 'tiger'],
};

export function unwrap<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
  return result.value;
}

export function newMatch(mode: MatchMode, seed = 1, ruleset: Ruleset = RULESET_V0_1): MatchState {
  return createMatch({
    id: `test-${mode}`,
    mode,
    ruleset,
    roster: ROSTER_V0_1,
    players: PLAYERS[mode],
    seed,
  });
}

/** Partida con todos los equipos confirmados, lista para el primer duelo. */
export function startedMatch(
  mode: MatchMode,
  teams: Readonly<Record<PlayerId, readonly AnimalId[]>> = mode === '1v1' ? TEAMS_1V1 : TEAMS_2V2,
  seed = 1,
): MatchState {
  let state = newMatch(mode, seed);
  for (const player of PLAYERS[mode]) {
    const animalIds = teams[player.id];
    if (animalIds === undefined) throw new Error(`Falta el equipo de ${player.id}`);
    state = unwrap(
      applyAction(state, { type: 'selectTeam', playerId: player.id, animalIds }),
    ).state;
  }
  return state;
}

/** Partida 1v1 en la que `attackerId` ataca primero (busca una semilla adecuada). */
export function startedWith(
  attackerId: PlayerId,
  teams: Readonly<Record<PlayerId, readonly AnimalId[]>> = TEAMS_1V1,
): MatchState {
  for (let seed = 0; seed < 100; seed++) {
    const state = startedMatch('1v1', teams, seed);
    if (state.turn?.attackerId === attackerId) return state;
  }
  throw new Error(`Ninguna semilla hace atacar primero a ${attackerId}`);
}

export function patchCards(
  state: MatchState,
  patches: Readonly<Record<CardId, Partial<Pick<CardState, 'hp' | 'locks'>>>>,
): MatchState {
  const cards = { ...state.cards };
  for (const [cardId, patch] of Object.entries(patches)) {
    const card = cards[cardId];
    if (card === undefined) throw new Error(`Carta inexistente: ${cardId}`);
    cards[cardId] = { ...card, ...patch };
  }
  return { ...state, cards };
}

/** Aplica varias acciones seguidas; falla en la primera ilegal. */
export function play(state: MatchState, actions: readonly Action[]): Transition {
  let current = state;
  const events: DomainEvent[] = [];
  for (const action of actions) {
    const transition = unwrap(applyAction(current, action));
    current = transition.state;
    events.push(...transition.events);
  }
  return { state: current, events };
}

export function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

/**
 * Juega hasta el final eligiendo acciones legales al azar (con semilla).
 * Congela cada estado antes de usarlo: si el motor mutara algo, el test fallaría.
 */
export function randomPlayout(
  start: MatchState,
  seed: number,
  onStep: (state: MatchState, transition: Transition) => void = () => undefined,
): Transition {
  let state = deepFreeze(start);
  let rng = createRng(seed);
  const events: DomainEvent[] = [];
  const maxSteps = start.ruleset.maxDuels * 2 + 2;

  for (let step = 0; step < maxSteps && state.result === null; step++) {
    const actor = state.phase === 'declare' ? state.turn?.attackerId : state.turn?.defenderId;
    if (actor === undefined) throw new Error('Partida sin actor');
    const legal = getLegalActions(state, actor);
    const [index, nextRng] = nextInt(rng, legal.length);
    rng = nextRng;
    const action = legal[index];
    if (action === undefined) throw new Error(`Sin acciones legales para ${actor}`);

    const transition = unwrap(applyAction(state, action));
    onStep(state, transition);
    state = deepFreeze(transition.state);
    events.push(...transition.events);
  }
  return { state, events };
}
