import type { AnimalImage } from '@atacknimal/content';

/** Foto encontrada en un proveedor, todavía sin elegir. */
export interface Candidate {
  readonly image: Omit<AnimalImage, 'status' | 'focalPoint'>;
  /** Commons la marca como "Quality image" o "Featured picture". */
  readonly quality: boolean;
  readonly score: number;
  readonly warnings: readonly string[];
}

/** Palabras del título que indican un motivo para descartar o revisar con cuidado. */
const RULES: readonly { pattern: RegExp; penalty: number; warning: string }[] = [
  {
    pattern: /\b(kill|prey|carcass|dead|blood|meal|eating|feeding|hunt|chase|wound|injur|attack)/i,
    penalty: 6,
    warning: 'posible contenido de caza o sangre',
  },
  {
    pattern:
      /\b(skull|skeleton|museum|specimen|taxiderm|drawing|illustration|map|stamp|bone|plate|histoire|natural history of|engraving|lithograph|painting|sculpture|statue|figure|fig\.|MBA|mus[eé]e|coin|emblem|logo|toy|mosaic|B\.C|archaeolog|archeolog)\b/i,
    penalty: 8,
    warning: 'no es una foto de un animal vivo',
  },
  {
    pattern: /\b(cub|calf|chick|juvenile|baby|young|pup|egg|hatchling)/i,
    penalty: 3,
    warning: 'ejemplar joven',
  },
  { pattern: /\b(zoo|captive|tierpark|zoológico|aquarium)/i, penalty: 1, warning: 'en cautividad' },
];

/**
 * Puntuación para ordenar candidatas: encuadre apaisado (la carta recorta a 4:3), resolución,
 * calidad reconocida, licencia más simple y penalización por títulos problemáticos.
 */
export function scoreCandidate(
  image: Candidate['image'],
  quality: boolean,
): { score: number; warnings: string[] } {
  const ratio = image.width / image.height;
  let score = 0;
  if (ratio >= 1.2 && ratio <= 1.8) score += 2;
  else if (ratio < 1) score -= 3;
  if (image.width >= 2000) score += 2;
  else if (image.width >= 1200) score += 1;
  else if (image.width < 800) score -= 5;
  if (quality) score += 3;
  if (image.licenseId === 'cc0' || image.licenseId === 'public-domain') score += 1;
  else if (image.licenseId === 'cc-by') score += 0.5;

  const warnings: string[] = [];
  for (const rule of RULES) {
    if (rule.pattern.test(image.title)) {
      score -= rule.penalty;
      warnings.push(rule.warning);
    }
  }
  return { score, warnings };
}

export function rank(candidates: readonly Candidate[]): Candidate[] {
  return [...candidates].sort((a, b) => b.score - a.score);
}
