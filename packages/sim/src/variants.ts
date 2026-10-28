import type { BalanceSet } from '@atacknimal/content';
import type { Affinity, AnimalId, Attribute, Habitat, Ruleset } from '@atacknimal/engine';

/** Cambia una afinidad concreta en todos los animales que la tengan. */
export interface AffinityPatch {
  readonly habitat: Habitat;
  readonly from: Affinity;
  readonly to: Affinity;
}

/** Cambia estadísticas o afinidades de un animal concreto. */
export interface ProfilePatch {
  readonly animalId: AnimalId;
  readonly stats?: Partial<Record<Attribute, number>>;
  readonly affinities?: Partial<Record<Habitat, Affinity>>;
}

/** Una variante experimental de una versión de balance (no se publica: solo se simula). */
export interface Variant {
  readonly name: string;
  readonly ruleset?: Partial<Omit<Ruleset, 'version'>>;
  readonly affinityPatches?: readonly AffinityPatch[];
  readonly profilePatches?: readonly ProfilePatch[];
}

export function applyVariant(balance: BalanceSet, variant: Variant): BalanceSet {
  const patches = variant.affinityPatches ?? [];
  return {
    ...balance,
    version: `${balance.version}+${variant.name}`,
    ruleset: { ...balance.ruleset, ...variant.ruleset },
    roster: balance.roster.map((profile) => {
      const own = (variant.profilePatches ?? []).filter((p) => p.animalId === profile.id);
      const affinities = patches.reduce(
        (current, patch) =>
          current[patch.habitat] === patch.from
            ? { ...current, [patch.habitat]: patch.to }
            : current,
        profile.affinities,
      );
      return {
        ...profile,
        stats: own.reduce((stats, patch) => ({ ...stats, ...patch.stats }), profile.stats),
        affinities: own.reduce(
          (current, patch) => ({ ...current, ...patch.affinities }),
          affinities,
        ),
      };
    }),
  };
}

/** Une varias variantes en una: los cambios posteriores tienen prioridad. */
export function mergeVariants(name: string, parts: readonly Variant[]): Variant {
  return {
    name,
    ruleset: parts.reduce<NonNullable<Variant['ruleset']>>(
      (merged, part) => ({ ...merged, ...part.ruleset }),
      {},
    ),
    affinityPatches: parts.flatMap((p) => p.affinityPatches ?? []),
    profilePatches: parts.flatMap((p) => p.profilePatches ?? []),
  };
}

/** Producto cartesiano de dos ejes de variantes, combinando nombres y cambios. */
export function combineVariants(rules: readonly Variant[], content: readonly Variant[]): Variant[] {
  return content.flatMap((c) =>
    rules.map((r) =>
      mergeVariants([r.name, c.name].filter((n) => n !== '').join(' · ') || 'base', [r, c]),
    ),
  );
}
