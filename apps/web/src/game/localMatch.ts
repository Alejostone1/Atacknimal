/**
 * Partida local contra la IA: el motor se ejecuta en el navegador (ARCHITECTURE §2, modo local).
 * Este módulo solo prepara la partida; todas las reglas las aplica @atacknimal/engine.
 */
import {
  applyAction,
  createMatch,
  createRng,
  nextInt,
  type MatchState,
  type RngState,
} from '@atacknimal/engine';
import { BALANCE } from '../content/catalog.ts';

export const HUMAN = 'jugador';
export const RIVAL = 'rival';

/** Equipo del rival: animales distintos al azar (puede coincidir con el tuyo: espejo permitido). */
export function rivalTeam(rng: RngState, size: number): [string[], RngState] {
  const pool = BALANCE.roster.map((profile) => profile.id);
  const team: string[] = [];
  let current = rng;
  while (team.length < size) {
    const [index, next] = nextInt(current, pool.length);
    current = next;
    const [picked] = pool.splice(index, 1);
    if (picked !== undefined) team.push(picked);
  }
  return [team, current];
}

export function createLocalMatch(
  team: readonly string[],
  seed: number,
): { state: MatchState; rng: RngState } {
  const created = createMatch({
    id: `local-${String(seed)}`,
    mode: '1v1',
    ruleset: BALANCE.ruleset,
    roster: BALANCE.roster,
    players: [
      { id: HUMAN, team: 'A', seat: 1 },
      { id: RIVAL, team: 'B', seat: 1 },
    ],
    seed,
  });
  const [rivalAnimals, rng] = rivalTeam(createRng(seed ^ 0x9e3779b9), BALANCE.ruleset.teamSize);

  let state = created;
  for (const [playerId, animalIds] of [
    [HUMAN, team],
    [RIVAL, rivalAnimals],
  ] as const) {
    const result = applyAction(state, { type: 'selectTeam', playerId, animalIds });
    if (!result.ok) throw new Error(`Equipo inválido (${playerId}): ${result.error.message}`);
    state = result.value.state;
  }
  return { state, rng };
}

export function randomSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
}
