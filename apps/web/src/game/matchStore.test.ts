import {
  applyAction,
  createRng,
  getLegalActions,
  getPlayerView,
  redactEvent,
  type Action,
  type PlayerView,
} from '@atacknimal/engine';
import type { ClientAction } from '@atacknimal/protocol';
import { afterEach, describe, expect, it } from 'vitest';
import { BALANCE } from '../content/catalog.ts';
import { createLocalMatch, HUMAN, RIVAL, rivalTeam } from './localMatch.ts';
import { bindOnlineSender, currentActor, useMatch } from './matchStore.ts';

const TEAM = ['cheetah', 'golden-eagle', 'brown-bear', 'great-white-shark'];

afterEach(() => {
  useMatch.getState().leave();
});

/** La interfaz nunca envía `playerId`: lo pone el motor local o el servidor. */
function toClient(action: Action): ClientAction {
  switch (action.type) {
    case 'declare':
      return {
        type: 'declare',
        habitat: action.habitat,
        cardId: action.cardId,
        attribute: action.attribute,
      };
    case 'defend':
      return { type: 'defend', cardId: action.cardId };
    case 'concede':
    case 'selectTeam':
      return { type: 'concede' };
  }
}

function firstLegal(view: PlayerView): ClientAction {
  const action = getLegalActions(view, view.viewerId)[0];
  if (action === undefined) throw new Error('El jugador no tiene acciones');
  return toClient(action);
}

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
      store.getState().act(firstLegal(view));
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
        useMatch.getState().act(firstLegal(view));
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
    useMatch.getState().act({ type: 'defend', cardId: 'nada' });
    expect(useMatch.getState().error).not.toBeNull();
    expect(useMatch.getState().view).toBe(before);
  });
});

describe('partida online', () => {
  it('muestra cada duelo con la vitalidad previa y envía las acciones al servidor', () => {
    // Simula al servidor con el motor: el store solo recibe vistas redactadas.
    let { state } = createLocalMatch(TEAM, 5);
    const update = (events: Parameters<typeof redactEvent>[0][]) => ({
      view: getPlayerView(state, HUMAN),
      events: events.map((event) => redactEvent(event, state, HUMAN)),
      turnEndsInMs: 20_000,
      history: null,
    });
    useMatch.getState().receive({ ...update([]), history: [] });
    expect(useMatch.getState().source).toEqual({ kind: 'online' });
    expect(useMatch.getState().turnDeadline).toBeGreaterThan(Date.now());

    const sent: ClientAction[] = [];
    bindOnlineSender((action) => {
      sent.push(action);
    });
    const before = useMatch.getState().view;
    if (before === null) throw new Error('Sin vista');
    useMatch.getState().act({ type: 'concede' });
    expect(sent).toEqual([{ type: 'concede' }]);
    expect(useMatch.getState().view).toBe(before);

    // Un duelo completo resuelto en el "servidor".
    const events = [];
    for (const actor of [state.turn?.attackerId, state.turn?.defenderId]) {
      if (actor === undefined) throw new Error('Sin turno');
      const action = getLegalActions(state, actor)[0];
      if (action === undefined) throw new Error('Sin acción');
      const result = applyAction(state, action);
      if (!result.ok) throw new Error(result.error.message);
      state = result.value.state;
      events.push(...result.value.events);
    }
    useMatch.getState().receive(update(events));
    const { presenting, log } = useMatch.getState();
    expect(log).toHaveLength(1);
    expect(presenting?.hpBefore).toEqual({
      attacker: BALANCE.ruleset.baseHp,
      defender: BALANCE.ruleset.baseHp,
    });

    // Al reconectar, el historial reconstruye el registro sin volver a animar nada.
    const resolved = log[0]?.resolution;
    if (resolved === undefined) throw new Error('Sin duelo');
    useMatch.getState().leave();
    useMatch.getState().receive({ ...update([]), history: [resolved] });
    expect(useMatch.getState().presenting).toBeNull();
    expect(useMatch.getState().log.map((d) => d.hpBefore)).toEqual([
      { attacker: BALANCE.ruleset.baseHp, defender: BALANCE.ruleset.baseHp },
    ]);
  });
});
