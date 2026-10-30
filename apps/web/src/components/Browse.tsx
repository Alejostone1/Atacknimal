import type { Habitat } from '@atacknimal/engine';
import { Search } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { CATALOG, matchesSearch, thrivesIn, type AnimalEntry } from '../content/catalog.ts';
import { HABITAT } from '../i18n/es.ts';
import { HabitatFilter } from './Habitats.tsx';
import styles from './Browse.module.css';

/** Retardo entre cartas al entrar y tope (las de abajo no esperan de más). */
const STAGGER_S = 0.035;
const MAX_STAGGER_S = 0.5;

/**
 * Buscador + filtro por hábitat + cuadrícula. Lo comparten Colección y Selección de equipo.
 * `renderCard` decide si cada carta enlaza a la ficha o se añade al equipo.
 */
export function AnimalBrowser({ renderCard }: { renderCard: (entry: AnimalEntry) => ReactNode }) {
  const [habitat, setHabitat] = useState<Habitat | null>(null);
  const [text, setText] = useState('');
  const visible = CATALOG.filter(
    (entry) => (habitat === null || thrivesIn(entry, habitat)) && matchesSearch(entry, text),
  );

  return (
    <div className={styles.browser}>
      <div className={styles.controls}>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className="visually-hidden">Buscar animal</span>
          <input
            type="search"
            placeholder="Buscar por nombre o especie"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
          />
        </label>
        <HabitatFilter value={habitat} onChange={setHabitat} />
      </div>
      <p className={styles.count} aria-live="polite">
        {visible.length === 1 ? '1 animal' : `${String(visible.length)} animales`}
        {habitat !== null && ` en su elemento en ${HABITAT[habitat].label}`}
      </p>
      {visible.length === 0 ? (
        <div className={styles.empty}>
          <p>Ningún animal coincide con «{text}».</p>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setText('');
              setHabitat(null);
            }}
          >
            Ver todos
          </button>
        </div>
      ) : (
        <ul className={styles.grid}>
          <AnimatePresence mode="popLayout" initial={true}>
            {visible.map((entry, i) => (
              <m.li
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 26,
                  delay: Math.min(i * STAGGER_S, MAX_STAGGER_S),
                }}
              >
                {renderCard(entry)}
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
