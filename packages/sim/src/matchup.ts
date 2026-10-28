import type { BalanceSet } from '@atacknimal/content';
import { createRng, nextInt } from '@atacknimal/engine';
import type { Policy } from './policies.ts';
import { playMatch } from './runner.ts';
import { allTeams } from './simulate.ts';

export interface MatchupResult {
  readonly matches: number;
  readonly aWins: number;
  readonly bWins: number;
  readonly draws: number;
  /** Victorias de A + medio punto por empate. */
  readonly aWinRate: number;
}

/**
 * Enfrenta dos políticas con equipos al azar. En cada emparejamiento se alternan los lados
 * (equipo A / B) para que el sorteo del primer turno no favorezca a ninguna.
 */
export function matchup(options: {
  balance: BalanceSet;
  a: Policy;
  b: Policy;
  seed: number;
  sample: number;
}): MatchupResult {
  const { balance, a, b, seed, sample } = options;
  const teams = allTeams(
    balance.roster.map((p) => p.id),
    balance.ruleset.teamSize,
  );
  let rng = createRng(seed);
  let aWins = 0;
  let bWins = 0;
  let draws = 0;
  for (let i = 0; i < sample; i++) {
    const [x, afterX] = nextInt(rng, teams.length);
    const [y, afterY] = nextInt(afterX, teams.length);
    rng = afterY;
    const teamX = teams[x];
    const teamY = teams[y];
    if (teamX === undefined || teamY === undefined) throw new Error('Equipo fuera de rango');
    const aIsA = i % 2 === 0;
    const record = playMatch({
      balance,
      teams: { A: teamX, B: teamY },
      policies: aIsA ? { A: a, B: b } : { A: b, B: a },
      seed: (Math.imul(seed, 2654435761) + i) >>> 0,
    });
    const winner = record.result.winner;
    if (winner === null) draws++;
    else if ((winner === 'A') === aIsA) aWins++;
    else bWins++;
  }
  return { matches: sample, aWins, bWins, draws, aWinRate: (aWins + draws / 2) / sample };
}
