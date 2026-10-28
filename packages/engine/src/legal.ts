import type { Action } from './actions.ts';
import { ATTRIBUTES, HABITATS, type Attribute } from './domain.ts';
import { isHabitatBlocked, isTeamAttributeBlocked } from './cooldowns.ts';
import { isLocked } from './locks.ts';
import { activeCardsOfPlayer, type CardsSnapshot } from './queries.ts';
import type { CardId, Phase, PlayerId, TeamCooldowns, TeamId, Turn } from './state.ts';

/**
 * Lo necesario para calcular acciones legales. Lo cumplen `MatchState` y `PlayerView`:
 * la IA y la simulación deciden con la vista, sin acceder al estado completo.
 */
export interface LegalSnapshot extends CardsSnapshot {
  readonly players: readonly {
    readonly id: PlayerId;
    readonly team: TeamId;
    readonly cardIds: readonly CardId[] | null;
  }[];
  readonly phase: Phase;
  readonly turn: Turn | null;
  readonly declaration: { readonly attribute: Attribute } | null;
  readonly teamCooldowns: Readonly<Record<TeamId, TeamCooldowns>>;
}

export interface DefenseOptions {
  readonly cardIds: readonly CardId[];
  /** `true` si ninguna carta activa puede usar el atributo (docs/GAME_RULES.md §5.3). */
  readonly forced: boolean;
}

export function getDefenseOptions(
  snapshot: CardsSnapshot,
  playerId: PlayerId,
  attribute: Attribute,
): DefenseOptions {
  const active = activeCardsOfPlayer(snapshot, playerId);
  const free = active.filter((card) => !isLocked(card, attribute));
  return free.length > 0
    ? { cardIds: free.map((card) => card.id), forced: false }
    : { cardIds: active.map((card) => card.id), forced: true };
}

/**
 * Acciones de juego legales ahora para un jugador (las usan la IA, la simulación y la interfaz).
 * No enumera equipos posibles ni la rendición.
 */
export function getLegalActions(snapshot: LegalSnapshot, playerId: PlayerId): Action[] {
  const { turn } = snapshot;
  if (turn === null) return [];

  if (snapshot.phase === 'declare' && turn.attackerId === playerId) {
    const team = snapshot.players.find((p) => p.id === playerId)?.team;
    if (team === undefined) return [];
    const cooldowns = snapshot.teamCooldowns[team];
    const habitats = HABITATS.filter((habitat) => !isHabitatBlocked(cooldowns, habitat));
    return activeCardsOfPlayer(snapshot, playerId).flatMap((card) =>
      habitats.flatMap((habitat) =>
        ATTRIBUTES.filter(
          (attribute) =>
            !isLocked(card, attribute) && !isTeamAttributeBlocked(cooldowns, attribute),
        ).map((attribute): Action => ({
          type: 'declare',
          playerId,
          habitat,
          cardId: card.id,
          attribute,
        })),
      ),
    );
  }

  if (
    snapshot.phase === 'defend' &&
    turn.defenderId === playerId &&
    snapshot.declaration !== null
  ) {
    return getDefenseOptions(snapshot, playerId, snapshot.declaration.attribute).cardIds.map(
      (cardId): Action => ({ type: 'defend', playerId, cardId }),
    );
  }

  return [];
}
