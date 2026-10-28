import type { Action } from './actions.ts';
import { ATTRIBUTES, HABITATS, type Attribute } from './domain.ts';
import { isLocked } from './locks.ts';
import { activeCardsOfPlayer } from './queries.ts';
import type { CardId, MatchState, PlayerId } from './state.ts';

export interface DefenseOptions {
  readonly cardIds: readonly CardId[];
  /** `true` si ninguna carta activa puede usar el atributo (docs/GAME_RULES.md §5.3). */
  readonly forced: boolean;
}

export function getDefenseOptions(
  state: MatchState,
  playerId: PlayerId,
  attribute: Attribute,
): DefenseOptions {
  const active = activeCardsOfPlayer(state, playerId);
  const free = active.filter((card) => !isLocked(card, attribute));
  return free.length > 0
    ? { cardIds: free.map((card) => card.id), forced: false }
    : { cardIds: active.map((card) => card.id), forced: true };
}

/**
 * Acciones de juego legales ahora para un jugador (las usan la IA, la simulación y la interfaz).
 * No enumera equipos posibles ni la rendición.
 */
export function getLegalActions(state: MatchState, playerId: PlayerId): Action[] {
  const { turn } = state;
  if (turn === null) return [];

  if (state.phase === 'declare' && turn.attackerId === playerId) {
    return activeCardsOfPlayer(state, playerId).flatMap((card) =>
      HABITATS.flatMap((habitat) =>
        ATTRIBUTES.filter((attribute) => !isLocked(card, attribute)).map((attribute): Action => ({
          type: 'declare',
          playerId,
          habitat,
          cardId: card.id,
          attribute,
        })),
      ),
    );
  }

  if (state.phase === 'defend' && turn.defenderId === playerId && state.declaration !== null) {
    return getDefenseOptions(state, playerId, state.declaration.attribute).cardIds.map(
      (cardId): Action => ({ type: 'defend', playerId, cardId }),
    );
  }

  return [];
}
