import { describe, expect, it } from 'vitest';
import { applyAction } from '../apply.ts';
import type { DeclareAction } from '../actions.ts';
import { createRng, type RngState } from '../rng.ts';
import type { Ruleset } from '../ruleset.ts';
import type { MatchMode, MatchState } from '../state.ts';
import { RULESET_V0_1 } from '../testing/fixtures.ts';
import {
  deepFreeze,
  patchCards,
  play,
  startedMatch,
  startedWith,
  unwrap,
} from '../testing/helpers.ts';
import { getPlayerView } from '../view.ts';
import { AI_DIFFICULTIES, decideAI, type AiDifficulty } from './decide.ts';
import { expectedMax } from './estimate.ts';

const HIDDEN: Ruleset = { ...RULESET_V0_1, hiddenTeams: true, defenderBonus: 5 };

/** Partida entera IA contra IA: cada jugador decide solo con su vista. */
function aiMatch(
  mode: MatchMode,
  seed: number,
  levels: Record<string, AiDifficulty>,
  rules: Ruleset,
) {
  let state: MatchState = deepFreeze(startedMatch(mode, undefined, seed, rules));
  let rng: RngState = createRng(seed);
  for (let step = 0; step < rules.maxDuels * 2 + 2 && state.result === null; step++) {
    const actor = state.phase === 'declare' ? state.turn?.attackerId : state.turn?.defenderId;
    if (actor === undefined) throw new Error('Sin actor');
    const [action, next] = decideAI(getPlayerView(state, actor), levels[actor] ?? 'normal', rng);
    rng = next;
    state = deepFreeze(unwrap(applyAction(state, action)).state);
  }
  return state;
}

describe('IA (GAME_RULES §12)', () => {
  it.each(AI_DIFFICULTIES)('nivel %s: siempre juega acciones legales hasta el final', (level) => {
    for (const rules of [RULESET_V0_1, HIDDEN]) {
      for (let seed = 1; seed <= 15; seed++) {
        const p1v1 = aiMatch('1v1', seed, { p1: level, p2: level }, rules);
        expect(p1v1.result).not.toBeNull();
        const p2v2 = aiMatch('2v2', seed, { a1: level, a2: level, b1: level, b2: level }, rules);
        expect(p2v2.result).not.toBeNull();
      }
    }
  });

  it('es determinista: misma vista y misma semilla, misma decisión', () => {
    const view = getPlayerView(startedWith('p1'), 'p1');
    for (const level of AI_DIFFICULTIES) {
      expect(decideAI(view, level, createRng(9))).toEqual(decideAI(view, level, createRng(9)));
    }
  });

  it('defendiendo, decide igual sea cual sea la carta atacante (no puede verla)', () => {
    const declare = (cardId: string): DeclareAction => ({
      type: 'declare',
      playerId: 'p1',
      habitat: 'land',
      cardId,
      attribute: 'attack',
    });
    const withCheetah = play(startedWith('p1'), [declare('p1/cheetah')]).state;
    const withTiger = play(startedWith('p1'), [declare('p1/tiger')]).state;
    for (const level of AI_DIFFICULTIES) {
      expect(decideAI(getPlayerView(withCheetah, 'p2'), level, createRng(3))).toEqual(
        decideAI(getPlayerView(withTiger, 'p2'), level, createRng(3)),
      );
    }
  });

  it('Normal defiende con su mayor valor efectivo', () => {
    const declared = play(startedWith('p1'), [
      {
        type: 'declare',
        playerId: 'p1',
        habitat: 'land',
        cardId: 'p1/brown-bear',
        attribute: 'weight',
      },
    ]).state;
    const [action] = decideAI(getPlayerView(declared, 'p2'), 'normal', createRng(1));
    // Peso en Tierra: Elefante 100+10 es el mayor del equipo p2.
    expect(action).toEqual({ type: 'defend', playerId: 'p2', cardId: 'p2/elephant' });
  });

  it('Difícil, si va a perder igualmente, sacrifica a la carta que no puede salvarse', () => {
    // El Guepardo (Velocidad 110 en Tierra) ataca: ningún defensor de p2 llega a ese valor.
    const start = patchCards(startedWith('p1'), {
      'p2/wolf': { hp: 10 },
      'p2/crocodile': { hp: 100 },
      'p2/elephant': { hp: 100 },
      'p2/rhinoceros': { hp: 100 },
    });
    const declared = play(start, [
      {
        type: 'declare',
        playerId: 'p1',
        habitat: 'land',
        cardId: 'p1/cheetah',
        attribute: 'speed',
      },
    ]).state;
    const [hard] = decideAI(getPlayerView(declared, 'p2'), 'hard', createRng(1));
    const [normal] = decideAI(getPlayerView(declared, 'p2'), 'normal', createRng(1));
    // Normal defiende con el Lobo (Velocidad 80+10, la mayor) aunque lo eliminen;
    // Difícil prefiere no perder una carta sana a cambio de nada.
    expect(normal).toMatchObject({ cardId: 'p2/wolf' });
    expect(hard).not.toMatchObject({ cardId: 'p2/wolf' });
  });

  it('el máximo esperado sin reemplazo es correcto', () => {
    expect(expectedMax([10, 20, 30], 2)).toBeCloseTo((20 + 30 + 30) / 3);
    expect(expectedMax([10, 20, 30], 3)).toBe(30);
    expect(expectedMax([], 2)).toBe(0);
  });
});
