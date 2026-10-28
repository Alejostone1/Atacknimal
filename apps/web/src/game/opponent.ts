/**
 * Rival PROVISIONAL de la Fase 6: elige una acción legal al azar a partir de su vista.
 * Solo sirve para poder jugar y probar el combate; la IA con dificultades (Fácil, Normal,
 * Difícil) llega en la Fase 7 y lo sustituye.
 */
import {
  getLegalActions,
  nextInt,
  type Action,
  type PlayerView,
  type RngState,
} from '@atacknimal/engine';

export function chooseOpponentAction(view: PlayerView, rng: RngState): [Action, RngState] {
  const legal = getLegalActions(view, view.viewerId);
  const [index, next] = nextInt(rng, legal.length);
  const action = legal[index];
  if (action === undefined) throw new Error('El rival no tiene acciones legales');
  return [action, next];
}
