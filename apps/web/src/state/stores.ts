import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { BALANCE } from '../content/catalog.ts';
import { toggleAnimal } from './team.ts';

/**
 * El almacenamiento local puede no existir (modo privado, datos bloqueados):
 * la app funciona igual, solo que sin recordar preferencias.
 */
const safeLocalStorage: StateStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Sin almacenamiento disponible: se ignora.
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Sin almacenamiento disponible: se ignora.
    }
  },
};

export type MotionPreference = 'system' | 'reduce' | 'full';
export type Difficulty = 'easy' | 'normal' | 'hard';

interface SettingsState {
  motion: MotionPreference;
  nickname: string;
  setMotion: (motion: MotionPreference) => void;
  setNickname: (nickname: string) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      motion: 'system',
      nickname: '',
      setMotion: (motion) => {
        set({ motion });
      },
      setNickname: (nickname) => {
        set({ nickname: nickname.slice(0, 20) });
      },
    }),
    { name: 'atacknimal.settings', storage: createJSONStorage(() => safeLocalStorage) },
  ),
);

interface MatchSetupState {
  difficulty: Difficulty;
  team: string[];
  setDifficulty: (difficulty: Difficulty) => void;
  toggle: (animalId: string) => void;
  clearTeam: () => void;
}

export const useMatchSetup = create<MatchSetupState>()(
  persist(
    (set) => ({
      difficulty: 'normal',
      team: [],
      setDifficulty: (difficulty) => {
        set({ difficulty });
      },
      toggle: (animalId) => {
        set((state) => ({ team: toggleAnimal(state.team, animalId, BALANCE.ruleset.teamSize) }));
      },
      clearTeam: () => {
        set({ team: [] });
      },
    }),
    { name: 'atacknimal.match-setup', storage: createJSONStorage(() => safeLocalStorage) },
  ),
);

/** Borra todo lo que la app guarda en este navegador. */
export function clearLocalData(): void {
  useSettings.persist.clearStorage();
  useMatchSetup.persist.clearStorage();
  useSettings.setState({ motion: 'system', nickname: '' });
  useMatchSetup.setState({ difficulty: 'normal', team: [] });
}
