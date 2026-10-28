import type { Action } from './actions.ts';
import { applyDeclare, applyDefend } from './duel.ts';
import { fail, ok, type Result } from './errors.ts';
import type { Transition } from './events.ts';
import { getPlayer, findPlayer, otherTeam } from './queries.ts';
import { applySelectTeam } from './setup.ts';
import type { MatchResult, MatchState, PlayerId } from './state.ts';

/**
 * Punto de entrada único de las reglas: valida la acción y devuelve el estado nuevo
 * con sus eventos, o un `RuleError` sin modificar nada. Función pura.
 */
export function applyAction(state: MatchState, action: Action): Result<Transition> {
  if (state.result !== null) return fail('MATCH_FINISHED', 'La partida ya terminó.');
  if (findPlayer(state, action.playerId) === undefined) {
    return fail('UNKNOWN_PLAYER', 'Jugador desconocido en esta partida.');
  }

  switch (action.type) {
    case 'selectTeam':
      return applySelectTeam(state, action);
    case 'declare':
      return applyDeclare(state, action);
    case 'defend':
      return applyDefend(state, action);
    case 'concede':
      return ok(concede(state, action.playerId));
  }
}

/** Abandonar hace perder a todo el equipo (docs/GAME_RULES.md §10.3). */
function concede(state: MatchState, playerId: PlayerId): Transition {
  const result: MatchResult = {
    winner: otherTeam(getPlayer(state, playerId).team),
    reason: 'concede',
  };
  return {
    state: { ...state, phase: 'finished', turn: null, declaration: null, result },
    events: [
      { type: 'conceded', playerId },
      { type: 'matchFinished', result },
    ],
  };
}
