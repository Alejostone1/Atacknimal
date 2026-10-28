import { Link } from 'react-router';
import { Screen } from '../components/Screen.tsx';
import { TeamSlots } from '../components/TeamSlots.tsx';
import { BALANCE } from '../content/catalog.ts';
import { useMatchSetup, type Difficulty } from '../state/stores.ts';
import { isTeamComplete } from '../state/team.ts';
import styles from './PlayScreen.module.css';

const DIFFICULTIES: readonly { id: Difficulty; label: string; description: string }[] = [
  {
    id: 'easy',
    label: 'Fácil',
    description: 'Ataca por instinto y a menudo elige mal su defensa.',
  },
  { id: 'normal', label: 'Normal', description: 'Busca siempre el mejor duelo inmediato.' },
  {
    id: 'hard',
    label: 'Difícil',
    description: 'Gestiona bloqueos y vitalidad, y te tiende cebos.',
  },
];

export function PlayScreen() {
  const { difficulty, setDifficulty, team } = useMatchSetup();
  const complete = isTeamComplete(team, BALANCE.ruleset.teamSize);

  return (
    <Screen
      title="Contra la IA"
      eyebrow="Nueva partida"
      back="/"
      footer={
        <Link
          to={complete ? '/jugar/listo' : '/jugar/equipo'}
          className="btn btn--primary btn--block"
        >
          {complete ? 'Continuar con este equipo' : 'Elegir equipo'}
        </Link>
      }
    >
      <section className={styles.section} aria-labelledby="difficulty-title">
        <h2 id="difficulty-title" className={styles.heading}>
          Dificultad
        </h2>
        <div className={styles.options} role="radiogroup" aria-labelledby="difficulty-title">
          {DIFFICULTIES.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={difficulty === option.id}
              className={styles.option}
              onClick={() => {
                setDifficulty(option.id);
              }}
            >
              <span className={styles.optionLabel}>{option.label}</span>
              <span className={styles.optionText}>{option.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="team-title">
        <div className={styles.row}>
          <h2 id="team-title" className={styles.heading}>
            Tu equipo
          </h2>
          {team.length > 0 && (
            <Link to="/jugar/equipo" className={styles.edit}>
              Cambiar
            </Link>
          )}
        </div>
        <TeamSlots team={team} size={BALANCE.ruleset.teamSize} />
      </section>
    </Screen>
  );
}
