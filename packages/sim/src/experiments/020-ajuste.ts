/**
 * Ajuste fino de la versión 0.2.0 (#029): Árboles, Águila, Guepardo y animales débiles.
 *
 * Histórico: se ejecutó sobre el borrador de 0.2.0 (perfiles de 0.1.0 + ocultos + A5 + aire neutral).
 * La variante ganadora ("r3 + águila 3") ya está incorporada al 0.2.0 publicado, así que volver
 * a ejecutar este experimento aplicaría los cambios dos veces. El informe guardado es la referencia.
 * Ronda 1 (base → nerf + buff + hostil −10) dejó al Águila en 57,9 %, Guepardo 59,3 % y Lobo 43,2 %.
 */
import type { Experiment } from '../experiment.ts';
import { mergeVariants, type Variant } from '../variants.ts';
import { MATCH_BALANCE } from './criteria.ts';

const HOSTILE_10: Variant = {
  name: 'hostil −10',
  ruleset: { habitatModifiers: { native: 10, adapted: 4, neutral: 0, hostile: -10 } },
};

/** El Águila pierde su tercer pico y su ventaja en Árboles; el Guepardo no trepa. */
const NERFS: Variant = {
  name: 'nerf',
  profilePatches: [
    { animalId: 'golden-eagle', stats: { speed: 80 }, affinities: { trees: 'neutral' } },
    { animalId: 'cheetah', affinities: { trees: 'neutral' } },
  ],
};

/** Picos más claros para los animales que quedan por debajo del 45 %. */
const BUFFS: Variant = {
  name: 'buff',
  profilePatches: [
    { animalId: 'wolf', stats: { agility: 72, endurance: 95, speed: 76, perception: 94 } },
    { animalId: 'great-white-shark', stats: { attack: 98, speed: 92 } },
    { animalId: 'crocodile', stats: { defense: 94 } },
  ],
};

const ROUND_1 = mergeVariants('ronda 1', [NERFS, BUFFS, HOSTILE_10]);

/** El Guepardo cede agilidad (su segundo pico baja de 92 a 88) y gana percepción. */
const CHEETAH_2: Variant = {
  name: 'guepardo',
  profilePatches: [{ animalId: 'cheetah', stats: { agility: 88, perception: 84 } }],
};

/** El Lobo gana ataque (pierde fuerza) para tener una amenaza más. */
const WOLF_2: Variant = {
  name: 'lobo',
  profilePatches: [{ animalId: 'wolf', stats: { strength: 56, attack: 82 } }],
};

/** El Lobo también caza en Agua (Adaptado), como el Oso. */
const WOLF_WATER: Variant = {
  name: 'lobo agua',
  profilePatches: [{ animalId: 'wolf', affinities: { water: 'adapted' } }],
};

/** El Águila pierde algo más de ataque. */
const EAGLE_2: Variant = {
  name: 'águila',
  profilePatches: [{ animalId: 'golden-eagle', stats: { attack: 78, endurance: 76 } }],
};

/**
 * Ronda 2 dejó a Guepardo (58,3 %) y Águila (58,6 %) justo por encima de la alerta y al Lobo en 44,5 %.
 * Sus valores 100 producen márgenes enormes, que el daño por margen premia.
 */
const ROUND_2 = mergeVariants('ronda 2', [ROUND_1, CHEETAH_2, WOLF_2, WOLF_WATER, EAGLE_2]);

/** Daño menos sensible al margen y con más base: premia menos los picos extremos y acorta. */
const FLAT_DAMAGE: Variant = {
  name: 'daño plano',
  ruleset: { damage: { base: 24, k: 0.35, min: 24, max: 45, counterRatio: 0.5 } },
};

/** Las firmas de 100 de Guepardo y Águila bajan a 96, sin cambiar su suma. */
const NO_PERFECT: Variant = {
  name: 'sin 100',
  profilePatches: [
    { animalId: 'cheetah', stats: { speed: 96, endurance: 66 } },
    { animalId: 'golden-eagle', stats: { perception: 96, defense: 70 } },
  ],
};

/**
 * Ronda 3: "sin 100" ayuda al Guepardo (56,7 %), pero el Águila sigue en ~58,3 %.
 * Es la única nativa en Aire: su +10 nunca se compensa. Bajan sus dos picos y sube su Defensa.
 */
const ROUND_3 = mergeVariants('ronda 3', [ROUND_2, NO_PERFECT]);

const EAGLE_3: Variant = {
  name: 'águila 3',
  profilePatches: [
    { animalId: 'golden-eagle', stats: { agility: 88, perception: 92, defense: 76 } },
  ],
};

const CROCODILE_2: Variant = {
  name: 'cocodrilo',
  profilePatches: [{ animalId: 'crocodile', stats: { attack: 92 } }],
};

export const EXPERIMENT: Experiment = {
  title: 'Ajuste de la versión 0.2.0 (ronda 4)',
  baseVersion: '0.2.0',
  sample: 20_000,
  seed: 1,
  criterion: MATCH_BALANCE,
  variants: [
    { name: 'base 0.2.0' },
    ROUND_3,
    mergeVariants('r3 + águila 3', [ROUND_3, EAGLE_3]),
    mergeVariants('r3 + águila 3 + cocodrilo', [ROUND_3, EAGLE_3, CROCODILE_2]),
    mergeVariants('r3 + águila 3 + cocodrilo + daño plano', [
      ROUND_3,
      EAGLE_3,
      CROCODILE_2,
      FLAT_DAMAGE,
    ]),
  ],
};
