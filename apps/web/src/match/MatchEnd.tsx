import { ATTRIBUTES, type Attribute, type PlayerView } from '@atacknimal/engine';
import { animate, m, stagger, useReducedMotionConfig } from 'motion/react';
import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { Wordmark } from '../components/Brand.tsx';
import { useMatch, type PresentedDuel } from '../game/matchStore.ts';
import { leaveRoom } from '../game/online.ts';
import { ATTRIBUTE } from '../i18n/es.ts';
import { useMatchSetup } from '../state/stores.ts';
import styles from './Match.module.css';

const REASON = {
  elimination: 'Todas las cartas de un equipo quedaron fuera.',
  'duel-limit': 'Se alcanzó el límite de duelos: decide quién conserva más cartas y vitalidad.',
  concede: 'La partida terminó por abandono.',
} as const;

/** Piezas de confeti de la victoria (posiciones deterministas: el render es puro). */
const CONFETTI_COUNT = 28;
const CONFETTI_COLORS = ['var(--c-amber)', 'var(--c-bone)', 'var(--c-slash)', 'var(--h-trees)'];

/** Cifra que cuenta desde 0 hasta su valor; con "reducir movimiento" aparece directamente. */
function CountUp({ value }: { value: number }) {
  const reduced = useReducedMotionConfig() === true;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: reduced ? 0 : 0.9,
      delay: reduced ? 0 : 0.6,
      ease: 'easeOut',
      onUpdate: (v) => {
        setShown(Math.round(v));
      },
    });
    return () => {
      controls.stop();
    };
  }, [value, reduced]);
  return <>{shown}</>;
}

function Confetti() {
  return (
    <div className={styles.confetti} aria-hidden="true">
      {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
        <span
          key={i}
          style={
            {
              '--x': `${String((i * 41) % 100)}%`,
              '--color': CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              '--dur': `${String(2.4 + ((i * 7) % 10) / 5)}s`,
              '--delay': `${String(((i * 3) % 12) / 10)}s`,
              '--spin': `${String(((i % 2) * 2 - 1) * (360 + ((i * 53) % 360)))}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

const STAT = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
} as const;

/** Resumen final: los datos salen del registro de duelos (presentación, no reglas). */
export function MatchEnd({ view, log }: { view: PlayerView; log: readonly PresentedDuel[] }) {
  const { start, leave, source } = useMatch();
  const team = useMatchSetup((s) => s.team);
  const result = view.result;
  if (result === null) return null;

  const me = view.viewerId;
  const myTeam = view.players.find((p) => p.id === me)?.team;
  const outcome = result.winner === null ? 'draw' : result.winner === myTeam ? 'win' : 'loss';
  const title = { win: '¡Victoria!', loss: 'Derrota', draw: 'Empate' }[outcome];

  let dealt = 0;
  let received = 0;
  const used = new Map<Attribute, number>();
  for (const { resolution: r } of log) {
    if (r.damage !== null) {
      const targetOwner =
        r.damage.targetCardId === r.attacker.cardId ? r.attacker.playerId : r.defender.playerId;
      // En 2 vs 2 el daño se cuenta por equipo: lo que recibe tu compañero también es tuyo.
      const targetTeam = view.players.find((p) => p.id === targetOwner)?.team;
      if (targetTeam === myTeam) received += r.damage.amount;
      else dealt += r.damage.amount;
    }
    if (r.attacker.playerId === me) used.set(r.attribute, (used.get(r.attribute) ?? 0) + 1);
  }
  const favourite = ATTRIBUTES.filter((a) => used.has(a)).sort(
    (a, b) => (used.get(b) ?? 0) - (used.get(a) ?? 0),
  )[0];

  return (
    <div className={styles.end}>
      {outcome === 'win' && <Confetti />}
      <Wordmark />
      <m.h1
        className={styles.endTitle}
        data-outcome={outcome}
        initial={{ opacity: 0, scale: 2.2, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: outcome === 'win' ? 12 : 22 }}
      >
        {title}
      </m.h1>
      <p className={styles.panelHint}>{REASON[result.reason]}</p>
      <m.dl
        className={styles.stats}
        initial="hidden"
        animate="shown"
        variants={{ shown: { transition: { delayChildren: stagger(0.1, { startDelay: 0.4 }) } } }}
      >
        <m.div variants={STAT}>
          <dt>Duelos</dt>
          <dd className="mono">
            <CountUp value={log.length} />
          </dd>
        </m.div>
        <m.div variants={STAT}>
          <dt>Daño causado</dt>
          <dd className="mono">
            <CountUp value={dealt} />
          </dd>
        </m.div>
        <m.div variants={STAT}>
          <dt>Daño recibido</dt>
          <dd className="mono">
            <CountUp value={received} />
          </dd>
        </m.div>
        <m.div variants={STAT}>
          <dt>Tu atributo favorito</dt>
          <dd>{favourite === undefined ? '—' : ATTRIBUTE[favourite].label}</dd>
        </m.div>
      </m.dl>
      <div className={styles.endActions}>
        {source?.kind === 'local' && (
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => {
              start(team, source.difficulty);
            }}
          >
            Jugar otra vez
          </button>
        )}
        <Link
          to="/"
          className={
            source?.kind === 'local' ? 'btn btn--ghost btn--block' : 'btn btn--primary btn--block'
          }
          onClick={() => {
            if (source?.kind === 'online') void leaveRoom();
            else leave();
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
