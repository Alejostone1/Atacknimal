import { Info } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router';
import { Screen } from '../components/Screen.tsx';
import { TeamSlots } from '../components/TeamSlots.tsx';
import { BALANCE } from '../content/catalog.ts';
import { useMatch } from '../game/matchStore.ts';
import { useMatchSetup } from '../state/stores.ts';
import { isTeamComplete } from '../state/team.ts';
import styles from './ReadyScreen.module.css';

const DIFFICULTY_LABEL = { easy: 'Fácil', normal: 'Normal', hard: 'Difícil' } as const;

/** Resumen previo a la partida: equipo, dificultad y entrada al combate. */
export function ReadyScreen() {
  const { team, difficulty } = useMatchSetup();
  const start = useMatch((s) => s.start);
  const navigate = useNavigate();
  if (!isTeamComplete(team, BALANCE.ruleset.teamSize)) {
    return <Navigate to="/jugar/equipo" replace />;
  }

  return (
    <Screen
      title="Listo para el duelo"
      eyebrow={`Contra la IA · ${DIFFICULTY_LABEL[difficulty]}`}
      back="/jugar/equipo"
      footer={
        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => {
              start(team, difficulty);
              void navigate('/partida');
            }}
          >
            Empezar partida
          </button>
          <Link to="/jugar/equipo" className="btn btn--ghost btn--block">
            Cambiar equipo
          </Link>
        </div>
      }
    >
      <TeamSlots team={team} size={BALANCE.ruleset.teamSize} />
      <div className={styles.notice} role="note">
        <Info size={20} aria-hidden="true" />
        <p>
          Al atacar eliges hábitat, animal y atributo. Quien defiende solo sabe el hábitat y el
          atributo, y tu rival no verá tus animales hasta que entren en combate. Gana quien deje al
          otro sin cartas.
        </p>
      </div>
    </Screen>
  );
}
