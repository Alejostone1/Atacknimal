import { ATTRIBUTES, type Attribute, type PlayerView } from '@atacknimal/engine';
import { Link } from 'react-router';
import { Wordmark } from '../components/Brand.tsx';
import { HUMAN, useMatch, type PresentedDuel } from '../game/matchStore.ts';
import { ATTRIBUTE } from '../i18n/es.ts';
import { useMatchSetup } from '../state/stores.ts';
import styles from './Match.module.css';

const REASON = {
  elimination: 'Todas las cartas de un equipo quedaron fuera.',
  'duel-limit': 'Se alcanzó el límite de duelos: decide quién conserva más cartas y vitalidad.',
  concede: 'La partida terminó por abandono.',
} as const;

/** Resumen final: los datos salen del registro de duelos (presentación, no reglas). */
export function MatchEnd({ view, log }: { view: PlayerView; log: readonly PresentedDuel[] }) {
  const { start, leave } = useMatch();
  const { team, difficulty } = useMatchSetup();
  const result = view.result;
  if (result === null) return null;

  const myTeam = view.players.find((p) => p.id === HUMAN)?.team;
  const outcome = result.winner === null ? 'draw' : result.winner === myTeam ? 'win' : 'loss';
  const title = { win: '¡Victoria!', loss: 'Derrota', draw: 'Empate' }[outcome];

  let dealt = 0;
  let received = 0;
  const used = new Map<Attribute, number>();
  for (const { resolution: r } of log) {
    if (r.damage !== null) {
      const targetOwner =
        r.damage.targetCardId === r.attacker.cardId ? r.attacker.playerId : r.defender.playerId;
      if (targetOwner === HUMAN) received += r.damage.amount;
      else dealt += r.damage.amount;
    }
    if (r.attacker.playerId === HUMAN) used.set(r.attribute, (used.get(r.attribute) ?? 0) + 1);
  }
  const favourite = ATTRIBUTES.filter((a) => used.has(a)).sort(
    (a, b) => (used.get(b) ?? 0) - (used.get(a) ?? 0),
  )[0];

  return (
    <div className={styles.end}>
      <Wordmark />
      <h1 className={styles.endTitle} data-outcome={outcome}>
        {title}
      </h1>
      <p className={styles.panelHint}>{REASON[result.reason]}</p>
      <dl className={styles.stats}>
        <div>
          <dt>Duelos</dt>
          <dd className="mono">{log.length}</dd>
        </div>
        <div>
          <dt>Daño causado</dt>
          <dd className="mono">{dealt}</dd>
        </div>
        <div>
          <dt>Daño recibido</dt>
          <dd className="mono">{received}</dd>
        </div>
        <div>
          <dt>Tu atributo favorito</dt>
          <dd>{favourite === undefined ? '—' : ATTRIBUTE[favourite].label}</dd>
        </div>
      </dl>
      <div className={styles.endActions}>
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => {
            start(team, difficulty);
          }}
        >
          Jugar otra vez
        </button>
        <Link to="/" className="btn btn--ghost btn--block" onClick={leave}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
