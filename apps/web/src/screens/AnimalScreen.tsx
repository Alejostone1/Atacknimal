import { cx } from '../ui/cx.ts';
import { ExternalLink } from 'lucide-react';
import { useParams } from 'react-router';
import { AnimalPhoto, PhotoCredit } from '../components/AnimalPhoto.tsx';
import { HabitatTable } from '../components/Habitats.tsx';
import { Screen } from '../components/Screen.tsx';
import { StatList } from '../components/StatList.tsx';
import { BALANCE, findEntry } from '../content/catalog.ts';
import { IUCN } from '../i18n/es.ts';
import { useMatchSetup } from '../state/stores.ts';
import { NotFoundScreen } from './NotFoundScreen.tsx';
import styles from './AnimalScreen.module.css';

export function AnimalScreen() {
  const { animalId } = useParams();
  const entry = findEntry(animalId);
  const { team, toggle } = useMatchSetup();
  if (entry === undefined) return <NotFoundScreen />;

  const inTeam = team.includes(entry.id);
  const teamFull = team.length >= BALANCE.ruleset.teamSize;
  const status = entry.facts?.conservationStatus;

  return (
    <Screen
      title={entry.name}
      eyebrow={entry.role}
      back="/coleccion"
      footer={
        <button
          type="button"
          className={`btn btn--block ${inTeam ? 'btn--ghost' : 'btn--primary'}`}
          disabled={!inTeam && teamFull}
          onClick={() => {
            toggle(entry.id);
          }}
        >
          {inTeam
            ? 'Quitar de mi equipo'
            : teamFull
              ? `Tu equipo ya tiene ${String(BALANCE.ruleset.teamSize)} animales`
              : 'Añadir a mi equipo'}
        </button>
      }
    >
      <div className={styles.layout}>
        <figure className={styles.figure}>
          <AnimalPhoto entry={entry} variant="hero" />
          <figcaption>
            <PhotoCredit entry={entry} />
          </figcaption>
        </figure>

        <div className={styles.details}>
          <div className={styles.identity}>
            <p className={cx('binomial', styles.binomial)}>{entry.scientificName}</p>
            {status !== undefined && (
              <a className={styles.iucn} href={status.source} target="_blank" rel="noreferrer">
                <span className={cx('mono', styles.code)}>{status.value}</span>
                <span>
                  {IUCN[status.value]}
                  <span className={styles.iucnSource}> · Lista Roja de la UICN, vía Wikidata</span>
                </span>
              </a>
            )}
          </div>

          <section className={styles.section} aria-labelledby="stats-title">
            <h2 id="stats-title" className={styles.heading}>
              Atributos
            </h2>
            <p className={styles.note}>
              En ámbar, sus picos: donde este animal destaca. Atenuados, sus puntos débiles.
            </p>
            <StatList entry={entry} />
          </section>

          <section className={styles.section} aria-labelledby="habitats-title">
            <h2 id="habitats-title" className={styles.heading}>
              Hábitats
            </h2>
            <p className={styles.note}>
              El hábitat del duelo suma o resta este valor al atributo que se compare.
            </p>
            <HabitatTable entry={entry} />
          </section>

          {entry.facts !== undefined && (
            <section className={styles.section} aria-labelledby="sources-title">
              <h2 id="sources-title" className={styles.heading}>
                Saber más
              </h2>
              <ul className={styles.links}>
                {entry.facts.wikipediaUrl !== undefined && (
                  <li>
                    <a href={entry.facts.wikipediaUrl} target="_blank" rel="noreferrer">
                      Wikipedia <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </li>
                )}
                <li>
                  <a href={entry.facts.wikidataUrl} target="_blank" rel="noreferrer">
                    Wikidata <ExternalLink size={14} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </section>
          )}
        </div>
      </div>
    </Screen>
  );
}
