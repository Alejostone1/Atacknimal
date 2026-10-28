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
