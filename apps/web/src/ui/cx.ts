/** Une clases CSS ignorando las vacías (las de un módulo CSS pueden ser `undefined`). */
export function cx(...classes: readonly (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
