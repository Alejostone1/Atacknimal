import { getBalanceSet } from '@atacknimal/content';
import { describe, expect, it } from 'vitest';
import { applyVariant, combineVariants } from './variants.ts';

const base = getBalanceSet('0.1.0');

describe('variantes experimentales', () => {
  it('sobrescribe parámetros del ruleset sin tocar el resto', () => {
    const variant = applyVariant(base, { name: 'A+5', ruleset: { defenderBonus: 5 } });
    expect(variant.ruleset).toEqual({ ...base.ruleset, defenderBonus: 5 });
    expect(variant.version).toBe('0.1.0+A+5');
    expect(base.ruleset.defenderBonus).toBe(0);
  });

  it('cambia solo las afinidades indicadas', () => {
    const variant = applyVariant(base, {
      name: 'aire neutral',
      affinityPatches: [{ habitat: 'air', from: 'hostile', to: 'neutral' }],
    });
    const affinity = (id: string) => variant.roster.find((p) => p.id === id)?.affinities;
    expect(affinity('cheetah')).toMatchObject({ air: 'neutral', water: 'hostile' });
    expect(affinity('golden-eagle')).toMatchObject({ air: 'native' });
  });

  it('combina ejes de variantes en un producto cartesiano', () => {
    const combined = combineVariants(
      [{ name: '' }, { name: 'B1', ruleset: { teamAttributeLock: 1 } }],
      [
        { name: '' },
        { name: 'aire', affinityPatches: [{ habitat: 'air', from: 'hostile', to: 'neutral' }] },
      ],
    );
    expect(combined.map((v) => v.name)).toEqual(['base', 'B1', 'aire', 'B1 · aire']);
    expect(combined[3]).toMatchObject({
      ruleset: { teamAttributeLock: 1 },
      affinityPatches: [{ habitat: 'air' }],
    });
  });
});
