export const RULE_ERROR_CODES = [
  'MATCH_FINISHED',
  'WRONG_PHASE',
  'UNKNOWN_PLAYER',
  'NOT_YOUR_TURN',
  'TEAM_ALREADY_CONFIRMED',
  'INVALID_TEAM_SIZE',
  'UNKNOWN_ANIMAL',
  'DUPLICATE_ANIMAL',
  'INVALID_HABITAT',
  'INVALID_ATTRIBUTE',
  'UNKNOWN_CARD',
  'NOT_YOUR_CARD',
  'CARD_ELIMINATED',
  'ATTRIBUTE_LOCKED',
] as const;

export type RuleErrorCode = (typeof RULE_ERROR_CODES)[number];

/** Acción rechazada por las reglas. El estado no cambia. */
export interface RuleError {
  readonly code: RuleErrorCode;
  readonly message: string;
}

export type Result<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: RuleError };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail(code: RuleErrorCode, message: string): { ok: false; error: RuleError } {
  return { ok: false, error: { code, message } };
}

/** Error de programación: un estado que las reglas nunca deberían producir. */
export class InvariantError extends Error {
  override name = 'InvariantError';
}

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new InvariantError(message);
}
