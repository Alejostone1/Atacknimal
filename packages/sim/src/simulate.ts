import type { BalanceSet } from '@atacknimal/content';
import { createRng, nextInt, type AnimalId } from '@atacknimal/engine';
import type { Policy } from './policies.ts';
import { playMatch } from './runner.ts';
import { BalanceStats } from './stats.ts';

export interface SimulationOptions {
  readonly balance: BalanceSet;
  readonly policy: Policy;
  readonly seed: number;
  /** Número de emparejamientos al azar; sin valor, el *round-robin* completo. */
  readonly sample?: number;
  readonly onProgress?: (done: number, total: number) => void;
}

/** Todos los equipos posibles de `size` animales distintos, en orden estable. */
export function allTeams(animalIds: readonly AnimalId[], size: number): AnimalId[][] {
  if (size === 0) return [[]];
  return animalIds.flatMap((first, index) =>
    allTeams(animalIds.slice(index + 1), size - 1).map((rest) => [first, ...rest]),
  );
}

/**
 * *Round-robin* de todos los equipos contra todos (docs/BALANCE.md §7.1):
 * 330 × 330 = 108 900 partidas con el roster de 11 animales.
 */
export function simulate({
  balance,
  policy,
  seed,
  sample,
  onProgress,
}: SimulationOptions): BalanceStats {
  const teams = allTeams(
    balance.roster.map((profile) => profile.id),
    balance.ruleset.teamSize,
  );
  const pairs = pairIndexes(teams.length, seed, sample);
  const stats = new BalanceStats();
  const policies = { A: policy, B: policy };

  pairs.forEach(([a, b], index) => {
    const teamA = teams[a];
    const teamB = teams[b];
    if (teamA === undefined || teamB === undefined) throw new Error('Equipo fuera de rango');
    const record = playMatch({
      balance,
      teams: { A: teamA, B: teamB },
      policies,
      seed: (Math.imul(seed, 2654435761) + index) >>> 0,
      onDuel: (duel) => {
        stats.recordDuel(duel);
      },
    });
    stats.recordMatch(record);
    onProgress?.(index + 1, pairs.length);
  });
  return stats;
}

function pairIndexes(teamCount: number, seed: number, sample?: number): [number, number][] {
  if (sample === undefined) {
    return Array.from({ length: teamCount * teamCount }, (_, i): [number, number] => [
      Math.floor(i / teamCount),
      i % teamCount,
    ]);
  }
  let rng = createRng(seed);
  return Array.from({ length: sample }, (): [number, number] => {
    const [a, afterA] = nextInt(rng, teamCount);
    const [b, afterB] = nextInt(afterA, teamCount);
    rng = afterB;
    return [a, b];
  });
}
