import { describe, expect, it } from 'vitest';
import { isTeamComplete, toggleAnimal } from './team.ts';

describe('formar el equipo', () => {
  it('añade y quita animales', () => {
    expect(toggleAnimal([], 'wolf', 4)).toEqual(['wolf']);
    expect(toggleAnimal(['wolf', 'tiger'], 'wolf', 4)).toEqual(['tiger']);
  });

  it('no supera el tamaño del equipo', () => {
    const full = ['wolf', 'tiger', 'penguin', 'elephant'];
    expect(toggleAnimal(full, 'cheetah', 4)).toEqual(full);
  });

  it('el equipo está completo solo con 4 animales distintos', () => {
    expect(isTeamComplete(['wolf', 'tiger', 'penguin'], 4)).toBe(false);
    expect(isTeamComplete(['wolf', 'tiger', 'penguin', 'elephant'], 4)).toBe(true);
    expect(isTeamComplete(['wolf', 'wolf', 'penguin', 'elephant'], 4)).toBe(false);
  });
});
