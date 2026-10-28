import { describe, expect, it } from 'vitest';
import { AFFINITIES, ATTRIBUTES, HABITATS } from './index.ts';

describe('vocabulario canónico', () => {
  it('define los 8 atributos oficiales sin repetir', () => {
    expect(ATTRIBUTES).toHaveLength(8);
    expect(new Set(ATTRIBUTES).size).toBe(ATTRIBUTES.length);
  });

  it('define los 4 hábitats oficiales sin repetir', () => {
    expect(HABITATS).toHaveLength(4);
    expect(new Set(HABITATS).size).toBe(HABITATS.length);
  });

  it('define los 4 niveles de afinidad', () => {
    expect(AFFINITIES).toEqual(['native', 'adapted', 'neutral', 'hostile']);
  });
});
