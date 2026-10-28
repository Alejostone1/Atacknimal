import { Hammer } from 'lucide-react';
import { Link, Navigate } from 'react-router';
import { Screen } from '../components/Screen.tsx';
import { TeamSlots } from '../components/TeamSlots.tsx';
import { BALANCE } from '../content/catalog.ts';
import { useMatchSetup } from '../state/stores.ts';
import { isTeamComplete } from '../state/team.ts';
import styles from './ReadyScreen.module.css';

const DIFFICULTY_LABEL = { easy: 'Fácil', normal: 'Normal', hard: 'Difícil' } as const;

/** Resumen previo a la partida. El combate (Phaser + IA) llega en las fases 6 y 7. */
export function ReadyScreen() {
  const { team, difficulty } = useMatchSetup();
  if (!isTeamComplete(team, BALANCE.ruleset.teamSize))
    return <Navigate to="/jugar/equipo" replace />;

  return (
    <Screen
      title="Listo para el duelo"
      eyebrow={`Contra la IA · ${DIFFICULTY_LABEL[difficulty]}`}
      back="/jugar/equipo"
      footer={
        <div className={styles.actions}>
          <button type="button" className="btn btn--primary btn--block" disabled>
            Empezar partida
          </button>
          <Link to="/jugar/equipo" className="btn btn--ghost btn--block">
            Cambiar equipo
          </Link>
        </div>
      }
    >
      <TeamSlots team={team} size={BALANCE.ruleset.teamSize} />
      <div className={styles.notice} role="status">
        <Hammer size={20} aria-hidden="true" />
        <p>
          El combate todavía se está construyendo. Tu equipo y la dificultad quedan guardados en
          este navegador para cuando esté listo.
        </p>
      </div>
    </Screen>
  );
}
