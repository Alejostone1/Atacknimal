/**
 * Traduce resoluciones del motor a lo que ve el jugador: datos para Phaser y un texto
 * equivalente (accesible y para movimiento reducido). No calcula reglas: solo describe.
 */
import type { CombatSide, PlayerView, ValueBreakdown } from '@atacknimal/engine';
import { getHabitatImage } from '@atacknimal/content';
import { findEntry } from '../content/catalog.ts';
import { ATTRIBUTE, HABITAT, signed } from '../i18n/es.ts';
import type { DuelPresentation, DuelRole, DuelSide } from '../phaser/presentation.ts';
import type { PresentedDuel } from './matchStore.ts';

export function cardName(view: PlayerView, cardId: string): string {
  const animalId = view.cards[cardId]?.animalId;
  return findEntry(animalId)?.name ?? 'Carta';
}

export function breakdownText(breakdown: ValueBreakdown | null, habitatLabel: string): string {
  if (breakdown === null) return 'Sin defensa: 0';
  const parts = [String(breakdown.base)];
  if (breakdown.habitatModifier !== 0) {
    parts.push(`${signed(breakdown.habitatModifier)} ${habitatLabel}`);
  }
  if (breakdown.roleModifier !== 0) parts.push(`${signed(breakdown.roleModifier)} defensa`);
  return parts.join(' ');
}

function side(
  view: PlayerView,
  combat: CombatSide,
  hpBefore: number,
  habitatLabel: string,
  nameOf: (playerId: string) => string,
): DuelSide {
  const card = view.cards[combat.cardId];
  const entry = findEntry(card?.animalId);
  return {
    name: entry?.name ?? 'Carta',
    imageUrl: entry?.image?.imageUrl ?? null,
    effective: combat.effective,
    detail: breakdownText(combat.breakdown, habitatLabel),
    hpBefore,
    hpAfter: combat.hpAfter,
    maxHp: card?.maxHp ?? view.ruleset.baseHp,
    owner: combat.playerId === view.viewerId ? 'Tú' : nameOf(combat.playerId),
  };
}

export function toPresentation(
  view: PlayerView,
  duel: PresentedDuel,
  reduceMotion: boolean,
  /** Nombre de cada jugador en las cartas: "IA" en local, su apodo online. */
  nameOf: (playerId: string) => string,
): DuelPresentation {
  const { resolution: r, hpBefore } = duel;
  const habitatLabel = HABITAT[r.habitat].label;
  const roleOf = (cardId: string | null | undefined): DuelRole | null =>
    cardId === r.attacker.cardId ? 'attacker' : cardId === r.defender.cardId ? 'defender' : null;
  return {
    key: `${view.matchId}-${String(r.duelNumber)}`,
    caption: `${habitatLabel} · ${ATTRIBUTE[r.attribute].label}`,
    backdropUrl: getHabitatImage(r.habitat)?.imageUrl ?? null,
    attacker: side(view, r.attacker, hpBefore.attacker, habitatLabel, nameOf),
    defender: side(view, r.defender, hpBefore.defender, habitatLabel, nameOf),
    winner: r.outcome,
    damage:
      r.damage === null
        ? null
        : { target: roleOf(r.damage.targetCardId) ?? 'defender', amount: r.damage.amount },
    eliminated: roleOf(r.eliminatedCardId),
    reduceMotion,
  };
}

/** Explicación en una o dos frases de por qué ganó una carta (pilar "Transparencia"). */
export function describeDuel(view: PlayerView, duel: PresentedDuel): string {
  const r = duel.resolution;
  const attacker = cardName(view, r.attacker.cardId);
  const defender = cardName(view, r.defender.cardId);
  const score = `${String(r.attacker.effective)} contra ${String(r.defender.effective)}`;
  const context = `${HABITAT[r.habitat].label} · ${ATTRIBUTE[r.attribute].label}`;
  const forced = r.forcedDefense ? ` ${defender} no podía usar ese atributo y luchó con 0.` : '';

  let text: string;
  if (r.outcome === 'tie') {
    text = `Empate en ${context} (${score}): nadie pierde vitalidad.`;
  } else if (r.outcome === 'attacker') {
    text = `Gana ${attacker} en ${context} (${score}). ${defender} pierde ${String(r.damage?.amount ?? 0)} de vitalidad.`;
  } else {
    text = `${defender} resiste en ${context} (${score}) y contraataca: ${attacker} pierde ${String(r.damage?.amount ?? 0)} de vitalidad.`;
  }
  const eliminated =
    r.eliminatedCardId === null ? '' : ` ${cardName(view, r.eliminatedCardId)} queda eliminado.`;
  return `${text}${forced}${eliminated}`;
}
