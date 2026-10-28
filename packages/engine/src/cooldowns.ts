import type { Attribute, Habitat } from './domain.ts';
import type { Ruleset } from './ruleset.ts';
import type { TeamCooldowns } from './state.ts';

export const NO_COOLDOWNS: TeamCooldowns = { attributes: [], habitats: [] };

export function isTeamAttributeBlocked(cooldowns: TeamCooldowns, attribute: Attribute): boolean {
  return cooldowns.attributes.some((c) => c.attribute === attribute && c.remaining > 0);
}

export function isHabitatBlocked(cooldowns: TeamCooldowns, habitat: Habitat): boolean {
  return cooldowns.habitats.some((c) => c.habitat === habitat && c.remaining > 0);
}

/**
 * Restricciones del equipo tras declarar un ataque: consume un ataque de las vigentes
 * y bloquea el atributo y el hábitat usados según el ruleset.
 */
export function cooldownsAfterAttack(
  cooldowns: TeamCooldowns,
  habitat: Habitat,
  attribute: Attribute,
  ruleset: Ruleset,
): TeamCooldowns {
  const tick = <T extends { readonly remaining: number }>(items: readonly T[]): T[] =>
    items
      .map((item) => ({ ...item, remaining: item.remaining - 1 }))
      .filter((i) => i.remaining > 0);
  return {
    attributes: [
      ...tick(cooldowns.attributes),
      ...(ruleset.teamAttributeLock > 0
        ? [{ attribute, remaining: ruleset.teamAttributeLock }]
        : []),
    ],
    habitats: [
      ...tick(cooldowns.habitats),
      ...(ruleset.habitatCooldown > 0 ? [{ habitat, remaining: ruleset.habitatCooldown }] : []),
    ],
  };
}
