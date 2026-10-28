/**
 * Reglas de interfaz para formar el equipo. La validación definitiva la hace el motor
 * al confirmar el equipo (acción `selectTeam`); esto solo evita estados imposibles en pantalla.
 */
export function toggleAnimal(team: readonly string[], id: string, size: number): string[] {
  if (team.includes(id)) return team.filter((member) => member !== id);
  if (team.length >= size) return [...team];
  return [...team, id];
}

export function isTeamComplete(team: readonly string[], size: number): boolean {
  return team.length === size && new Set(team).size === size;
}
