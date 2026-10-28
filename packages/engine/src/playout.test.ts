/**
 * Partidas completas con acciones legales al azar: comprueban que las reglas
 * siempre terminan, respetan sus invariantes y son deterministas.
 */
import { describe, expect, it } from 'vitest';
import type { CombatResolvedEvent } from './events.ts';
import { getLegalActions } from './legal.ts';
import type { MatchMode, MatchState } from './state.ts';
import { randomPlayout, startedMatch } from './testing/helpers.ts';
import { getPlayerView } from './view.ts';

function checkInvariants(state: MatchState): void {
  for (const card of Object.values(state.cards)) {
    expect(card.hp).toBeGreaterThanOrEqual(0);
    expect(card.hp).toBeLessThanOrEqual(card.maxHp);
    expect(card.locks.length).toBeLessThanOrEqual(state.ruleset.lockDuration);
    if (card.hp === 0) expect(card.locks).toEqual([]);
  }
  expect(state.duelNumber).toBeLessThanOrEqual(state.ruleset.maxDuels);
}

describe.each<[MatchMode, number]>([
  ['1v1', 200],
  ['2v2', 100],
])('partidas completas %s', (mode, games) => {
  it(`${String(games)} partidas terminan respetando las invariantes`, () => {
    for (let seed = 1; seed <= games; seed++) {
      const { state, events } = randomPlayout(startedMatch(mode, undefined, seed), seed, (_, t) => {
        checkInvariants(t.state);
      });
      expect(state.phase).toBe('finished');
      expect(state.result).not.toBeNull();
      expect(events.at(-1)?.type).toBe('matchFinished');

      const duels = events.filter((e): e is CombatResolvedEvent => e.type === 'combatResolved');
      expect(duels.map((e) => e.resolution.duelNumber)).toEqual(duels.map((_, i) => i + 1));
      if (state.result?.reason === 'elimination') {
        const loser = state.result.winner === 'A' ? 'B' : 'A';
        const loserCards = Object.values(state.cards).filter(
          (card) => state.players.find((p) => p.id === card.ownerId)?.team === loser,
        );
        expect(loserCards.every((card) => card.hp === 0)).toBe(true);
      }
    }
  });

  it('es determinista: misma semilla, misma partida', () => {
    const run = () => randomPlayout(startedMatch(mode, undefined, 42), 42);
    expect(JSON.stringify(run())).toBe(JSON.stringify(run()));
  });

  it('las acciones legales son las mismas calculadas desde la vista del jugador', () => {
    randomPlayout(startedMatch(mode, undefined, 9), 9, (state) => {
      for (const player of state.players) {
        expect(getLegalActions(getPlayerView(state, player.id), player.id)).toEqual(
          getLegalActions(state, player.id),
        );
      }
    });
  });

  it('la partida acabada no ofrece acciones', () => {
    const { state } = randomPlayout(startedMatch(mode, undefined, 5), 5);
    for (const player of state.players) expect(getLegalActions(state, player.id)).toEqual([]);
  });
});
