import { scoreCandidate, type Candidate } from './candidates.ts';
import { getJson, query } from './http.ts';
import { commonsLicense, plainAuthor } from './licenses.ts';

const API = 'https://commons.wikimedia.org/w/api.php';
/** Wikimedia solo sirve miniaturas en anchos estándar (500, 960 y 1280 sí; 640 devuelve 400). */
const DISPLAY_WIDTH = 1280;
const THUMB_WIDTH = 500;

interface CommonsPage {
  title: string;
  imageinfo?: {
    width: number;
    height: number;
    thumburl?: string;
    descriptionurl: string;
    extmetadata?: Record<string, { value?: string } | undefined>;
  }[];
}

/**
 * Fotos de Commons que representan la especie (`depicts` = P180 en Wikidata).
 * Primero las reconocidas como "Quality images"; si hay pocas, cualquier foto que la represente.
 */
export async function commonsCandidates(wikidataId: string, today: string): Promise<Candidate[]> {
  const quality = await search(
    `haswbstatement:P180=${wikidataId} incategory:Quality_images filetype:bitmap`,
    true,
    today,
  );
  const general =
    quality.length >= 6
      ? []
      : await search(`haswbstatement:P180=${wikidataId} filetype:bitmap`, false, today);
  const seen = new Set(quality.map((c) => c.image.sourceId));
  return [...quality, ...general.filter((c) => !seen.has(c.image.sourceId))];
}

export async function search(text: string, quality: boolean, today: string): Promise<Candidate[]> {
  const data = (await getJson(
    query(API, {
      action: 'query',
      format: 'json',
      formatversion: '2',
      generator: 'search',
      gsrnamespace: '6',
      gsrlimit: '20',
      gsrsearch: text,
      prop: 'imageinfo',
      iiprop: 'url|size|extmetadata',
      iiurlwidth: String(DISPLAY_WIDTH),
    }),
  )) as { query?: { pages?: CommonsPage[] } };

  return (data.query?.pages ?? []).flatMap((page): Candidate[] => {
    const info = page.imageinfo?.[0];
    const meta = info?.extmetadata ?? {};
    const licenseId = commonsLicense(meta['License']?.value);
    if (info?.thumburl === undefined || licenseId === null) return [];

    const author = plainAuthor(meta['Artist']?.value);
    const license = meta['LicenseShortName']?.value ?? licenseId;
    const licenseUrl = meta['LicenseUrl']?.value?.replace(/^http:/, 'https:');
    const image: Candidate['image'] = {
      animalId: '',
      provider: 'wikimedia-commons',
      sourceId: page.title,
      title: page.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, ''),
      imageUrl: info.thumburl,
      thumbnailUrl: info.thumburl.replace(
        `/${String(DISPLAY_WIDTH)}px-`,
        `/${String(THUMB_WIDTH)}px-`,
      ),
      width: info.width,
      height: info.height,
      sourceUrl: info.descriptionurl,
      author: author.name || 'Autor desconocido',
      ...(author.url === undefined ? {} : { authorUrl: author.url }),
      licenseId,
      license,
      ...(licenseUrl?.startsWith('https://') ? { licenseUrl } : {}),
      attribution: `${author.name || 'Autor desconocido'} · ${license} · Wikimedia Commons`,
      retrievedAt: today,
    };
    const scored = scoreCandidate(image, quality);
    // Un "autor" largo suele traer notas, condiciones de cortesía o datos de contacto del autor.
    if (image.author.length > 80) {
      scored.score -= 4;
      scored.warnings.push('autoría con texto largo: revisar condiciones y datos personales');
    }
    return [{ image, quality, ...scored }];
  });
}
