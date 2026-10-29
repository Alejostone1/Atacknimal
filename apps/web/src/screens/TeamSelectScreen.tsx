import { EyeOff, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { AnimalCard } from '../components/AnimalCard.tsx';
import { AnimalBrowser } from '../components/Browse.tsx';
import { Screen } from '../components/Screen.tsx';
import { TeamSlots } from '../components/TeamSlots.tsx';
import { BALANCE, findEntry } from '../content/catalog.ts';
import { sidesOf, useMatch } from '../game/matchStore.ts';
import { DUO_SIZE, useMatchSetup } from '../state/stores.ts';
import { isTeamComplete } from '../state/team.ts';
import styles from './TeamSelectScreen.module.css';

/** De dónde se viene: contra la IA o desde una sala online (lista cerrada, sin redirecciones libres). */
const FLOWS = {
  ia: { back: '/jugar', next: '/jugar/listo', duo: false },
  sala: { back: '/sala', next: '/sala', duo: false },
  /** Sala 2 vs 2: cada jugador aporta 2 animales, distintos de los de su compañero. */
  sala2: { back: '/sala', next: '/sala', duo: true },
} as const;

/** Animales que tu compañero ya confirmó (solo en una sala 2 vs 2 en curso). */
function usePartnerAnimals(): string[] {
  const view = useMatch((s) => s.view);
  if (view === null) return [];
  return sidesOf(view).partners.flatMap((partner) =>
    (partner.cardIds ?? []).flatMap((id) => {
      const animalId = view.cards[id]?.animalId;
      return animalId === undefined ? [] : [animalId];
    }),
  );
}

export function TeamSelectScreen() {
  const { team, toggle, duo, toggleDuo } = useMatchSetup();
  const [params] = useSearchParams();
  const volver = params.get('volver');
  const flow = volver === 'sala2' ? FLOWS.sala2 : volver === 'sala' ? FLOWS.sala : FLOWS.ia;
  const partnerAnimals = usePartnerAnimals();

  const picks = flow.duo ? duo : team;
  const pick = flow.duo ? toggleDuo : toggle;
  const size = flow.duo ? DUO_SIZE : BALANCE.ruleset.teamSize;
  const complete = isTeamComplete(picks, size);
  const taken = flow.duo ? partnerAnimals : [];

  return (
    <Screen
      title={flow.duo ? 'Elige tus 2 animales' : 'Elige tu equipo'}
      eyebrow={`${String(picks.length)} de ${String(size)} animales`}
      back={flow.back}
      footer={
        complete ? (
          <Link to={flow.next} className="btn btn--primary btn--block">
            Confirmar equipo
          </Link>
        ) : (
          <button type="button" className="btn btn--primary btn--block" disabled>
            Elige {size - picks.length} {size - picks.length === 1 ? 'animal más' : 'animales más'}
          </button>
        )
      }
    >
      <div className={styles.layout}>
        <div className={styles.team}>
          <TeamSlots team={picks} size={size} onRemove={pick} />
          {taken.length > 0 && (
            <p className={styles.hint}>
              <Users size={16} aria-hidden="true" />
              Tu compañero lleva {taken.map((id) => findEntry(id)?.name ?? id).join(' y ')}: no
              podéis repetir animales.
            </p>
          )}
          {BALANCE.ruleset.hiddenTeams && (
            <p className={styles.hint}>
              <EyeOff size={16} aria-hidden="true" />
              Los rivales no verán tus animales hasta que entren en combate.
            </p>
          )}
        </div>
        <AnimalBrowser
          renderCard={(entry) => {
            const index = picks.indexOf(entry.id);
            return (
              <AnimalCard
                entry={entry}
                onToggle={() => {
                  pick(entry.id);
                }}
                {...(index >= 0 ? { slot: index + 1 } : {})}
                blocked={index < 0 && (complete || taken.includes(entry.id))}
              />
            );
          }}
        />
      </div>
    </Screen>
  );
}
