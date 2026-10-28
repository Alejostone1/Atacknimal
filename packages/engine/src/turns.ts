import { invariant } from './errors.ts';
import { activeCardsOfPlayer, otherTeam, teammatesOf } from './queries.ts';
import type { MatchState, PlayerState, PlayerId, TeamId, TurnSlot } from './state.ts';

/**
 * Orden de turnos (docs/GAME_RULES.md §9):
 * 1v1 → alternancia estricta; 2v2 → A1→B1, B2→A2, A2→B2, B1→A1.
 * "A" es el equipo que ganó el sorteo inicial.
 */
export function buildTurnOrder(players: readonly PlayerState[], firstTeam: TeamId): TurnSlot[] {
  const seatOf = (team: TeamId, seat: number): PlayerId => {
    const player = players.find((p) => p.team === team && p.seat === seat);
    invariant(player, `Falta el jugador del asiento ${String(seat)} del equipo ${team}.`);
    return player.id;
  };
  const a = firstTeam;
  const b = otherTeam(firstTeam);

  if (players.length === 2) {
    return [
      { attackerId: seatOf(a, 1), defenderId: seatOf(b, 1) },
      { attackerId: seatOf(b, 1), defenderId: seatOf(a, 1) },
    ];
  }
  return [
    { attackerId: seatOf(a, 1), defenderId: seatOf(b, 1) },
    { attackerId: seatOf(b, 2), defenderId: seatOf(a, 2) },
    { attackerId: seatOf(a, 2), defenderId: seatOf(b, 2) },
    { attackerId: seatOf(b, 1), defenderId: seatOf(a, 1) },
  ];
}

export interface ResolvedTurn {
  readonly slotIndex: number;
  readonly attackerId: PlayerId;
  readonly defenderId: PlayerId;
}

/**
 * Primer turno jugable a partir de `fromSlot`:
 * se salta a los atacantes sin cartas activas y, si el defensor designado
 * no tiene cartas activas, defiende su compañero (relevo).
 * Devuelve `null` si nadie puede jugar (la partida ya debería haber terminado).
 */
export function resolveTurn(state: MatchState, fromSlot: number): ResolvedTurn | null {
  const { turnOrder } = state;
  for (let step = 0; step < turnOrder.length; step++) {
    const slotIndex = (fromSlot + step) % turnOrder.length;
    const slot = turnOrder[slotIndex];
    invariant(slot, 'Orden de turnos vacío.');
    if (activeCardsOfPlayer(state, slot.attackerId).length === 0) continue;

    const defenderId = hasActiveCards(state, slot.defenderId)
      ? slot.defenderId
      : teammatesOf(state, slot.defenderId).find((p) => hasActiveCards(state, p.id))?.id;
    if (defenderId === undefined) return null;

    return { slotIndex, attackerId: slot.attackerId, defenderId };
  }
  return null;
}

function hasActiveCards(state: MatchState, playerId: PlayerId): boolean {
  return activeCardsOfPlayer(state, playerId).length > 0;
}
