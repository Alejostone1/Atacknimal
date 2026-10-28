export { greedyPolicy, isPolicyName, POLICIES, randomPolicy } from './policies.ts';
export type { Policy, PolicyName } from './policies.ts';
export { playMatch } from './runner.ts';
export type { DuelRecord, MatchOptions, MatchRecord } from './runner.ts';
export { allTeams, simulate } from './simulate.ts';
export type { SimulationOptions } from './simulate.ts';
export { BalanceStats, teamKey, winRate } from './stats.ts';
export {
  animalMetrics,
  evaluate,
  marginSplit,
  renderAnimalsCsv,
  renderMarkdown,
} from './report.ts';
export type { AnimalMetrics, ReportMeta, Status } from './report.ts';
