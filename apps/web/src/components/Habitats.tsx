import { cx } from '../ui/cx.ts';
import { HABITATS, type Habitat } from '@atacknimal/engine';
import type { CSSProperties } from 'react';
import { BALANCE, type AnimalEntry } from '../content/catalog.ts';
import { AFFINITY, HABITAT, signed } from '../i18n/es.ts';
import styles from './Habitats.module.css';

const habitatColor = (habitat: Habitat): CSSProperties =>
  ({ '--habitat': `var(--h-${habitat})` }) as CSSProperties;

/** Fila compacta para las cartas: el icono cambia de forma según la afinidad, no solo de color. */
export function HabitatDots({ entry }: { entry: AnimalEntry }) {
  const summary = HABITATS.map(
    (h) => `${HABITAT[h].label}: ${AFFINITY[entry.profile.affinities[h]]}`,
  ).join(', ');
  return (
    <ul className={styles.dots} aria-label={`Afinidad por hábitat. ${summary}`}>
      {HABITATS.map((habitat) => {
        const Icon = HABITAT[habitat].icon;
        const affinity = entry.profile.affinities[habitat];
        return (
          <li
            key={habitat}
            className={cx(styles.dot, styles[affinity])}
            style={habitatColor(habitat)}
            aria-hidden="true"
          >
            <Icon size={14} strokeWidth={2.4} />
          </li>
        );
      })}
    </ul>
  );
}

/** Tabla completa para la ficha: afinidad y modificador real del ruleset vigente. */
export function HabitatTable({ entry }: { entry: AnimalEntry }) {
  return (
    <ul className={styles.table}>
      {HABITATS.map((habitat) => {
        const Icon = HABITAT[habitat].icon;
        const affinity = entry.profile.affinities[habitat];
        const modifier = BALANCE.ruleset.habitatModifiers[affinity];
        return (
          <li
            key={habitat}
            className={cx(styles.tile, styles[affinity])}
            style={habitatColor(habitat)}
          >
            <Icon size={20} aria-hidden="true" />
            <span className={styles.habitat}>{HABITAT[habitat].label}</span>
            <span className={styles.affinity}>{AFFINITY[affinity]}</span>
            <span className={cx('mono', styles.modifier)}>{signed(modifier)}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Filtro de la colección: "Todos" o los animales en su elemento (Nativo o Adaptado). */
export function HabitatFilter({
  value,
  onChange,
}: {
  value: Habitat | null;
  onChange: (habitat: Habitat | null) => void;
}) {
  return (
    <div className={styles.filter} role="group" aria-label="Filtrar por hábitat">
      <button
        type="button"
        className="chip"
        aria-pressed={value === null}
        onClick={() => {
          onChange(null);
        }}
      >
        Todos
      </button>
      {HABITATS.map((habitat) => {
        const Icon = HABITAT[habitat].icon;
        return (
          <button
            key={habitat}
            type="button"
            className="chip"
            aria-pressed={value === habitat}
            onClick={() => {
              onChange(value === habitat ? null : habitat);
            }}
          >
            <Icon size={16} aria-hidden="true" />
            {HABITAT[habitat].label}
          </button>
        );
      })}
    </div>
  );
}
