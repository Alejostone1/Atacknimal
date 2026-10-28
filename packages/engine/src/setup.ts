import type { SelectTeamAction } from './actions.ts';
import { fail, invariant, ok, type Result } from './errors.ts';
import type { DomainEvent, Transition } from './events.ts';
import { cardIdFor, cardsOfPlayer, cardsPerPlayer, getPlayer, teammatesOf } from './queries.ts';
import { nextInt } from './rng.ts';
import type { AnimalId } from './roster.ts';
import type { CardState, MatchState, PlayerId, TeamId } from './state.ts';
import { buildTurnOrder, resolveTurn } from './turns.ts';

/** Confirma el equipo de un jugador (docs/GAME_RULES.md §3). */
export function applySelectTeam(state: MatchState, action: SelectTeamAction): Result<Transition> {
  if (state.phase !== 'setup') return fail('WRONG_PHASE', 'Los equipos ya están confirmados.');
  const player = getPlayer(state, action.playerId);
  if (player.cardIds !== null) {
    return fail('TEAM_ALREADY_CONFIRMED', 'Ya confirmaste tu equipo.');
  }

  const expected = cardsPerPlayer(state);
  if (action.animalIds.length !== expected) {
    return fail('INVALID_TEAM_SIZE', `Debes elegir ${String(expected)} animales.`);
  }
  const unknown = action.animalIds.find((animalId) => state.roster[animalId] === undefined);
  if (unknown !== undefined) return fail('UNKNOWN_ANIMAL', `Animal desconocido: ${unknown}.`);

  const teammateAnimals = new Set(
    teammatesOf(state, player.id).flatMap((mate) =>
      cardsOfPlayer(state, mate.id).map((card) => card.animalId),
    ),
  );
  const repeated =
    new Set(action.animalIds).size !== action.animalIds.length ||
    action.animalIds.some((animalId) => teammateAnimals.has(animalId));
  if (repeated) {
    return fail('DUPLICATE_ANIMAL', 'Un equipo no puede repetir animales.');
  }

  const newCards = action.animalIds.map((animalId) => createCard(state, player.id, animalId));
  const confirmed: MatchState = {
    ...state,
    players: state.players.map((p) =>
      p.id === player.id ? { ...p, cardIds: newCards.map((card) => card.id) } : p,
    ),
    cards: { ...state.cards, ...Object.fromEntries(newCards.map((card) => [card.id, card])) },
  };
  const events: DomainEvent[] = [
    { type: 'teamConfirmed', playerId: player.id, animalIds: action.animalIds },
  ];

  if (confirmed.players.some((p) => p.cardIds === null)) return ok({ state: confirmed, events });

  const started = startMatch(confirmed);
  return ok({ state: started.state, events: [...events, ...started.events] });
}

function createCard(state: MatchState, ownerId: PlayerId, animalId: AnimalId): CardState {
  const profile = state.roster[animalId];
  invariant(profile, `Animal sin perfil: ${animalId}`);
  const maxHp = profile.baseHp ?? state.ruleset.baseHp;
  return {
    id: cardIdFor(ownerId, animalId),
    animalId,
    ownerId,
    hp: maxHp,
    maxHp,
    locks: [],
    revealed: false,
  };
}

/** Sorteo del primer equipo atacante y primer turno (docs/GAME_RULES.md §3.3). */
function startMatch(state: MatchState): Transition {
  const [draw, rng] = nextInt(state.rng, 2);
  const firstTeam: TeamId = draw === 0 ? 'A' : 'B';
  const turnOrder = buildTurnOrder(state.players, firstTeam);
  const withOrder: MatchState = { ...state, rng, turnOrder };
  const turn = resolveTurn(withOrder, 0);
  invariant(turn, 'No hay ningún turno jugable al empezar la partida.');

  const teams = Object.fromEntries(
    state.players.map((p) => [p.id, cardsOfPlayer(state, p.id).map((card) => card.animalId)]),
  );
  return {
    state: {
      ...withOrder,
      phase: 'declare',
      duelNumber: 1,
      slotIndex: turn.slotIndex,
      turn: { attackerId: turn.attackerId, defenderId: turn.defenderId },
    },
    events: [
      { type: 'matchStarted', firstTeam, turnOrder, teams },
      {
        type: 'turnStarted',
        duelNumber: 1,
        attackerId: turn.attackerId,
        defenderId: turn.defenderId,
      },
    ],
  };
}
