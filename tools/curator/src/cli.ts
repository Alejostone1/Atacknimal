/**
 * Herramienta de curación de contenido (solo desarrollo). Uso:
 *   npm run curate -- facts                 Estado de conservación y Wikipedia desde Wikidata
 *   npm run curate -- search                Busca candidatas y genera la galería de revisión
 *   npm run curate -- propose               Propone la mejor candidata para cada animal sin foto
 *   npm run curate -- pick <animal> <#>     Elige otra candidata (número de la galería)
 *   npm run curate -- focus <animal> <x> <y> Punto que debe verse al recortar (0–1)
 *   npm run curate -- approve <animal|all>  Marca como aprobada tras revisarla una persona
 *   npm run curate -- habitats              Busca fotos de los 4 hábitats (galería en out/)
 *   npm run curate -- habitat <hábitat> <#> Elige la foto de un hábitat (queda propuesta)
 */
import {
  ANIMALS,
  animalImageSchema,
  habitatImageSchema,
  type AnimalImage,
  type HabitatImage,
} from '@atacknimal/content';
import { HABITATS, isHabitat } from '@atacknimal/engine';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { rank, type Candidate } from './candidates.ts';
import { commonsCandidates, search as commonsSearch } from './commons.ts';
import { renderGallery } from './gallery.ts';
import { inaturalistCandidates } from './inaturalist.ts';
import { findTaxon, taxonFacts } from './wikidata.ts';

const ROOT = join(import.meta.dirname, '..', '..', '..');
const IMAGES_FILE = join(ROOT, 'packages', 'content', 'data', 'images.json');
const FACTS_FILE = join(ROOT, 'packages', 'content', 'data', 'facts.json');
const OUT_DIR = join(import.meta.dirname, '..', 'out');
const CANDIDATES_FILE = join(OUT_DIR, 'candidates.json');
const GALLERY_FILE = join(OUT_DIR, 'gallery.html');
const HABITATS_FILE = join(ROOT, 'packages', 'content', 'data', 'habitats.json');
const HABITAT_CANDIDATES_FILE = join(OUT_DIR, 'habitat-candidates.json');
const HABITAT_GALLERY_FILE = join(OUT_DIR, 'habitats.html');

/**
 * Búsquedas en Commons por hábitat: primero lo que la foto representa (P180) y luego texto.
 * Solo "Quality images": paisajes amplios y bien expuestos para usarlos a sangre en la interfaz.
 */
const HABITAT_QUERIES = {
  air: ['haswbstatement:P180=Q527', 'cumulus clouds sky'],
  water: ['haswbstatement:P180=Q9430', 'ocean waves open sea'],
  land: ['haswbstatement:P180=Q42320', 'savanna landscape'],
  trees: ['rainforest canopy', 'tropical rainforest'],
} as const;

const today = new Date().toISOString().slice(0, 10);
const [command, ...args] = process.argv.slice(2);

const writeJson = (file: string, data: unknown): void => {
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
};
const readImages = (): AnimalImage[] =>
  animalImageSchema.array().parse(JSON.parse(readFileSync(IMAGES_FILE, 'utf8')));
const readCandidates = (): Record<string, Candidate[]> => {
  if (!existsSync(CANDIDATES_FILE)) throw new Error('Primero ejecuta: npm run curate -- search');
  return JSON.parse(readFileSync(CANDIDATES_FILE, 'utf8')) as Record<string, Candidate[]>;
};
const saveImages = (images: readonly AnimalImage[]): void => {
  writeJson(IMAGES_FILE, animalImageSchema.array().parse(images));
  writeFileSync(GALLERY_FILE, renderGallery(ANIMALS, readCandidates(), images));
};
const log = (line: string): void => {
  process.stdout.write(`${line}\n`);
};

/** Sustituye la imagen activa de un animal: una propuesta se descarta, una aprobada se retira. */
function choose(
  images: readonly AnimalImage[],
  candidate: Candidate,
  animalId: string,
): AnimalImage[] {
  const kept = images.flatMap((image): AnimalImage[] => {
    if (image.animalId !== animalId || image.status === 'retired') return [image];
    return image.status === 'approved' ? [{ ...image, status: 'retired' }] : [];
  });
  return [
    ...kept,
    { ...candidate.image, animalId, focalPoint: { x: 0.5, y: 0.5 }, status: 'proposed' },
  ];
}

switch (command) {
  case 'facts': {
    const taxa = [];
    for (const animal of ANIMALS) {
      taxa.push({ animalId: animal.id, wikidataId: await findTaxon(animal.scientificName) });
    }
    const facts = await taxonFacts(taxa, today);
    writeJson(FACTS_FILE, facts);
    for (const f of facts)
      log(`${f.animalId}: ${f.wikidataId} · ${f.conservationStatus?.value ?? 'sin estado'}`);
    break;
  }

  case 'search': {
    mkdirSync(OUT_DIR, { recursive: true });
    const all: Record<string, Candidate[]> = {};
    for (const animal of ANIMALS) {
      const wikidataId = await findTaxon(animal.scientificName);
      const found = [
        ...(await commonsCandidates(wikidataId, today)),
        ...(await inaturalistCandidates(animal.scientificName, today)),
      ].map((c) => ({ ...c, image: { ...c.image, animalId: animal.id } }));
      all[animal.id] = rank(found);
      log(`${animal.id}: ${String(found.length)} candidatas con licencia abierta`);
    }
    writeJson(CANDIDATES_FILE, all);
    writeFileSync(GALLERY_FILE, renderGallery(ANIMALS, all, readImages()));
    log(`Galería: ${GALLERY_FILE}`);
    break;
  }

  case 'propose': {
    const candidates = readCandidates();
    let images = readImages();
    for (const animal of ANIMALS) {
      if (images.some((i) => i.animalId === animal.id && i.status !== 'retired')) continue;
      const best = candidates[animal.id]?.find((c) => c.warnings.length === 0);
      if (best === undefined) {
        log(`${animal.id}: sin candidata limpia; elige una con pick`);
        continue;
      }
      images = choose(images, best, animal.id);
      log(`${animal.id}: propuesta ${best.image.sourceId}`);
    }
    saveImages(images);
    break;
  }

  case 'pick': {
    const [animalId, index] = args;
    const candidate =
      animalId === undefined ? undefined : readCandidates()[animalId]?.[Number(index)];
    if (animalId === undefined || candidate === undefined) {
      throw new Error('Uso: npm run curate -- pick <animal> <número de la galería>');
    }
    saveImages(choose(readImages(), candidate, animalId));
    log(`${animalId}: elegida ${candidate.image.sourceId} (pendiente de aprobar)`);
    break;
  }

  case 'focus': {
    const [animalId, x, y] = args;
    const point = { x: Number(x), y: Number(y) };
    if (animalId === undefined || [point.x, point.y].some((v) => !(v >= 0 && v <= 1))) {
      throw new Error('Uso: npm run curate -- focus <animal> <x 0–1> <y 0–1>');
    }
    saveImages(
      readImages().map((image) =>
        image.animalId === animalId && image.status !== 'retired'
          ? { ...image, focalPoint: point }
          : image,
      ),
    );
    log(`${animalId}: punto focal (${String(point.x)}, ${String(point.y)})`);
    break;
  }

  case 'approve': {
    const [target] = args;
    if (target === undefined) throw new Error('Uso: npm run curate -- approve <animal|all>');
    const images = readImages().map((image) =>
      image.status === 'proposed' && (target === 'all' || image.animalId === target)
        ? { ...image, status: 'approved' as const }
        : image,
    );
    saveImages(images);
    log(
      `Aprobadas: ${images
        .filter((i) => i.status === 'approved')
        .map((i) => i.animalId)
        .join(', ')}`,
    );
    break;
  }

  case 'habitats': {
    mkdirSync(OUT_DIR, { recursive: true });
    const all: Record<string, Candidate[]> = {};
    for (const habitat of HABITATS) {
      const found: Candidate[] = [];
      for (const text of HABITAT_QUERIES[habitat]) {
        const page = await commonsSearch(
          `${text} incategory:Quality_images filetype:bitmap`,
          true,
          today,
        );
        for (const candidate of page) {
          if (!found.some((c) => c.image.sourceId === candidate.image.sourceId))
            found.push(candidate);
        }
      }
      // Paisaje: la interfaz las recorta en tiras anchas.
      all[habitat] = rank(found.filter((c) => c.image.width > c.image.height));
      log(`${habitat}: ${String(all[habitat].length)} candidatas apaisadas con licencia abierta`);
    }
    writeJson(HABITAT_CANDIDATES_FILE, all);
    writeFileSync(
      HABITAT_GALLERY_FILE,
      `<!doctype html><meta charset="utf-8"><title>Hábitats</title><body style="font:14px sans-serif;background:#111;color:#eee">${HABITATS.map(
        (h) =>
          `<h2>${h}</h2><div style="display:flex;flex-wrap:wrap;gap:8px">${(all[h] ?? [])
            .slice(0, 12)
            .map(
              (c, i) =>
                `<figure style="margin:0;width:240px"><img src="${c.image.thumbnailUrl}" style="width:240px;height:135px;object-fit:cover"><figcaption>#${String(i)} · ${c.image.license}</figcaption></figure>`,
            )
            .join('')}</div>`,
      ).join('')}</body>`,
    );
    log(`Galería: ${HABITAT_GALLERY_FILE}`);
    break;
  }

  case 'habitat': {
    const [habitat, index] = args;
    const all = JSON.parse(readFileSync(HABITAT_CANDIDATES_FILE, 'utf8')) as Record<
      string,
      Candidate[]
    >;
    const candidate = habitat === undefined ? undefined : all[habitat]?.[Number(index)];
    if (habitat === undefined || !isHabitat(habitat) || candidate === undefined) {
      throw new Error(
        'Uso: npm run curate -- habitat <air|water|land|trees> <número de la galería>',
      );
    }
    const current = habitatImageSchema
      .array()
      .parse(JSON.parse(readFileSync(HABITATS_FILE, 'utf8')))
      .filter((i) => i.habitat !== habitat);
    // La candidata viene del buscador de animales: se valida sin su campo animalId.
    const chosen: HabitatImage = habitatImageSchema.parse({
      ...Object.fromEntries(Object.entries(candidate.image).filter(([key]) => key !== 'animalId')),
      habitat,
      focalPoint: { x: 0.5, y: 0.5 },
      status: 'proposed',
    });
    writeJson(HABITATS_FILE, habitatImageSchema.array().parse([...current, chosen]));
    log(`${habitat}: elegida ${candidate.image.sourceId}`);
    break;
  }

  case undefined:
  default:
    throw new Error(
      'Comandos: facts | search | propose | pick <animal> <#> | approve <animal|all>',
    );
}
