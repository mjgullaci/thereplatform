import { create } from 'zustand';
import { loadState, saveState, PersistedState } from './storage';
import { daysBetween, todayKey } from './words';

interface GameState extends PersistedState {
  recordWin: (puzzleId: string, foundWords: string[]) => void;
  appendFoundWord: (puzzleId: string, word: string) => void;
  setLargeText: (v: boolean) => void;
  getFoundWords: (puzzleId: string) => string[];
}

const initial = loadState();

export const useGame = create<GameState>((set, get) => ({
  ...initial,

  appendFoundWord: (puzzleId, word) => {
    const current = get().solved[puzzleId] ?? [];
    if (current.includes(word)) return;
    const solved = { ...get().solved, [puzzleId]: [...current, word] };
    const next: PersistedState = {
      streak: get().streak,
      lastPlayedDate: get().lastPlayedDate,
      solved,
      largeText: get().largeText,
      totalSolved: get().totalSolved,
    };
    set({ solved });
    saveState(next);
  },

  recordWin: (puzzleId, foundWords) => {
    const today = todayKey();
    const last = get().lastPlayedDate;
    let streak = get().streak;
    if (!last) {
      streak = 1;
    } else {
      const gap = daysBetween(last, today);
      if (gap === 0) {
        // already counted today
      } else if (gap === 1) {
        streak += 1;
      } else if (gap > 1) {
        streak = 1;
      }
    }
    const solved = { ...get().solved, [puzzleId]: foundWords };
    const totalSolved = get().totalSolved + (get().solved[puzzleId] ? 0 : 1);
    const next: PersistedState = {
      streak,
      lastPlayedDate: today,
      solved,
      largeText: get().largeText,
      totalSolved,
    };
    set({ streak, lastPlayedDate: today, solved, totalSolved });
    saveState(next);
  },

  setLargeText: (v) => {
    const next: PersistedState = {
      streak: get().streak,
      lastPlayedDate: get().lastPlayedDate,
      solved: get().solved,
      largeText: v,
      totalSolved: get().totalSolved,
    };
    set({ largeText: v });
    saveState(next);
  },

  getFoundWords: (puzzleId) => get().solved[puzzleId] ?? [],
}));
