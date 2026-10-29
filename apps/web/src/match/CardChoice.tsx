import type { CardState } from '@atacknimal/engine';
import { Check } from 'lucide-react';
import type { AnimalEntry } from '../content/catalog.ts';
import { photoSet } from '../content/photo.ts';
import styles from './Match.module.css';

interface CardChoiceProps {
  entry: AnimalEntry | undefined;
  card: CardState;
  pressed: boolean;
  disabled?: boolean;
  /** Valor destacado (por ejemplo, "Peso 95" en la defensa). */
  detail?: string | undefined;
  label: string;
  onSelect: () => void;
}

/** Carta de tu equipo para atacar o defender: foto, nombre, valor y vitalidad de un vistazo. */
export function CardChoice({
  entry,
  card,
  pressed,
  disabled = false,
  detail,
  label,
  onSelect,
}: CardChoiceProps) {
  const ratio = card.maxHp === 0 ? 0 : card.hp / card.maxHp;
  return (
    <button
      type="button"
      className={styles.cardChoice}
      aria-pressed={pressed}
      aria-label={label}
      disabled={disabled}
      onClick={onSelect}
    >
      {entry?.image !== undefined && (
        <img
          {...photoSet(entry.image, '(min-width: 720px) 240px, 40vw')}
          alt=""
          className={styles.choicePhoto}
          style={{
            objectPosition: `${String(entry.image.focalPoint.x * 100)}% ${String(entry.image.focalPoint.y * 100)}%`,
          }}
        />
      )}
      <span className={styles.choiceText}>
        <span className={styles.choiceName}>{entry?.name ?? 'Carta'}</span>
        {detail !== undefined && <span className={styles.choiceDetail}>{detail}</span>}
        <span className={styles.choiceHp} data-low={ratio <= 0.3}>
          <span style={{ width: `${String(ratio * 100)}%` }} />
        </span>
      </span>
      {pressed && (
        <span className={styles.choiceCheck} aria-hidden="true">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
