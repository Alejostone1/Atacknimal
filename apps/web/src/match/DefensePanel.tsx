import { computeValue, getDefenseOptions, type PlayerView } from '@atacknimal/engine';
import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { findEntry } from '../content/catalog.ts';
import { useMatch } from '../game/matchStore.ts';
import { ATTRIBUTE, HABITAT } from '../i18n/es.ts';
import styles from './Match.module.css';

/** Defensa: el jugador conoce hábitat y atributo, nunca la carta atacante (GAME_RULES §4). */
export function DefensePanel({ view }: { view: PlayerView }) {
  const act = useMatch((s) => s.act);
  const [cardId, setCardId] = useState<string | null>(null);
  const declaration = view.declaration;
  if (declaration === null) return null;

  const { habitat, attribute } = declaration;
  const options = getDefenseOptions(view, view.viewerId, attribute);
  const valueOf = (id: string): number => {
    const card = view.cards[id];
    const profile = card === undefined ? undefined : view.roster[card.animalId];
    if (profile === undefined || options.forced) return 0;
    return computeValue(profile, attribute, habitat, view.ruleset, view.ruleset.defenderBonus)
      .effective;
  };
  const chosen = cardId === null ? undefined : findEntry(view.cards[cardId]?.animalId);

  return (
    <div className={styles.panel}>
      <p className={styles.panelTitle}>Te atacan</p>
      <p className={styles.declared}>
        {HABITAT[habitat].label} · {ATTRIBUTE[attribute].label}
      </p>
      <p className={styles.panelHint}>No sabes con qué animal. Elige quién defiende.</p>
      {options.forced && (
        <p className={styles.forced} role="alert">
          <ShieldAlert size={18} aria-hidden="true" />
          Ninguna de tus cartas puede usar {ATTRIBUTE[attribute].label}: la que elijas luchará con
          0. Elige cuál recibe el golpe.
        </p>
      )}

      <div className={styles.cardChoices}>
        {options.cardIds.map((id) => {
          const card = view.cards[id];
          const entry = findEntry(card?.animalId);
          return (
            <button
              key={id}
              type="button"
              className={styles.cardChoice}
              aria-pressed={cardId === id}
              aria-label={`${entry?.name ?? 'Carta'}: ${ATTRIBUTE[attribute].label} ${String(valueOf(id))}, vitalidad ${String(card?.hp ?? 0)} de ${String(card?.maxHp ?? 0)}`}
              onClick={() => {
                setCardId(id);
              }}
            >
              {entry?.image !== undefined && <img src={entry.image.thumbnailUrl} alt="" />}
              <span>{entry?.name}</span>
              <span className="mono">
                {ATTRIBUTE[attribute].label} {valueOf(id)}
              </span>
              <span className="mono">
                {card?.hp}/{card?.maxHp}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="btn btn--primary btn--block"
        disabled={cardId === null}
        onClick={() => {
          if (cardId !== null) act({ type: 'defend', cardId });
        }}
      >
        {chosen === undefined ? 'Elige quién defiende' : `Defender con ${chosen.name}`}
      </button>
    </div>
  );
}
