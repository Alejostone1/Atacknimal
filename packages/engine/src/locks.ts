import type { Attribute } from './domain.ts';
import type { CardState, Lock } from './state.ts';

export function isLocked(card: CardState, attribute: Attribute): boolean {
  return card.locks.some((lock) => lock.attribute === attribute && lock.remaining > 0);
}

/**
 * Bloqueos de una carta tras participar en un duelo (docs/GAME_RULES.md §8.2):
 * 1. consume una participación de los bloqueos que ya tenía;
 * 2. bloquea el atributo comparado durante `duration` participaciones.
 */
export function locksAfterDuel(
  locks: readonly Lock[],
  usedAttribute: Attribute,
  duration: number,
): { locks: readonly Lock[]; expired: readonly Attribute[] } {
  const consumed = locks.map((lock) => ({ ...lock, remaining: lock.remaining - 1 }));
  const expired = consumed.filter((lock) => lock.remaining <= 0).map((lock) => lock.attribute);
  const kept = consumed.filter((lock) => lock.remaining > 0 && lock.attribute !== usedAttribute);
  return {
    locks: duration > 0 ? [...kept, { attribute: usedAttribute, remaining: duration }] : kept,
    expired,
  };
}
