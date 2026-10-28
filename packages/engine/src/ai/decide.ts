/**
 * IA de ATACKNIMAL (docs/GAME_RULES.md §12). Recibe la vista del jugador, igual que un humano:
 * no puede conocer la carta atacante ni las cartas rivales ocultas por construcción.
 * La dificultad cambia cómo decide, nunca la información ni las estadísticas.
 */
import type { Action, DeclareAction, DefendAction } from '../actions.ts';
import { computeCounterDamage, computeDamage, computeValue } from '../combat.ts';
import type { Attribute, Habitat } from '../domain.ts';
import { invariant } from '../errors.ts';
import { getDefenseOptions, getLegalActions } from '../legal.ts';
import { nextFloat, nextInt, type RngState } from '../rng.ts';
import type { CardState } from '../state.ts';
import type { PlayerView } from '../view.ts';
import { estimateAttack, estimateDefense, profileOf, visibleCards } from './estimate.ts';

export const AI_DIFFICULTIES = ['easy', 'normal', 'hard'] as const;
export type AiDifficulty = (typeof AI_DIFFICULTIES)[number];

/**
 * Error máximo (en puntos de valor) con el que la IA Fácil valora cada opción.
 * Jugar al azar la hundía (0–8 % contra Normal): equivocarse "en grado" la hace vencible
 * sin que parezca absurda. Calibrado con `npm run matchup` (docs/BALANCE.md §14).
 */
const EASY_NOISE = 20;

/** Penalización de la IA Difícil por perder una carta (equivale a ~1 golpe medio extra). */
const HARD_ELIMINATION_PENALTY = 30;

/** Coste de la IA Difícil por bloquear la mejor carta de su equipo en un atributo. */
const HARD_LOCK_COST = 4;

export function decideAI(
  view: PlayerView,
  difficulty: AiDifficulty,
  rng: RngState,
): [Action, RngState] {
  const legal = getLegalActions(view, view.viewerId);
  invariant(legal.length > 0, 'La IA no tiene acciones legales en este momento.');
  const declares = legal.filter((a): a is DeclareAction => a.type === 'declare');
  const defends = legal.filter((a): a is DefendAction => a.type === 'defend');

  if (difficulty === 'easy') {
    // Razona como Normal, pero valora cada opción con un error de hasta ±EASY_NOISE puntos.
    return declares.length > 0
      ? pickNoisy(declares, (a) => ownValue(view, a) - rivalDefense(view, a), EASY_NOISE, rng)
      : pickNoisy(defends, (a) => defenseValue(view, a), EASY_NOISE, rng);
  }

  if (difficulty === 'normal') {
    return declares.length > 0
      ? pickBest(declares, (a) => ownValue(view, a) - rivalDefense(view, a), rng)
      : pickBest(defends, (a) => defenseValue(view, a), rng);
  }

  return declares.length > 0
    ? pickBest(declares, (a) => hardAttackScore(view, a), rng)
    : pickBest(defends, (a) => hardDefenseScore(view, a), rng);
}

/* ---------- Valoraciones ---------- */

function card(view: PlayerView, cardId: string): CardState {
  const found = view.cards[cardId];
  invariant(found, `La IA no ve su carta ${cardId}`);
  return found;
}

function value(
  view: PlayerView,
  c: CardState,
  attribute: Attribute,
  habitat: Habitat,
  bonus = 0,
): number {
  const profile = profileOf(view, c);
  return profile === undefined
    ? 0
    : computeValue(profile, attribute, habitat, view.ruleset, bonus).effective;
}

function ownValue(view: PlayerView, action: DeclareAction): number {
  return value(view, card(view, action.cardId), action.attribute, action.habitat);
}

function rivalDefense(view: PlayerView, action: DeclareAction): number {
  invariant(view.turn, 'Ataque sin turno');
  return estimateDefense(view, view.turn.defenderId, action.habitat, action.attribute);
}

/** Valor con el que defendería esa carta (0 en defensa forzada; con forzada se prefiere la más sana). */
function defenseValue(view: PlayerView, action: DefendAction): number {
  invariant(view.declaration, 'Defensa sin declaración');
  const { habitat, attribute } = view.declaration;
  const c = card(view, action.cardId);
  return getDefenseOptions(view, view.viewerId, attribute).forced
    ? c.hp
    : value(view, c, attribute, habitat, view.ruleset.defenderBonus);
}

/** ¿Es esta carta la mejor del equipo en ese atributo? Bloquearla debilita la defensa futura. */
function isTeamBest(
  view: PlayerView,
  c: CardState,
  attribute: Attribute,
  habitat: Habitat,
): boolean {
  const mine = value(view, c, attribute, habitat);
  return visibleCards(view, view.viewerId).every(
    (other) => other.id === c.id || value(view, other, attribute, habitat) <= mine,
  );
}

/** Intercambio de daño esperado del ataque, con riesgo de perder la carta y coste del bloqueo. */
function hardAttackScore(view: PlayerView, action: DeclareAction): number {
  const rules = view.ruleset.damage;
  const attacker = card(view, action.cardId);
  const mine = ownValue(view, action);
  const theirs = rivalDefense(view, action);
  let score: number;
  if (mine > theirs) {
    score = computeDamage(mine - theirs, rules);
  } else if (mine === theirs) {
    score = 0;
  } else {
    const counter = computeCounterDamage(computeDamage(theirs - mine, rules), rules);
    score = -counter - (attacker.hp <= counter ? HARD_ELIMINATION_PENALTY : 0);
  }
  const lock = isTeamBest(view, attacker, action.attribute, action.habitat) ? HARD_LOCK_COST : 0;
  return score - lock;
}

/**
 * Defensa: gana si puede con la carta cuyo bloqueo cueste menos; si va a perder,
 * minimiza el daño, evita eliminaciones y, si alguien debe caer, sacrifica la carta más débil.
 */
function hardDefenseScore(view: PlayerView, action: DefendAction): number {
  invariant(view.declaration && view.turn, 'Defensa sin declaración');
  const { habitat, attribute } = view.declaration;
  const rules = view.ruleset.damage;
  const defender = card(view, action.cardId);
  const forced = getDefenseOptions(view, view.viewerId, attribute).forced;
  const mine = forced ? 0 : value(view, defender, attribute, habitat, view.ruleset.defenderBonus);
  const threat = estimateAttack(view, view.turn.attackerId, habitat, attribute);
  const lock = !forced && isTeamBest(view, defender, attribute, habitat) ? HARD_LOCK_COST : 0;

  if (mine > threat) return 100 + Math.min(mine - threat, 20) - lock;
  if (mine === threat) return 50 - lock;
  const damage = computeDamage(threat - mine, rules);
  const survives = defender.hp > damage;
  // Si nadie sobrevive, se prefiere perder la carta con menos vitalidad (vale menos).
  return -damage - lock - (survives ? 0 : HARD_ELIMINATION_PENALTY - (100 - defender.hp) * 0.2);
}

/* ---------- Elección ---------- */

function pickRandom<T>(candidates: readonly T[], rng: RngState): [T, RngState] {
  const [index, next] = nextInt(rng, candidates.length);
  const chosen = candidates[index];
  invariant(chosen !== undefined, 'Sin candidatas');
  return [chosen, next];
}

/** Como `pickBest`, pero sumando a cada valoración un error uniforme en [−noise, +noise]. */
function pickNoisy<T>(
  candidates: readonly T[],
  score: (candidate: T) => number,
  noise: number,
  rng: RngState,
): [T, RngState] {
  let current = rng;
  const noisy = new Map<T, number>();
  for (const candidate of candidates) {
    const [r, next] = nextFloat(current);
    current = next;
    noisy.set(candidate, score(candidate) + (r * 2 - 1) * noise);
  }
  return pickBest(candidates, (c) => noisy.get(c) ?? 0, current);
}

/** Mejor candidata según `score`; los empates se rompen al azar con el RNG de la IA. */
function pickBest<T>(
  candidates: readonly T[],
  score: (candidate: T) => number,
  rng: RngState,
): [T, RngState] {
  let bestScore = -Infinity;
  let best: T[] = [];
  for (const candidate of candidates) {
    const s = score(candidate);
    if (s > bestScore) {
      bestScore = s;
      best = [candidate];
    } else if (s === bestScore) {
      best.push(candidate);
    }
  }
  return pickRandom(best, rng);
}
