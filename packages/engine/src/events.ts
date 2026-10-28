import type { Attribute, Habitat } from './domain.ts';
import type { ValueBreakdown, DuelOutcome } from './combat.ts';
import type { AnimalId } from './roster.ts';
import type { CardId, MatchResult, MatchState, PlayerId, TeamId, TurnSlot } from './state.ts';

export interface CombatSide {
  readonly playerId: PlayerId;
  readonly cardId: CardId;
  readonly effective: number;
  /** `null` en una defensa forzada: la carta lucha con 0 y sin modificadores. */
  readonly breakdown: ValueBreakdown | null;
  readonly hpAfter: number;
}

export interface DamageDealt {
  readonly targetCardId: CardId;
  readonly amount: number;
  readonly isCounter: boolean;
}

export interface LockChange {
  readonly cardId: CardId;
  readonly attribute: Attribute;
}

/** Todo lo que hace falta para animar y explicar un duelo (docs/GAME_RULES.md §13). */
export interface CombatResolution {
  readonly duelNumber: number;
  readonly habitat: Habitat;
  readonly attribute: Attribute;
  readonly attacker: CombatSide;
  readonly defender: CombatSide;
  readonly forcedDefense: boolean;
  readonly outcome: DuelOutcome;
  readonly margin: number;
  readonly damage: DamageDealt | null;
  readonly locksApplied: readonly LockChange[];
  readonly locksExpired: readonly LockChange[];
  readonly eliminatedCardId: CardId | null;
}

export interface TeamConfirmedEvent {
  readonly type: 'teamConfirmed';
  readonly playerId: PlayerId;
  readonly animalIds: readonly AnimalId[];
}

export interface MatchStartedEvent {
  readonly type: 'matchStarted';
  readonly firstTeam: TeamId;
  readonly turnOrder: readonly TurnSlot[];
  /** Equipos completos: a partir de aquí son públicos. */
  readonly teams: Readonly<Record<PlayerId, readonly AnimalId[]>>;
}

export interface TurnStartedEvent {
  readonly type: 'turnStarted';
  readonly duelNumber: number;
  readonly attackerId: PlayerId;
  readonly defenderId: PlayerId;
}

export interface AttackDeclaredEvent {
  readonly type: 'attackDeclared';
  readonly duelNumber: number;
  readonly attackerId: PlayerId;
  readonly defenderId: PlayerId;
  readonly habitat: Habitat;
  readonly attribute: Attribute;
  readonly cardId: CardId;
}

export interface CombatResolvedEvent {
  readonly type: 'combatResolved';
  readonly resolution: CombatResolution;
}

export interface ConcededEvent {
  readonly type: 'conceded';
  readonly playerId: PlayerId;
}

export interface MatchFinishedEvent {
  readonly type: 'matchFinished';
  readonly result: MatchResult;
}

export type DomainEvent =
  | TeamConfirmedEvent
  | MatchStartedEvent
  | TurnStartedEvent
  | AttackDeclaredEvent
  | CombatResolvedEvent
  | ConcededEvent
  | MatchFinishedEvent;

/** Resultado de aplicar una acción válida. */
export interface Transition {
  readonly state: MatchState;
  readonly events: readonly DomainEvent[];
}
