import type { BalanceSet } from '@atacknimal/content';
import type { Affinity, Habitat, Ruleset } from '@atacknimal/engine';

/** Cambia una afinidad concreta en todos los animales que la tengan. */
export interface AffinityPatch {
  readonly habitat: Habitat;
  readonly from: Affinity;
  readonly to: Affinity;
}

/** Una variante experimental de una versión de balance (no se publica: solo se simula). */
export interface Variant {
  readonly name: string;
  readonly ruleset?: Partial<Omit<Ruleset, 'version'>>;
  readonly affinityPatches?: readonly AffinityPatch[];
}

export function applyVariant(balance: BalanceSet, variant: Variant): BalanceSet {
  const patches = variant.affinityPatches ?? [];
  return {
    ...balance,
    version: `${balance.version}+${variant.name}`,
    ruleset: { ...balance.ruleset, ...variant.ruleset },
    roster: balance.roster.map((profile) => ({
      ...profile,
      affinities: patches.reduce(
        (affinities, patch) =>
          affinities[patch.habitat] === patch.from
            ? { ...affinities, [patch.habitat]: patch.to }
            : affinities,
        profile.affinities,
      ),
    })),
  };
}

/** Producto cartesiano de dos ejes de variantes, combinando nombres y cambios. */
export function combineVariants(rules: readonly Variant[], content: readonly Variant[]): Variant[] {
  return content.flatMap((c) =>
    rules.map((r) => ({
      name: [r.name, c.name].filter((n) => n !== '').join(' · ') || 'base',
      ruleset: { ...r.ruleset, ...c.ruleset },
      affinityPatches: [...(r.affinityPatches ?? []), ...(c.affinityPatches ?? [])],
    })),
  );
}
