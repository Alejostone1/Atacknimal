import type { Attribute, Habitat } from './domain.ts';
import type {
  AttackDeclaredEvent,
  CombatResolution,
  DomainEvent,
  TeamConfirmedEvent,
} from './events.ts';
import { getPlayer } from './queries.ts';
import type { AnimalId, AnimalProfile } from './roster.ts';
import type { Ruleset } from './ruleset.ts';
import type {
  CardId,
  CardState,
  MatchMode,
  MatchResult,
  MatchState,
  Phase,
  PlayerId,
  Seat,
  TeamId,
  Turn,
  TurnSlot,
} from './state.ts';

export interface PlayerSummary {
  readonly id: PlayerId;
  readonly team: TeamId;
  readonly seat: Seat;
  readonly confirmed: boolean;
  /** `null` si aún no confirmó o si su equipo todavía es secreto para quien mira. */
  readonly cardIds: readonly CardId[] | null;
}

export interface DeclarationView {
  readonly habitat: Habitat;
  readonly attribute: Attribute;
  /** Solo el equipo atacante ve la carta antes de la resolución. */
  readonly cardId: CardId | null;
}

/** Lo que un jugador puede saber de la partida (docs/GAME_RULES.md §11). */
export interface PlayerView {
  readonly viewerId: PlayerId;
  readonly matchId: string;
  readonly mode: MatchMode;
  readonly phase: Phase;
  readonly duelNumber: number;
  readonly ruleset: Ruleset;
  readonly roster: Readonly<Record<AnimalId, AnimalProfile>>;
  readonly players: readonly PlayerSummary[];
  readonly cards: Readonly<Record<CardId, CardState>>;
  readonly turnOrder: readonly TurnSlot[];
  readonly turn: Turn | null;
  readonly declaration: DeclarationView | null;
  readonly lastResolution: CombatResolution | null;
  readonly result: MatchResult | null;
}

/**
 * Vista redactada para un jugador. Es lo único que el servidor envía a los clientes
 * y lo único que recibe la IA: así la información oculta no puede filtrarse.
 */
export function getPlayerView(state: MatchState, viewerId: PlayerId): PlayerView {
  const viewerTeam = getPlayer(state, viewerId).team;
  const teamVisible = (team: TeamId): boolean => team === viewerTeam || state.phase !== 'setup';
  const visibleOwners = new Set(state.players.filter((p) => teamVisible(p.team)).map((p) => p.id));
  const { declaration, turn } = state;

  return {
    viewerId,
    matchId: state.id,
    mode: state.mode,
    phase: state.phase,
    duelNumber: state.duelNumber,
    ruleset: state.ruleset,
    roster: state.roster,
    players: state.players.map((p) => ({
      id: p.id,
      team: p.team,
      seat: p.seat,
      confirmed: p.cardIds !== null,
      cardIds: teamVisible(p.team) ? p.cardIds : null,
    })),
    cards: Object.fromEntries(
      Object.entries(state.cards).filter(([, card]) => visibleOwners.has(card.ownerId)),
    ),
    turnOrder: state.turnOrder,
    turn,
    declaration:
      declaration === null || turn === null
        ? null
        : {
            habitat: declaration.habitat,
            attribute: declaration.attribute,
            cardId:
              getPlayer(state, turn.attackerId).team === viewerTeam ? declaration.cardId : null,
          },
    lastResolution: state.lastResolution,
    result: state.result,
  };
}

export type PlayerEvent =
  | Exclude<DomainEvent, TeamConfirmedEvent | AttackDeclaredEvent>
  | (Omit<TeamConfirmedEvent, 'animalIds'> & { readonly animalIds: readonly AnimalId[] | null })
  | (Omit<AttackDeclaredEvent, 'cardId'> & { readonly cardId: CardId | null });

/** Versión de un evento que puede enviarse a un jugador concreto. */
export function redactEvent(
  event: DomainEvent,
  state: MatchState,
  viewerId: PlayerId,
): PlayerEvent {
  const viewerTeam = getPlayer(state, viewerId).team;
  const sameTeam = (playerId: PlayerId): boolean => getPlayer(state, playerId).team === viewerTeam;

  switch (event.type) {
    case 'teamConfirmed':
      return sameTeam(event.playerId) ? event : { ...event, animalIds: null };
    case 'attackDeclared':
      return sameTeam(event.attackerId) ? event : { ...event, cardId: null };
    case 'matchStarted':
    case 'turnStarted':
    case 'combatResolved':
    case 'conceded':
    case 'matchFinished':
      return event;
  }
}
