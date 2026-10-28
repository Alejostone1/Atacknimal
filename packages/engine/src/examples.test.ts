/**
 * Los cinco ejemplos resueltos de docs/GAME_RULES.md §18, ejecutados con el motor completo.
 */
import { describe, expect, it } from 'vitest';
import { applyAction } from './apply.ts';
import type { CombatResolution } from './events.ts';
import { getDefenseOptions } from './legal.ts';
import type { MatchState } from './state.ts';
import { patchCards, play, startedWith } from './testing/helpers.ts';

function duel(
  state: MatchState,
  attack: {
    habitat: 'air' | 'water' | 'land' | 'trees';
    cardId: string;
    attribute: 'speed' | 'attack';
  },
  defenseCardId: string,
): { state: MatchState; resolution: CombatResolution } {
  const result = play(state, [
    { type: 'declare', playerId: 'p1', ...attack },
    { type: 'defend', playerId: 'p2', cardId: defenseCardId },
  ]);
  const event = result.events.find((e) => e.type === 'combatResolved');
  if (event?.type !== 'combatResolved') throw new Error('No hubo resolución');
  return { state: result.state, resolution: event.resolution };
}

/** Equipos del ejemplo 3: el defensor necesita al Oso y al Rinoceronte. */
const FORCED_TEAMS = {
  p1: ['cheetah', 'tiger', 'golden-eagle', 'elephant'],
  p2: ['wolf', 'crocodile', 'brown-bear', 'rhinoceros'],
};

describe('ejemplos de GAME_RULES §18', () => {
  it('1 · gana el atacante: Guepardo contra Lobo en Tierra + Velocidad', () => {
    const { state, resolution } = duel(
      startedWith('p1'),
      { habitat: 'land', cardId: 'p1/cheetah', attribute: 'speed' },
      'p2/wolf',
    );
    expect(resolution).toMatchObject({
      outcome: 'attacker',
      margin: 20,
      attacker: { effective: 110, hpAfter: 100 },
      defender: { effective: 90, hpAfter: 70 },
      damage: { targetCardId: 'p2/wolf', amount: 30, isCounter: false },
      forcedDefense: false,
      eliminatedCardId: null,
    });
    expect(state.cards['p1/cheetah']?.locks).toEqual([{ attribute: 'speed', remaining: 1 }]);
    expect(state.cards['p2/wolf']?.locks).toEqual([{ attribute: 'speed', remaining: 1 }]);
  });

  it('2 · contraataque: Tigre contra Cocodrilo en Agua + Ataque', () => {
    const { state, resolution } = duel(
      startedWith('p1'),
      { habitat: 'water', cardId: 'p1/tiger', attribute: 'attack' },
      'p2/crocodile',
    );
    expect(resolution).toMatchObject({
      outcome: 'defender',
      margin: 2,
      attacker: { effective: 98, hpAfter: 89 },
      defender: { effective: 100, hpAfter: 100 },
      damage: { targetCardId: 'p1/tiger', amount: 11, isCounter: true },
    });
    expect(state.cards['p1/tiger']?.locks).toEqual([{ attribute: 'attack', remaining: 1 }]);
    expect(state.cards['p2/crocodile']?.locks).toEqual([{ attribute: 'attack', remaining: 1 }]);
  });

  it('3 · defensa forzada: solo quedan Oso y Rinoceronte con Velocidad bloqueada', () => {
    const speedLock = [{ attribute: 'speed' as const, remaining: 1 }];
    const start = patchCards(startedWith('p1', FORCED_TEAMS), {
      'p2/wolf': { hp: 0 },
      'p2/crocodile': { hp: 0 },
      'p2/brown-bear': { hp: 60, locks: speedLock },
      'p2/rhinoceros': { locks: speedLock },
    });
    expect(getDefenseOptions(start, 'p2', 'speed')).toEqual({
      cardIds: ['p2/brown-bear', 'p2/rhinoceros'],
      forced: true,
    });
  });

  it('4 · empate: espejo de Guepardos en Tierra + Velocidad', () => {
    const start = startedWith('p1', {
      p1: ['cheetah', 'tiger', 'golden-eagle', 'brown-bear'],
      p2: ['cheetah', 'crocodile', 'elephant', 'rhinoceros'],
    });
    const { state, resolution } = duel(
      start,
      { habitat: 'land', cardId: 'p1/cheetah', attribute: 'speed' },
      'p2/cheetah',
    );
    expect(resolution).toMatchObject({ outcome: 'tie', margin: 0, damage: null });
    expect(state.cards['p1/cheetah']?.locks).toEqual([{ attribute: 'speed', remaining: 1 }]);
    expect(state.cards['p2/cheetah']?.locks).toEqual([{ attribute: 'speed', remaining: 1 }]);
    expect(state.duelNumber).toBe(2);
  });

  it('5 · el duelo de los mockups: el Elefante defiende Velocidad', () => {
    const { resolution } = duel(
      startedWith('p1'),
      { habitat: 'land', cardId: 'p1/cheetah', attribute: 'speed' },
      'p2/elephant',
    );
    expect(resolution).toMatchObject({
      attacker: { effective: 110 },
      defender: { effective: 50, hpAfter: 55 },
      margin: 60,
      damage: { amount: 45 },
    });
  });
});

describe('defensa forzada (GAME_RULES §5.3, ejemplo 3 completo)', () => {
  const speedLock = [{ attribute: 'speed' as const, remaining: 1 }];
  const start = patchCards(startedWith('p1', FORCED_TEAMS), {
    'p2/wolf': { hp: 0 },
    'p2/crocodile': { hp: 0 },
    'p2/brown-bear': { hp: 60, locks: speedLock },
    'p2/rhinoceros': { locks: speedLock },
  });

  it('el defensor elige qué carta recibe el golpe, que lucha con 0', () => {
    const { state, resolution } = duel(
      start,
      { habitat: 'land', cardId: 'p1/cheetah', attribute: 'speed' },
      'p2/brown-bear',
    );
    expect(resolution).toMatchObject({
      forcedDefense: true,
      margin: 110,
      defender: { effective: 0, breakdown: null, hpAfter: 15 },
      damage: { targetCardId: 'p2/brown-bear', amount: 45 },
      locksExpired: [{ cardId: 'p2/brown-bear', attribute: 'speed' }],
    });
    expect(state.cards['p2/brown-bear']?.locks).toEqual(speedLock);
  });

  it('sin defensa forzada, una carta bloqueada no puede defender', () => {
    const partial = patchCards(startedWith('p1'), { 'p2/wolf': { locks: speedLock } });
    const declared = play(partial, [
      {
        type: 'declare',
        playerId: 'p1',
        habitat: 'land',
        cardId: 'p1/cheetah',
        attribute: 'speed',
      },
    ]).state;
    expect(
      applyAction(declared, { type: 'defend', playerId: 'p2', cardId: 'p2/wolf' }),
    ).toMatchObject({
      ok: false,
      error: { code: 'ATTRIBUTE_LOCKED' },
    });
  });

  it('una carta eliminada no puede ser elegida ni en defensa forzada', () => {
    const declared = play(start, [
      {
        type: 'declare',
        playerId: 'p1',
        habitat: 'land',
        cardId: 'p1/cheetah',
        attribute: 'speed',
      },
    ]).state;
    expect(
      applyAction(declared, { type: 'defend', playerId: 'p2', cardId: 'p2/wolf' }),
    ).toMatchObject({
      ok: false,
      error: { code: 'CARD_ELIMINATED' },
    });
  });
});
