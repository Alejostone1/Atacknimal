import { isActive, type PlayerView } from '@atacknimal/engine';
import { Lock } from 'lucide-react';
import { findEntry } from '../content/catalog.ts';
import { ATTRIBUTE } from '../i18n/es.ts';
import { cx } from '../ui/cx.ts';
import styles from './Match.module.css';

/** Cartas de un jugador tal como las ve el jugador humano: las rivales ocultas salen como "?". */
export function TeamStrip({
  view,
  playerId,
  label,
}: {
  view: PlayerView;
  playerId: string;
  label: string;
}) {
  const player = view.players.find((p) => p.id === playerId);
  if (player === undefined) return null;
  const cards = (player.cardIds ?? []).flatMap((id) => {
    const card = view.cards[id];
    return card === undefined ? [] : [card];
  });

  return (
    <section className={styles.strip} aria-label={label}>
      <h2 className={styles.stripLabel}>{label}</h2>
      <ul className={styles.stripCards}>
        {cards.map((card) => {
          const entry = findEntry(card.animalId);
          const lock = card.locks[0];
          const out = !isActive(card);
          return (
            <li key={card.id} className={cx(styles.mini, out && styles.out)}>
              {entry?.image !== undefined && (
                <img src={entry.image.thumbnailUrl} alt="" className={styles.miniPhoto} />
              )}
              <span className={styles.miniName}>{entry?.name ?? card.animalId}</span>
              <span
                className={styles.hp}
                role="meter"
                aria-label={`Vitalidad de ${entry?.name ?? card.animalId}`}
                aria-valuemin={0}
                aria-valuemax={card.maxHp}
                aria-valuenow={card.hp}
              >
                <span style={{ width: `${String((card.hp / card.maxHp) * 100)}%` }} />
              </span>
              <span className={cx('mono', styles.hpText)}>
                {out ? 'Fuera' : `${String(card.hp)}/${String(card.maxHp)}`}
              </span>
              {lock !== undefined && !out && (
                <span
                  className={styles.lock}
                  title={`Bloqueado: ${ATTRIBUTE[lock.attribute].label}`}
                >
                  <Lock size={11} aria-hidden="true" />
                  <span className="visually-hidden">Bloqueado: </span>
                  {ATTRIBUTE[lock.attribute].label}
                </span>
              )}
            </li>
          );
        })}
        {Array.from({ length: player.hiddenCards }, (_, i) => (
          <li key={`hidden-${String(i)}`} className={cx(styles.mini, styles.hidden)}>
            <span className={styles.unknown} aria-hidden="true">
              ?
            </span>
            <span className="visually-hidden">Carta rival sin revelar</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
