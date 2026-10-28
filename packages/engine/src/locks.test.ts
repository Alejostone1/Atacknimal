import { describe, expect, it } from 'vitest';
import { isLocked, locksAfterDuel } from './locks.ts';
import type { CardState } from './state.ts';

const card = (locks: CardState['locks']): CardState => ({
  id: 'p1/cheetah',
  animalId: 'cheetah',
  ownerId: 'p1',
  hp: 100,
  maxHp: 100,
  locks,
  revealed: false,
});

describe('bloqueos (GAME_RULES §8)', () => {
  it('bloquea el atributo usado durante la siguiente participación', () => {
    expect(locksAfterDuel([], 'speed', 1)).toEqual({
      locks: [{ attribute: 'speed', remaining: 1 }],
      expired: [],
    });
  });

  it('consume el bloqueo anterior antes de aplicar el nuevo', () => {
    expect(locksAfterDuel([{ attribute: 'speed', remaining: 1 }], 'attack', 1)).toEqual({
      locks: [{ attribute: 'attack', remaining: 1 }],
      expired: ['speed'],
    });
  });

  it('con duración 2 acumula hasta dos bloqueos', () => {
    const first = locksAfterDuel([], 'speed', 2).locks;
    const second = locksAfterDuel(first, 'attack', 2);
    expect(second.locks).toEqual([
      { attribute: 'speed', remaining: 1 },
      { attribute: 'attack', remaining: 2 },
    ]);
    expect(locksAfterDuel(second.locks, 'defense', 2).expired).toEqual(['speed']);
  });

  it('una defensa forzada renueva el bloqueo del mismo atributo', () => {
    expect(locksAfterDuel([{ attribute: 'speed', remaining: 1 }], 'speed', 1)).toEqual({
      locks: [{ attribute: 'speed', remaining: 1 }],
      expired: ['speed'],
    });
  });

  it('con duración 0 no bloquea nada', () => {
    expect(locksAfterDuel([], 'speed', 0).locks).toEqual([]);
  });

  it('isLocked solo considera bloqueos vigentes', () => {
    expect(isLocked(card([{ attribute: 'speed', remaining: 1 }]), 'speed')).toBe(true);
    expect(isLocked(card([{ attribute: 'speed', remaining: 1 }]), 'attack')).toBe(false);
    expect(isLocked(card([{ attribute: 'speed', remaining: 0 }]), 'speed')).toBe(false);
  });
});
