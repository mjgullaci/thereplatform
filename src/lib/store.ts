import { create } from 'zustand';
import { loadState, saveState, PersistedState } from './storage';
import { daysBetween, todayKey } from './words';

interface GameState extends PersistedState {
  recordWin: (puzzleId: string) => void;
  appendFoundWord: (puzzleId: string, word: string) => void;
  setLargeText: (v: boolean) => void;
  getFoundWords: (puzzleId: string) => string[];
}

const initial = loadState();

function snapshot(get: () => GameState): PersistedState {
  return {
    streak: get().streak,
    lastPlayedDate: get().lastPlayedDate,
    solved: get().solved,
    solvedIds: get().solvedIds,
    largeText: get().largeText,
    totalSolved: get().totalSolved,
  };
}

export const useGame = create<GameState>((set, get) => ({
  ...initial,

  appendFoundWord: (puzzleId, word) => {
    const current = get().solved[puzzleId] ?? [];
    if (current.includes(word)) return;
    const solved = { ...get().solved, [puzzleId]: [...current, word] };
    set({ solved });
    saveState({ ...snapshot(get), solved });
  },

  recordWin: (puzzleId) => {
    const today = todayKey();
    const last = get().lastPlayedDate;
    let streak = get().streak;
    if (!last) {
      streak = 1;
    } else {
      const gap = daysBetween(last, today);
      if (gap === 1) streak += 1;
      else if (gap > 1) streak = 1;
      // gap === 0: same day, leave streak alone
    }

    const isNewWin = !get().solvedIds.includes(puzzleId);
    const solvedIds = isNewWin ? [...get().solvedIds, puzzleId] : get().solvedIds;
    const totalSolved = isNewWin ? get().totalSolved + 1 : get().totalSolved;

    set({ streak, lastPlayedDate: today, solvedIds, totalSolved });
    saveState({
      ...snapshot(get),
      streak,
      lastPlayedDate: today,
      solvedIds,
      totalSolved,
    });
  },

  setLargeText: (v) => {
    set({ largeText: v });
    saveState({ ...snapshot(get), largeText: v });
  },

  getFoundWords: (puzzleId) => get().solved[puzzleId] ?? [],
}));
