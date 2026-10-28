/**
 * Equipos ocultos (#028 A): las cartas rivales no se ven hasta que participan en un duelo.
 */
import { describe, expect, it } from 'vitest';
import type { MatchStartedEvent } from './events.ts';
import { getLegalActions } from './legal.ts';
import type { Ruleset } from './ruleset.ts';
import { RULESET_V0_1 } from './testing/fixtures.ts';
import {
  TEAMS_1V1,
  newMatch,
  play,
  randomPlayout,
  startedMatch,
  startedWith,
} from './testing/helpers.ts';
import { getPlayerView, redactEvent } from './view.ts';

const HIDDEN: Ruleset = { ...RULESET_V0_1, hiddenTeams: true };

describe('equipos ocultos', () => {
  it('al empezar, el rival solo sabe cuántas cartas tienes', () => {
    const view = getPlayerView(startedWith('p1', TEAMS_1V1, HIDDEN), 'p2');
    expect(view.players.find((p) => p.id === 'p1')).toMatchObject({ cardIds: [], hiddenCards: 4 });
    expect(Object.keys(view.cards).filter((id) => id.startsWith('p1/'))).toEqual([]);
    expect(view.players.find((p) => p.id === 'p2')).toMatchObject({ hiddenCards: 0 });
  });

  it('la vista del rival no depende de qué animales elegiste', () => {
    const teamsA = {
      p1: ['cheetah', 'tiger', 'golden-eagle', 'brown-bear'],
      p2: TEAMS_1V1['p2'] ?? [],
    };
    const teamsB = {
      p1: ['penguin', 'blue-whale', 'wolf', 'great-white-shark'],
      p2: TEAMS_1V1['p2'] ?? [],
    };
    const viewA = getPlayerView(startedMatch('1v1', teamsA, 3, HIDDEN), 'p2');
    const viewB = getPlayerView(startedMatch('1v1', teamsB, 3, HIDDEN), 'p2');
    expect(viewA).toEqual(viewB);
  });

  it('las dos cartas de un duelo se revelan; el resto sigue oculto', () => {
    const { state } = play(startedWith('p1', TEAMS_1V1, HIDDEN), [
      {
        type: 'declare',
        playerId: 'p1',
        habitat: 'land',
        cardId: 'p1/cheetah',
        attribute: 'speed',
      },
      { type: 'defend', playerId: 'p2', cardId: 'p2/wolf' },
    ]);
    const p2View = getPlayerView(state, 'p2');
    expect(p2View.players.find((p) => p.id === 'p1')).toMatchObject({
      cardIds: ['p1/cheetah'],
      hiddenCards: 3,
    });
    expect(p2View.cards['p1/cheetah']).toMatchObject({
      revealed: true,
      locks: [{ attribute: 'speed' }],
    });
    expect(getPlayerView(state, 'p1').cards['p2/wolf']).toMatchObject({ hp: 70 });
  });

  it('el evento de inicio no revela los equipos rivales', () => {
    const { state, events } = play(newMatch('1v1', 1, HIDDEN), [
      { type: 'selectTeam', playerId: 'p1', animalIds: TEAMS_1V1['p1'] ?? [] },
      { type: 'selectTeam', playerId: 'p2', animalIds: TEAMS_1V1['p2'] ?? [] },
    ]);
    const started = events.find((e): e is MatchStartedEvent => e.type === 'matchStarted');
    if (started === undefined) throw new Error('Sin evento de inicio');
    expect(redactEvent(started, state, 'p2')).toMatchObject({
      teams: { p1: null, p2: TEAMS_1V1['p2'] },
    });
  });

  it('sin hiddenTeams, los equipos son públicos desde el inicio', () => {
    const view = getPlayerView(startedWith('p1'), 'p2');
    expect(view.players.find((p) => p.id === 'p1')).toMatchObject({ hiddenCards: 0 });
    expect(view.players.find((p) => p.id === 'p1')?.cardIds).toHaveLength(4);
  });

  it('las partidas terminan y cada jugador calcula sus acciones desde su vista', () => {
    for (const mode of ['1v1', '2v2'] as const) {
      for (let seed = 1; seed <= 30; seed++) {
        const { state } = randomPlayout(
          startedMatch(mode, undefined, seed, HIDDEN),
          seed,
          (before) => {
            for (const player of before.players) {
              expect(getLegalActions(getPlayerView(before, player.id), player.id)).toEqual(
                getLegalActions(before, player.id),
              );
            }
          },
        );
        expect(state.result).not.toBeNull();
      }
    }
  });
});
