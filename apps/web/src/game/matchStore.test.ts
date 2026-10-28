import { getLegalActions } from '@atacknimal/engine';
import { afterEach, describe, expect, it } from 'vitest';
import { BALANCE } from '../content/catalog.ts';
import { rivalTeam } from './localMatch.ts';
import { currentActor, HUMAN, RIVAL, useMatch } from './matchStore.ts';
import { createRng } from '@atacknimal/engine';

const TEAM = ['cheetah', 'golden-eagle', 'brown-bear', 'great-white-shark'];

afterEach(() => {
  useMatch.getState().leave();
});

/** Juega la partida entera: el jugador elige siempre su primera acción legal. */
function playToEnd(seed: number) {
  const store = useMatch;
  store.getState().start(TEAM, 'normal', seed);
  for (let guard = 0; guard < 200; guard++) {
    const { view, presenting } = store.getState();
    if (view === null || view.result !== null) break;
    if (presenting !== null) {
      store.getState().acknowledge();
      continue;
    }
    if (currentActor(view) === HUMAN) {
      const action = getLegalActions(view, HUMAN)[0];
      if (action === undefined) throw new Error('El jugador no tiene acciones');
      store.getState().act(action);
    } else {
      store.getState().opponentStep();
    }
  }
  return store.getState();
}

describe('partida local contra el rival provisional', () => {
  it('el rival forma un equipo legal de animales distintos', () => {
    const [team] = rivalTeam(createRng(5), BALANCE.ruleset.teamSize);
    expect(new Set(team).size).toBe(BALANCE.ruleset.teamSize);
  });

  it('se juega hasta el final y registra cada duelo', () => {
    const final = playToEnd(7);
    expect(final.view?.result).not.toBeNull();
    expect(final.log.length).toBe(final.view?.lastResolution?.duelNumber);
    expect(final.error).toBeNull();
  });

  it('la vista del jugador nunca muestra las cartas rivales sin revelar', () => {
    useMatch.getState().start(TEAM, 'normal', 11);
    const view = useMatch.getState().view;
    const rival = view?.players.find((p) => p.id === RIVAL);
    expect(rival?.hiddenCards).toBe(BALANCE.ruleset.teamSize);
    expect(Object.values(view?.cards ?? {}).some((card) => card.ownerId === RIVAL)).toBe(false);
  });

  it('mientras se muestra un duelo, el rival espera', () => {
    useMatch.getState().start(TEAM, 'normal', 3);
    for (let i = 0; i < 10 && useMatch.getState().presenting === null; i++) {
      const view = useMatch.getState().view;
      if (view === null) break;
      if (currentActor(view) === HUMAN) {
        const action = getLegalActions(view, HUMAN)[0];
        if (action !== undefined) useMatch.getState().act(action);
      } else useMatch.getState().opponentStep();
    }
    const before = useMatch.getState().view;
    useMatch.getState().opponentStep();
    expect(useMatch.getState().view).toBe(before);
  });

  it('rendirse termina la partida con derrota', () => {
    useMatch.getState().start(TEAM, 'normal', 1);
    useMatch.getState().concede();
    expect(useMatch.getState().view?.result).toEqual({ winner: 'B', reason: 'concede' });
  });

  it('una acción ilegal deja un error legible y no cambia la partida', () => {
    useMatch.getState().start(TEAM, 'normal', 1);
    const before = useMatch.getState().view;
    useMatch.getState().act({ type: 'defend', playerId: HUMAN, cardId: 'nada' });
    expect(useMatch.getState().error).not.toBeNull();
    expect(useMatch.getState().view).toBe(before);
  });
});
