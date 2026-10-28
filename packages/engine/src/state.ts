import type { Attribute, Habitat } from './domain.ts';
import type { CombatResolution } from './events.ts';
import type { RngState } from './rng.ts';
import type { AnimalId, AnimalProfile } from './roster.ts';
import type { Ruleset } from './ruleset.ts';

export type PlayerId = string;
export type CardId = string;
export type TeamId = 'A' | 'B';
export type Seat = 1 | 2;
export type MatchMode = '1v1' | '2v2';

/** `setup` → `declare` ⇄ `defend` → `finished`. La resolución ocurre dentro de la acción `defend`. */
export type Phase = 'setup' | 'declare' | 'defend' | 'finished';

export interface Lock {
  readonly attribute: Attribute;
  /** Participaciones que quedan con el atributo bloqueado. */
  readonly remaining: number;
}

export interface HabitatCooldown {
  readonly habitat: Habitat;
  /** Ataques del equipo que quedan sin poder usar el hábitat. */
  readonly remaining: number;
}

/** Restricciones de ataque que afectan a todo un equipo (públicas). */
export interface TeamCooldowns {
  readonly attributes: readonly Lock[];
  readonly habitats: readonly HabitatCooldown[];
}

/** Una carta está activa mientras `hp > 0`; con `hp === 0` está eliminada. */
export interface CardState {
  readonly id: CardId;
  readonly animalId: AnimalId;
  readonly ownerId: PlayerId;
  readonly hp: number;
  readonly maxHp: number;
  readonly locks: readonly Lock[];
}

export interface PlayerState {
  readonly id: PlayerId;
  readonly team: TeamId;
  readonly seat: Seat;
  /** `null` hasta que el jugador confirma su equipo. */
  readonly cardIds: readonly CardId[] | null;
}

/** Entrada del orden de turnos: quién ataca y quién es el defensor designado. */
export interface TurnSlot {
  readonly attackerId: PlayerId;
  readonly defenderId: PlayerId;
}

/** Turno en curso. El defensor puede diferir del designado por relevo (2v2). */
export interface Turn {
  readonly attackerId: PlayerId;
  readonly defenderId: PlayerId;
}

/** Declaración sellada del atacante. La carta es información oculta para el rival. */
export interface Declaration {
  readonly habitat: Habitat;
  readonly attribute: Attribute;
  readonly cardId: CardId;
}

export type MatchEndReason = 'elimination' | 'duel-limit' | 'concede';

export interface MatchResult {
  /** `null` = empate. */
  readonly winner: TeamId | null;
  readonly reason: MatchEndReason;
}

export interface MatchState {
  readonly id: string;
  readonly mode: MatchMode;
  readonly ruleset: Ruleset;
  readonly roster: Readonly<Record<AnimalId, AnimalProfile>>;
  readonly players: readonly PlayerState[];
  readonly cards: Readonly<Record<CardId, CardState>>;
  readonly teamCooldowns: Readonly<Record<TeamId, TeamCooldowns>>;
  readonly phase: Phase;
  /** Número del duelo en curso (1, 2, …). 0 durante la preparación. */
  readonly duelNumber: number;
  readonly turnOrder: readonly TurnSlot[];
  readonly slotIndex: number;
  readonly turn: Turn | null;
  readonly declaration: Declaration | null;
  readonly lastResolution: CombatResolution | null;
  readonly result: MatchResult | null;
  readonly rng: RngState;
}
