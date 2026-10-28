import { Link } from 'react-router';
import { peaks, type AnimalEntry } from '../content/catalog.ts';
import { ATTRIBUTE } from '../i18n/es.ts';
import { cx } from '../ui/cx.ts';
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

export function AnimalCard({ entry, to, onToggle, slot, blocked = false }: AnimalCardProps) {
  const body = (
    <>
      <AnimalPhoto entry={entry} />
      {slot !== undefined && (
        <span className={styles.slot} aria-hidden="true">
          <ClawMark className={styles.claw} />
          <span className="mono">{slot}</span>
        </span>
      )}
      <div className={styles.info}>
        <h3 className={styles.name}>{entry.name}</h3>
        <p className={cx('binomial', styles.binomial)}>{entry.scientificName}</p>
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

  const className = cx(
    styles.card,
    slot !== undefined && styles.selected,
    blocked && styles.blocked,
  );

  if (onToggle !== undefined) {
    return (
      <button
        type="button"
        className={className}
        aria-pressed={slot !== undefined}
        aria-disabled={blocked}
        aria-label={`${entry.name}${slot !== undefined ? `, en tu equipo (puesto ${String(slot)})` : ''}`}
        onClick={blocked ? undefined : onToggle}
      >
        {body}
      </button>
    );
  }
  return (
    <Link to={to ?? `/coleccion/${entry.id}`} className={className}>
      {body}
    </Link>
  );
}
