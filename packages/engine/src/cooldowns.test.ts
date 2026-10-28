/**
 * Parámetros candidatos de la decisión #025 (desactivados en el ruleset 0.1.0).
 */
import { describe, expect, it } from 'vitest';
import type { DeclareAction } from './actions.ts';
import { applyAction } from './apply.ts';
import { getLegalActions } from './legal.ts';
import { createMatch, MatchConfigError } from './match.ts';
import type { Ruleset } from './ruleset.ts';
import { RULESET_V0_1, ROSTER_V0_1 } from './testing/fixtures.ts';
import {
  PLAYERS,
  patchCards,
  play,
  randomPlayout,
  startedMatch,
  startedWith,
} from './testing/helpers.ts';

const withRules = (overrides: Partial<Ruleset>): Ruleset => ({ ...RULESET_V0_1, ...overrides });

const declare = (
  playerId: string,
  cardId: string,
  habitat: DeclareAction['habitat'],
  attribute: DeclareAction['attribute'],
): DeclareAction => ({ type: 'declare', playerId, cardId, habitat, attribute });

describe('ventaja defensiva (#025 A)', () => {
  const rules = withRules({ defenderBonus: 10 });

  it('suma la ventaja al valor del defensor y la muestra en el desglose', () => {
    const { events } = play(startedWith('p1', undefined, rules), [
      declare('p1', 'p1/cheetah', 'land', 'speed'),
      { type: 'defend', playerId: 'p2', cardId: 'p2/wolf' },
    ]);
    const resolved = events.find((e) => e.type === 'combatResolved');
    expect(resolved).toMatchObject({
      resolution: {
        attacker: { effective: 110, breakdown: { roleModifier: 0 } },
        defender: { effective: 100, breakdown: { roleModifier: 10 } },
        margin: 10,
        damage: { amount: 25 },
      },
    });
  });

  it('no se aplica en una defensa forzada', () => {
    const locked = [{ attribute: 'speed' as const, remaining: 1 }];
    const start = patchCards(startedWith('p1', undefined, rules), {
      'p2/wolf': { locks: locked },
      'p2/crocodile': { locks: locked },
      'p2/elephant': { locks: locked },
      'p2/rhinoceros': { locks: locked },
    });
    const { events } = play(start, [
      declare('p1', 'p1/cheetah', 'land', 'speed'),
      { type: 'defend', playerId: 'p2', cardId: 'p2/wolf' },
    ]);
    expect(events.find((e) => e.type === 'combatResolved')).toMatchObject({
      resolution: { forcedDefense: true, defender: { effective: 0 } },
    });
  });
});

/** Juega un duelo de p1 y la respuesta completa de p2, para volver al turno de p1. */
function roundTrip(rules: Ruleset, first: DeclareAction) {
  return play(startedWith('p1', undefined, rules), [
    first,
    { type: 'defend', playerId: 'p2', cardId: 'p2/rhinoceros' },
    declare('p2', 'p2/wolf', 'trees', 'perception'),
    { type: 'defend', playerId: 'p1', cardId: 'p1/golden-eagle' },
  ]).state;
}

describe('bloqueo de atributo de equipo (#025 B)', () => {
  const rules = withRules({ teamAttributeLock: 1 });

  it('el atributo usado al atacar queda bloqueado para todo el equipo en su siguiente ataque', () => {
    const state = roundTrip(rules, declare('p1', 'p1/cheetah', 'land', 'speed'));
    expect(state.teamCooldowns.A.attributes).toEqual([{ attribute: 'speed', remaining: 1 }]);
    expect(applyAction(state, declare('p1', 'p1/tiger', 'land', 'speed'))).toMatchObject({
      error: { code: 'ATTRIBUTE_LOCKED' },
    });
    const legal = getLegalActions(state, 'p1');
    expect(legal.length).toBeGreaterThan(0);
    expect(legal.some((a) => a.type === 'declare' && a.attribute === 'speed')).toBe(false);
  });

  it('se libera después de ese ataque', () => {
    const state = roundTrip(rules, declare('p1', 'p1/cheetah', 'land', 'speed'));
    const after = play(state, [
      declare('p1', 'p1/tiger', 'land', 'attack'),
      { type: 'defend', playerId: 'p2', cardId: 'p2/crocodile' },
    ]).state;
    expect(after.teamCooldowns.A.attributes).toEqual([{ attribute: 'attack', remaining: 1 }]);
  });

  it('no afecta al rival', () => {
    const state = roundTrip(rules, declare('p1', 'p1/cheetah', 'land', 'speed'));
    expect(state.teamCooldowns.B.attributes).toEqual([{ attribute: 'perception', remaining: 1 }]);
  });
});

describe('enfriamiento de hábitat (#025 C)', () => {
  const rules = withRules({ habitatCooldown: 1 });

  it('el equipo no puede repetir el hábitat en su siguiente ataque', () => {
    const state = roundTrip(rules, declare('p1', 'p1/cheetah', 'land', 'speed'));
    expect(applyAction(state, declare('p1', 'p1/tiger', 'land', 'attack'))).toMatchObject({
      error: { code: 'HABITAT_LOCKED' },
    });
    expect(
      getLegalActions(state, 'p1').some((a) => a.type === 'declare' && a.habitat === 'land'),
    ).toBe(false);
  });
});

describe('validación de los parámetros', () => {
  it('rechaza valores que dejarían a una carta sin ataques legales', () => {
    const create = (overrides: Partial<Ruleset>) => () =>
      createMatch({
        id: 'x',
        mode: '1v1',
        ruleset: withRules(overrides),
        roster: ROSTER_V0_1,
        players: PLAYERS['1v1'],
        seed: 1,
      });
    expect(create({ teamAttributeLock: 7 })).toThrow(MatchConfigError);
    expect(create({ habitatCooldown: 4 })).toThrow(MatchConfigError);
    expect(create({ defenderBonus: -1 })).toThrow(MatchConfigError);
    expect(create({ teamAttributeLock: 6, habitatCooldown: 3, defenderBonus: 20 })).not.toThrow();
  });

  it('con todas las candidatas activas, las partidas terminan y el rival las ve', () => {
    const rules = withRules({ defenderBonus: 10, teamAttributeLock: 3, habitatCooldown: 2 });
    for (const mode of ['1v1', '2v2'] as const) {
      for (let seed = 1; seed <= 40; seed++) {
        const { state } = randomPlayout(startedMatch(mode, undefined, seed, rules), seed);
        expect(state.result).not.toBeNull();
      }
    }
  });
});
