import { Flag, LoaderCircle, Timer, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { currentActor, rivalOf, useMatch } from '../game/matchStore.ts';
import { useRoom } from '../game/online.ts';
import { describeDuel } from '../game/present.ts';
import { hasActiveRoom } from '../game/session.ts';
import { useSettings } from '../state/stores.ts';
import { AttackPanel } from './AttackPanel.tsx';
import { DefensePanel } from './DefensePanel.tsx';
import { DuelResult } from './DuelResult.tsx';
import { MatchEnd } from './MatchEnd.tsx';
import { TeamStrip } from './TeamStrip.tsx';
import styles from './Match.module.css';

const DIFFICULTY_LABEL = { easy: 'Fácil', normal: 'Normal', hard: 'Difícil' } as const;

/** A partir de aquí el reloj del turno se muestra como urgente. */
const URGENT_SECONDS = 10;

function useReducedMotion(): boolean {
  const motion = useSettings((s) => s.motion);
  if (motion !== 'system') return motion === 'reduce';
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Segundos que quedan del turno online (si se agotan, el servidor juega por quien debía actuar). */
function TurnClock({ deadline, mine }: { deadline: number; mine: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 250);
    return () => {
      clearInterval(timer);
    };
  }, [deadline]);
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  return (
    <p
      className={styles.clock}
      data-urgent={mine && seconds <= URGENT_SECONDS}
      aria-label={`${String(seconds)} segundos para ${mine ? 'tu jugada' : 'la jugada rival'}`}
    >
      <Timer size={16} aria-hidden="true" />
      <span className="mono">{seconds}</span>
    </p>
  );
}

/** Partida contra la IA u online. Se carga aparte (incluye Phaser) para no pesar en el resto. */
export default function MatchScreen() {
  const { view, source, presenting, log, error, turnDeadline, opponentStep, concede } = useMatch();
  const { room, connection } = useRoom();
  const reduceMotion = useReducedMotion();
  const [confirmingExit, setConfirmingExit] = useState(false);
  const online = source?.kind === 'online';
  const rivalId = view === null ? undefined : rivalOf(view);

  // Contra la IA, el rival actúa solo cuando le toca y no se está mostrando un duelo.
  const rivalTurn =
    source?.kind === 'local' &&
    view !== null &&
    presenting === null &&
    currentActor(view) === rivalId;
  useEffect(() => {
    if (!rivalTurn) return;
    const delay = reduceMotion ? 250 : view.phase === 'declare' ? 900 : 700;
    const timer = setTimeout(opponentStep, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [rivalTurn, view, reduceMotion, opponentStep]);

  if (view === null) {
    // Recarga en mitad de una partida online: la vista llega al reconectar.
    if (hasActiveRoom()) {
      return (
        <p className={styles.waiting} role="status">
          <LoaderCircle size={20} className={styles.spin} aria-hidden="true" />
          Volviendo a la sala…
        </p>
      );
    }
    return <Navigate to="/" replace />;
  }
  if (view.result !== null && presenting === null) {
    return (
      <div className={styles.page}>
        <MatchEnd view={view} log={log} />
      </div>
    );
  }

  const rival = room?.players.find((p) => p.playerId === rivalId);
  const rivalName = online ? (rival?.nickname ?? 'Rival') : 'IA';
  const actor = currentActor(view);
  const mine = actor === view.viewerId;
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className="eyebrow">
            {source?.kind === 'local'
              ? `Contra la IA · ${DIFFICULTY_LABEL[source.difficulty]}`
              : `Online · Sala ${room?.code ?? ''}`}
          </p>
          <p className={styles.duel}>
            Duelo {presenting?.resolution.duelNumber ?? view.duelNumber}
            <span className={styles.duelMax}> / {view.ruleset.maxDuels}</span>
          </p>
        </div>
        {online && turnDeadline !== null && presenting === null && (
          <TurnClock deadline={turnDeadline} mine={mine} />
        )}
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

      {online && connection === 'offline' && (
        <p className={styles.forced} role="alert">
          <WifiOff size={16} aria-hidden="true" /> Sin conexión. Reconectando…
        </p>
      )}
      {online && rival?.connected === false && (
        <p className={styles.forced} role="status">
          <WifiOff size={16} aria-hidden="true" /> {rivalName} se ha desconectado. Si no vuelve a
          tiempo, ganas por abandono.
        </p>
      )}

      {rivalId !== undefined && (
        <TeamStrip view={view} playerId={rivalId} label={online ? rivalName : 'Rival'} />
      )}

      <main className={styles.stage}>
        {error !== null && (
          <p className={styles.forced} role="alert">
            {error}
          </p>
        )}
        {presenting !== null ? (
          <DuelResult
            view={view}
            duel={presenting}
            reduceMotion={reduceMotion}
            rivalName={rivalName}
          />
        ) : mine && view.phase === 'declare' ? (
          <AttackPanel key={view.duelNumber} view={view} />
        ) : mine && view.phase === 'defend' ? (
          <DefensePanel key={view.duelNumber} view={view} />
        ) : (
          <p className={styles.waiting} role="status">
            <LoaderCircle size={20} className={styles.spin} aria-hidden="true" />
            {view.phase === 'declare'
              ? `${rivalName} elige hábitat, animal y atributo…`
              : `${rivalName} elige con qué defenderse…`}
          </p>
        )}
      </main>

      <TeamStrip view={view} playerId={view.viewerId} label="Tu equipo" />

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
