import type { AnimalEntry } from '../content/catalog.ts';
import styles from './AnimalPhoto.module.css';

interface AnimalPhotoProps {
  entry: AnimalEntry;
  /** `card`: miniatura ligera; `hero`: versión grande para la ficha. */
  variant?: 'card' | 'hero';
  className?: string | undefined;
}

/**
 * Foto real enlazada al proveedor (hotlink) y recortada por CSS según su punto focal:
 * no se generan archivos derivados (docs/ASSETS.md §4).
 */
export function AnimalPhoto({ entry, variant = 'card', className }: AnimalPhotoProps) {
  const { image } = entry;
  const classes = [styles.frame, styles[variant], className].filter(Boolean).join(' ');
  if (image === undefined) {
    return (
      <div className={classes}>
        <span className={styles.missing} aria-label={`${entry.name}: sin foto`}>
          {entry.name.charAt(0)}
        </span>
      </div>
    );
  }
  return (
    <div className={classes}>
      <img
        src={variant === 'hero' ? image.imageUrl : image.thumbnailUrl}
        alt={`${entry.name} (${entry.scientificName})`}
        loading={variant === 'hero' ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          objectPosition: `${String(image.focalPoint.x * 100)}% ${String(image.focalPoint.y * 100)}%`,
        }}
      />
    </div>
  );
}

/** Crédito obligatorio de la foto (autor, licencia y enlace a la fuente). */
export function PhotoCredit({ entry }: { entry: AnimalEntry }) {
  const { image } = entry;
  if (image === undefined) return null;
  return (
    <p className={styles.credit}>
      Foto:{' '}
      {image.authorUrl === undefined ? (
        image.author
      ) : (
        <a href={image.authorUrl} target="_blank" rel="noreferrer">
          {image.author}
        </a>
      )}{' '}
      ·{' '}
      {image.licenseUrl === undefined ? (
        image.license
      ) : (
        <a href={image.licenseUrl} target="_blank" rel="noreferrer">
          {image.license}
        </a>
      )}{' '}
      ·{' '}
      <a href={image.sourceUrl} target="_blank" rel="noreferrer">
        ver original
      </a>
    </p>
  );
}
