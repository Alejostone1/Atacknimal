import type { AnimalProfile, Ruleset } from '@atacknimal/engine';
import animalsData from '../data/animals.json' with { type: 'json' };
import balance010 from '../data/balance/0.1.0.json' with { type: 'json' };
import balance020 from '../data/balance/0.2.0.json' with { type: 'json' };
import balance030 from '../data/balance/0.3.0.json' with { type: 'json' };
import balance040 from '../data/balance/0.4.0.json' with { type: 'json' };
import factsData from '../data/facts.json' with { type: 'json' };
import habitatsData from '../data/habitats.json' with { type: 'json' };
import imagesData from '../data/images.json' with { type: 'json' };
import {
  animalFactsSchema,
  animalImageSchema,
  habitatImageSchema,
  type AnimalFacts,
  type AnimalImage,
  type HabitatImage,
} from './media.ts';
import {
  animalSchema,
  balanceSetSchema,
  type Animal,
  type Budget,
  type Targets,
} from './schema.ts';

export { checkProfileBudget, checkRosterCoverage } from './budget.ts';
export type { Animal, Budget, Target, Targets } from './schema.ts';
export {
  animalFactsSchema,
  animalImageSchema,
  habitatImageSchema,
  IMAGE_PROVIDERS,
  IMAGE_STATUSES,
  IUCN_CATEGORIES,
  LICENSE_IDS,
} from './media.ts';
export type {
  AnimalFacts,
  AnimalImage,
  HabitatImage,
  ImageStatus,
  IucnCategory,
  LicenseId,
} from './media.ts';

/** Versión de balance lista para jugar o simular. */
export interface BalanceSet {
  readonly version: string;
  readonly ruleset: Ruleset;
  readonly budget: Budget;
  readonly targets: Targets;
  readonly roster: readonly AnimalProfile[];
}

export class ContentError extends Error {
  override name = 'ContentError';
}

export const ANIMALS: readonly Animal[] = animalSchema.array().parse(animalsData);

const animalIds = new Set(ANIMALS.map((animal) => animal.id));

export const IMAGES: readonly AnimalImage[] = animalImageSchema.array().parse(imagesData);
export const FACTS: readonly AnimalFacts[] = animalFactsSchema.array().parse(factsData);

for (const { animalId } of [...IMAGES, ...FACTS]) {
  if (!animalIds.has(animalId))
    throw new ContentError(`Imagen o dato de un animal desconocido: ${animalId}`);
}
for (const id of animalIds) {
  if (IMAGES.filter((i) => i.animalId === id && i.status !== 'retired').length > 1) {
    throw new ContentError(`${id} tiene más de una imagen activa.`);
  }
}

export const HABITAT_IMAGES: readonly HabitatImage[] = habitatImageSchema
  .array()
  .parse(habitatsData);

/** Foto activa de un hábitat, o `undefined` si aún no tiene (la interfaz usa su icono). */
export function getHabitatImage(habitat: HabitatImage['habitat']): HabitatImage | undefined {
  return HABITAT_IMAGES.find((image) => image.habitat === habitat && image.status !== 'retired');
}

/** Imagen activa (aprobada o propuesta) de un animal, o `undefined` si aún no tiene. */
export function getImage(animalId: string): AnimalImage | undefined {
  return IMAGES.find((image) => image.animalId === animalId && image.status !== 'retired');
}

export function getFacts(animalId: string): AnimalFacts | undefined {
  return FACTS.find((facts) => facts.animalId === animalId);
}

const BALANCE_SETS: Readonly<Record<string, BalanceSet>> = Object.fromEntries(
  [balance010, balance020, balance030, balance040].map((data) => {
    const set = toBalanceSet(data);
    return [set.version, set];
  }),
);

export const BALANCE_VERSIONS: readonly string[] = Object.keys(BALANCE_SETS);
export const LATEST_BALANCE_VERSION = '0.4.0';

export function getBalanceSet(version: string = LATEST_BALANCE_VERSION): BalanceSet {
  const set = BALANCE_SETS[version];
  if (set === undefined) throw new ContentError(`Versión de balance desconocida: ${version}`);
  return set;
}

export function getAnimal(id: string): Animal {
  const animal = ANIMALS.find((a) => a.id === id);
  if (animal === undefined) throw new ContentError(`Animal desconocido: ${id}`);
  return animal;
}

function toBalanceSet(raw: unknown): BalanceSet {
  const data = balanceSetSchema.parse(raw);
  const known = new Set(ANIMALS.map((animal) => animal.id));
  const profiled = data.profiles.map((profile) => profile.animalId);

  // Cada versión tiene su propio roster (0.1.0 y 0.2.0 tenían 11 animales; 0.3.0, 20; 0.4.0, 26):
  // así una versión publicada sigue siendo reproducible aunque se añadan animales.
  const unknown = profiled.filter((id) => !known.has(id));
  if (unknown.length > 0 || new Set(profiled).size !== profiled.length) {
    throw new ContentError(
      `Balance ${data.version}: perfiles desconocidos [${unknown.join(', ')}] o repetidos.`,
    );
  }
  if (data.ruleset.version !== data.version) {
    throw new ContentError(`Balance ${data.version}: el ruleset dice ${data.ruleset.version}.`);
  }

  return {
    version: data.version,
    ruleset: data.ruleset,
    budget: data.budget,
    targets: data.targets,
    roster: data.profiles.map(({ animalId, stats, affinities, baseHp }) => ({
      id: animalId,
      stats,
      affinities,
      ...(baseHp === undefined ? {} : { baseHp }),
    })),
  };
}
