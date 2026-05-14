import { create } from 'zustand';
import { loadState, saveState, PersistedState } from './storage';
import { daysBetween, todayKey } from './words';

interface GameState extends PersistedState {
  recordWin: (puzzleId: string) => void;
  appendFoundWord: (puzzleId: string, word: string) => void;
  setLargeText: (v: boolean) => void;
  getFoundWords: (puzzleId: string) => string[];
  useHint: (puzzleId: string, word: string) => boolean;
  addHints: (n: number) => void;
  grantPremium: () => void;
  revokePremium: () => void;
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
    hints: get().hints,
    isPremium: get().isPremium,
    revealedLetters: get().revealedLetters,
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

  useHint: (puzzleId, word) => {
    const isPremium = get().isPremium;
    const hints = get().hints;
    if (!isPremium && hints <= 0) return false;

    const puzzleReveals = { ...(get().revealedLetters[puzzleId] ?? {}) };
    const current = puzzleReveals[word] ?? 0;
    if (current >= word.length) return false;
    puzzleReveals[word] = current + 1;

    const revealedLetters = { ...get().revealedLetters, [puzzleId]: puzzleReveals };
    const nextHints = isPremium ? hints : hints - 1;

    set({ revealedLetters, hints: nextHints });
    saveState({ ...snapshot(get), revealedLetters, hints: nextHints });
    return true;
  },

  addHints: (n) => {
    const hints = Math.max(0, get().hints + n);
    set({ hints });
    saveState({ ...snapshot(get), hints });
  },

  grantPremium: () => {
    set({ isPremium: true });
    saveState({ ...snapshot(get), isPremium: true });
  },

  revokePremium: () => {
    set({ isPremium: false });
    saveState({ ...snapshot(get), isPremium: false });
  },

  getFoundWords: (puzzleId) => get().solved[puzzleId] ?? [],
}));
