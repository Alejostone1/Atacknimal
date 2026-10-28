import type { PlayerView } from '@atacknimal/engine';
import { useMemo, useState } from 'react';
import { useMatch, type PresentedDuel } from '../game/matchStore.ts';
import { describeDuel, toPresentation } from '../game/present.ts';
import { CombatStage } from '../phaser/CombatStage.tsx';
import styles from './Match.module.css';

/** Revelación del duelo: Phaser lo anima y el texto lo explica (el mismo contenido, accesible). */
export function DuelResult({
  view,
  duel,
  reduceMotion,
}: {
  view: PlayerView;
  duel: PresentedDuel;
  reduceMotion: boolean;
}) {
  const acknowledge = useMatch((s) => s.acknowledge);
  const [animated, setAnimated] = useState(false);
  const presentation = useMemo(
    () => toPresentation(view, duel, reduceMotion),
    // La presentación de un duelo no cambia aunque la vista avance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [duel, reduceMotion],
  );

  return (
    <div className={styles.result}>
      <CombatStage
        presentation={presentation}
        onComplete={() => {
          setAnimated(true);
        }}
      />
      <p className={styles.resultText} role="status" aria-live="polite">
        {describeDuel(view, duel)}
      </p>
      <button
        type="button"
        className={animated ? 'btn btn--primary btn--block' : 'btn btn--ghost btn--block'}
        onClick={acknowledge}
      >
        {view.result === null ? 'Continuar' : 'Ver resultado'}
      </button>
    </div>
  );
}
