const KEY = 'wordwell.v1';

export interface PersistedState {
  streak: number;
  lastPlayedDate: string | null;
  solved: Record<string, string[]>;
  largeText: boolean;
  totalSolved: number;
}

const defaults: PersistedState = {
  streak: 0,
  lastPlayedDate: null,
  solved: {},
  largeText: false,
  totalSolved: 0,
};

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return { ...defaults };
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode). Ignore.
  }
}
