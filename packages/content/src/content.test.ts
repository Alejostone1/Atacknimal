import { ATTRIBUTES, createMatch } from '@atacknimal/engine';
import { describe, expect, it } from 'vitest';
import {
  ANIMALS,
  BALANCE_VERSIONS,
  ContentError,
  checkProfileBudget,
  checkRosterCoverage,
  getAnimal,
  getBalanceSet,
} from './index.ts';

describe('animales', () => {
  it('el roster inicial tiene los 11 animales del documento maestro', () => {
    expect(ANIMALS).toHaveLength(11);
    expect(new Set(ANIMALS.map((a) => a.id)).size).toBe(11);
  });

  it('busca por id y falla con ids desconocidos', () => {
    expect(getAnimal('cheetah').scientificName).toBe('Acinonyx jubatus');
    expect(() => getAnimal('lion')).toThrow(ContentError);
  });
});

describe.each(BALANCE_VERSIONS)('balance %s', (version) => {
  const set = getBalanceSet(version);

  it('tiene un perfil por animal con los 8 atributos', () => {
    expect(set.roster.map((p) => p.id).sort()).toEqual(ANIMALS.map((a) => a.id).sort());
    for (const profile of set.roster) {
      expect(Object.keys(profile.stats).sort()).toEqual([...ATTRIBUTES].sort());
    }
  });

  it.each(getBalanceSet(version).roster.map((p) => [p.id, p] as const))(
    '%s cumple el presupuesto de BALANCE §2',
    (_, profile) => {
      expect(checkProfileBudget(profile, set.budget)).toEqual([]);
    },
  );

  it('cada atributo tiene 2–3 especialistas y como mucho un 100', () => {
    expect(checkRosterCoverage(set.roster, set.budget)).toEqual([]);
  });

  it('el motor acepta el ruleset y el roster', () => {
    expect(() =>
      createMatch({
        id: 'content-check',
        mode: '2v2',
        ruleset: set.ruleset,
        roster: set.roster,
        players: [
          { id: 'a1', team: 'A', seat: 1 },
          { id: 'a2', team: 'A', seat: 2 },
          { id: 'b1', team: 'B', seat: 1 },
          { id: 'b2', team: 'B', seat: 2 },
        ],
        seed: 1,
      }),
    ).not.toThrow();
  });
});

describe('validación de presupuesto', () => {
  const set = getBalanceSet();
  const base = set.roster[0];
  if (base === undefined) throw new Error('Roster vacío');

  it('detecta perfiles que lo incumplen', () => {
    const flat = {
      ...base,
      stats: Object.fromEntries(ATTRIBUTES.map((a) => [a, 70])) as typeof base.stats,
    };
    expect(checkProfileBudget(flat, set.budget)).toEqual(['0 picos (≥ 88)', '0 valles (≤ 50)']);
  });

  it('detecta atributos sin cobertura', () => {
    const noSpeed = set.roster.map((p) => ({ ...p, stats: { ...p.stats, speed: 60 } }));
    expect(checkRosterCoverage(noSpeed, set.budget)).toContain('speed: 0 especialistas (≥ 85)');
  });

  it('falla con versiones desconocidas', () => {
    expect(() => getBalanceSet('9.9.9')).toThrow(ContentError);
  });
});
