import { HABITATS, isActive, type PlayerView } from '@atacknimal/engine';
import type { TeamSignal } from '@atacknimal/protocol';
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sendSignal, useRoom } from '../game/online.ts';
import { cardName } from '../game/present.ts';
import { HABITAT } from '../i18n/es.ts';
import styles from './Match.module.css';

/** Tiempo que un marcador recibido sigue a la vista. */
const SIGNAL_VISIBLE_MS = 8000;

export function signalText(view: PlayerView, signal: TeamSignal): string {
  switch (signal.type) {
    case 'wellPlayed':
      return '¡Bien jugado!';
    case 'careful':
      return '¡Cuidado!';
    case 'saveCard':
      return `Guarda tu ${cardName(view, signal.cardId)}`;
    case 'useCard':
      return `Usa tu ${cardName(view, signal.cardId)}`;
    case 'useHabitat':
      return `Ataca en ${HABITAT[signal.habitat].label}`;
  }
}

/**
 * Marcadores rápidos entre compañeros (2 vs 2): la única comunicación del MVP, sin chat libre
 * (docs/GAME_RULES.md §9.2). El servidor solo se los entrega al compañero.
 */
export function SignalBar({
  view,
  partnerId,
  nameOf,
}: {
  view: PlayerView;
  partnerId: string;
  nameOf: (playerId: string) => string;
}) {
  const signals = useRoom((s) => s.signals);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const visible = signals.filter((s) => now - s.at < SIGNAL_VISIBLE_MS);

  // Reloj solo mientras hay marcadores a la vista, para retirarlos cuando caducan. Uno recién
  // llegado siempre es visible: su hora es posterior al último "ahora" medido.
  const pending = visible.length > 0;
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [pending]);

  const send = (signal: TeamSignal): void => {
    void sendSignal(signal).then((response) => {
      setError(response.ok ? null : response.error.message);
    });
  };
  const partner = view.players.find((p) => p.id === partnerId);
  const partnerCards = (partner?.cardIds ?? []).flatMap((id) => {
    const card = view.cards[id];
    return card !== undefined && isActive(card) ? [card] : [];
  });

  return (
    <section className={styles.signals} aria-label="Marcadores del equipo">
      <ul className={styles.signalFeed} aria-live="polite">
        {visible.map((s) => (
          <li key={s.id}>
            <strong>{s.from === view.viewerId ? 'Tú' : nameOf(s.from)}:</strong>{' '}
            {signalText(view, s.signal)}
          </li>
        ))}
      </ul>
      <details className={styles.signalMenu}>
        <summary>
          <MessageSquare size={16} aria-hidden="true" /> Marcadores para {nameOf(partnerId)}
        </summary>
        <div className={styles.signalButtons}>
          <button
            type="button"
            onClick={() => {
              send({ type: 'wellPlayed' });
            }}
          >
            ¡Bien jugado!
          </button>
          <button
            type="button"
            onClick={() => {
              send({ type: 'careful' });
            }}
          >
            ¡Cuidado!
          </button>
          {partnerCards.map((card) => (
            <span key={card.id} className={styles.signalPair}>
              <button
                type="button"
                onClick={() => {
                  send({ type: 'saveCard', cardId: card.id });
                }}
              >
                Guarda tu {cardName(view, card.id)}
              </button>
              <button
                type="button"
                onClick={() => {
                  send({ type: 'useCard', cardId: card.id });
                }}
              >
                Usa tu {cardName(view, card.id)}
              </button>
            </span>
          ))}
          {HABITATS.map((habitat) => (
            <button
              key={habitat}
              type="button"
              onClick={() => {
                send({ type: 'useHabitat', habitat });
              }}
            >
              Ataca en {HABITAT[habitat].label}
            </button>
          ))}
        </div>
        {error !== null && (
          <p className={styles.signalError} role="alert">
            {error}
          </p>
        )}
      </details>
    </section>
  );
}
