import { Link } from 'react-router';
import { peaks, type AnimalEntry } from '../content/catalog.ts';
import { ATTRIBUTE } from '../i18n/es.ts';
import { cx } from '../ui/cx.ts';
import { tiltHandlers } from '../ui/tilt.ts';
import { AnimalPhoto } from './AnimalPhoto.tsx';
import { ClawMark } from './Brand.tsx';
import { HabitatDots } from './Habitats.tsx';
import styles from './AnimalCard.module.css';

interface AnimalCardProps {
  entry: AnimalEntry;
  /** Enlace a la ficha (Colección). */
  to?: string;
  /** Alternar en el equipo (Selección de equipo). */
  onToggle?: () => void;
  /** Posición en el equipo (1–4) si está elegido. */
  slot?: number;
  /** El equipo está completo y esta carta no forma parte de él. */
  blocked?: boolean;
}

/**
 * Carta de animal al estilo de un juego de cartas: foto vertical a sangre con el nombre encima,
 * picos y afinidades debajo. Se inclina bajo el ratón; al elegirla se eleva y recibe el zarpazo.
 */
export function AnimalCard({ entry, to, onToggle, slot, blocked = false }: AnimalCardProps) {
  const chosen = slot !== undefined;
  const body = (
    <>
      <div className={styles.art}>
        <AnimalPhoto
          entry={entry}
          className={styles.photo}
          sizes="(min-width: 720px) 360px, 75vw"
        />
        <span className={styles.shine} aria-hidden="true" />
        <div className={styles.title}>
          <h3 className={styles.name}>{entry.name}</h3>
          <p className={cx('binomial', styles.binomial)}>{entry.scientificName}</p>
        </div>
        {chosen && (
          <>
            <span className={styles.slash} aria-hidden="true">
              <ClawMark />
            </span>
            <span className={styles.slot} aria-hidden="true">
              <span className="mono">{slot}</span>
            </span>
          </>
        )}
      </div>
      <div className={styles.info}>
        <ul className={styles.peaks} aria-label="Atributos pico">
          {peaks(entry.profile).map((attribute) => {
            const Icon = ATTRIBUTE[attribute].icon;
            return (
              <li key={attribute} className={styles.peak}>
                <Icon size={13} aria-hidden="true" />
                <span className="visually-hidden">{ATTRIBUTE[attribute].label}</span>
                <span className="mono">{entry.profile.stats[attribute]}</span>
              </li>
            );
          })}
        </ul>
        <HabitatDots entry={entry} />
      </div>
    </>
  );

  const className = cx(styles.card, chosen && styles.selected, blocked && styles.blocked);

  if (onToggle !== undefined) {
    return (
      <button
        type="button"
        className={className}
        aria-pressed={chosen}
        aria-disabled={blocked}
        aria-label={`${entry.name}${chosen ? `, en tu equipo (puesto ${String(slot)})` : ''}`}
        onClick={blocked ? undefined : onToggle}
        {...tiltHandlers}
      >
        {body}
      </button>
    );
  }
  return (
    <Link to={to ?? `/coleccion/${entry.id}`} className={className} {...tiltHandlers}>
      {body}
    </Link>
  );
}
