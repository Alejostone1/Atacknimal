import { getHabitatImage } from '@atacknimal/content';
import type { Habitat } from '@atacknimal/engine';
import { Check } from 'lucide-react';
import { photoSet } from '../content/photo.ts';
import { HABITAT } from '../i18n/es.ts';
import { cx } from '../ui/cx.ts';
import styles from './HabitatTile.module.css';

interface HabitatTileProps {
  habitat: Habitat;
  pressed: boolean;
  disabled?: boolean;
  /** Texto pequeño bajo el nombre (por ejemplo, por qué no está disponible). */
  note?: string | undefined;
  onSelect: () => void;
}

/**
 * Hábitat como una ficha con foto real (cielo, mar, llanura, bosque), no como un icono.
 * La foto es decorativa: el nombre y el estado los lee el lector de pantalla.
 */
export function HabitatTile({
  habitat,
  pressed,
  disabled = false,
  note,
  onSelect,
}: HabitatTileProps) {
  const image = getHabitatImage(habitat);
  const { label, scene, icon: Icon } = HABITAT[habitat];
  return (
    <button
      type="button"
      className={cx(styles.tile, image === undefined && styles.noPhoto)}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onSelect}
    >
      {image !== undefined && (
        <img
          {...photoSet(image, '(min-width: 720px) 220px, 50vw')}
          alt=""
          className={styles.photo}
          style={{
            objectPosition: `${String(image.focalPoint.x * 100)}% ${String(image.focalPoint.y * 100)}%`,
          }}
          decoding="async"
        />
      )}
      <span className={styles.shade} aria-hidden="true" />
      <span className={styles.text}>
        <span className={styles.label}>
          <Icon size={16} aria-hidden="true" /> {label}
        </span>
        <span className={styles.scene}>{note ?? scene}</span>
      </span>
      {pressed && (
        <span className={styles.check} aria-hidden="true">
          <Check size={16} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
