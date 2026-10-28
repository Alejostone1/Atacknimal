import type { Habitat } from '@atacknimal/engine';
import { Search } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { CATALOG, matchesSearch, thrivesIn, type AnimalEntry } from '../content/catalog.ts';
import { HABITAT } from '../i18n/es.ts';
import { HabitatFilter } from './Habitats.tsx';
import styles from './Browse.module.css';

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
          {visible.map((entry) => (
            <li key={entry.id}>{renderCard(entry)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
