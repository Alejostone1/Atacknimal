import { ATTRIBUTES, type AnimalProfile } from '@atacknimal/engine';
import type { Budget } from './schema.ts';

/** Incumplimientos de un perfil frente a las reglas de presupuesto (docs/BALANCE.md §2). */
export function checkProfileBudget(profile: AnimalProfile, budget: Budget): string[] {
  const values = ATTRIBUTES.map((attribute) => profile.stats[attribute]);
  const sum = values.reduce((total, value) => total + value, 0);
  const peaks = values.filter((value) => value >= budget.peak).length;
  const valleys = values.filter((value) => value <= budget.valley).length;
  const lowest = Math.min(...values);
  const issues: string[] = [];

  if (values.some((v) => v < budget.statRange.min || v > budget.statRange.max)) {
    issues.push(`valores fuera de ${String(budget.statRange.min)}–${String(budget.statRange.max)}`);
  }
  if (sum < budget.sum.min || sum > budget.sum.max) {
    issues.push(`suma ${String(sum)} fuera de ${String(budget.sum.min)}–${String(budget.sum.max)}`);
  }
  if (peaks < budget.peaks.min || peaks > budget.peaks.max) {
    issues.push(`${String(peaks)} picos (≥ ${String(budget.peak)})`);
  }
  if (peaks > budget.peaks.min && lowest > budget.deepValleyForThirdPeak) {
    issues.push(`picos extra sin un valle ≤ ${String(budget.deepValleyForThirdPeak)}`);
  }
  if (valleys < budget.minValleys) {
    issues.push(`${String(valleys)} valles (≤ ${String(budget.valley)})`);
  }
  if (values.some((v) => v >= budget.forbiddenRange.min && v <= budget.forbiddenRange.max)) {
    issues.push(
      `valor en la franja prohibida ${String(budget.forbiddenRange.min)}–${String(budget.forbiddenRange.max)}`,
    );
  }
  return issues;
}

/** Incumplimientos de cobertura del roster por atributo (docs/BALANCE.md §2–3.1). */
export function checkRosterCoverage(profiles: readonly AnimalProfile[], budget: Budget): string[] {
  return ATTRIBUTES.flatMap((attribute) => {
    const values = profiles.map((profile) => profile.stats[attribute]);
    const specialists = values.filter((value) => value >= budget.specialist).length;
    const perfect = values.filter((value) => value >= budget.perfect).length;
    const issues: string[] = [];
    const { min, max } = budget.specialistsPerAttribute;
    if (specialists < min || specialists > max) {
      issues.push(
        `${attribute}: ${String(specialists)} especialistas (≥ ${String(budget.specialist)})`,
      );
    }
    if (perfect > budget.maxPerfectPerAttribute) {
      issues.push(`${attribute}: ${String(perfect)} animales con ${String(budget.perfect)}`);
    }
    return issues;
  });
}
