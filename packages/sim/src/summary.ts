import type { BalanceSet } from '@atacknimal/content';
import { animalMetrics, type AnimalMetrics } from './report.ts';
import type { BalanceStats } from './stats.ts';

/** Métricas principales de una simulación, en un objeto plano (se puede enviar entre hilos). */
export interface SimulationSummary {
  readonly matches: number;
  readonly attackerWinRate: number;
  readonly firstPlayerWinRate: number;
  readonly averageDuels: number;
  readonly duelLimitRate: number;
  readonly tieRate: number;
  readonly forcedDefensesPerMatch: number;
  readonly animals: readonly AnimalMetrics[];
}

export function summarize(stats: BalanceStats, balance: BalanceSet): SimulationSummary {
  const per = (part: number, whole: number): number => (whole === 0 ? 0 : part / whole);
  return {
    matches: stats.matches,
    attackerWinRate: per(stats.attackerWins, stats.duels),
    firstPlayerWinRate: per(stats.firstTeamWins + stats.draws / 2, stats.matches),
    averageDuels: per(stats.totalDuels, stats.matches),
    duelLimitRate: per(stats.reasons['duel-limit'], stats.matches),
    tieRate: per(stats.ties, stats.duels),
    forcedDefensesPerMatch: per(stats.forcedDefenses, stats.matches),
    animals: animalMetrics(stats, balance),
  };
}
