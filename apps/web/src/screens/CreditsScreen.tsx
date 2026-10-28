import { Screen } from '../components/Screen.tsx';
import { CATALOG } from '../content/catalog.ts';
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
              <li key={entry.id} className={styles.item}>
                <img
                  src={entry.image.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  className={styles.thumb}
                />
                <div>
                  <p className={styles.animal}>{entry.name}</p>
                  <p className={styles.meta}>
                    {entry.image.authorUrl === undefined ? (
                      entry.image.author
                    ) : (
                      <a href={entry.image.authorUrl} target="_blank" rel="noreferrer">
                        {entry.image.author}
                      </a>
                    )}
                    {' · '}
                    {entry.image.licenseUrl === undefined ? (
                      entry.image.license
                    ) : (
                      <a href={entry.image.licenseUrl} target="_blank" rel="noreferrer">
                        {entry.image.license}
                      </a>
                    )}
                    {' · '}
                    <a href={entry.image.sourceUrl} target="_blank" rel="noreferrer">
                      {entry.image.provider === 'inaturalist' ? 'iNaturalist' : 'Wikimedia Commons'}
                    </a>
                  </p>
                </div>
              </li>
            ),
          )}
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
