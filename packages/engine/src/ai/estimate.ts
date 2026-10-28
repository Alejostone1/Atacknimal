/**
 * Estimaciones que usa la IA a partir de lo que ve un jugador (nunca del estado completo).
 */
import { computeValue } from '../combat.ts';
import type { Attribute, Habitat } from '../domain.ts';
import { getDefenseOptions } from '../legal.ts';
import { isLocked } from '../locks.ts';
import type { AnimalProfile } from '../roster.ts';
import type { CardState, PlayerId } from '../state.ts';
import type { PlayerView } from '../view.ts';

/** Valor esperado del máximo de `k` valores elegidos al azar, sin reemplazo, de `values`. */
export function expectedMax(values: readonly number[], k: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  if (k <= 0 || n === 0) return 0;
  if (k >= n) return sorted[n - 1] ?? 0;
  const total = binomial(n, k);
  return sorted.reduce((sum, value, i) => sum + (value * binomial(i, k - 1)) / total, 0);
}

function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
  return result;
}

export function profileOf(view: PlayerView, card: CardState): AnimalProfile | undefined {
  return view.roster[card.animalId];
}

/** Cartas visibles (activas) de un jugador según la vista. */
export function visibleCards(view: PlayerView, playerId: PlayerId): CardState[] {
  const player = view.players.find((p) => p.id === playerId);
  return (player?.cardIds ?? []).flatMap((id) => {
    const card = view.cards[id];
    return card !== undefined && card.hp > 0 ? [card] : [];
  });
}

/** Cartas ocultas de un jugador y animales que podrían ser (los no revelados de su equipo). */
function hiddenOf(
  view: PlayerView,
  playerId: PlayerId,
): { count: number; candidates: AnimalProfile[] } {
  const player = view.players.find((p) => p.id === playerId);
  const count = player?.hiddenCards ?? 0;
  if (player === undefined || count === 0) return { count: 0, candidates: [] };
  const revealed = new Set(
    view.players
      .filter((p) => p.team === player.team)
      .flatMap((p) => p.cardIds ?? [])
      .flatMap((id) => {
        const card = view.cards[id];
        return card === undefined ? [] : [card.animalId];
      }),
  );
  return {
    count,
    candidates: Object.values(view.roster).filter((profile) => !revealed.has(profile.id)),
  };
}

/**
 * Mejor defensa que se espera del rival en (hábitat, atributo): sus cartas visibles legales
 * y, si tiene cartas ocultas, el máximo esperado entre los animales que podrían ser.
 */
export function estimateDefense(
  view: PlayerView,
  defenderId: PlayerId,
  habitat: Habitat,
  attribute: Attribute,
): number {
  const bonus = view.ruleset.defenderBonus;
  const options = getDefenseOptions(view, defenderId, attribute);
  const known = options.forced
    ? 0
    : Math.max(
        0,
        ...options.cardIds.flatMap((id) => {
          const card = view.cards[id];
          const profile = card === undefined ? undefined : profileOf(view, card);
          return profile === undefined
            ? []
            : [computeValue(profile, attribute, habitat, view.ruleset, bonus).effective];
        }),
      );
  const hidden = hiddenOf(view, defenderId);
  const guessed = expectedMax(
    hidden.candidates.map(
      (profile) => computeValue(profile, attribute, habitat, view.ruleset, bonus).effective,
    ),
    hidden.count,
  );
  return Math.max(known, guessed);
}

/**
 * Valor que se espera del atacante rival tras declarar (hábitat, atributo), sin saber su carta:
 * su mejor carta visible que pueda usar ese atributo o el máximo esperado de las ocultas.
 */
export function estimateAttack(
  view: PlayerView,
  attackerId: PlayerId,
  habitat: Habitat,
  attribute: Attribute,
): number {
  const known = Math.max(
    0,
    ...visibleCards(view, attackerId)
      .filter((card) => !isLocked(card, attribute))
      .flatMap((card) => {
        const profile = profileOf(view, card);
        return profile === undefined
          ? []
          : [computeValue(profile, attribute, habitat, view.ruleset).effective];
      }),
  );
  const hidden = hiddenOf(view, attackerId);
  const guessed = expectedMax(
    hidden.candidates.map(
      (profile) => computeValue(profile, attribute, habitat, view.ruleset).effective,
    ),
    hidden.count,
  );
  return Math.max(known, guessed);
}
