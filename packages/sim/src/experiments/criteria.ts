import { evaluate } from '../report.ts';
import type { Criterion } from '../experiment.ts';

/** Criterio original de #025 (descartado en #029). */
export const ATTACKER_RANGE: Criterion = {
  label: 'atacante entre 55 % y 62 % y primer jugador sin alerta (≤ 54 %) — #025.',
  test: (s, targets) =>
    s.attackerWinRate >= 0.55 &&
    s.attackerWinRate <= 0.62 &&
    evaluate(s.firstPlayerWinRate, targets.firstPlayerWinRate) !== 'alert',
};

/** Objetivo de balance acordado en #029: ninguna métrica que decide partidas en alerta. */
export const MATCH_BALANCE: Criterion = {
  label:
    'ninguna alerta en primer jugador, animales (42–58 %), duración, empates ni partidas que llegan al límite — #029.',
  test: (s, targets) =>
    evaluate(s.firstPlayerWinRate, targets.firstPlayerWinRate) !== 'alert' &&
    evaluate(s.averageDuels, targets.matchDuels) !== 'alert' &&
    evaluate(s.duelLimitRate, targets.duelLimitRate) !== 'alert' &&
    evaluate(s.tieRate, targets.tieRate) !== 'alert' &&
    s.animals.every((a) => evaluate(a.winRate, targets.animalWinRate) !== 'alert'),
};
