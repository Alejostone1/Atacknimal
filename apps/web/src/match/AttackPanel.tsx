import {
  ATTRIBUTES,
  HABITATS,
  computeValue,
  getLegalActions,
  isActive,
  type Attribute,
  type Habitat,
  type PlayerView,
} from '@atacknimal/engine';
import { Lock } from 'lucide-react';
import { useState } from 'react';
import { findEntry } from '../content/catalog.ts';
import { HUMAN, useMatch } from '../game/matchStore.ts';
import { ATTRIBUTE, HABITAT } from '../i18n/es.ts';
import styles from './Match.module.css';

/**
 * Declaración del ataque en tres pasos: hábitat → carta → atributo.
 * Qué es legal lo decide el motor (getLegalActions); aquí solo se elige y se muestra el valor.
 */
export function AttackPanel({ view }: { view: PlayerView }) {
  const act = useMatch((s) => s.act);
  const [habitat, setHabitat] = useState<Habitat | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [attribute, setAttribute] = useState<Attribute | null>(null);

  const legal = getLegalActions(view, HUMAN).flatMap((a) => (a.type === 'declare' ? [a] : []));
  const isLegal = (h: Habitat | null, c: string | null, at: Attribute | null): boolean =>
    legal.some(
      (a) =>
        (h === null || a.habitat === h) &&
        (c === null || a.cardId === c) &&
        (at === null || a.attribute === at),
    );

  const me = view.players.find((p) => p.id === HUMAN);
  const myCards = (me?.cardIds ?? []).flatMap((id) => {
    const card = view.cards[id];
    return card !== undefined && isActive(card) ? [card] : [];
  });
  const selected = cardId === null ? undefined : view.cards[cardId];
  const profile = selected === undefined ? undefined : view.roster[selected.animalId];
  const preview = (at: Attribute): number | null =>
    profile === undefined || habitat === null
      ? null
      : computeValue(profile, at, habitat, view.ruleset).effective;

  const ready =
    habitat !== null &&
    cardId !== null &&
    attribute !== null &&
    isLegal(habitat, cardId, attribute);
  const cardName = findEntry(selected?.animalId)?.name;

  return (
    <div className={styles.panel}>
      <p className={styles.panelTitle}>Tu turno: ataca</p>
      <p className={styles.panelHint}>
        Tu rival solo verá el hábitat y el atributo, no qué animal ataca.
      </p>

      <fieldset className={styles.step}>
        <legend className={styles.stepLabel}>1 · Hábitat</legend>
        <div className={styles.choices}>
          {HABITATS.map((h) => {
            const Icon = HABITAT[h].icon;
            return (
              <button
                key={h}
                type="button"
                className="chip"
                aria-pressed={habitat === h}
                disabled={!isLegal(h, null, null)}
                onClick={() => {
                  setHabitat(h);
                }}
              >
                <Icon size={16} aria-hidden="true" />
                {HABITAT[h].label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={styles.step}>
        <legend className={styles.stepLabel}>2 · Tu animal</legend>
        <div className={styles.cardChoices}>
          {myCards.map((card) => {
            const entry = findEntry(card.animalId);
            return (
              <button
                key={card.id}
                type="button"
                className={styles.cardChoice}
                aria-pressed={cardId === card.id}
                aria-label={`${entry?.name ?? 'Carta'}, vitalidad ${String(card.hp)} de ${String(card.maxHp)}`}
                disabled={!isLegal(habitat, card.id, null)}
                onClick={() => {
                  setCardId(card.id);
                  if (attribute !== null && !isLegal(habitat, card.id, attribute))
                    setAttribute(null);
                }}
              >
                {entry?.image !== undefined && <img src={entry.image.thumbnailUrl} alt="" />}
                <span>{entry?.name}</span>
                <span className="mono">
                  {card.hp}/{card.maxHp}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={styles.step}>
        <legend className={styles.stepLabel}>3 · Atributo</legend>
        <div className={styles.attributes}>
          {ATTRIBUTES.map((at) => {
            const Icon = ATTRIBUTE[at].icon;
            const allowed =
              cardId === null ? isLegal(habitat, null, at) : isLegal(habitat, cardId, at);
            const value = preview(at);
            return (
              <button
                key={at}
                type="button"
                className={styles.attribute}
                aria-pressed={attribute === at}
                aria-label={`${ATTRIBUTE[at].label}${!allowed && cardId !== null ? ', bloqueado' : value === null ? '' : ` ${String(value)}`}`}
                disabled={!allowed}
                onClick={() => {
                  setAttribute(at);
                }}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{ATTRIBUTE[at].label}</span>
                {!allowed && cardId !== null ? (
                  <span className={styles.locked}>
                    <Lock size={12} aria-hidden="true" /> Bloqueado
                  </span>
                ) : (
                  value !== null && <span className="mono">{value}</span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button
        type="button"
        className="btn btn--primary btn--block"
        disabled={!ready}
        onClick={() => {
          if (habitat === null || cardId === null || attribute === null) return;
          act({ type: 'declare', playerId: HUMAN, habitat, cardId, attribute });
        }}
      >
        {ready && cardName !== undefined
          ? `Atacar con ${cardName} · ${ATTRIBUTE[attribute].label} ${String(preview(attribute) ?? '')}`
          : 'Elige hábitat, animal y atributo'}
      </button>
    </div>
  );
}
