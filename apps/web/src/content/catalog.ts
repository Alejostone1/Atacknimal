/**
 * Adaptador entre el contenido versionado y la interfaz. React nunca lee los JSON ni
 * escribe estadísticas a mano: todo sale de @atacknimal/content (versión de balance vigente).
 */
import {
  ANIMALS,
  getBalanceSet,
  getFacts,
  getImage,
  type AnimalFacts,
  type AnimalImage,
  type BalanceSet,
} from '@atacknimal/content';
import { ATTRIBUTES, type AnimalProfile, type Attribute, type Habitat } from '@atacknimal/engine';

export interface AnimalEntry {
  readonly id: string;
  readonly name: string;
  readonly scientificName: string;
  readonly role: string;
  readonly profile: AnimalProfile;
  readonly image: AnimalImage | undefined;
  readonly facts: AnimalFacts | undefined;
}

export const BALANCE: BalanceSet = getBalanceSet();

export const CATALOG: readonly AnimalEntry[] = ANIMALS.map((animal) => {
  const profile = BALANCE.roster.find((p) => p.id === animal.id);
  if (profile === undefined) throw new Error(`Sin perfil de balance: ${animal.id}`);
  return {
    id: animal.id,
    name: animal.name,
    scientificName: animal.scientificName,
    role: animal.role,
    profile,
    image: getImage(animal.id),
    facts: getFacts(animal.id),
  };
});

export function findEntry(id: string | undefined): AnimalEntry | undefined {
  return CATALOG.find((entry) => entry.id === id);
}

export type StatTone = 'peak' | 'mid' | 'valley';

/** Pico o valle según las reglas de presupuesto de la versión de balance (docs/BALANCE.md §2). */
export function statTone(value: number): StatTone {
  if (value >= BALANCE.budget.peak) return 'peak';
  if (value <= BALANCE.budget.valley) return 'valley';
  return 'mid';
}

/** Atributos pico de un animal, de mayor a menor: su identidad en el juego. */
export function peaks(profile: AnimalProfile): Attribute[] {
  return ATTRIBUTES.filter((a) => statTone(profile.stats[a]) === 'peak').sort(
    (a, b) => profile.stats[b] - profile.stats[a],
  );
}

/** El animal está en su elemento (Nativo o Adaptado) en ese hábitat. */
export function thrivesIn(entry: AnimalEntry, habitat: Habitat): boolean {
  const affinity = entry.profile.affinities[habitat];
  return affinity === 'native' || affinity === 'adapted';
}

export function matchesSearch(entry: AnimalEntry, text: string): boolean {
  const needle = normalize(text.trim());
  return (
    needle === '' ||
    normalize(entry.name).includes(needle) ||
    normalize(entry.scientificName).includes(needle)
  );
}

function normalize(text: string): string {
  // Quita tildes y diéresis: "aguila" encuentra "Águila", "pinguino" encuentra "Pingüino".
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}
