import Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import { DuelScene, PIXEL_RATIO_KEY, type PresentRequest } from './DuelScene.ts';
import type { DuelPresentation } from './presentation.ts';
import styles from './CombatStage.module.css';

/** Más de 3× apenas se nota y multiplica la memoria del lienzo en celulares de gama alta. */
const MAX_PIXEL_RATIO = 3;

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
    const element = host.current;
    if (element === null) return;
    // Nitidez en celulares: el lienzo se dibuja a la densidad real de la pantalla (2–3 píxeles
    // físicos por píxel CSS) y se muestra reducido con el zoom. La escena sigue en píxeles CSS.
    const dpr = Math.min(Math.max(window.devicePixelRatio, 1), MAX_PIXEL_RATIO);
    const instance = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current,
      backgroundColor: '#0e1411',
      banner: false,
      // Sin sonido todavía: evita crear (y cerrar en cada duelo) un AudioContext.
      audio: { noAudio: true },
      scale: {
        mode: Phaser.Scale.NONE,
        width: Math.max(1, element.clientWidth * dpr),
        height: Math.max(1, element.clientHeight * dpr),
        zoom: 1 / dpr,
      },
      callbacks: {
        preBoot: (booting) => {
          booting.registry.set(PIXEL_RATIO_KEY, dpr);
        },
      },
      scene: [DuelScene],
    });
    game.current = instance;
    const observer = new ResizeObserver(([entry]) => {
      if (entry === undefined) return;
      const { width, height } = entry.contentRect;
      instance.scale.resize(Math.max(1, width * dpr), Math.max(1, height * dpr));
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
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
