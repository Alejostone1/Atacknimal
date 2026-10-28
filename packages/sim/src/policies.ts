import {
  ATTRIBUTES,
  HABITATS,
  computeValue,
  getDefenseOptions,
  getLegalActions,
  nextInt,
  type Action,
  type AnimalProfile,
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
export const randomPolicy: Policy = (view, rng) =>
  pickBest(getLegalActions(view, view.viewerId), () => 0, rng);

/**
 * Maximiza el margen inmediato.
 * Al atacar, supone que el rival responderá con su mejor defensa legal. Si el rival tiene
 * cartas ocultas, las estima con el valor máximo esperado entre los animales que podrían ser.
 * Al defender, elige el mayor valor efectivo; en defensa forzada, la carta con más vitalidad.
 */
export const greedyPolicy: Policy = (view, rng) => {
  const legal = getLegalActions(view, view.viewerId);
  const { turn, declaration } = view;
  if (turn === null) throw new Error('El bot no tiene turno');

  if (view.phase === 'declare') {
    const hidden = hiddenRivals(view, turn.defenderId);
    const rivalBest = new Map<string, number>();
    for (const habitat of HABITATS) {
      for (const attribute of ATTRIBUTES) {
        const options = getDefenseOptions(view, turn.defenderId, attribute);
        const known =
          options.forced || options.cardIds.length === 0
            ? 0
            : Math.max(
                ...options.cardIds.map((id) => valueOf(view, card(view, id), attribute, habitat)),
              );
        const guessed =
          hidden.count === 0
            ? 0
            : expectedMax(
                hidden.candidates.map(
                  (profile) => computeValue(profile, attribute, habitat, view.ruleset).effective,
                ),
                hidden.count,
              );
        rivalBest.set(`${habitat}/${attribute}`, Math.max(known, guessed));
      }
    }
    return pickBest(
      legal,
      (action) =>
        action.type === 'declare'
          ? valueOf(view, card(view, action.cardId), action.attribute, action.habitat) -
            (rivalBest.get(`${action.habitat}/${action.attribute}`) ?? 0)
          : 0,
      rng,
    );
  }

  if (declaration === null) throw new Error('Defensa sin declaración');
  const forced = getDefenseOptions(view, view.viewerId, declaration.attribute).forced;
  return pickBest(
    legal,
    (action) => {
      if (action.type !== 'defend') return 0;
      const defender = card(view, action.cardId);
      return forced
        ? defender.hp
        : valueOf(view, defender, declaration.attribute, declaration.habitat);
    },
    rng,
  );
};

/**
 * Diagnóstico: ataca con su mayor valor efectivo propio **sin mirar al rival**
 * (simula no conocer el equipo rival) y defiende como `greedy`.
 */
export const blindPolicy: Policy = (view, rng) => {
  if (view.phase !== 'declare') return greedyPolicy(view, rng);
  return pickBest(
    getLegalActions(view, view.viewerId),
    (action) =>
      action.type === 'declare'
        ? valueOf(view, card(view, action.cardId), action.attribute, action.habitat)
        : 0,
    rng,
  );
};

export const POLICIES = {
  random: randomPolicy,
  greedy: greedyPolicy,
  blind: blindPolicy,
} as const;
export type PolicyName = keyof typeof POLICIES;

export function isPolicyName(value: string): value is PolicyName {
  return Object.hasOwn(POLICIES, value);
}

/** Cartas ocultas del defensor y animales que podrían ser (los no revelados en su equipo). */
function hiddenRivals(
  view: PlayerView,
  defenderId: string,
): { count: number; candidates: AnimalProfile[] } {
  const defender = view.players.find((p) => p.id === defenderId);
  const count = defender?.hiddenCards ?? 0;
  if (defender === undefined || count === 0) return { count: 0, candidates: [] };
  const teamRevealed = new Set(
    view.players
      .filter((p) => p.team === defender.team)
      .flatMap((p) => p.cardIds ?? [])
      .map((id) => card(view, id).animalId),
  );
  return {
    count,
    candidates: Object.values(view.roster).filter((profile) => !teamRevealed.has(profile.id)),
  };
}

/** Valor esperado del máximo de `k` valores elegidos al azar, sin reemplazo, de `values`. */
export function expectedMax(values: readonly number[], k: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  if (k <= 0 || n === 0) return 0;
  if (k >= n) return sorted[n - 1] ?? 0;
  const total = binomial(n, k);
  return sorted.reduce((sum, value, i) => sum + (value * binomial(i, k - 1)) / total, 0);
}

function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
  return result;
}

function card(view: PlayerView, cardId: string): CardState {
  const found = view.cards[cardId];
  if (found === undefined) throw new Error(`Carta no visible: ${cardId}`);
  return found;
}

function valueOf(
  view: PlayerView,
  target: CardState,
  attribute: (typeof ATTRIBUTES)[number],
  habitat: (typeof HABITATS)[number],
): number {
  const profile = view.roster[target.animalId];
  if (profile === undefined) throw new Error(`Animal sin perfil: ${target.animalId}`);
  return computeValue(profile, attribute, habitat, view.ruleset).effective;
}

/** Mejor candidata según `score`; los empates se rompen al azar con el RNG del bot. */
function pickBest<T>(
  candidates: readonly T[],
  score: (candidate: T) => number,
  rng: RngState,
): [T, RngState] {
  let bestScore = -Infinity;
  let best: T[] = [];
  for (const candidate of candidates) {
    const value = score(candidate);
    if (value > bestScore) {
      bestScore = value;
      best = [candidate];
    } else if (value === bestScore) {
      best.push(candidate);
    }
  }
  const [index, next] = nextInt(rng, best.length);
  const chosen = best[index];
  if (chosen === undefined) throw new Error('No hay acciones legales');
  return [chosen, next];
}
