import { describe, expect, it } from 'vitest';
import { compareValues, computeCounterDamage, computeDamage, computeValue } from './combat.ts';
import { RULESET_V0_1, rosterProfile } from './testing/fixtures.ts';

const damage = RULESET_V0_1.damage;

describe('valor efectivo (GAME_RULES §6)', () => {
  it('suma la bonificación de hábitat nativo a la base', () => {
    const value = computeValue(rosterProfile('cheetah'), 'speed', 'land', RULESET_V0_1);
    expect(value).toEqual({
      base: 100,
      affinity: 'native',
      habitatModifier: 10,
      abilityModifier: 0,
      statusModifier: 0,
      roleModifier: 0,
      effective: 110,
    });
  });

  it('aplica la afinidad adaptada y la hostil', () => {
    expect(computeValue(rosterProfile('tiger'), 'attack', 'water', RULESET_V0_1).effective).toBe(
      98,
    );
    expect(
      computeValue(rosterProfile('great-white-shark'), 'attack', 'land', RULESET_V0_1).effective,
    ).toBe(81);
  });

  it('nunca devuelve un valor negativo', () => {
    const weak = {
      ...rosterProfile('golden-eagle'),
      affinities: { ...rosterProfile('golden-eagle').affinities, water: 'hostile' as const },
    };
    expect(computeValue(weak, 'weight', 'water', RULESET_V0_1).effective).toBe(0);
  });
});

describe('comparación', () => {
  it('distingue victoria del atacante, del defensor y empate', () => {
    expect(compareValues(110, 90)).toEqual({ outcome: 'attacker', margin: 20 });
    expect(compareValues(98, 100)).toEqual({ outcome: 'defender', margin: 2 });
    expect(compareValues(110, 110)).toEqual({ outcome: 'tie', margin: 0 });
  });
});

describe('daño (GAME_RULES §7, tabla de BALANCE §5.1)', () => {
  it.each([
    [5, 23, 12],
    [10, 25, 13],
    [20, 30, 15],
    [30, 35, 18],
    [40, 40, 20],
    [50, 45, 23],
    [110, 45, 23],
  ])('margen %i → daño %i y contraataque %i', (margin, expected, counter) => {
    const amount = computeDamage(margin, damage);
    expect(amount).toBe(expected);
    expect(computeCounterDamage(amount, damage)).toBe(counter);
  });

  it('respeta el mínimo con márgenes pequeños', () => {
    expect(computeDamage(1, damage)).toBe(21);
    expect(computeDamage(1, { ...damage, base: 5 })).toBe(damage.min);
  });
});
