/**
 * Datos de prueba: copia del ruleset v0.1 y de los perfiles de docs/BALANCE.md §3–4.
 * Solo los usan los tests del motor. El contenido real vivirá en @atacknimal/content (Fase 4).
 */
import type { Affinity } from '../domain.ts';
import type { AnimalProfile } from '../roster.ts';
import type { Ruleset } from '../ruleset.ts';

export const RULESET_V0_1: Ruleset = {
  version: '0.1.0',
  teamSize: 4,
  baseHp: 100,
  habitatModifiers: { native: 10, adapted: 4, neutral: 0, hostile: -15 },
  damage: { base: 20, k: 0.5, min: 20, max: 45, counterRatio: 0.5 },
  lockDuration: 1,
  maxDuels: 30,
  abilitiesEnabled: false,
  defenderBonus: 0,
  teamAttributeLock: 0,
  habitatCooldown: 0,
};

type Stats = readonly [
  weight: number,
  strength: number,
  agility: number,
  attack: number,
  endurance: number,
  speed: number,
  defense: number,
  perception: number,
];
type Affinities = readonly [air: Affinity, water: Affinity, land: Affinity, trees: Affinity];

const N = 'native';
const A = 'adapted';
const O = 'neutral';
const H = 'hostile';

function profile(id: string, s: Stats, a: Affinities): AnimalProfile {
  return {
    id,
    stats: {
      weight: s[0],
      strength: s[1],
      agility: s[2],
      attack: s[3],
      endurance: s[4],
      speed: s[5],
      defense: s[6],
      perception: s[7],
    },
    affinities: { air: a[0], water: a[1], land: a[2], trees: a[3] },
  };
}

export const ROSTER_V0_1: readonly AnimalProfile[] = [
  profile('cheetah', [35, 58, 92, 82, 62, 100, 45, 82], [H, H, N, A]),
  profile('golden-eagle', [15, 45, 90, 84, 70, 88, 66, 100], [N, O, O, A]),
  profile('brown-bear', [84, 92, 45, 80, 80, 40, 88, 60], [H, A, N, O]),
  profile('great-white-shark', [80, 82, 45, 96, 62, 88, 50, 62], [H, N, H, H]),
  profile('wolf', [45, 62, 78, 76, 90, 80, 50, 88], [H, O, N, H]),
  profile('elephant', [100, 94, 30, 72, 82, 40, 80, 70], [H, A, N, H]),
  profile('rhinoceros', [90, 84, 35, 80, 78, 45, 100, 45], [H, O, N, H]),
  profile('crocodile', [78, 84, 40, 90, 75, 45, 90, 60], [H, N, A, H]),
  profile('tiger', [65, 82, 88, 94, 48, 80, 48, 60], [H, A, N, A]),
  profile('penguin', [35, 40, 82, 49, 92, 82, 80, 90], [H, N, A, H]),
  profile('blue-whale', [96, 84, 25, 40, 100, 70, 76, 75], [H, N, H, H]),
];

export function rosterProfile(id: string): AnimalProfile {
  const found = ROSTER_V0_1.find((p) => p.id === id);
  if (found === undefined) throw new Error(`Perfil de prueba inexistente: ${id}`);
  return found;
}
