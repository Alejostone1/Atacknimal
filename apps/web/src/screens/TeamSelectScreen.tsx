import { EyeOff } from 'lucide-react';
import { Link } from 'react-router';
import { AnimalCard } from '../components/AnimalCard.tsx';
import { AnimalBrowser } from '../components/Browse.tsx';
import { Screen } from '../components/Screen.tsx';
import { TeamSlots } from '../components/TeamSlots.tsx';
import { BALANCE } from '../content/catalog.ts';
import { useMatchSetup } from '../state/stores.ts';
import { isTeamComplete } from '../state/team.ts';
import styles from './TeamSelectScreen.module.css';

export function TeamSelectScreen() {
  const { team, toggle } = useMatchSetup();
  const size = BALANCE.ruleset.teamSize;
  const complete = isTeamComplete(team, size);

  return (
    <Screen
      title="Elige tu equipo"
      eyebrow={`${String(team.length)} de ${String(size)} animales`}
      back="/jugar"
      footer={
        complete ? (
          <Link to="/jugar/listo" className="btn btn--primary btn--block">
            Confirmar equipo
          </Link>
        ) : (
          <button type="button" className="btn btn--primary btn--block" disabled>
            Elige {size - team.length} {size - team.length === 1 ? 'animal más' : 'animales más'}
          </button>
        )
      }
    >
      <div className={styles.layout}>
        <div className={styles.team}>
          <TeamSlots team={team} size={size} onRemove={toggle} />
          {BALANCE.ruleset.hiddenTeams && (
            <p className={styles.hint}>
              <EyeOff size={16} aria-hidden="true" />
              Tu rival no verá tus animales hasta que entren en combate.
            </p>
          )}
        </div>
        <AnimalBrowser
          renderCard={(entry) => {
            const index = team.indexOf(entry.id);
            return (
              <AnimalCard
                entry={entry}
                onToggle={() => {
                  toggle(entry.id);
                }}
                {...(index >= 0 ? { slot: index + 1 } : {})}
                blocked={complete && index < 0}
              />
            );
          }}
        />
      </div>
    </Screen>
  );
}
