import { ATTRIBUTES } from '@atacknimal/engine';
import { describe, expect, it } from 'vitest';
import {
  BALANCE,
  CATALOG,
  findEntry,
  matchesSearch,
  peaks,
  statTone,
  thrivesIn,
} from './catalog.ts';

describe('catálogo de la interfaz', () => {
  it('muestra los 26 animales con perfil de la versión de balance vigente y foto', () => {
    expect(CATALOG).toHaveLength(26);
    for (const entry of CATALOG) {
      expect(entry.profile).toBe(BALANCE.roster.find((p) => p.id === entry.id));
      // "proposed": elegida y revisada en la curación, pendiente de la aprobación del usuario.
      expect(['approved', 'proposed']).toContain(entry.image?.status);
    }
  });

  it('los picos y valles salen del presupuesto de balance, no de números escritos a mano', () => {
    const cheetah = findEntry('cheetah');
    if (cheetah === undefined) throw new Error('Falta el guepardo');
    for (const attribute of peaks(cheetah.profile)) {
      expect(cheetah.profile.stats[attribute]).toBeGreaterThanOrEqual(BALANCE.budget.peak);
    }
    expect(statTone(BALANCE.budget.valley)).toBe('valley');
    expect(statTone(BALANCE.budget.peak)).toBe('peak');
    expect(ATTRIBUTES.filter((a) => statTone(cheetah.profile.stats[a]) === 'peak')).toHaveLength(
      peaks(cheetah.profile).length,
    );
  });

  it('el filtro de hábitat incluye a nativos y adaptados', () => {
    const shark = findEntry('great-white-shark');
    if (shark === undefined) throw new Error('Falta el tiburón');
    expect(thrivesIn(shark, 'water')).toBe(true);
    expect(thrivesIn(shark, 'land')).toBe(false);
  });

  it('la búsqueda ignora tildes y mayúsculas, y acepta el nombre científico', () => {
    const eagle = findEntry('golden-eagle');
    const penguin = findEntry('penguin');
    if (eagle === undefined || penguin === undefined) throw new Error('Faltan animales');
    expect(matchesSearch(eagle, 'AGUILA')).toBe(true);
    expect(matchesSearch(penguin, 'pinguino')).toBe(true);
    expect(matchesSearch(eagle, 'chrysaetos')).toBe(true);
    expect(matchesSearch(eagle, 'tiburón')).toBe(false);
  });
});
