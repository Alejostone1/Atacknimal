import { getBalanceSet } from '@atacknimal/content';
import {
  applyAction,
  createMatch,
  createRng,
  getPlayerView,
  type MatchState,
} from '@atacknimal/engine';
import { describe, expect, it } from 'vitest';
import { expectedMax, greedyPolicy, randomPolicy } from './policies.ts';
import { evaluate, marginSplit } from './report.ts';
import { playMatch } from './runner.ts';
import { allTeams, simulate } from './simulate.ts';
import { BalanceStats } from './stats.ts';

const balance = getBalanceSet();

function started(): MatchState {
  let state = createMatch({
    id: 'policy',
    mode: '1v1',
    ruleset: balance.ruleset,
    roster: balance.roster,
    players: [
      { id: 'p1', team: 'A', seat: 1 },
      { id: 'p2', team: 'B', seat: 1 },
    ],
    seed: 4,
  });
  for (const [playerId, animalIds] of [
    ['p1', ['cheetah', 'golden-eagle', 'brown-bear', 'great-white-shark']],
    ['p2', ['elephant', 'rhinoceros', 'crocodile', 'blue-whale']],
  ] as const) {
    const result = applyAction(state, { type: 'selectTeam', playerId, animalIds });
    if (!result.ok) throw new Error(result.error.code);
    state = result.value.state;
  }
  return state;
}

describe('equipos', () => {
  it('con 11 animales hay C(11,4) = 330 equipos distintos', () => {
    const teams = allTeams(
      balance.roster.map((p) => p.id),
      4,
    );
    expect(teams).toHaveLength(330);
    expect(new Set(teams.map((t) => t.join('+'))).size).toBe(330);
  });
});

describe('política greedy', () => {
  it('ataca donde su margen frente a la mejor defensa rival es mayor', () => {
    const state = started();
    const attacker = state.turn?.attackerId ?? '';
    const [action] = greedyPolicy(getPlayerView(state, attacker), createRng(1));
    expect(action.type).toBe('declare');
    expect(applyAction(state, action).ok).toBe(true);
  });

  it('defiende con el mayor valor efectivo legal', () => {
    const state = started();
    const attacker = state.turn?.attackerId ?? '';
    const defender = state.turn?.defenderId ?? '';
    const cardId = state.players.find((p) => p.id === attacker)?.cardIds?.[0] ?? '';
    const declared = applyAction(state, {
      type: 'declare',
      playerId: attacker,
      habitat: 'land',
      cardId,
      attribute: 'weight',
    });
    if (!declared.ok) throw new Error(declared.error.code);
    const [action] = greedyPolicy(getPlayerView(declared.value.state, defender), createRng(1));
    const expected = attacker === 'p1' ? 'p2/elephant' : 'p1/brown-bear';
    expect(action).toEqual({ type: 'defend', playerId: defender, cardId: expected });
  });
});

describe('simulación', () => {
  it('juega partidas completas y deterministas', () => {
    const run = () =>
      playMatch({
        balance,
        teams: {
          A: ['cheetah', 'wolf', 'tiger', 'penguin'],
          B: ['elephant', 'rhinoceros', 'crocodile', 'blue-whale'],
        },
        policies: { A: greedyPolicy, B: randomPolicy },
        seed: 3,
      });
    const record = run();
    expect(record.duels).toBeGreaterThan(0);
    expect(record.duels).toBeLessThanOrEqual(balance.ruleset.maxDuels);
    expect(run()).toEqual(record);
  });

  it('agrega estadísticas coherentes en una muestra', () => {
    const stats = simulate({ balance, policy: greedyPolicy, seed: 1, sample: 30 });
    expect(stats.matches).toBe(30);
    expect(stats.reasons.elimination + stats.reasons['duel-limit']).toBe(30);
    expect(stats.attackerWins + stats.ties).toBeLessThanOrEqual(stats.duels);
    const appearances = [...stats.animals.values()].reduce((sum, t) => sum + t.matches, 0);
    expect(appearances).toBe(30 * 2 * 4);
  });
});

describe('estimación de cartas ocultas', () => {
  it('calcula el máximo esperado sin reemplazo', () => {
    expect(expectedMax([10, 20, 30], 1)).toBeCloseTo(20);
    expect(expectedMax([10, 20, 30], 2)).toBeCloseTo((20 + 30 + 30) / 3);
    expect(expectedMax([10, 20, 30], 3)).toBe(30);
    expect(expectedMax([], 2)).toBe(0);
  });
});

describe('márgenes', () => {
  it('estima el reparto de resultados con una ventaja defensiva', () => {
    const stats = new BalanceStats();
    for (const [margin, count] of [
      [-5, 1],
      [0, 1],
      [5, 1],
      [10, 1],
    ] as const) {
      stats.signedMargins.set(margin, count);
    }
    stats.duels = 4;
    expect(marginSplit(stats, 0)).toEqual({ attacker: 0.5, tie: 0.25, defender: 0.25 });
    expect(marginSplit(stats, 5)).toEqual({ attacker: 0.25, tie: 0.25, defender: 0.5 });
  });
});

describe('evaluación de objetivos', () => {
  const target = { min: 0.45, max: 0.55, alertMin: 0.42, alertMax: 0.58 };
  it.each([
    [0.5, 'ok'],
    [0.44, 'warn'],
    [0.56, 'warn'],
    [0.41, 'alert'],
    [0.6, 'alert'],
  ])('%f → %s', (value, status) => {
    expect(evaluate(value, target)).toBe(status);
  });
});
