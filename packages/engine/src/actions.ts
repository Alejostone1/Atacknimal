import type { Attribute, Habitat } from './domain.ts';
import type { AnimalId } from './roster.ts';
import type { CardId, PlayerId } from './state.ts';

export interface SelectTeamAction {
  readonly type: 'selectTeam';
  readonly playerId: PlayerId;
  readonly animalIds: readonly AnimalId[];
}

/** Hábitat + carta + atributo en una sola acción atómica (docs/GAME_RULES.md §4). */
export interface DeclareAction {
  readonly type: 'declare';
  readonly playerId: PlayerId;
  readonly habitat: Habitat;
  readonly cardId: CardId;
  readonly attribute: Attribute;
}

export interface DefendAction {
  readonly type: 'defend';
  readonly playerId: PlayerId;
  readonly cardId: CardId;
}

export interface ConcedeAction {
  readonly type: 'concede';
  readonly playerId: PlayerId;
}

export type Action = SelectTeamAction | DeclareAction | DefendAction | ConcedeAction;
