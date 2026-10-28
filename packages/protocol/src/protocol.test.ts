import { describe, expect, it } from 'vitest';
import { actSchema, joinRoomSchema, nicknameSchema, roomCodeSchema } from './index.ts';

describe('protocolo', () => {
  it('normaliza y valida códigos de sala', () => {
    expect(roomCodeSchema.parse(' 7f3k2j ')).toBe('7F3K2J');
    expect(roomCodeSchema.safeParse('7F3K2').success).toBe(false);
    expect(roomCodeSchema.safeParse('7F3K2O').success).toBe(false); // O es ambigua
  });

  it('valida apodos', () => {
    expect(nicknameSchema.parse('  AlexRaptor ')).toBe('AlexRaptor');
    expect(nicknameSchema.safeParse('').success).toBe(false);
    expect(nicknameSchema.safeParse('<script>').success).toBe(false);
    expect(nicknameSchema.safeParse('Ñandú 2').success).toBe(true);
  });

  it('rechaza acciones mal formadas o con campos extra', () => {
    const ok = { actionId: 'abcdef1234', action: { type: 'defend', cardId: 'B1/wolf' } };
    expect(actSchema.safeParse(ok).success).toBe(true);
    expect(actSchema.safeParse({ ...ok, action: { type: 'declare', cardId: 'x' } }).success).toBe(
      false,
    );
    expect(
      actSchema.safeParse({ ...ok, action: { type: 'defend', cardId: 'x', playerId: 'A1' } })
        .success,
    ).toBe(false);
    expect(joinRoomSchema.safeParse({ code: '7F3K2J', nickname: 'Ana', extra: 1 }).success).toBe(
      false,
    );
  });
});
