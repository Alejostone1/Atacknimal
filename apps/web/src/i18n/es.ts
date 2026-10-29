/**
 * Vocabulario de interfaz en español (docs/GAME_RULES.md §17).
 * El código usa los identificadores en inglés del motor; aquí se traducen para el jugador.
 */
import type { IucnCategory, LicenseId } from '@atacknimal/content';
import type { Affinity, Attribute, Habitat } from '@atacknimal/engine';
import {
  BicepsFlexed,
  Eye,
  Gauge,
  HeartPulse,
  Mountain,
  Shield,
  Swords,
  TreePine,
  Waves,
  Weight,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const ATTRIBUTE: Readonly<Record<Attribute, { label: string; icon: LucideIcon }>> = {
  weight: { label: 'Peso', icon: Weight },
  strength: { label: 'Fuerza', icon: BicepsFlexed },
  agility: { label: 'Agilidad', icon: Zap },
  attack: { label: 'Ataque', icon: Swords },
  endurance: { label: 'Resistencia', icon: HeartPulse },
  speed: { label: 'Velocidad', icon: Gauge },
  defense: { label: 'Defensa', icon: Shield },
  perception: { label: 'Percepción', icon: Eye },
};

export const HABITAT: Readonly<
  Record<Habitat, { label: string; scene: string; icon: LucideIcon }>
> = {
  air: { label: 'Aire', scene: 'Cielo abierto', icon: Wind },
  water: { label: 'Agua', scene: 'Mar, ríos y lagos', icon: Waves },
  land: { label: 'Tierra', scene: 'Llanuras y sabana', icon: Mountain },
  trees: { label: 'Árboles', scene: 'Bosque y selva', icon: TreePine },
};

export const AFFINITY: Readonly<Record<Affinity, string>> = {
  native: 'Nativo',
  adapted: 'Adaptado',
  neutral: 'Neutral',
  hostile: 'Hostil',
};

export const IUCN: Readonly<Record<IucnCategory, string>> = {
  LC: 'Preocupación menor',
  NT: 'Casi amenazada',
  VU: 'Vulnerable',
  EN: 'En peligro',
  CR: 'En peligro crítico',
  EW: 'Extinta en estado silvestre',
  EX: 'Extinta',
  DD: 'Datos insuficientes',
};

export const LICENSE: Readonly<Record<LicenseId, string>> = {
  cc0: 'CC0',
  'public-domain': 'Dominio público',
  'cc-by': 'CC BY',
  'cc-by-sa': 'CC BY-SA',
  unsplash: 'Licencia Unsplash',
  pexels: 'Licencia Pexels',
};

/** Modificador con signo legible: "+10", "0", "−10". */
export function signed(value: number): string {
  if (value > 0) return `+${String(value)}`;
  if (value < 0) return `−${String(Math.abs(value))}`;
  return '0';
}
