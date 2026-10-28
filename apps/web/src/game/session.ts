/**
 * Sesión online guardada en esta pestaña. Módulo ligero, sin Socket.IO: la carga inicial lo usa
 * para saber si hay que retomar una sala sin descargar el cliente de red.
 *
 * La sesión vive en sessionStorage: cada pestaña es un jugador distinto (útil para probar
 * en un mismo navegador) y sobrevive a recargar la página, que es cuando hace falta reconectar.
 */
export const TOKEN_KEY = 'atacknimal.online.token';
export const ROOM_KEY = 'atacknimal.online.room';

export function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: string | null): void {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento: la partida sigue, pero no se podrá recuperar al recargar.
  }
}

/** Esta pestaña estaba en una sala online (aunque la vista aún no haya llegado). */
export function hasActiveRoom(): boolean {
  return readSession(TOKEN_KEY) !== null && readSession(ROOM_KEY) !== null;
}
