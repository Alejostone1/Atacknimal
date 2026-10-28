import { ATTRIBUTES } from '@atacknimal/engine';
import { BALANCE, statTone, type AnimalEntry } from '../content/catalog.ts';
import { ATTRIBUTE } from '../i18n/es.ts';
import { cx } from '../ui/cx.ts';
import styles from './StatList.module.css';

/**
 * Los ocho atributos. El tono de la barra dice algo verdadero del balance:
 * ámbar = pico (identidad del animal), apagado = valle (su debilidad).
 */
export function StatList({ entry }: { entry: AnimalEntry }) {
  const max = BALANCE.budget.statRange.max;
  return (
    <dl className={styles.list}>
      {ATTRIBUTES.map((attribute) => {
        const value = entry.profile.stats[attribute];
        const tone = statTone(value);
        const Icon = ATTRIBUTE[attribute].icon;
        return (
          <div key={attribute} className={cx(styles.row, styles[tone])}>
            <dt className={styles.label}>
              <Icon size={16} aria-hidden="true" />
              {ATTRIBUTE[attribute].label}
              {tone !== 'mid' && (
                <span className="visually-hidden">{tone === 'peak' ? ' (pico)' : ' (valle)'}</span>
              )}
            </dt>
            <dd className={styles.value}>
              <span className={styles.track} aria-hidden="true">
                <span
                  className={styles.fill}
                  style={{ width: `${String((value / max) * 100)}%` }}
                />
              </span>
              <span className="mono">{value}</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
