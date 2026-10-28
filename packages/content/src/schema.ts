import { AFFINITIES, ATTRIBUTES, HABITATS } from '@atacknimal/engine';
import { z } from 'zod';

const attribute = z.enum(ATTRIBUTES);
const habitat = z.enum(HABITATS);
const affinity = z.enum(AFFINITIES);
const animalId = z.string().regex(/^[a-z]+(-[a-z]+)*$/, 'id en kebab-case');
const nonNegativeInt = z.number().int().nonnegative();

/** Identidad del animal: no contiene números de balance. */
export const animalSchema = z.strictObject({
  id: animalId,
  name: z.string().min(1),
  scientificName: z.string().min(1),
  role: z.string().min(1),
});

export const rulesetSchema = z.strictObject({
  version: z.string().min(1),
  teamSize: z.number().int().positive(),
  baseHp: z.number().int().positive(),
  habitatModifiers: z.record(affinity, z.number().int()),
  damage: z.strictObject({
    base: z.number().nonnegative(),
    k: z.number().nonnegative(),
    min: nonNegativeInt,
    max: nonNegativeInt,
    counterRatio: z.number().min(0).max(1),
  }),
  lockDuration: nonNegativeInt,
  maxDuels: z.number().int().positive(),
  abilitiesEnabled: z.boolean(),
  defenderBonus: z.number().nonnegative(),
  teamAttributeLock: nonNegativeInt,
  habitatCooldown: nonNegativeInt,
});

const range = z.strictObject({ min: z.number(), max: z.number() });

/** Reglas de presupuesto de un perfil (docs/BALANCE.md §2). */
export const budgetSchema = z.strictObject({
  statRange: range,
  sum: range,
  peak: z.number(),
  peaks: range,
  deepValleyForThirdPeak: z.number(),
  valley: z.number(),
  minValleys: nonNegativeInt,
  forbiddenRange: range,
  specialist: z.number(),
  specialistsPerAttribute: range,
  perfect: z.number(),
  maxPerfectPerAttribute: nonNegativeInt,
});

const target = z.strictObject({
  min: z.number().optional(),
  max: z.number().optional(),
  alertMin: z.number().optional(),
  alertMax: z.number().optional(),
});

/** Métricas objetivo de la simulación (docs/BALANCE.md §7.2). */
export const targetsSchema = z.strictObject({
  animalWinRate: target,
  topTeamPresence: target,
  firstPlayerWinRate: target,
  attributeUsage: target,
  habitatUsage: target,
  attackerDuelWinRate: target,
  tieRate: target,
  matchDuels: target,
  duelLimitRate: target,
  forcedDefensesPerMatch: target,
});

export const profileSchema = z.strictObject({
  animalId,
  stats: z.record(attribute, z.number().int()),
  affinities: z.record(habitat, affinity),
  baseHp: z.number().int().positive().optional(),
});

/** Versión de balance: ruleset + reglas de presupuesto + objetivos + perfiles. */
export const balanceSetSchema = z.strictObject({
  version: z.string().min(1),
  ruleset: rulesetSchema,
  budget: budgetSchema,
  targets: targetsSchema,
  profiles: z.array(profileSchema).min(1),
});

export type Animal = z.infer<typeof animalSchema>;
export type Budget = z.infer<typeof budgetSchema>;
export type Target = z.infer<typeof target>;
export type Targets = z.infer<typeof targetsSchema>;
export type BalanceProfile = z.infer<typeof profileSchema>;
export type BalanceSetData = z.infer<typeof balanceSetSchema>;
