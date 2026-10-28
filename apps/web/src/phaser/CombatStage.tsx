import Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import { DuelScene, type PresentRequest } from './DuelScene.ts';
import type { DuelPresentation } from './presentation.ts';
import styles from './CombatStage.module.css';

interface CombatStageProps {
  presentation: DuelPresentation;
  /** Phaser avisa de que terminó la animación (solo presentación: el resultado ya está aplicado). */
  onComplete: () => void;
}

/**
 * Único punto de contacto entre React y Phaser (ARCHITECTURE §6): crea el juego una vez,
 * le entrega la presentación por el registro y lo destruye al desmontarse.
 */
export function CombatStage({ presentation, onComplete }: CombatStageProps) {
  const host = useRef<HTMLDivElement>(null);
  const game = useRef<Phaser.Game | null>(null);
  const done = useRef(onComplete);
  useEffect(() => {
    done.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (host.current === null) return;
    const instance = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current,
      backgroundColor: '#0e1411',
      banner: false,
      // Sin sonido todavía: evita crear (y cerrar en cada duelo) un AudioContext.
      audio: { noAudio: true },
      scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
      scene: [DuelScene],
    });
    game.current = instance;
    return () => {
      game.current = null;
      instance.destroy(true);
    };
  }, []);

  useEffect(() => {
    const request: PresentRequest = {
      data: presentation,
      onDone: () => {
        done.current();
      },
    };
    // Las fuentes del sistema visual deben estar cargadas antes de dibujar texto en el canvas.
    void document.fonts.ready.then(() => {
      game.current?.registry.set('presentation', request);
    });
  }, [presentation]);

  return <div ref={host} className={styles.stage} aria-hidden="true" />;
}
