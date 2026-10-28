import type { AnimalProfile } from './roster.ts';
import { createRng } from './rng.ts';
import type { Ruleset } from './ruleset.ts';
import type { MatchMode, MatchState, PlayerId, Seat, TeamId } from './state.ts';
import { playersPerTeam } from './queries.ts';

export interface PlayerConfig {
  readonly id: PlayerId;
  readonly team: TeamId;
  readonly seat: Seat;
}

export interface MatchConfig {
  readonly id: string;
  readonly mode: MatchMode;
  readonly ruleset: Ruleset;
  readonly roster: readonly AnimalProfile[];
  readonly players: readonly PlayerConfig[];
  readonly seed: number;
}

/** Configuración imposible de jugar: es un error de quien crea la partida, no del jugador. */
export class MatchConfigError extends Error {
  override name = 'MatchConfigError';
}

export function createMatch(config: MatchConfig): MatchState {
  validateConfig(config);
  return {
    id: config.id,
    mode: config.mode,
    ruleset: config.ruleset,
    roster: Object.fromEntries(config.roster.map((profile) => [profile.id, profile])),
    players: config.players.map((player) => ({ ...player, cardIds: null })),
    cards: {},
    phase: 'setup',
    duelNumber: 0,
    turnOrder: [],
    slotIndex: 0,
    turn: null,
    declaration: null,
    lastResolution: null,
    result: null,
    rng: createRng(config.seed),
  };
}

function validateConfig({ mode, ruleset, roster, players }: MatchConfig): void {
  const perTeam = playersPerTeam(mode);
  const check = (condition: boolean, message: string): void => {
    if (!condition) throw new MatchConfigError(message);
  };

  check(new Set(players.map((p) => p.id)).size === players.length, 'Ids de jugador repetidos.');
  for (const team of ['A', 'B'] as const) {
    const seats = players.filter((p) => p.team === team).map((p) => p.seat);
    check(seats.length === perTeam, `El equipo ${team} necesita ${String(perTeam)} jugador(es).`);
    check(new Set(seats).size === seats.length, `Asientos repetidos en el equipo ${team}.`);
  }
  check(players.length === perTeam * 2, 'Número de jugadores incorrecto para el modo.');

  check(
    Number.isInteger(ruleset.teamSize / perTeam),
    'teamSize debe repartirse entre los jugadores.',
  );
  check(
    ruleset.lockDuration >= 0 && Number.isInteger(ruleset.lockDuration),
    'lockDuration inválido.',
  );
  check(ruleset.maxDuels >= 1, 'maxDuels debe ser al menos 1.');
  check(
    !ruleset.abilitiesEnabled,
    'Las habilidades aún no están implementadas (docs/GAME_RULES.md §15).',
  );

  check(
    new Set(roster.map((p) => p.id)).size === roster.length,
    'Animales repetidos en el roster.',
  );
  check(roster.length >= ruleset.teamSize, 'El roster no alcanza para formar un equipo.');
}
