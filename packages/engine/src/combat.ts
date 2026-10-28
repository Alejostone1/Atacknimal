import type { Affinity, Attribute, Habitat } from './domain.ts';
import type { AnimalProfile } from './roster.ts';
import type { DamageRules, Ruleset } from './ruleset.ts';

/** Desglose del valor efectivo en el orden fijo de docs/GAME_RULES.md §6. */
export interface ValueBreakdown {
  readonly base: number;
  readonly affinity: Affinity;
  readonly habitatModifier: number;
  /** Siempre 0 mientras las habilidades estén desactivadas. */
  readonly abilityModifier: number;
  /** Reservado para estados futuros: siempre 0 en v0.1. */
  readonly statusModifier: number;
  readonly effective: number;
}

export type DuelOutcome = 'attacker' | 'defender' | 'tie';

export function computeValue(
  profile: AnimalProfile,
  attribute: Attribute,
  habitat: Habitat,
  ruleset: Ruleset,
): ValueBreakdown {
  const base = profile.stats[attribute];
  const affinity = profile.affinities[habitat];
  const habitatModifier = ruleset.habitatModifiers[affinity];
  const abilityModifier = 0;
  const statusModifier = 0;
  return {
    base,
    affinity,
    habitatModifier,
    abilityModifier,
    statusModifier,
    effective: Math.max(0, base + habitatModifier + abilityModifier + statusModifier),
  };
}

export function compareValues(
  attackerValue: number,
  defenderValue: number,
): { outcome: DuelOutcome; margin: number } {
  const margin = Math.abs(attackerValue - defenderValue);
  if (attackerValue > defenderValue) return { outcome: 'attacker', margin };
  if (attackerValue < defenderValue) return { outcome: 'defender', margin };
  return { outcome: 'tie', margin: 0 };
}

/** Redondeo al entero más cercano, mitades hacia arriba (docs/GAME_RULES.md §7.2). */
export function roundHalfUp(value: number): number {
  return Math.floor(value + 0.5);
}

/** Daño al perdedor cuando gana el atacante. */
export function computeDamage(margin: number, rules: DamageRules): number {
  return Math.min(rules.max, Math.max(rules.min, roundHalfUp(rules.base + rules.k * margin)));
}

/** Daño al atacante cuando gana el defensor. */
export function computeCounterDamage(damage: number, rules: DamageRules): number {
  return roundHalfUp(damage * rules.counterRatio);
}
