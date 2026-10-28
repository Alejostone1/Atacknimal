import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import styles from './Screen.module.css';

interface ScreenProps {
  title: string;
  /** Ruta a la que vuelve el botón de atrás. */
  back?: string;
  eyebrow?: string;
  /** Barra fija inferior (zona del pulgar en móvil): acciones principales. */
  footer?: ReactNode;
  children: ReactNode;
}

export function Screen({ title, back, eyebrow, footer, children }: ScreenProps) {
  return (
    <div className={styles.screen}>
      <header className={styles.bar}>
        {back !== undefined && (
          <Link to={back} className={styles.back} aria-label="Volver">
            <ChevronLeft size={24} aria-hidden="true" />
          </Link>
        )}
        <div className={styles.titles}>
          {eyebrow !== undefined && <p className="eyebrow">{eyebrow}</p>}
          <h1 className={styles.title}>{title}</h1>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      {footer !== undefined && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
