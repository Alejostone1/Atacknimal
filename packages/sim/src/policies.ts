import {
  computeValue,
  decideAI,
  getLegalActions,
  nextInt,
  type Action,
  type CardState,
  type PlayerView,
  type RngState,
} from '@atacknimal/engine';

/**
 * Política de un bot de simulación. Decide solo con la vista del jugador,
 * igual que un humano: nunca ve la carta atacante al defender.
 */
export type Policy = (view: PlayerView, rng: RngState) => [Action, RngState];

/** Acción legal al azar: línea base y control de errores. */
export const randomPolicy: Policy = (view, rng) => {
  const legal = getLegalActions(view, view.viewerId);
  const [index, next] = nextInt(rng, legal.length);
  const action = legal[index];
  if (action === undefined) throw new Error('No hay acciones legales');
  return [action, next];
};

/** Los tres niveles de la IA del juego (packages/engine/src/ai). */
export const easyPolicy: Policy = (view, rng) => decideAI(view, 'easy', rng);
export const normalPolicy: Policy = (view, rng) => decideAI(view, 'normal', rng);
export const hardPolicy: Policy = (view, rng) => decideAI(view, 'hard', rng);

/**
 * `greedy` es el nombre histórico de los informes de balance: equivale a la IA Normal
 * (maximiza el margen inmediato frente a la mejor defensa estimada del rival).
 */
export const greedyPolicy: Policy = normalPolicy;

/**
 * Diagnóstico: ataca con su mayor valor efectivo propio **sin mirar al rival**
 * (simula no conocer el equipo rival) y defiende como la IA Normal.
 */
export const blindPolicy: Policy = (view, rng) => {
  if (view.phase !== 'declare') return normalPolicy(view, rng);
  const legal = getLegalActions(view, view.viewerId);
  let best = -Infinity;
  let top: Action[] = [];
  for (const action of legal) {
    if (action.type !== 'declare') continue;
    const card: CardState | undefined = view.cards[action.cardId];
    const profile = card === undefined ? undefined : view.roster[card.animalId];
    const score =
      profile === undefined
        ? 0
        : computeValue(profile, action.attribute, action.habitat, view.ruleset).effective;
    if (score > best) {
      best = score;
      top = [action];
    } else if (score === best) top.push(action);
  }
  const [index, next] = nextInt(rng, top.length);
  const chosen = top[index];
  if (chosen === undefined) throw new Error('No hay acciones legales');
  return [chosen, next];
};

export const POLICIES = {
  random: randomPolicy,
  easy: easyPolicy,
  normal: normalPolicy,
  hard: hardPolicy,
  greedy: greedyPolicy,
  blind: blindPolicy,
} as const;
export type PolicyName = keyof typeof POLICIES;

export function isPolicyName(value: string): value is PolicyName {
  return Object.hasOwn(POLICIES, value);
}
