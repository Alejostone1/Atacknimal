/**
 * Candidatas de las decisiones #025 (dominio del atacante) y #026 (Águila en Aire).
 * Criterio acordado: la combinación más simple que deje al atacante entre el 55 % y el 62 %.
 */
import { combineVariants, type Variant } from '../variants.ts';

const RULES: readonly Variant[] = [
  { name: '' },
  { name: 'A+5', ruleset: { defenderBonus: 5 } },
  { name: 'A+10', ruleset: { defenderBonus: 10 } },
  { name: 'A+15', ruleset: { defenderBonus: 15 } },
  { name: 'B1', ruleset: { teamAttributeLock: 1 } },
  { name: 'B2', ruleset: { teamAttributeLock: 2 } },
  { name: 'B3', ruleset: { teamAttributeLock: 3 } },
  { name: 'C1', ruleset: { habitatCooldown: 1 } },
  { name: 'B2+C1', ruleset: { teamAttributeLock: 2, habitatCooldown: 1 } },
  { name: 'B3+C1', ruleset: { teamAttributeLock: 3, habitatCooldown: 1 } },
  { name: 'B2+C1+A5', ruleset: { teamAttributeLock: 2, habitatCooldown: 1, defenderBonus: 5 } },
  { name: 'B2+C1+A10', ruleset: { teamAttributeLock: 2, habitatCooldown: 1, defenderBonus: 10 } },
  { name: 'B3+C1+A5', ruleset: { teamAttributeLock: 3, habitatCooldown: 1, defenderBonus: 5 } },
];

const CONTENT: readonly Variant[] = [
  { name: '' },
  {
    name: 'aire neutral',
    affinityPatches: [{ habitat: 'air', from: 'hostile', to: 'neutral' }],
  },
];

export const EXPERIMENT = {
  title: 'Decisiones #025 y #026',
  baseVersion: '0.1.0',
  sample: 20_000,
  seed: 1,
  variants: combineVariants(RULES, CONTENT),
};
