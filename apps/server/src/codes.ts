import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from '@atacknimal/protocol';
import { randomInt } from 'node:crypto';

/**
 * Código corto de sala (por ejemplo, 7F3K2J), con un alfabeto sin caracteres ambiguos.
 * 🔒 Con 31⁶ ≈ 887 millones de combinaciones no es adivinable a mano, pero falta limitar
 * los intentos de unión por cliente (ARCHITECTURE §10).
 */
export function generateRoomCode(isTaken: (code: string) => boolean): string {
  for (let attempt = 0; attempt < 100; attempt++) {
    const code = Array.from(
      { length: ROOM_CODE_LENGTH },
      () => ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)],
    ).join('');
    if (!isTaken(code)) return code;
  }
  throw new Error('No se pudo generar un código de sala libre');
}
