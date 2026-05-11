import puzzleData from '@/data/puzzles.json';
import { canSpellFromLetters, normalize } from './words';

export interface Puzzle {
  id: string;
  theme: string;
  letters: string[];
  bonus: string;
  required: string[];
  extras: string[];
}

const PUZZLES = puzzleData as Puzzle[];

export function getPuzzleByIndex(index: number): Puzzle {
  if (PUZZLES.length === 0) {
    throw new Error('No puzzles defined');
  }
  const i = ((index % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
  return PUZZLES[i];
}

export function getPuzzleForDate(date: Date): Puzzle {
  // Anchor on Jan 1 2026 so puzzle ids stay stable across timezones.
  const epoch = new Date(2026, 0, 1).getTime();
  const day = Math.floor((date.getTime() - epoch) / 86_400_000);
  return getPuzzleByIndex(day);
}

export function getTotalPuzzles(): number {
  return PUZZLES.length;
}

export function validateGuess(puzzle: Puzzle, guess: string): {
  status: 'required' | 'extra' | 'bonus' | 'unspellable' | 'too-short' | 'unknown';
  word: string;
} {
  const word = normalize(guess);
  if (word.length < 3) return { status: 'too-short', word };
  if (!canSpellFromLetters(word, puzzle.letters)) return { status: 'unspellable', word };
  if (word === puzzle.bonus) return { status: 'bonus', word };
  if (puzzle.required.includes(word)) return { status: 'required', word };
  if (puzzle.extras.includes(word)) return { status: 'extra', word };
  return { status: 'unknown', word };
}

export function isPuzzleComplete(puzzle: Puzzle, found: string[]): boolean {
  const set = new Set(found);
  return puzzle.required.every((w) => set.has(w));
}
