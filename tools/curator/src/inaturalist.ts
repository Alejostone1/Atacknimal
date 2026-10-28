import { scoreCandidate, type Candidate } from './candidates.ts';
import { getJson, query } from './http.ts';
import { inaturalistLicense } from './licenses.ts';

const API = 'https://api.inaturalist.org/v1/observations';

const LICENSE_URLS: Readonly<Record<string, string>> = {
  cc0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'cc-by': 'https://creativecommons.org/licenses/by/4.0/',
  'cc-by-sa': 'https://creativecommons.org/licenses/by-sa/4.0/',
};

interface Observation {
  user?: { login?: string; name?: string | null };
  photos?: {
    id: number;
    url: string;
    license_code: string | null;
    attribution: string;
    original_dimensions?: { width: number; height: number } | null;
  }[];
}

/**
 * Fotos de observaciones "research grade" (animales silvestres identificados por la comunidad),
 * solo con licencias abiertas. Las licencias de iNaturalist son por foto, no por observación.
 */
export async function inaturalistCandidates(
  scientificName: string,
  today: string,
): Promise<Candidate[]> {
  const data = (await getJson(
    query(API, {
      taxon_name: scientificName,
      quality_grade: 'research',
      photo_license: 'cc0,cc-by,cc-by-sa',
      order_by: 'votes',
      photos: 'true',
      per_page: '12',
    }),
  )) as { results?: Observation[] };

  return (data.results ?? []).flatMap((observation): Candidate[] => {
    const photo = observation.photos?.[0];
    const licenseId = inaturalistLicense(photo?.license_code);
    const size = photo?.original_dimensions;
    if (photo === undefined || licenseId === null || size == null || photo.license_code === null) {
      return [];
    }
    const author =
      /\(c\)\s*([^,]+)/.exec(photo.attribution)?.[1]?.trim() ??
      observation.user?.name ??
      observation.user?.login ??
      'Autor desconocido';
    const login = observation.user?.login;
    const license = photo.license_code.toUpperCase().replace(/-/g, ' ');
    const licenseUrl = LICENSE_URLS[photo.license_code];
    const image: Candidate['image'] = {
      animalId: '',
      provider: 'inaturalist',
      sourceId: String(photo.id),
      title: `${scientificName} (iNaturalist ${String(photo.id)})`,
      imageUrl: photo.url.replace('/square.', '/large.'),
      thumbnailUrl: photo.url.replace('/square.', '/medium.'),
      width: size.width,
      height: size.height,
      sourceUrl: `https://www.inaturalist.org/photos/${String(photo.id)}`,
      author,
      ...(login === undefined ? {} : { authorUrl: `https://www.inaturalist.org/people/${login}` }),
      licenseId,
      license,
      ...(licenseUrl === undefined ? {} : { licenseUrl }),
      attribution: `${author} · ${license} · iNaturalist`,
      retrievedAt: today,
    };
    return [{ image, quality: false, ...scoreCandidate(image, false) }];
  });
}
