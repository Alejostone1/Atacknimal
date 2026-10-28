/**
 * Decisión #028 A: equipos ocultos hasta que se revelan, solos o con ajustes de #025 y #026.
 * Criterio acordado: atacante entre el 55 % y el 62 % y primer jugador sin alerta.
 */
import type { Experiment } from '../experiment.ts';
import { combineVariants, type Variant } from '../variants.ts';
import { ATTACKER_RANGE } from './criteria.ts';

const RULES: readonly Variant[] = [
  { name: 'públicos' },
  { name: 'ocultos', ruleset: { hiddenTeams: true } },
  { name: 'ocultos+A5', ruleset: { hiddenTeams: true, defenderBonus: 5 } },
  { name: 'ocultos+A10', ruleset: { hiddenTeams: true, defenderBonus: 10 } },
  { name: 'ocultos+C1', ruleset: { hiddenTeams: true, habitatCooldown: 1 } },
  {
    name: 'ocultos+B2+C1+A5',
    ruleset: { hiddenTeams: true, teamAttributeLock: 2, habitatCooldown: 1, defenderBonus: 5 },
  },
];

const CONTENT: readonly Variant[] = [
  { name: '' },
  {
    name: 'aire neutral',
    affinityPatches: [{ habitat: 'air', from: 'hostile', to: 'neutral' }],
  },
];

export const EXPERIMENT: Experiment = {
  title: 'Decisión #028: equipos ocultos',
  baseVersion: '0.1.0',
  sample: 20_000,
  seed: 1,
  criterion: ATTACKER_RANGE,
  variants: combineVariants(RULES, CONTENT),
};
