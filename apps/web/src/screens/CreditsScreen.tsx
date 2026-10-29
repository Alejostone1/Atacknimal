import { HABITAT_IMAGES, type AnimalImage, type HabitatImage } from '@atacknimal/content';
import { Screen } from '../components/Screen.tsx';
import { CATALOG } from '../content/catalog.ts';
import { HABITAT } from '../i18n/es.ts';
import styles from './CreditsScreen.module.css';

const SOFTWARE: readonly { name: string; license: string; url: string }[] = [
  {
    name: 'Big Shoulders Display',
    license: 'SIL Open Font License',
    url: 'https://fonts.google.com/specimen/Big+Shoulders+Display',
  },
  {
    name: 'Barlow',
    license: 'SIL Open Font License',
    url: 'https://fonts.google.com/specimen/Barlow',
  },
  {
    name: 'IBM Plex Mono',
    license: 'SIL Open Font License',
    url: 'https://fonts.google.com/specimen/IBM+Plex+Mono',
  },
  { name: 'Iconos Lucide', license: 'ISC', url: 'https://lucide.dev/license' },
];

/** Crédito obligatorio de una foto: autor, licencia y enlace a la fuente. */
function CreditItem({ name, image }: { name: string; image: AnimalImage | HabitatImage }) {
  return (
    <li className={styles.item}>
      <img src={image.thumbnailUrl} alt="" loading="lazy" className={styles.thumb} />
      <div>
        <p className={styles.animal}>{name}</p>
        <p className={styles.meta}>
          {image.authorUrl === undefined ? (
            image.author
          ) : (
            <a href={image.authorUrl} target="_blank" rel="noreferrer">
              {image.author}
            </a>
          )}
          {' · '}
          {image.licenseUrl === undefined ? (
            image.license
          ) : (
            <a href={image.licenseUrl} target="_blank" rel="noreferrer">
              {image.license}
            </a>
          )}
          {' · '}
          <a href={image.sourceUrl} target="_blank" rel="noreferrer">
            {image.provider === 'inaturalist' ? 'iNaturalist' : 'Wikimedia Commons'}
          </a>
        </p>
      </div>
    </li>
  );
}

export function CreditsScreen() {
  return (
    <Screen title="Créditos" eyebrow="Fotos, datos y recursos" back="/">
      <section className={styles.section} aria-labelledby="photos-title">
        <h2 id="photos-title" className={styles.heading}>
          Fotografías
        </h2>
        <p className={styles.note}>
          Todas son fotos reales publicadas con licencias abiertas. Se muestran enlazadas a su
          fuente original.
        </p>
        <ul className={styles.list}>
          {CATALOG.map((entry) =>
            entry.image === undefined ? null : (
              <CreditItem key={entry.id} name={entry.name} image={entry.image} />
            ),
          )}
          {HABITAT_IMAGES.filter((image) => image.status !== 'retired').map((image) => (
            <CreditItem
              key={image.habitat}
              name={`Hábitat: ${HABITAT[image.habitat].label}`}
              image={image}
            />
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="data-title">
        <h2 id="data-title" className={styles.heading}>
          Datos de las especies
        </h2>
        <p className={styles.note}>
          Estado de conservación (Lista Roja de la UICN) y enlaces a Wikipedia obtenidos de{' '}
          <a href="https://www.wikidata.org" target="_blank" rel="noreferrer">
            Wikidata
          </a>{' '}
          (CC0). Los atributos de juego son valores de diseño, no mediciones científicas.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="software-title">
        <h2 id="software-title" className={styles.heading}>
          Tipografías e iconos
        </h2>
        <ul className={styles.simple}>
          {SOFTWARE.map((item) => (
            <li key={item.name}>
              <a href={item.url} target="_blank" rel="noreferrer">
                {item.name}
              </a>{' '}
              · {item.license}
            </li>
          ))}
        </ul>
      </section>
    </Screen>
  );
}
