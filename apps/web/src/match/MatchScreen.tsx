import { Flag, LoaderCircle, Timer, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { RIVAL } from '../game/localMatch.ts';
import { currentActor, sidesOf, useMatch } from '../game/matchStore.ts';
import { useRoom } from '../game/online.ts';
import { describeDuel } from '../game/present.ts';
import { hasActiveRoom } from '../game/session.ts';
import { useSettings } from '../state/stores.ts';
import { AttackPanel } from './AttackPanel.tsx';
import { DefensePanel } from './DefensePanel.tsx';
import { DuelResult } from './DuelResult.tsx';
import { MatchEnd } from './MatchEnd.tsx';
import { SignalBar } from './SignalBar.tsx';
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

  // Contra la IA, el rival actúa solo cuando le toca y no se está mostrando un duelo.
  const rivalTurn =
    source?.kind === 'local' &&
    view !== null &&
    presenting === null &&
    currentActor(view) === RIVAL;
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

  const { partners, rivals } = sidesOf(view);
  const nameOf = (playerId: string): string =>
    playerId === view.viewerId
      ? 'Tú'
      : online
        ? (room?.players.find((p) => p.playerId === playerId)?.nickname ?? 'Jugador')
        : 'IA';
  const isPartner = (playerId: string): boolean => partners.some((p) => p.id === playerId);
  const actor = currentActor(view);
  const mine = actor === view.viewerId;
  const actorName =
    actor === null ? '' : isPartner(actor) ? `Tu compañero ${nameOf(actor)}` : nameOf(actor);
  const away = online ? (room?.players.filter((p) => !p.isYou && !p.connected) ?? []) : [];
  const [partner] = partners;
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
      {away.map((player) => (
        <p key={player.playerId} className={styles.forced} role="status">
          <WifiOff size={16} aria-hidden="true" /> {player.nickname} se ha desconectado.{' '}
          {player.team === view.players.find((p) => p.id === view.viewerId)?.team
            ? 'Si no vuelve a tiempo, vuestro equipo pierde por abandono.'
            : 'Si no vuelve a tiempo, ganáis por abandono.'}
        </p>
      ))}

      {rivals.map((rival) => (
        <TeamStrip
          key={rival.id}
          view={view}
          playerId={rival.id}
          label={online ? `Rival · ${nameOf(rival.id)}` : 'Rival'}
        />
      ))}

      <main className={styles.stage}>
        {error !== null && (
          <p className={styles.forced} role="alert">
            {error}
          </p>
        )}
        {presenting !== null ? (
          <DuelResult view={view} duel={presenting} reduceMotion={reduceMotion} nameOf={nameOf} />
        ) : mine && view.phase === 'declare' ? (
          <AttackPanel key={view.duelNumber} view={view} />
        ) : mine && view.phase === 'defend' ? (
          <DefensePanel key={view.duelNumber} view={view} />
        ) : (
          <p className={styles.waiting} role="status">
            <LoaderCircle size={20} className={styles.spin} aria-hidden="true" />
            {view.phase === 'declare'
              ? `${actorName} elige hábitat, animal y atributo…`
              : `${actorName} elige con qué defenderse…`}
          </p>
        )}
      </main>

      {partners.map((mate) => (
        <TeamStrip
          key={mate.id}
          view={view}
          playerId={mate.id}
          label={`Compañero · ${nameOf(mate.id)}`}
        />
      ))}
      <TeamStrip
        view={view}
        playerId={view.viewerId}
        label={partners.length > 0 ? 'Tus cartas' : 'Tu equipo'}
      />

      {online && partner !== undefined && (
        <SignalBar view={view} partnerId={partner.id} nameOf={nameOf} />
      )}

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
