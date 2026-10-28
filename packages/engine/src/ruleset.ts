import type { Affinity } from './domain.ts';

export interface DamageRules {
  readonly base: number;
  readonly k: number;
  readonly min: number;
  readonly max: number;
  /** Fracción del daño que recibe el atacante cuando pierde (contraataque). */
  readonly counterRatio: number;
}

/**
 * Parámetros numéricos de una partida (docs/GAME_RULES.md §14).
 * Los valores concretos viven en el contenido versionado, nunca en el código.
 * Los temporizadores online no están aquí: los aplica el servidor alrededor del motor.
 */
export interface Ruleset {
  readonly version: string;
  /** Cartas por equipo. */
  readonly teamSize: number;
  readonly baseHp: number;
  readonly habitatModifiers: Readonly<Record<Affinity, number>>;
  readonly damage: DamageRules;
  /** Participaciones durante las que un atributo usado queda bloqueado. */
  readonly lockDuration: number;
  readonly maxDuels: number;
  readonly abilitiesEnabled: boolean;
}
