/**
 * Vocabulario canónico del juego (docs/GAME_RULES.md §1).
 * El orden de cada lista es el orden de presentación en la interfaz.
 */

export const ATTRIBUTES = [
  'weight',
  'strength',
  'agility',
  'attack',
  'endurance',
  'speed',
  'defense',
  'perception',
] as const;

export type Attribute = (typeof ATTRIBUTES)[number];

export const HABITATS = ['air', 'water', 'land', 'trees'] as const;

export type Habitat = (typeof HABITATS)[number];

export const AFFINITIES = ['native', 'adapted', 'neutral', 'hostile'] as const;

export type Affinity = (typeof AFFINITIES)[number];

export function isAttribute(value: unknown): value is Attribute {
  return typeof value === 'string' && (ATTRIBUTES as readonly string[]).includes(value);
}

export function isHabitat(value: unknown): value is Habitat {
  return typeof value === 'string' && (HABITATS as readonly string[]).includes(value);
}
