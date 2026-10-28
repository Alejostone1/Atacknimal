import type { BalanceSet } from '@atacknimal/content';
import {
  applyAction,
  createMatch,
  createRng,
  getPlayerView,
  type AnimalId,
  type CombatResolution,
  type MatchResult,
  type MatchState,
  type RngState,
  type TeamId,
} from '@atacknimal/engine';
import type { Policy } from './policies.ts';

export interface DuelRecord {
  readonly resolution: CombatResolution;
  readonly attackerAnimal: AnimalId;
  readonly defenderAnimal: AnimalId;
}

export interface MatchRecord {
  readonly teams: Readonly<Record<TeamId, readonly AnimalId[]>>;
  readonly firstTeam: TeamId;
  readonly result: MatchResult;
  readonly duels: number;
}

export interface MatchOptions {
  readonly balance: BalanceSet;
  readonly teams: Readonly<Record<TeamId, readonly AnimalId[]>>;
  readonly policies: Readonly<Record<TeamId, Policy>>;
  readonly seed: number;
  readonly onDuel?: (duel: DuelRecord) => void;
}

const PLAYER_OF_TEAM: Readonly<Record<TeamId, string>> = { A: 'p1', B: 'p2' };

/** Juega una partida 1v1 completa entre dos bots. */
export function playMatch({ balance, teams, policies, seed, onDuel }: MatchOptions): MatchRecord {
  let state: MatchState = createMatch({
    id: `sim-${String(seed)}`,
    mode: '1v1',
    ruleset: balance.ruleset,
    roster: balance.roster,
    players: [
      { id: PLAYER_OF_TEAM.A, team: 'A', seat: 1 },
      { id: PLAYER_OF_TEAM.B, team: 'B', seat: 1 },
    ],
    seed,
  });
  for (const team of ['A', 'B'] as const) {
    state = mustApply(state, {
      type: 'selectTeam',
      playerId: PLAYER_OF_TEAM[team],
      animalIds: teams[team],
    });
  }
  const firstTeam = teamOf(state, state.turn?.attackerId);

  let rng: RngState = createRng(seed ^ 0x5bd1e995);
  while (state.result === null) {
    const actorId = state.phase === 'declare' ? state.turn?.attackerId : state.turn?.defenderId;
    if (actorId === undefined) throw new Error('Partida sin actor');
    const [action, nextRng] = policies[teamOf(state, actorId)](getPlayerView(state, actorId), rng);
    rng = nextRng;
    state = mustApply(state, action, onDuel);
  }

  return { teams, firstTeam, result: state.result, duels: state.lastResolution?.duelNumber ?? 0 };
}

function mustApply(
  state: MatchState,
  action: Parameters<typeof applyAction>[1],
  onDuel?: (duel: DuelRecord) => void,
): MatchState {
  const result = applyAction(state, action);
  if (!result.ok) throw new Error(`Acción ilegal del bot: ${result.error.code}`);
  if (onDuel !== undefined) {
    for (const event of result.value.events) {
      if (event.type !== 'combatResolved') continue;
      const { resolution } = event;
      onDuel({
        resolution,
        attackerAnimal: animalOf(state, resolution.attacker.cardId),
        defenderAnimal: animalOf(state, resolution.defender.cardId),
      });
    }
  }
  return result.value.state;
}

function teamOf(state: MatchState, playerId: string | undefined): TeamId {
  const team = state.players.find((p) => p.id === playerId)?.team;
  if (team === undefined) throw new Error(`Jugador sin equipo: ${String(playerId)}`);
  return team;
}

function animalOf(state: MatchState, cardId: string): AnimalId {
  const found = state.cards[cardId];
  if (found === undefined) throw new Error(`Carta inexistente: ${cardId}`);
  return found.animalId;
}
