/**
 * Decisión #044: balance 0.4.0 con especialistas marcados. Con picos de 95–100 y hábitat ±15
 * el atacante gana casi siempre y el primer jugador sube al 62 %. Se busca la ventaja defensiva
 * y el peso del hábitat que devuelven la partida al objetivo de #029.
 */
import type { Experiment } from '../experiment.ts';
import { combineVariants, type Variant } from '../variants.ts';
import { MATCH_BALANCE } from './criteria.ts';

const DEFENSE: readonly Variant[] = [6, 12, 18, 24].map((bonus) => ({
  name: `A${String(bonus)}`,
  ruleset: { defenderBonus: bonus },
}));

const HABITAT: readonly Variant[] = [
  { name: 'hábitat ±15' },
  {
    name: 'hábitat ±10',
    ruleset: { habitatModifiers: { native: 10, adapted: 4, neutral: 0, hostile: -10 } },
  },
];

export const EXPERIMENT: Experiment = {
  title: 'Decisión #044: ventaja defensiva y peso del hábitat en 0.4.0',
  baseVersion: '0.4.0',
  sample: 12_000,
  seed: 1,
  criterion: MATCH_BALANCE,
  variants: combineVariants(DEFENSE, HABITAT),
};
