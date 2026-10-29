import { ATTRIBUTES, createMatch } from '@atacknimal/engine';
import { describe, expect, it } from 'vitest';
import {
  ANIMALS,
  BALANCE_VERSIONS,
  ContentError,
  IMAGES,
  LATEST_BALANCE_VERSION,
  LICENSE_IDS,
  checkProfileBudget,
  checkRosterCoverage,
  getAnimal,
  getBalanceSet,
  getFacts,
  getImage,
} from './index.ts';

describe('animales', () => {
  it('hay 20 animales: los 11 del documento maestro y los 9 de la Fase 10b', () => {
    expect(ANIMALS).toHaveLength(20);
    expect(new Set(ANIMALS.map((a) => a.id)).size).toBe(20);
  });

  it('busca por id y falla con ids desconocidos', () => {
    expect(getAnimal('cheetah').scientificName).toBe('Acinonyx jubatus');
    expect(() => getAnimal('unicorn')).toThrow(ContentError);
  });
});

describe.each(BALANCE_VERSIONS)('balance %s', (version) => {
  const set = getBalanceSet(version);

  it('perfila animales conocidos con los 8 atributos (la vigente, todos)', () => {
    const ids = set.roster.map((p) => p.id);
    expect(ids.every((id) => ANIMALS.some((a) => a.id === id))).toBe(true);
    if (version === LATEST_BALANCE_VERSION) {
      expect([...ids].sort()).toEqual(ANIMALS.map((a) => a.id).sort());
    }
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

  it('cada atributo tiene los especialistas del presupuesto y como mucho un 100', () => {
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

describe('fotografías (docs/ASSETS.md)', () => {
  it.each(ANIMALS.map((a) => [a.id] as const))(
    '%s tiene una foto activa con licencia permitida',
    (id) => {
      const image = getImage(id);
      expect(image).toBeDefined();
      expect(LICENSE_IDS).toContain(image?.licenseId);
      expect(image?.attribution).toContain(image?.author ?? '∅');
    },
  );

  it('las fotos usan URLs del proveedor (hotlink) y no archivos locales', () => {
    for (const image of IMAGES) {
      expect(image.imageUrl).toMatch(/^https:\/\//);
      expect(image.sourceUrl).toMatch(/^https:\/\//);
    }
  });
});

describe('datos reales', () => {
  it.each(ANIMALS.map((a) => [a.id] as const))('%s tiene ficha de Wikidata con fuente', (id) => {
    const facts = getFacts(id);
    expect(facts?.wikidataUrl).toMatch(/^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/);
    expect(facts?.conservationStatus?.source).toBe(facts?.wikidataUrl);
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
