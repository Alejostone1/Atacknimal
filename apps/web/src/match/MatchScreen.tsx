import { Flag, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { currentActor, HUMAN, RIVAL, useMatch } from '../game/matchStore.ts';
import { describeDuel } from '../game/present.ts';
import { useSettings } from '../state/stores.ts';
import { AttackPanel } from './AttackPanel.tsx';
import { DefensePanel } from './DefensePanel.tsx';
import { DuelResult } from './DuelResult.tsx';
import { MatchEnd } from './MatchEnd.tsx';
import { TeamStrip } from './TeamStrip.tsx';
import styles from './Match.module.css';

const DIFFICULTY_LABEL = { easy: 'Fácil', normal: 'Normal', hard: 'Difícil' } as const;

function useReducedMotion(): boolean {
  const motion = useSettings((s) => s.motion);
  if (motion !== 'system') return motion === 'reduce';
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Partida contra la IA. Se carga aparte (incluye Phaser) para no pesar en el resto de la app. */
export default function MatchScreen() {
  const { view, presenting, log, error, difficulty, opponentStep, concede } = useMatch();
  const reduceMotion = useReducedMotion();
  const [confirmingExit, setConfirmingExit] = useState(false);

  // El rival actúa solo cuando le toca y no se está mostrando un duelo.
  const rivalTurn = view !== null && presenting === null && currentActor(view) === RIVAL;
  useEffect(() => {
    if (!rivalTurn) return;
    const delay = reduceMotion ? 250 : view.phase === 'declare' ? 900 : 700;
    const timer = setTimeout(opponentStep, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [rivalTurn, view, reduceMotion, opponentStep]);

  if (view === null) return <Navigate to="/jugar" replace />;
  if (view.result !== null && presenting === null) {
    return (
      <div className={styles.page}>
        <MatchEnd view={view} log={log} />
      </div>
    );
  }

  const actor = currentActor(view);
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className="eyebrow">Contra la IA · {DIFFICULTY_LABEL[difficulty]}</p>
          <p className={styles.duel}>
            Duelo {presenting?.resolution.duelNumber ?? view.duelNumber}
            <span className={styles.duelMax}> / {view.ruleset.maxDuels}</span>
          </p>
        </div>
        {confirmingExit ? (
          <div className={styles.confirm}>
            <span>¿Abandonar? Cuenta como derrota.</span>
            <button type="button" className="btn btn--ghost" onClick={concede}>
              Sí, abandonar
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setConfirmingExit(false);
              }}
            >
              Seguir
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.exit}
            onClick={() => {
              setConfirmingExit(true);
            }}
          >
            <Flag size={16} aria-hidden="true" /> Abandonar
          </button>
        )}
      </header>

      <TeamStrip view={view} playerId={RIVAL} label="Rival" />

      <main className={styles.stage}>
        {error !== null && (
          <p className={styles.forced} role="alert">
            {error}
          </p>
        )}
        {presenting !== null ? (
          <DuelResult view={view} duel={presenting} reduceMotion={reduceMotion} />
        ) : actor === HUMAN && view.phase === 'declare' ? (
          <AttackPanel key={view.duelNumber} view={view} />
        ) : actor === HUMAN && view.phase === 'defend' ? (
          <DefensePanel key={view.duelNumber} view={view} />
        ) : (
          <p className={styles.waiting} role="status">
            <LoaderCircle size={20} className={styles.spin} aria-hidden="true" />
            {view.phase === 'declare'
              ? 'La IA elige hábitat, animal y atributo…'
              : 'La IA elige con qué defenderse…'}
          </p>
        )}
      </main>

      <TeamStrip view={view} playerId={HUMAN} label="Tu equipo" />

      {log.length > 0 && (
        <details className={styles.log}>
          <summary>Registro del combate ({log.length})</summary>
          <ol reversed>
            {[...log].reverse().map((duel) => (
              <li key={duel.resolution.duelNumber}>
                <span className="mono">{duel.resolution.duelNumber}.</span>{' '}
                {describeDuel(view, duel)}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
