import type { Affinity, Attribute, Habitat } from './domain.ts';

export type AnimalId = string;

/**
 * Perfil de juego de un animal: solo los datos que necesitan las reglas.
 * Los datos zoológicos reales viven aparte y el motor nunca los lee (docs/BALANCE.md §1).
 */
export interface AnimalProfile {
  readonly id: AnimalId;
  readonly stats: Readonly<Record<Attribute, number>>;
  readonly affinities: Readonly<Record<Habitat, Affinity>>;
  /** Si falta, se usa `ruleset.baseHp`. */
  readonly baseHp?: number;
}
