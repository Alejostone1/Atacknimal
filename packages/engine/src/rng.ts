/**
 * Generador pseudoaleatorio determinista (mulberry32).
 * Su estado forma parte del estado de la partida: misma semilla y mismas acciones,
 * mismo resultado en el navegador y en el servidor.
 */
export interface RngState {
  readonly state: number;
}

export function createRng(seed: number): RngState {
  return { state: seed >>> 0 };
}

/** Devuelve un número en [0, 1) y el estado siguiente. */
export function nextFloat(rng: RngState): [value: number, next: RngState] {
  const state = (rng.state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, { state }];
}

/** Devuelve un entero en [0, maxExclusive) y el estado siguiente. */
export function nextInt(rng: RngState, maxExclusive: number): [value: number, next: RngState] {
  const [value, next] = nextFloat(rng);
  return [Math.floor(value * maxExclusive), next];
}
