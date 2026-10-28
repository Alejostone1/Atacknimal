/**
 * Herramienta de curación de contenido (solo desarrollo). Uso:
 *   npm run curate -- facts                 Estado de conservación y Wikipedia desde Wikidata
 *   npm run curate -- search                Busca candidatas y genera la galería de revisión
 *   npm run curate -- propose               Propone la mejor candidata para cada animal sin foto
 *   npm run curate -- pick <animal> <#>     Elige otra candidata (número de la galería)
 *   npm run curate -- focus <animal> <x> <y> Punto que debe verse al recortar (0–1)
 *   npm run curate -- approve <animal|all>  Marca como aprobada tras revisarla una persona
 */
import { ANIMALS, animalImageSchema, type AnimalImage } from '@atacknimal/content';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { rank, type Candidate } from './candidates.ts';
import { commonsCandidates } from './commons.ts';
import { renderGallery } from './gallery.ts';
import { inaturalistCandidates } from './inaturalist.ts';
import { findTaxon, taxonFacts } from './wikidata.ts';

const ROOT = join(import.meta.dirname, '..', '..', '..');
const IMAGES_FILE = join(ROOT, 'packages', 'content', 'data', 'images.json');
const FACTS_FILE = join(ROOT, 'packages', 'content', 'data', 'facts.json');
const OUT_DIR = join(import.meta.dirname, '..', 'out');
const CANDIDATES_FILE = join(OUT_DIR, 'candidates.json');
const GALLERY_FILE = join(OUT_DIR, 'gallery.html');

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

  case undefined:
  default:
    throw new Error(
      'Comandos: facts | search | propose | pick <animal> <#> | approve <animal|all>',
    );
}
