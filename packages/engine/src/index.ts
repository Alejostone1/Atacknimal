// Vocabulario
export { AFFINITIES, ATTRIBUTES, HABITATS, isAttribute, isHabitat } from './domain.ts';
export type { Affinity, Attribute, Habitat } from './domain.ts';

// Configuración y contenido
export type { DamageRules, Ruleset } from './ruleset.ts';
export type { AnimalId, AnimalProfile } from './roster.ts';
export { createMatch, MatchConfigError } from './match.ts';
export type { MatchConfig, PlayerConfig } from './match.ts';

// Estado, acciones, eventos y errores
export type {
  CardId,
  CardState,
  Declaration,
  HabitatCooldown,
  Lock,
  MatchEndReason,
  MatchMode,
  MatchResult,
  MatchState,
  Phase,
  PlayerId,
  PlayerState,
  Seat,
  TeamCooldowns,
  TeamId,
  Turn,
  TurnSlot,
} from './state.ts';
export type {
  Action,
  ConcedeAction,
  DeclareAction,
  DefendAction,
  SelectTeamAction,
} from './actions.ts';
export type {
  AttackDeclaredEvent,
  CombatResolution,
  CombatResolvedEvent,
  CombatSide,
  ConcededEvent,
  DamageDealt,
  DomainEvent,
  LockChange,
  MatchFinishedEvent,
  MatchStartedEvent,
  TeamConfirmedEvent,
  Transition,
  TurnStartedEvent,
} from './events.ts';
export { InvariantError, RULE_ERROR_CODES } from './errors.ts';
export type { Result, RuleError, RuleErrorCode } from './errors.ts';

// Reglas
export { applyAction } from './apply.ts';
export { getDefenseOptions, getLegalActions } from './legal.ts';
export type { DefenseOptions, LegalSnapshot } from './legal.ts';
export type { CardsSnapshot } from './queries.ts';
export { compareValues, computeCounterDamage, computeDamage, computeValue } from './combat.ts';
export type { DuelOutcome, ValueBreakdown } from './combat.ts';
export { isLocked } from './locks.ts';
export { isHabitatBlocked, isTeamAttributeBlocked } from './cooldowns.ts';
export { cardIdFor, isActive } from './queries.ts';

// Información visible
export { getPlayerView, redactEvent } from './view.ts';
export type { DeclarationView, PlayerEvent, PlayerSummary, PlayerView } from './view.ts';

// Inteligencia artificial (decide con la vista del jugador, nunca con el estado completo)
export { AI_DIFFICULTIES, decideAI } from './ai/decide.ts';
export type { AiDifficulty } from './ai/decide.ts';
export { estimateAttack, estimateDefense, expectedMax } from './ai/estimate.ts';

// Aleatoriedad determinista (para IA y simulación)
export { createRng, nextFloat, nextInt } from './rng.ts';
export type { RngState } from './rng.ts';
