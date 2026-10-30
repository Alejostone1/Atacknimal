import { m } from 'motion/react';
import { cx } from '../ui/cx.ts';
import styles from './Brand.module.css';

/** El zarpazo: tres trazos que se afilan. Firma visual de ATACKNIMAL (marca y selección). */
export function ClawMark({ className }: { className?: string | undefined }) {
  return (
    <svg className={className} viewBox="0 0 44 56" aria-hidden="true" focusable="false">
      <polygon points="17,0 22,0 7,56 5,56" />
      <polygon points="28,2 33,2 18,56 16,56" />
      <polygon points="39,5 44,5 29,56 27,56" />
    </svg>
  );
}

export function Wordmark({ size = 'md' }: { size?: 'md' | 'xl' }) {
  return (
    <span className={cx(styles.wordmark, styles[size])} role="img" aria-label="ATACKNIMAL">
      <span aria-hidden="true">ATACK</span>
      <span className={styles.nimal} aria-hidden="true">
        NIMAL
        <ClawMark className={styles.claw} />
      </span>
    </span>
  );
}

/**
 * Logotipo de la portada: "ATACK" entra por la izquierda, "NIMAL" por la derecha y el zarpazo
 * se dibuja de arriba abajo con un destello. Con "reducir movimiento" aparece directamente.
 */
export function AnimatedWordmark() {
  return (
    <span className={cx(styles.wordmark, styles.xl)} role="img" aria-label="ATACKNIMAL">
      <m.span
        aria-hidden="true"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
      >
        ATACK
      </m.span>
      <m.span
        className={styles.nimal}
        aria-hidden="true"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.25 }}
      >
        NIMAL
        <m.span
          className={styles.clawWrap}
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 0.28, ease: 'easeOut', delay: 0.75 }}
        >
          <ClawMark className={styles.claw} />
        </m.span>
        <m.span
          className={styles.flash}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.5, delay: 0.9 }}
        />
      </m.span>
    </span>
  );
}
