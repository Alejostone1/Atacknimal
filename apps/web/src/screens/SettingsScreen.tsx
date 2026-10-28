import { useState } from 'react';
import { Screen } from '../components/Screen.tsx';
import { BALANCE } from '../content/catalog.ts';
import { clearLocalData, useSettings, type MotionPreference } from '../state/stores.ts';
import styles from './SettingsScreen.module.css';

const MOTION: readonly { id: MotionPreference; label: string }[] = [
  { id: 'system', label: 'Según el sistema' },
  { id: 'reduce', label: 'Reducido' },
  { id: 'full', label: 'Completo' },
];

export function SettingsScreen() {
  const { motion, setMotion, nickname, setNickname } = useSettings();
  const [cleared, setCleared] = useState(false);

  return (
    <Screen title="Ajustes" back="/">
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label className={styles.field}>
          <span className={styles.label}>Apodo</span>
          <input
            className={styles.input}
            value={nickname}
            maxLength={20}
            placeholder="Cómo te verá tu rival"
            autoComplete="nickname"
            onChange={(event) => {
              setNickname(event.target.value);
            }}
          />
          <span className={styles.help}>Se guarda solo en este navegador.</span>
        </label>

        <fieldset className={styles.field}>
          <legend className={styles.label}>Animaciones</legend>
          <div className={styles.segmented}>
            {MOTION.map((option) => (
              <label key={option.id} className={styles.segment}>
                <input
                  type="radio"
                  name="motion"
                  value={option.id}
                  checked={motion === option.id}
                  onChange={() => {
                    setMotion(option.id);
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <span className={styles.help}>
            «Reducido» quita los movimientos de pantalla y de las barras.
          </span>
        </fieldset>

        <div className={styles.field}>
          <span className={styles.label}>Datos guardados</span>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              clearLocalData();
              setCleared(true);
            }}
          >
            Borrar equipo y ajustes de este navegador
          </button>
          <span className={styles.help} role="status">
            {cleared ? 'Datos borrados.' : 'Equipo, dificultad, apodo y animaciones.'}
          </span>
        </div>

        <p className={styles.version}>
          Versión de balance <span className="mono">{BALANCE.version}</span>
        </p>
      </form>
    </Screen>
  );
}
