import { BookOpen, Info, Settings } from 'lucide-react';
import { Link } from 'react-router';
import { PhotoCredit } from '../components/AnimalPhoto.tsx';
import { Wordmark } from '../components/Brand.tsx';
import { CATALOG, findEntry } from '../content/catalog.ts';
import styles from './HomeScreen.module.css';

/** Foto de portada: el Águila en vuelo, el animal más reconocible del roster en movimiento. */
const HERO_ID = 'golden-eagle';

export function HomeScreen() {
  const hero = findEntry(HERO_ID);
  const image = hero?.image;

  return (
    <div className={styles.home}>
      {image !== undefined && (
        <img
          className={styles.backdrop}
          src={image.imageUrl}
          alt=""
          style={{
            objectPosition: `${String(image.focalPoint.x * 100)}% ${String(image.focalPoint.y * 100)}%`,
          }}
        />
      )}
      <div className={styles.content}>
        <header className={styles.brand}>
          <p className="eyebrow">Duelos tácticos con animales reales</p>
          <h1 className={styles.title}>
            <Wordmark size="xl" />
          </h1>
          <p className={styles.tagline}>El instinto decide. La estrategia gana.</p>
        </header>

        <nav className={styles.actions} aria-label="Menú principal">
          <Link to="/jugar" className="btn btn--primary btn--block">
            Jugar contra la IA
          </Link>
          <div className={styles.online}>
            <Link to="/sala" className="btn btn--ghost">
              Crear sala
            </Link>
            <Link to="/sala?modo=unirse" className="btn btn--ghost">
              Unirse con código
            </Link>
            <p className={styles.soon}>
              Online 1 vs 1 con código de sala. El QR llegará más adelante.
            </p>
          </div>
          <div className={styles.secondary}>
            <Link to="/coleccion" className={styles.link}>
              <BookOpen size={20} aria-hidden="true" />
              Colección
              <span className="mono">{CATALOG.length}</span>
            </Link>
            <Link to="/ajustes" className={styles.link}>
              <Settings size={20} aria-hidden="true" />
              Ajustes
            </Link>
            <Link to="/creditos" className={styles.link}>
              <Info size={20} aria-hidden="true" />
              Créditos
            </Link>
          </div>
        </nav>
      </div>
      {hero !== undefined && (
        <div className={styles.credit}>
          <PhotoCredit entry={hero} />
        </div>
      )}
    </div>
  );
}
