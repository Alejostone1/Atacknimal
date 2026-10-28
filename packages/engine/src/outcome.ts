import { activeCardsOfTeam } from './queries.ts';
import type { MatchResult, MatchState, TeamId } from './state.ts';

/**
 * Comprueba el fin de la partida tras resolver el duelo `state.duelNumber`
 * (docs/GAME_RULES.md §10).
 */
export function checkOutcome(state: MatchState): MatchResult | null {
  const activeA = activeCardsOfTeam(state, 'A');
  const activeB = activeCardsOfTeam(state, 'B');

  if (activeB.length === 0) return { winner: 'A', reason: 'elimination' };
  if (activeA.length === 0) return { winner: 'B', reason: 'elimination' };
  if (state.duelNumber < state.ruleset.maxDuels) return null;

  const byCards = activeA.length - activeB.length;
  const hpA = activeA.reduce((sum, card) => sum + card.hp, 0);
  const hpB = activeB.reduce((sum, card) => sum + card.hp, 0);
  const byHp = hpA - hpB;
  const lead = byCards !== 0 ? byCards : byHp;
  const winner: TeamId | null = lead > 0 ? 'A' : lead < 0 ? 'B' : null;
  return { winner, reason: 'duel-limit' };
}
