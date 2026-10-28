import { describe, expect, it } from 'vitest';
import { scoreCandidate, type Candidate } from './candidates.ts';
import { commonsLicense, inaturalistLicense, plainAuthor } from './licenses.ts';

describe('licencias', () => {
  it.each([
    ['cc-by-sa-4.0', 'cc-by-sa'],
    ['cc-by-2.0', 'cc-by'],
    ['cc0', 'cc0'],
    ['pd', 'public-domain'],
    ['cc-by-nc-sa-4.0', null],
    ['cc-by-nd-2.0', null],
    ['arr', null],
    [undefined, null],
  ])('Commons %s → %s', (code, expected) => {
    expect(commonsLicense(code)).toBe(expected);
  });

  it('iNaturalist solo acepta CC0, CC BY y CC BY-SA', () => {
    expect(inaturalistLicense('cc-by')).toBe('cc-by');
    expect(inaturalistLicense('cc-by-nc')).toBeNull();
    expect(inaturalistLicense(null)).toBeNull();
  });
});

describe('autor', () => {
  it('convierte el HTML de Commons en texto y enlace https', () => {
    expect(
      plainAuthor(
        '<a href="//commons.wikimedia.org/wiki/User:Giles_Laurent" title="x">Giles Laurent</a>',
      ),
    ).toEqual({
      name: 'Giles Laurent',
      url: 'https://commons.wikimedia.org/wiki/User:Giles_Laurent',
    });
    expect(plainAuthor('Jane &amp; John')).toEqual({ name: 'Jane & John' });
  });
});

describe('puntuación', () => {
  const base: Candidate['image'] = {
    animalId: 'cheetah',
    provider: 'wikimedia-commons',
    sourceId: 'File:x.jpg',
    title: 'Cheetah resting',
    imageUrl: 'https://upload.wikimedia.org/x.jpg',
    thumbnailUrl: 'https://upload.wikimedia.org/x.jpg',
    width: 3000,
    height: 2000,
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:x.jpg',
    author: 'A',
    licenseId: 'cc-by-sa',
    license: 'CC BY-SA 4.0',
    attribution: 'A · CC BY-SA 4.0 · Wikimedia Commons',
    retrievedAt: '2026-10-28',
  };

  it('prefiere fotos apaisadas, grandes y reconocidas por su calidad', () => {
    expect(scoreCandidate(base, true).score).toBeGreaterThan(scoreCandidate(base, false).score);
    expect(scoreCandidate({ ...base, width: 1000, height: 1500 }, false).score).toBeLessThan(
      scoreCandidate(base, false).score,
    );
  });

  it('penaliza y avisa de títulos con caza, crías o restos', () => {
    expect(scoreCandidate({ ...base, title: 'Cheetah after chase' }, true).warnings).toEqual([
      'posible contenido de caza o sangre',
    ]);
    expect(scoreCandidate({ ...base, title: 'Cheetah cub' }, true).warnings).toEqual([
      'ejemplar joven',
    ]);
    expect(scoreCandidate({ ...base, title: 'Cheetah skull' }, true).score).toBeLessThan(0);
  });

  it('detecta láminas, grabados y obras de museo que Commons asocia a la especie', () => {
    for (const title of [
      'Ichthyologie; ou, Histoire naturelle des poissons (Plate 119)',
      'Crocodile-MBA Lyon 1970-486-IMG 0193',
      'Tiger engraving 1850',
    ]) {
      expect(scoreCandidate({ ...base, title }, true).warnings).toContain(
        'no es una foto de un animal vivo',
      );
    }
  });
});
