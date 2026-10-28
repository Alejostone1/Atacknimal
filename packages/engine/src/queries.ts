import { invariant } from './errors.ts';
import type { AnimalId, AnimalProfile } from './roster.ts';
import type {
  CardId,
  CardState,
  MatchMode,
  MatchState,
  PlayerId,
  PlayerState,
  TeamId,
} from './state.ts';

export function playersPerTeam(mode: MatchMode): number {
  return mode === '1v1' ? 1 : 2;
}

export function cardsPerPlayer(state: MatchState): number {
  return state.ruleset.teamSize / playersPerTeam(state.mode);
}

export function cardIdFor(playerId: PlayerId, animalId: AnimalId): CardId {
  return `${playerId}/${animalId}`;
}

export function findPlayer(state: MatchState, playerId: PlayerId): PlayerState | undefined {
  return state.players.find((player) => player.id === playerId);
}

export function getPlayer(state: MatchState, playerId: PlayerId): PlayerState {
  const player = findPlayer(state, playerId);
  invariant(player, `Jugador inexistente: ${playerId}`);
  return player;
}

export function getCard(state: MatchState, cardId: CardId): CardState {
  const card = state.cards[cardId];
  invariant(card, `Carta inexistente: ${cardId}`);
  return card;
}

export function getProfile(state: MatchState, card: CardState): AnimalProfile {
  const profile = state.roster[card.animalId];
  invariant(profile, `Animal sin perfil: ${card.animalId}`);
  return profile;
}

export function isActive(card: CardState): boolean {
  return card.hp > 0;
}

export function cardsOfPlayer(state: MatchState, playerId: PlayerId): CardState[] {
  return (getPlayer(state, playerId).cardIds ?? []).map((cardId) => getCard(state, cardId));
}

export function activeCardsOfPlayer(state: MatchState, playerId: PlayerId): CardState[] {
  return cardsOfPlayer(state, playerId).filter(isActive);
}

export function activeCardsOfTeam(state: MatchState, team: TeamId): CardState[] {
  return state.players
    .filter((player) => player.team === team)
    .flatMap((player) => activeCardsOfPlayer(state, player.id));
}

export function teammatesOf(state: MatchState, playerId: PlayerId): PlayerState[] {
  const player = getPlayer(state, playerId);
  return state.players.filter((other) => other.team === player.team && other.id !== playerId);
}

export function otherTeam(team: TeamId): TeamId {
  return team === 'A' ? 'B' : 'A';
}
