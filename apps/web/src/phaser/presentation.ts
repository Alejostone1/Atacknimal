/**
 * Lo único que Phaser recibe: datos de presentación ya decididos por el motor.
 * Phaser representa; nunca calcula ni cambia un resultado (ARCHITECTURE §1).
 */
export type DuelRole = 'attacker' | 'defender';

export interface DuelSide {
  readonly name: string;
  readonly imageUrl: string | null;
  /** Valor efectivo final. */
  readonly effective: number;
  /** Desglose legible, por ejemplo "100 +10 Tierra". */
  readonly detail: string;
  readonly hpBefore: number;
  readonly hpAfter: number;
  readonly maxHp: number;
  /** Etiqueta del dueño de la carta: "Tú" o "IA". */
  readonly owner: string;
}

export interface DuelPresentation {
  /** Identificador único del duelo (para no repetir la animación). */
  readonly key: string;
  readonly caption: string;
  /** Foto del hábitat del duelo para el fondo, o `null` si no hay. */
  readonly backdropUrl: string | null;
  readonly attacker: DuelSide;
  readonly defender: DuelSide;
  readonly winner: DuelRole | 'tie';
  readonly damage: { readonly target: DuelRole; readonly amount: number } | null;
  readonly eliminated: DuelRole | null;
  readonly reduceMotion: boolean;
}
