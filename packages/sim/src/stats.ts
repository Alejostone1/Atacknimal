import type { AnimalId, Attribute, Habitat, MatchEndReason, TeamId } from '@atacknimal/engine';
import type { DuelRecord, MatchRecord } from './runner.ts';

export interface Tally {
  matches: number;
  wins: number;
  draws: number;
}

export interface UseTally {
  uses: number;
  wins: number;
}

/** Acumulador de una simulación. Solo cuenta: las métricas se calculan en `report.ts`. */
export class BalanceStats {
  matches = 0;
  draws = 0;
  firstTeamWins = 0;
  totalDuels = 0;
  readonly reasons: Record<MatchEndReason, number> = {
    elimination: 0,
    'duel-limit': 0,
    concede: 0,
  };
  readonly animals = new Map<AnimalId, Tally>();
  readonly teams = new Map<string, Tally>();

  duels = 0;
  attackerWins = 0;
  ties = 0;
  forcedDefenses = 0;
  damageTotal = 0;
  readonly attributes = new Map<Attribute, UseTally>();
  readonly habitats = new Map<Habitat, UseTally>();
  readonly attackers = new Map<AnimalId, UseTally>();
  readonly attackerHabitats = new Map<`${AnimalId}/${Habitat}`, UseTally>();
  /** Valor efectivo del atacante − el del defensor → número de duelos. */
  readonly signedMargins = new Map<number, number>();

  recordDuel({ resolution, attackerAnimal }: DuelRecord): void {
    const won = resolution.outcome === 'attacker' ? 1 : 0;
    const signed = resolution.attacker.effective - resolution.defender.effective;
    this.signedMargins.set(signed, (this.signedMargins.get(signed) ?? 0) + 1);
    this.duels++;
    this.attackerWins += won;
    if (resolution.outcome === 'tie') this.ties++;
    if (resolution.forcedDefense) this.forcedDefenses++;
    this.damageTotal += resolution.damage?.amount ?? 0;
    addUse(this.attributes, resolution.attribute, won);
    addUse(this.habitats, resolution.habitat, won);
    addUse(this.attackers, attackerAnimal, won);
    addUse(this.attackerHabitats, `${attackerAnimal}/${resolution.habitat}`, won);
  }

  recordMatch({ teams, firstTeam, result, duels }: MatchRecord): void {
    this.matches++;
    this.totalDuels += duels;
    this.reasons[result.reason]++;
    if (result.winner === null) this.draws++;
    if (result.winner === firstTeam) this.firstTeamWins++;

    for (const team of ['A', 'B'] as const satisfies readonly TeamId[]) {
      const win = result.winner === team ? 1 : 0;
      const draw = result.winner === null ? 1 : 0;
      addTally(this.teams, teamKey(teams[team]), win, draw);
      for (const animal of teams[team]) addTally(this.animals, animal, win, draw);
    }
  }
}

export function teamKey(animals: readonly AnimalId[]): string {
  return [...animals].sort().join('+');
}

/** Victorias + medio punto por empate. */
export function winRate(tally: Tally): number {
  return tally.matches === 0 ? 0 : (tally.wins + tally.draws / 2) / tally.matches;
}

function addTally<K>(map: Map<K, Tally>, key: K, win: number, draw: number): void {
  const tally = map.get(key) ?? { matches: 0, wins: 0, draws: 0 };
  tally.matches++;
  tally.wins += win;
  tally.draws += draw;
  map.set(key, tally);
}

function addUse<K>(map: Map<K, UseTally>, key: K, win: number): void {
  const tally = map.get(key) ?? { uses: 0, wins: 0 };
  tally.uses++;
  tally.wins += win;
  map.set(key, tally);
}
