import { HABITATS } from '@atacknimal/engine';
import { z } from 'zod';

/**
 * Licencias permitidas (docs/ASSETS.md §2). Se excluyen NC y ND para no bloquear
 * una futura publicación comercial ni la adaptación de la imagen a la carta.
 */
export const LICENSE_IDS = [
  'cc0',
  'public-domain',
  'cc-by',
  'cc-by-sa',
  'unsplash',
  'pexels',
] as const;
export type LicenseId = (typeof LICENSE_IDS)[number];

export const IMAGE_PROVIDERS = ['wikimedia-commons', 'inaturalist', 'unsplash', 'pexels'] as const;

/**
 * - `proposed`: elegida por la herramienta de curación, pendiente de revisión humana.
 * - `approved`: revisada por una persona (especie correcta, sin contenido sangriento).
 * - `retired`: ya no se usa; se conserva por trazabilidad.
 */
export const IMAGE_STATUSES = ['proposed', 'approved', 'retired'] as const;

const url = z.url({ protocol: /^https$/ });

export const animalImageSchema = z.strictObject({
  animalId: z.string().min(1),
  provider: z.enum(IMAGE_PROVIDERS),
  sourceId: z.string().min(1),
  title: z.string().min(1),
  /** URL que usa la aplicación (hotlink al proveedor). */
  imageUrl: url,
  thumbnailUrl: url,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** Página original del recurso. */
  sourceUrl: url,
  author: z.string().min(1),
  authorUrl: url.optional(),
  licenseId: z.enum(LICENSE_IDS),
  /** Nombre de la licencia tal como lo publica el proveedor (por ejemplo, "CC BY-SA 4.0"). */
  license: z.string().min(1),
  licenseUrl: url.optional(),
  /** Texto de atribución listo para mostrar. */
  attribution: z.string().min(1),
  /** Punto que debe quedar visible al recortar la foto en la carta (0–1). */
  focalPoint: z.strictObject({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }),
  retrievedAt: z.iso.date(),
  status: z.enum(IMAGE_STATUSES),
});

/** Categorías de la Lista Roja de la UICN (la interfaz traduce el código a texto). */
export const IUCN_CATEGORIES = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD'] as const;
export type IucnCategory = (typeof IUCN_CATEGORIES)[number];

const sourced = <T extends z.ZodType>(value: T) => z.strictObject({ value, source: url });

/**
 * Datos zoológicos reales. El motor nunca los lee: son contenido para la Colección
 * (docs/BALANCE.md §11). Cada dato lleva su fuente.
 */
export const animalFactsSchema = z.strictObject({
  animalId: z.string().min(1),
  wikidataId: z.string().regex(/^Q\d+$/),
  wikidataUrl: url,
  wikipediaUrl: url.optional(),
  conservationStatus: sourced(z.enum(IUCN_CATEGORIES)).optional(),
  massKg: sourced(z.number().positive()).optional(),
  lengthM: sourced(z.number().positive()).optional(),
  speedKmh: sourced(z.number().positive()).optional(),
  retrievedAt: z.iso.date(),
});

/**
 * Foto que representa un hábitat en la interfaz (cielo, océano, sabana, selva). Mismas reglas de
 * licencia y atribución que las fotos de animales (docs/ASSETS.md).
 */
export const habitatImageSchema = animalImageSchema
  .omit({ animalId: true })
  .extend({ habitat: z.enum(HABITATS) });

export type AnimalImage = z.infer<typeof animalImageSchema>;
export type HabitatImage = z.infer<typeof habitatImageSchema>;
export type AnimalFacts = z.infer<typeof animalFactsSchema>;
export type ImageStatus = (typeof IMAGE_STATUSES)[number];
