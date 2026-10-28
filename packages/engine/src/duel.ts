import type { DeclareAction, DefendAction } from './actions.ts';
import {
  compareValues,
  computeCounterDamage,
  computeDamage,
  computeValue,
  type ValueBreakdown,
} from './combat.ts';
import { isAttribute, isHabitat } from './domain.ts';
import { fail, invariant, ok, type Result } from './errors.ts';
import type {
  CombatResolution,
  DamageDealt,
  DomainEvent,
  LockChange,
  Transition,
} from './events.ts';
import { cooldownsAfterAttack, isHabitatBlocked, isTeamAttributeBlocked } from './cooldowns.ts';
import { getDefenseOptions } from './legal.ts';
import { isLocked, locksAfterDuel } from './locks.ts';
import { checkOutcome } from './outcome.ts';
import { getCard, getPlayer, getProfile, isActive } from './queries.ts';
import type { CardId, CardState, Declaration, MatchState, PlayerId } from './state.ts';
import { resolveTurn } from './turns.ts';

/** Declaración sellada del atacante (docs/GAME_RULES.md §5.1). */
export function applyDeclare(state: MatchState, action: DeclareAction): Result<Transition> {
  if (state.phase !== 'declare') return fail('WRONG_PHASE', 'No es momento de atacar.');
  const { turn } = state;
  invariant(turn, 'Fase de declaración sin turno.');
  if (action.playerId !== turn.attackerId)
    return fail('NOT_YOUR_TURN', 'No es tu turno de atacar.');
  if (!isHabitat(action.habitat)) return fail('INVALID_HABITAT', 'Hábitat desconocido.');
  if (!isAttribute(action.attribute)) return fail('INVALID_ATTRIBUTE', 'Atributo desconocido.');

  const owned = ownActiveCard(state, action.playerId, action.cardId);
  if (!owned.ok) return owned;
  if (isLocked(owned.value, action.attribute)) {
    return fail('ATTRIBUTE_LOCKED', 'Esa carta tiene ese atributo bloqueado.');
  }
  const team = getPlayer(state, action.playerId).team;
  const cooldowns = state.teamCooldowns[team];
  if (isTeamAttributeBlocked(cooldowns, action.attribute)) {
    return fail('ATTRIBUTE_LOCKED', 'Tu equipo atacó hace poco con ese atributo.');
  }
  if (isHabitatBlocked(cooldowns, action.habitat)) {
    return fail('HABITAT_LOCKED', 'Tu equipo todavía no puede repetir ese hábitat.');
  }

  const declaration: Declaration = {
    habitat: action.habitat,
    attribute: action.attribute,
    cardId: action.cardId,
  };
  const teamCooldowns = {
    ...state.teamCooldowns,
    [team]: cooldownsAfterAttack(cooldowns, action.habitat, action.attribute, state.ruleset),
  };
  return ok({
    state: { ...state, phase: 'defend', declaration, teamCooldowns },
    events: [
      {
        type: 'attackDeclared',
        duelNumber: state.duelNumber,
        attackerId: turn.attackerId,
        defenderId: turn.defenderId,
        ...declaration,
      },
    ],
  });
}

/** Defensa y resolución completa del duelo (docs/GAME_RULES.md §5.2–§10). */
export function applyDefend(state: MatchState, action: DefendAction): Result<Transition> {
  if (state.phase !== 'defend') return fail('WRONG_PHASE', 'No es momento de defender.');
  const { turn, declaration } = state;
  invariant(turn && declaration, 'Fase de defensa sin turno o sin declaración.');
  if (action.playerId !== turn.defenderId) {
    return fail('NOT_YOUR_TURN', 'No te toca defender.');
  }

  const owned = ownActiveCard(state, action.playerId, action.cardId);
  if (!owned.ok) return owned;
  const options = getDefenseOptions(state, action.playerId, declaration.attribute);
  if (!options.cardIds.includes(action.cardId)) {
    return fail('ATTRIBUTE_LOCKED', 'Esa carta tiene bloqueado el atributo declarado.');
  }

  const resolution = resolveDuel(
    state,
    turn.attackerId,
    action.playerId,
    action.cardId,
    options.forced,
  );
  return ok(advance(applyResolution(state, resolution), resolution));
}

function ownActiveCard(state: MatchState, playerId: PlayerId, cardId: CardId): Result<CardState> {
  const card = state.cards[cardId];
  if (card === undefined) return fail('UNKNOWN_CARD', 'Carta desconocida.');
  if (card.ownerId !== playerId) return fail('NOT_YOUR_CARD', 'Esa carta no es tuya.');
  if (!isActive(card)) return fail('CARD_ELIMINATED', 'Esa carta está eliminada.');
  return ok(card);
}

function resolveDuel(
  state: MatchState,
  attackerId: PlayerId,
  defenderId: PlayerId,
  defenderCardId: CardId,
  forcedDefense: boolean,
): CombatResolution {
  const { declaration, ruleset } = state;
  invariant(declaration, 'Resolución sin declaración.');
  const { habitat, attribute } = declaration;
  const attackerCard = getCard(state, declaration.cardId);
  const defenderCard = getCard(state, defenderCardId);

  const attackerBreakdown = computeValue(
    getProfile(state, attackerCard),
    attribute,
    habitat,
    ruleset,
  );
  const defenderBreakdown: ValueBreakdown | null = forcedDefense
    ? null
    : computeValue(
        getProfile(state, defenderCard),
        attribute,
        habitat,
        ruleset,
        ruleset.defenderBonus,
      );
  const attackerValue = attackerBreakdown.effective;
  const defenderValue = defenderBreakdown?.effective ?? 0;
  const { outcome, margin } = compareValues(attackerValue, defenderValue);

  let damage: DamageDealt | null = null;
  if (outcome !== 'tie') {
    const amount = computeDamage(margin, ruleset.damage);
    damage =
      outcome === 'attacker'
        ? { targetCardId: defenderCard.id, amount, isCounter: false }
        : {
            targetCardId: attackerCard.id,
            amount: computeCounterDamage(amount, ruleset.damage),
            isCounter: true,
          };
  }

  const hpAfter = (card: CardState): number =>
    damage?.targetCardId === card.id ? Math.max(0, card.hp - damage.amount) : card.hp;
  const locksApplied: LockChange[] = [];
  const locksExpired: LockChange[] = [];
  for (const card of [attackerCard, defenderCard]) {
    const { expired } = locksAfterDuel(card.locks, attribute, ruleset.lockDuration);
    locksExpired.push(
      ...expired.map((expiredAttribute) => ({ cardId: card.id, attribute: expiredAttribute })),
    );
    if (hpAfter(card) > 0 && ruleset.lockDuration > 0)
      locksApplied.push({ cardId: card.id, attribute });
  }

  const eliminated = [attackerCard, defenderCard].find((card) => hpAfter(card) === 0);
  return {
    duelNumber: state.duelNumber,
    habitat,
    attribute,
    attacker: {
      playerId: attackerId,
      cardId: attackerCard.id,
      effective: attackerValue,
      breakdown: attackerBreakdown,
      hpAfter: hpAfter(attackerCard),
    },
    defender: {
      playerId: defenderId,
      cardId: defenderCard.id,
      effective: defenderValue,
      breakdown: defenderBreakdown,
      hpAfter: hpAfter(defenderCard),
    },
    forcedDefense,
    outcome,
    margin,
    damage,
    locksApplied,
    locksExpired,
    eliminatedCardId: eliminated?.id ?? null,
  };
}

/** Aplica vitalidad y bloqueos de la resolución a las dos cartas del duelo. */
function applyResolution(state: MatchState, resolution: CombatResolution): MatchState {
  const update = (cardId: CardId, hp: number): CardState => {
    const card = getCard(state, cardId);
    const locks =
      hp > 0
        ? locksAfterDuel(card.locks, resolution.attribute, state.ruleset.lockDuration).locks
        : [];
    return { ...card, hp, locks };
  };
  const attacker = update(resolution.attacker.cardId, resolution.attacker.hpAfter);
  const defender = update(resolution.defender.cardId, resolution.defender.hpAfter);
  return {
    ...state,
    cards: { ...state.cards, [attacker.id]: attacker, [defender.id]: defender },
    declaration: null,
    lastResolution: resolution,
  };
}

/** Termina la partida o pasa al siguiente turno. */
function advance(state: MatchState, resolution: CombatResolution): Transition {
  const events: DomainEvent[] = [{ type: 'combatResolved', resolution }];
  const result = checkOutcome(state);
  if (result !== null) {
    events.push({ type: 'matchFinished', result });
    return { state: { ...state, phase: 'finished', turn: null, result }, events };
  }

  const next = resolveTurn(state, state.slotIndex + 1);
  invariant(next, 'Partida sin terminar y sin turnos jugables.');
  const duelNumber = state.duelNumber + 1;
  events.push({
    type: 'turnStarted',
    duelNumber,
    attackerId: next.attackerId,
    defenderId: next.defenderId,
  });
  return {
    state: {
      ...state,
      phase: 'declare',
      duelNumber,
      slotIndex: next.slotIndex,
      turn: { attackerId: next.attackerId, defenderId: next.defenderId },
    },
    events,
  };
}
