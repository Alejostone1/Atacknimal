import { X } from 'lucide-react';
import { findEntry } from '../content/catalog.ts';
import { cx } from '../ui/cx.ts';
import { AnimalPhoto } from './AnimalPhoto.tsx';
import styles from './TeamSlots.module.css';

interface TeamSlotsProps {
  team: readonly string[];
  size: number;
  /** Si se indica, cada puesto ocupado tiene un botón para sacar al animal del equipo. */
  onRemove?: (animalId: string) => void;
}

/** Los puestos del equipo: ocupados con la foto del animal o vacíos con su número. */
export function TeamSlots({ team, size, onRemove }: TeamSlotsProps) {
  return (
    <ol className={styles.slots} aria-label={`Equipo: ${String(team.length)} de ${String(size)}`}>
      {Array.from({ length: size }, (_, index) => {
        const entry = findEntry(team[index]);
        if (entry === undefined) {
          return (
            <li key={`empty-${String(index)}`} className={cx(styles.slot, styles.empty)}>
              <span className="mono">{index + 1}</span>
            </li>
          );
        }
        return (
          <li key={entry.id} className={styles.slot}>
            <AnimalPhoto
              entry={entry}
              className={styles.photo}
              sizes="(min-width: 720px) 240px, 45vw"
            />
            <span className={styles.name}>{entry.name}</span>
            {onRemove !== undefined && (
              <button
                type="button"
                className={styles.remove}
                aria-label={`Quitar ${entry.name} del equipo`}
                onClick={() => {
                  onRemove(entry.id);
                }}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}
