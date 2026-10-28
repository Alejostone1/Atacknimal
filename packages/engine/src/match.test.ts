import { describe, expect, it } from 'vitest';
import { applyAction } from './apply.ts';
import type { MatchStartedEvent, TurnStartedEvent } from './events.ts';
import { createMatch, MatchConfigError } from './match.ts';
import { checkOutcome } from './outcome.ts';
import type { MatchState } from './state.ts';
import { RULESET_V0_1, ROSTER_V0_1 } from './testing/fixtures.ts';
import {
  PLAYERS,
  TEAMS_2V2,
  newMatch,
  patchCards,
  play,
  startedMatch,
  startedWith,
  unwrap,
} from './testing/helpers.ts';
import { resolveTurn } from './turns.ts';

const KILL = { hp: 0 };

describe('creación de partida', () => {
  it('rechaza configuraciones imposibles', () => {
    const base = {
      id: 'x',
      mode: '1v1' as const,
      ruleset: RULESET_V0_1,
      roster: ROSTER_V0_1,
      seed: 1,
    };
    expect(() => createMatch({ ...base, players: PLAYERS['2v2'] })).toThrow(MatchConfigError);
    expect(() =>
      createMatch({
        ...base,
        players: PLAYERS['1v1'],
        ruleset: { ...RULESET_V0_1, abilitiesEnabled: true },
      }),
    ).toThrow(MatchConfigError);
    expect(() =>
      createMatch({
        ...base,
        players: [
          { id: 'p1', team: 'A', seat: 1 },
          { id: 'p2', team: 'A', seat: 1 },
        ],
      }),
    ).toThrow(MatchConfigError);
  });

  it('empieza en preparación, sin cartas ni turno', () => {
    const state = newMatch('1v1');
    expect(state).toMatchObject({ phase: 'setup', duelNumber: 0, turn: null, cards: {} });
  });
});

describe('preparación de equipos (GAME_RULES §3)', () => {
  const select = (state: MatchState, playerId: string, animalIds: readonly string[]) =>
    applyAction(state, { type: 'selectTeam', playerId, animalIds });

  it('valida tamaño, animales conocidos y repeticiones', () => {
    const state = newMatch('1v1');
    expect(select(state, 'p1', ['cheetah'])).toMatchObject({
      error: { code: 'INVALID_TEAM_SIZE' },
    });
    expect(select(state, 'p1', ['cheetah', 'tiger', 'wolf', 'lion'])).toMatchObject({
      error: { code: 'UNKNOWN_ANIMAL' },
    });
    expect(select(state, 'p1', ['cheetah', 'cheetah', 'wolf', 'tiger'])).toMatchObject({
      error: { code: 'DUPLICATE_ANIMAL' },
    });
  });

  it('no permite confirmar dos veces', () => {
    const once = unwrap(
      select(newMatch('1v1'), 'p1', ['cheetah', 'tiger', 'wolf', 'penguin']),
    ).state;
    expect(select(once, 'p1', ['elephant', 'tiger', 'wolf', 'penguin'])).toMatchObject({
      error: { code: 'TEAM_ALREADY_CONFIRMED' },
    });
  });

  it('en 2v2 los compañeros no pueden repetir animal, pero los rivales sí', () => {
    const afterA1 = unwrap(select(newMatch('2v2'), 'a1', ['cheetah', 'wolf'])).state;
    expect(select(afterA1, 'a2', ['wolf', 'tiger'])).toMatchObject({
      error: { code: 'DUPLICATE_ANIMAL' },
    });
    expect(select(afterA1, 'b1', ['cheetah', 'wolf']).ok).toBe(true);
  });

  it('cuando todos confirman, sortea y empieza el duelo 1', () => {
    const { state, events } = play(newMatch('1v1', 7), [
      { type: 'selectTeam', playerId: 'p1', animalIds: ['cheetah', 'tiger', 'wolf', 'penguin'] },
      { type: 'selectTeam', playerId: 'p2', animalIds: ['elephant', 'tiger', 'wolf', 'penguin'] },
    ]);
    expect(state.phase).toBe('declare');
    expect(state.duelNumber).toBe(1);
    expect(state.cards['p1/cheetah']).toMatchObject({ hp: 100, maxHp: 100, locks: [] });
    expect(events.map((e) => e.type)).toEqual([
      'teamConfirmed',
      'teamConfirmed',
      'matchStarted',
      'turnStarted',
    ]);
  });

  it('no se puede atacar durante la preparación', () => {
    expect(
      applyAction(newMatch('1v1'), {
        type: 'declare',
        playerId: 'p1',
        habitat: 'land',
        cardId: 'p1/cheetah',
        attribute: 'speed',
      }),
    ).toMatchObject({ error: { code: 'WRONG_PHASE' } });
  });
});

describe('validación de la declaración (GAME_RULES §5.1)', () => {
  const state = startedWith('p1');
  const declare = (overrides: Record<string, unknown>) =>
    applyAction(state, {
      type: 'declare',
      playerId: 'p1',
      habitat: 'land',
      cardId: 'p1/cheetah',
      attribute: 'speed',
      ...overrides,
    } as never);

  it.each([
    [{ playerId: 'p2', cardId: 'p2/wolf' }, 'NOT_YOUR_TURN'],
    [{ playerId: 'nadie' }, 'UNKNOWN_PLAYER'],
    [{ habitat: 'desierto' }, 'INVALID_HABITAT'],
    [{ attribute: 'carisma' }, 'INVALID_ATTRIBUTE'],
    [{ cardId: 'p1/lion' }, 'UNKNOWN_CARD'],
    [{ cardId: 'p2/wolf' }, 'NOT_YOUR_CARD'],
  ])('%o → %s', (overrides, code) => {
    expect(declare(overrides)).toMatchObject({ ok: false, error: { code } });
  });

  it('rechaza una carta eliminada y un atributo bloqueado', () => {
    const patched = patchCards(state, {
      'p1/tiger': KILL,
      'p1/cheetah': { locks: [{ attribute: 'speed', remaining: 1 }] },
    });
    expect(
      applyAction(patched, {
        type: 'declare',
        playerId: 'p1',
        habitat: 'land',
        cardId: 'p1/tiger',
        attribute: 'attack',
      }),
    ).toMatchObject({ error: { code: 'CARD_ELIMINATED' } });
    expect(
      applyAction(patched, {
        type: 'declare',
        playerId: 'p1',
        habitat: 'land',
        cardId: 'p1/cheetah',
        attribute: 'speed',
      }),
    ).toMatchObject({ error: { code: 'ATTRIBUTE_LOCKED' } });
  });

  it('una acción rechazada no modifica el estado', () => {
    const before = JSON.stringify(state);
    declare({ playerId: 'p2' });
    expect(JSON.stringify(state)).toBe(before);
  });
});

describe('orden de turnos (GAME_RULES §9)', () => {
  it('1v1: el atacante alterna en cada duelo', () => {
    let state = startedWith('p1');
    const attackers: string[] = [];
    for (let i = 0; i < 4; i++) {
      const attacker = state.turn?.attackerId ?? '';
      const defender = state.turn?.defenderId ?? '';
      attackers.push(attacker);
      state = play(state, [
        {
          type: 'declare',
          playerId: attacker,
          habitat: 'trees',
          cardId: `${attacker}/${attacker === 'p1' ? 'golden-eagle' : 'wolf'}`,
          attribute: i < 2 ? 'perception' : 'endurance',
        },
        {
          type: 'defend',
          playerId: defender,
          cardId: `${defender}/${defender === 'p1' ? 'brown-bear' : 'rhinoceros'}`,
        },
      ]).state;
    }
    expect(attackers).toEqual(['p1', 'p2', 'p1', 'p2']);
  });

  it('2v2: sigue el ciclo A1→B1, B2→A2, A2→B2, B1→A1', () => {
    const { events } = play(newMatch('2v2', 3), [
      { type: 'selectTeam', playerId: 'a1', animalIds: TEAMS_2V2['a1'] ?? [] },
      { type: 'selectTeam', playerId: 'a2', animalIds: TEAMS_2V2['a2'] ?? [] },
      { type: 'selectTeam', playerId: 'b1', animalIds: TEAMS_2V2['b1'] ?? [] },
      { type: 'selectTeam', playerId: 'b2', animalIds: TEAMS_2V2['b2'] ?? [] },
    ]);
    const started = events.find((e): e is MatchStartedEvent => e.type === 'matchStarted');
    const a = started?.firstTeam === 'A' ? 'a' : 'b';
    const b = a === 'a' ? 'b' : 'a';
    expect(started?.turnOrder).toEqual([
      { attackerId: `${a}1`, defenderId: `${b}1` },
      { attackerId: `${b}2`, defenderId: `${a}2` },
      { attackerId: `${a}2`, defenderId: `${b}2` },
      { attackerId: `${b}1`, defenderId: `${a}1` },
    ]);
  });

  it('2v2: si el defensor designado no tiene cartas, defiende su compañero (relevo)', () => {
    const state = startedMatch('2v2');
    const slot = state.turnOrder[0];
    if (slot === undefined) throw new Error('Sin orden de turnos');
    const defenderCards = state.players.find((p) => p.id === slot.defenderId)?.cardIds ?? [];
    const patched = patchCards(state, Object.fromEntries(defenderCards.map((id) => [id, KILL])));
    const turn = resolveTurn(patched, 0);
    expect(turn?.attackerId).toBe(slot.attackerId);
    expect(turn?.defenderId).not.toBe(slot.defenderId);
    expect(patched.players.find((p) => p.id === turn?.defenderId)?.team).toBe(
      patched.players.find((p) => p.id === slot.defenderId)?.team,
    );
  });

  it('2v2: se salta el turno de un atacante sin cartas', () => {
    const state = startedMatch('2v2');
    const slot = state.turnOrder[0];
    if (slot === undefined) throw new Error('Sin orden de turnos');
    const attackerCards = state.players.find((p) => p.id === slot.attackerId)?.cardIds ?? [];
    const patched = patchCards(state, Object.fromEntries(attackerCards.map((id) => [id, KILL])));
    expect(resolveTurn(patched, 0)).toMatchObject({
      slotIndex: 1,
      attackerId: state.turnOrder[1]?.attackerId,
    });
  });
});

describe('fin de partida (GAME_RULES §10)', () => {
  it('gana quien elimina las 4 cartas rivales', () => {
    const almost = patchCards(startedWith('p1'), {
      'p2/wolf': KILL,
      'p2/crocodile': KILL,
      'p2/rhinoceros': KILL,
      'p2/elephant': { hp: 10 },
    });
    const { state, events } = play(almost, [
      {
        type: 'declare',
        playerId: 'p1',
        habitat: 'land',
        cardId: 'p1/cheetah',
        attribute: 'speed',
      },
      { type: 'defend', playerId: 'p2', cardId: 'p2/elephant' },
    ]);
    expect(state).toMatchObject({
      phase: 'finished',
      turn: null,
      result: { winner: 'A', reason: 'elimination' },
    });
    expect(state.cards['p2/elephant']).toMatchObject({ hp: 0, locks: [] });
    expect(events.at(-1)).toEqual({
      type: 'matchFinished',
      result: { winner: 'A', reason: 'elimination' },
    });
    expect(applyAction(state, { type: 'concede', playerId: 'p2' })).toMatchObject({
      error: { code: 'MATCH_FINISHED' },
    });
  });

  it('al llegar al límite de duelos gana quien tenga más cartas activas', () => {
    const atLimit = patchCards({ ...startedWith('p1'), duelNumber: 30 }, { 'p2/wolf': KILL });
    const { state } = play(atLimit, [
      {
        type: 'declare',
        playerId: 'p1',
        habitat: 'trees',
        cardId: 'p1/golden-eagle',
        attribute: 'perception',
      },
      { type: 'defend', playerId: 'p2', cardId: 'p2/rhinoceros' },
    ]);
    expect(state.result).toEqual({ winner: 'A', reason: 'duel-limit' });
  });

  it('desempata por vitalidad total y, si persiste, es empate', () => {
    const atLimit = { ...startedWith('p1'), duelNumber: 30 };
    expect(checkOutcome(patchCards(atLimit, { 'p1/tiger': { hp: 99 } }))).toEqual({
      winner: 'B',
      reason: 'duel-limit',
    });
    expect(checkOutcome(atLimit)).toEqual({ winner: null, reason: 'duel-limit' });
    expect(checkOutcome({ ...atLimit, duelNumber: 29 })).toBeNull();
  });

  it('rendirse hace perder a todo el equipo', () => {
    const { state, events } = play(startedMatch('2v2'), [{ type: 'concede', playerId: 'b2' }]);
    expect(state.result).toEqual({ winner: 'A', reason: 'concede' });
    expect(events.map((e) => e.type)).toEqual(['conceded', 'matchFinished']);
  });

  it('cada duelo anuncia el siguiente turno', () => {
    const { events } = play(startedWith('p1'), [
      {
        type: 'declare',
        playerId: 'p1',
        habitat: 'land',
        cardId: 'p1/cheetah',
        attribute: 'speed',
      },
      { type: 'defend', playerId: 'p2', cardId: 'p2/wolf' },
    ]);
    expect(events.at(-1)).toEqual<TurnStartedEvent>({
      type: 'turnStarted',
      duelNumber: 2,
      attackerId: 'p2',
      defenderId: 'p1',
    });
  });
});
