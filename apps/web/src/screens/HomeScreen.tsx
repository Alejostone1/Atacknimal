import { BookOpen, Hash, Info, QrCode, Settings, Swords } from 'lucide-react';
import { AnimatePresence, m, stagger, useReducedMotionConfig } from 'motion/react';
import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { PhotoCredit } from '../components/AnimalPhoto.tsx';
import { AnimatedWordmark, ClawMark } from '../components/Brand.tsx';
import { CATALOG, findEntry, peaks, type AnimalEntry } from '../content/catalog.ts';
import { photoSet } from '../content/photo.ts';
import { ATTRIBUTE } from '../i18n/es.ts';
import { cx } from '../ui/cx.ts';
import styles from './HomeScreen.module.css';

/** Animales de portada: depredadores reconocibles de los cuatro hábitats, en ese orden de rotación. */
const HERO_IDS = ['lion', 'great-white-shark', 'golden-eagle', 'tiger', 'orca', 'jaguar'] as const;
/** Cada cuánto cambia la foto de fondo y gira el abanico de cartas. */
const HERO_INTERVAL_MS = 6500;
/** Cartas del abanico: inclinación y desplazamiento de cada posición (izquierda, centro, derecha). */
const FAN = [
  { rotate: -14, x: '-62%', y: 18, delay: 0 },
  { rotate: 0, x: '0%', y: 0, delay: 0.12 },
  { rotate: 14, x: '62%', y: 18, delay: 0.24 },
] as const;
/** Brasas que flotan sobre la foto (posiciones deterministas: el render es puro). */
const EMBER_COUNT = 18;

const HEROES: readonly AnimalEntry[] = HERO_IDS.map((id) => findEntry(id)).filter(
  (entry): entry is AnimalEntry => entry?.image !== undefined,
);

function heroAt(index: number): AnimalEntry | undefined {
  return HEROES[((index % HEROES.length) + HEROES.length) % HEROES.length];
}

/** Índice del animal de portada; avanza solo mientras se permita el movimiento. */
function useHeroIndex(): number {
  const reduced = useReducedMotionConfig() === true;
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduced || HEROES.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((i) => i + 1);
    }, HERO_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [reduced]);
  // Precarga la siguiente foto para que el fundido no muestre un hueco.
  useEffect(() => {
    const next = heroAt(index + 1)?.image;
    if (next === undefined) return;
    const set = photoSet(next, '100vw');
    const img = new Image();
    img.sizes = set.sizes;
    if (set.srcSet !== undefined) img.srcset = set.srcSet;
    img.src = set.src;
  }, [index]);
  return index;
}

export function HomeScreen() {
  const index = useHeroIndex();
  const hero = heroAt(index);

  return (
    <div className={styles.home}>
      <Backdrop hero={hero} />
      <Embers />

      <div className={styles.content}>
        <CardFan index={index} />

        <header className={styles.brand}>
          <m.p
            className={cx('eyebrow', styles.eyebrow)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            Duelos tácticos con animales reales
          </m.p>
          <h1 className={styles.title}>
            <AnimatedWordmark />
          </h1>
          <m.p
            className={styles.signature}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, type: 'spring', stiffness: 200, damping: 20 }}
          >
            by <strong>ALEJOSTONE</strong>
          </m.p>
          <m.p
            className={styles.tagline}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            El instinto decide. La estrategia gana.
          </m.p>
        </header>

        <m.nav
          className={styles.actions}
          aria-label="Menú principal"
          initial="hidden"
          animate="shown"
          variants={{ shown: { transition: { delayChildren: stagger(0.1, { startDelay: 0.8 }) } } }}
        >
          <m.div variants={RISE} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
            <Link to="/jugar" className={cx('btn btn--primary btn--block', styles.play)}>
              <Swords size={26} aria-hidden="true" />
              Jugar
            </Link>
          </m.div>
          <m.div className={styles.online} variants={RISE}>
            <m.div whileTap={{ scale: 0.94 }}>
              <Link to="/sala" className={cx('btn btn--ghost', styles.ghost)}>
                <QrCode size={18} aria-hidden="true" />
                Crear sala
              </Link>
            </m.div>
            <m.div whileTap={{ scale: 0.94 }}>
              <Link to="/sala?modo=unirse" className={cx('btn btn--ghost', styles.ghost)}>
                <Hash size={18} aria-hidden="true" />
                Unirse
              </Link>
            </m.div>
          </m.div>
          <m.p className={styles.hint} variants={RISE}>
            Contra la IA o con amigos: 1 vs 1 o 2 vs 2 compartiendo el enlace o el QR.
          </m.p>
          <m.div className={styles.secondary} variants={RISE}>
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
          </m.div>
        </m.nav>
      </div>

      <footer className={styles.footer}>
        {hero !== undefined && <PhotoCredit entry={hero} />}
      </footer>
    </div>
  );
}

const RISE = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
} as const;

/** Foto a sangre que cambia con un fundido y un acercamiento lento (efecto Ken Burns). */
function Backdrop({ hero }: { hero: AnimalEntry | undefined }) {
  const image = hero?.image;
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <AnimatePresence initial={false}>
        {hero !== undefined && image !== undefined && (
          <m.img
            key={hero.id}
            {...photoSet(image, '100vw')}
            alt=""
            className={styles.backdropImg}
            style={{
              objectPosition: `${String(image.focalPoint.x * 100)}% ${String(image.focalPoint.y * 100)}%`,
            }}
            initial={{ opacity: 0, scale: 1.18 }}
            animate={{ opacity: 1, scale: 1.04 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.2, ease: 'easeInOut' },
              scale: { duration: (HERO_INTERVAL_MS / 1000) * 1.4, ease: 'linear' },
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Chispas ámbar que suben despacio: dan vida a la foto sin tapar al animal. */
function Embers() {
  return (
    <div className={styles.embers} aria-hidden="true">
      {Array.from({ length: EMBER_COUNT }, (_, i) => (
        <span
          key={i}
          style={
            {
              '--x': `${String((i * 37) % 100)}%`,
              '--size': `${String(2 + (i % 4))}px`,
              '--dur': `${String(7 + ((i * 13) % 9))}s`,
              '--delay': `${String(-((i * 7) % 14))}s`,
              '--sway': `${String(((i % 5) - 2) * 14)}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Tres cartas en abanico que flotan y se voltean cuando cambia el animal de portada. */
function CardFan({ index }: { index: number }) {
  return (
    <div className={styles.fan} aria-hidden="true">
      {FAN.map((slot, i) => {
        const entry = heroAt(index + i + 1);
        return (
          <m.div
            key={i}
            className={cx(styles.fanSlot, i === 1 && styles.fanCenter)}
            initial={{ opacity: 0, y: 80, rotate: 0, x: '0%' }}
            animate={{ opacity: 1, y: slot.y, rotate: slot.rotate, x: slot.x }}
            transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 0.3 + slot.delay }}
          >
            <div className={styles.fanFloat} style={{ animationDelay: `${String(-i * 1.3)}s` }}>
              <AnimatePresence mode="wait" initial={false}>
                {entry !== undefined && (
                  <m.div
                    key={entry.id}
                    className={styles.fanFlip}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.35, delay: slot.delay }}
                  >
                    <MiniCard entry={entry} />
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </m.div>
        );
      })}
    </div>
  );
}

function MiniCard({ entry }: { entry: AnimalEntry }) {
  const image = entry.image;
  const top = peaks(entry.profile)[0];
  const Icon = top === undefined ? undefined : ATTRIBUTE[top].icon;
  return (
    <div className={styles.mini}>
      {image !== undefined && (
        <img
          {...photoSet(image, '(min-width: 720px) 200px, 34vw')}
          alt=""
          decoding="async"
          style={{
            objectPosition: `${String(image.focalPoint.x * 100)}% ${String(image.focalPoint.y * 100)}%`,
          }}
        />
      )}
      <span className={styles.miniShine} />
      {top !== undefined && Icon !== undefined && (
        <span className={styles.miniPeak}>
          <Icon size={12} />
          {entry.profile.stats[top]}
        </span>
      )}
      <span className={styles.miniName}>{entry.name}</span>
      <ClawMark className={styles.miniClaw} />
    </div>
  );
}
