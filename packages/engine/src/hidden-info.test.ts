/**
 * Regla de información crítica (GAME_RULES §4 y §11):
 * el defensor no puede saber qué carta ataca hasta que confirma su defensa.
 */
import { describe, expect, it } from 'vitest';
import { applyAction } from './apply.ts';
import type { AttackDeclaredEvent } from './events.ts';
import { newMatch, play, startedMatch, startedWith, unwrap } from './testing/helpers.ts';
import { getPlayerView, redactEvent } from './view.ts';

const declareWith = (cardId: string) =>
  play(startedWith('p1'), [
    { type: 'declare', playerId: 'p1', habitat: 'land', cardId, attribute: 'attack' },
  ]);

describe('información oculta', () => {
  it('la vista del defensor es idéntica sea cual sea la carta atacante', () => {
    const withCheetah = declareWith('p1/cheetah').state;
    const withTiger = declareWith('p1/tiger').state;
    expect(withCheetah.declaration?.cardId).not.toBe(withTiger.declaration?.cardId);
    expect(getPlayerView(withCheetah, 'p2')).toEqual(getPlayerView(withTiger, 'p2'));
  });

  it('el defensor ve hábitat y atributo, pero no la carta', () => {
    const state = declareWith('p1/tiger').state;
    expect(getPlayerView(state, 'p2').declaration).toEqual({
      habitat: 'land',
      attribute: 'attack',
      cardId: null,
    });
    expect(getPlayerView(state, 'p1').declaration?.cardId).toBe('p1/tiger');
  });

  it('el evento de ataque se redacta para el rival', () => {
    const { state, events } = declareWith('p1/tiger');
    const declared = events.find((e): e is AttackDeclaredEvent => e.type === 'attackDeclared');
    if (declared === undefined) throw new Error('Sin evento de ataque');
    expect(redactEvent(declared, state, 'p2')).toMatchObject({ cardId: null, attribute: 'attack' });
    expect(redactEvent(declared, state, 'p1')).toMatchObject({ cardId: 'p1/tiger' });
  });

  it('en 2v2 el compañero del atacante ve la carta y los rivales no', () => {
    const state = startedMatch('2v2');
    const attackerId = state.turn?.attackerId ?? '';
    const cardId = state.players.find((p) => p.id === attackerId)?.cardIds?.[0] ?? '';
    const declared = unwrap(
      applyAction(state, {
        type: 'declare',
        playerId: attackerId,
        habitat: 'land',
        cardId,
        attribute: 'attack',
      }),
    ).state;
    for (const player of declared.players) {
      const seen = getPlayerView(declared, player.id).declaration?.cardId;
      const attackerTeam = declared.players.find((p) => p.id === attackerId)?.team;
      expect(seen).toBe(player.team === attackerTeam ? cardId : null);
    }
  });

  it('la carta se revela al resolver el duelo', () => {
    const { state } = play(declareWith('p1/tiger').state, [
      { type: 'defend', playerId: 'p2', cardId: 'p2/crocodile' },
    ]);
    expect(getPlayerView(state, 'p2').lastResolution?.attacker.cardId).toBe('p1/tiger');
  });

  it('la vista nunca expone el estado del generador aleatorio', () => {
    expect(getPlayerView(startedWith('p1'), 'p2')).not.toHaveProperty('rng');
  });
});

describe('equipos secretos durante la preparación (GAME_RULES §3.1)', () => {
  it('el rival sabe que confirmaste, pero no qué animales elegiste', () => {
    const { state, events } = play(newMatch('1v1'), [
      { type: 'selectTeam', playerId: 'p1', animalIds: ['cheetah', 'tiger', 'wolf', 'penguin'] },
    ]);
    const view = getPlayerView(state, 'p2');
    expect(view.players.find((p) => p.id === 'p1')).toMatchObject({
      confirmed: true,
      cardIds: null,
    });
    expect(Object.keys(view.cards)).toEqual([]);
    const confirmed = events[0];
    if (confirmed === undefined) throw new Error('Sin evento');
    expect(redactEvent(confirmed, state, 'p2')).toMatchObject({ animalIds: null });
    expect(redactEvent(confirmed, state, 'p1')).toMatchObject({
      animalIds: ['cheetah', 'tiger', 'wolf', 'penguin'],
    });
  });

  it('en 2v2 los compañeros ven el equipo del otro durante la preparación', () => {
    const { state } = play(newMatch('2v2'), [
      { type: 'selectTeam', playerId: 'a1', animalIds: ['cheetah', 'wolf'] },
    ]);
    expect(getPlayerView(state, 'a2').players.find((p) => p.id === 'a1')?.cardIds).toEqual([
      'a1/cheetah',
      'a1/wolf',
    ]);
    expect(getPlayerView(state, 'b1').players.find((p) => p.id === 'a1')?.cardIds).toBeNull();
  });

  it('al empezar la partida todos los equipos son públicos', () => {
    const view = getPlayerView(startedWith('p1'), 'p2');
    expect(view.players.every((p) => p.cardIds?.length === 4)).toBe(true);
    expect(Object.keys(view.cards)).toHaveLength(8);
  });
});
