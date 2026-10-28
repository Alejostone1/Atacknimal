import type { AnimalFacts, IucnCategory } from '@atacknimal/content';
import { getJson, query } from './http.ts';

const API = 'https://www.wikidata.org/w/api.php';

interface Entity {
  claims?: Record<string, { mainsnak?: { datavalue?: { value?: unknown } } }[] | undefined>;
  sitelinks?: Record<string, { title: string } | undefined>;
  labels?: Record<string, { value: string } | undefined>;
}

/**
 * Elemento de Wikidata cuyo nombre del taxón (P225) es exactamente `scientificName`.
 * El buscador a veces devuelve vacío: se prueba también con el nombre restringido a especies
 * (P105 = Q7432) y se confirma el P225 leyendo el elemento.
 */
export async function findTaxon(scientificName: string): Promise<string> {
  const searches = [
    `haswbstatement:"P225=${scientificName}"`,
    `"${scientificName}" haswbstatement:P105=Q7432`,
  ];
  for (const srsearch of searches) {
    const data = (await getJson(
      query(API, { action: 'query', list: 'search', format: 'json', srlimit: '5', srsearch }),
    )) as { query?: { search?: { title: string }[] } };
    const ids = (data.query?.search ?? []).map((result) => result.title);
    if (ids.length === 0) continue;
    const entities = await getEntities(ids, 'claims');
    const match = ids.find((id) =>
      entities[id]?.claims?.['P225']?.some((c) => c.mainsnak?.datavalue?.value === scientificName),
    );
    if (match !== undefined) return match;
  }
  throw new Error(`Wikidata no tiene el taxón ${scientificName}`);
}

async function getEntities(
  ids: readonly string[],
  props: string,
): Promise<Record<string, Entity | undefined>> {
  const data = (await getJson(
    query(API, {
      action: 'wbgetentities',
      format: 'json',
      ids: ids.join('|'),
      props,
      languages: 'es',
      sitefilter: 'eswiki',
    }),
  )) as { entities?: Record<string, Entity | undefined> };
  return data.entities ?? {};
}

/** Elementos de Wikidata de las categorías de la Lista Roja de la UICN. */
export const IUCN_BY_WIKIDATA: Readonly<Record<string, IucnCategory | undefined>> = {
  Q211005: 'LC',
  Q719675: 'NT',
  Q278113: 'VU',
  Q96377276: 'EN',
  Q11394: 'EN',
  Q219127: 'CR',
  Q239509: 'EW',
  Q237350: 'EX',
  Q3245245: 'DD',
};

/**
 * Datos reales automatizables con fiabilidad: estado de conservación UICN (P141) y artículo
 * de Wikipedia en español. La masa, la longitud y la velocidad de Wikidata son incompletas o
 * mezclan crías y adultos, así que se curan a mano con fuente (docs/ASSETS.md §5).
 */
export async function taxonFacts(
  taxa: readonly { animalId: string; wikidataId: string }[],
  today: string,
): Promise<AnimalFacts[]> {
  const entities = await getEntities(
    taxa.map((t) => t.wikidataId),
    'claims|sitelinks',
  );
  const statusOf = (entity: Entity | undefined): string | undefined => {
    const value = entity?.claims?.['P141']?.[0]?.mainsnak?.datavalue?.value as
      { id?: string } | undefined;
    return value?.id;
  };
  return taxa.map(({ animalId, wikidataId }) => {
    const entity = entities[wikidataId];
    const wikidataUrl = `https://www.wikidata.org/wiki/${wikidataId}`;
    const article = entity?.sitelinks?.['eswiki']?.title;
    const statusId = statusOf(entity);
    const statusLabel = statusId === undefined ? undefined : IUCN_BY_WIKIDATA[statusId];
    return {
      animalId,
      wikidataId,
      wikidataUrl,
      ...(article === undefined
        ? {}
        : {
            wikipediaUrl: `https://es.wikipedia.org/wiki/${encodeURIComponent(article.replace(/ /g, '_'))}`,
          }),
      ...(statusLabel === undefined
        ? {}
        : { conservationStatus: { value: statusLabel, source: wikidataUrl } }),
      retrievedAt: today,
    };
  });
}
