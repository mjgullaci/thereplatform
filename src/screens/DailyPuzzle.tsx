import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LetterWheel } from '@/components/LetterWheel';
import { FoundWordsList } from '@/components/FoundWordsList';
import { ProgressBar } from '@/components/ProgressBar';
import { useGame } from '@/lib/store';
import {
  getPuzzleForDate,
  isPuzzleComplete,
  validateGuess,
} from '@/lib/puzzles';

type Toast = { id: number; text: string; tone: 'good' | 'bad' | 'bonus' };

export function DailyPuzzle() {
  const largeText = useGame((s) => s.largeText);
  const appendFoundWord = useGame((s) => s.appendFoundWord);
  const recordWin = useGame((s) => s.recordWin);
  const solved = useGame((s) => s.solved);

  const puzzle = useMemo(() => getPuzzleForDate(new Date()), []);
  const found = solved[puzzle.id] ?? [];

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [won, setWon] = useState(() => isPuzzleComplete(puzzle, found));

  const shuffledLetters = useMemo(() => {
    if (shuffleSeed === 0) return puzzle.letters;
    const arr = [...puzzle.letters];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
    // shuffleSeed intentionally re-runs this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffleSeed, puzzle.letters]);

  useEffect(() => {
    if (!won && isPuzzleComplete(puzzle, found)) {
      setWon(true);
      recordWin(puzzle.id, found);
    }
  }, [found, puzzle, recordWin, won]);

  const pushToast = (text: string, tone: Toast['tone']) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 1400);
  };

  const handleSubmit = (word: string) => {
    const result = validateGuess(puzzle, word);
    if (result.status === 'too-short') {
      pushToast('Too short', 'bad');
      return;
    }
    if (result.status === 'unspellable') {
      pushToast('Not in the wheel', 'bad');
      return;
    }
    if (found.includes(result.word)) {
      pushToast('Already found', 'bad');
      return;
    }
    if (result.status === 'unknown') {
      pushToast('Not a word we know', 'bad');
      return;
    }
    appendFoundWord(puzzle.id, result.word);
    if (result.status === 'bonus') {
      pushToast(`Bonus! ${result.word}`, 'bonus');
    } else if (result.status === 'extra') {
      pushToast(`+ Bonus word: ${result.word}`, 'good');
    } else {
      pushToast(`+ ${result.word}`, 'good');
    }
  };

  const requiredCount = puzzle.required.length;
  const requiredFound = puzzle.required.filter((w) => found.includes(w)).length;

  return (
    <section className="flex-1 flex flex-col items-center pt-4 pb-8 gap-5 relative">
      <div className="text-center">
        <div className="text-cocoa/60 text-sm uppercase tracking-widest">Today's theme</div>
        <div className={`font-display text-cocoa ${largeText ? 'text-3xl' : 'text-2xl'}`}>
          {puzzle.theme}
        </div>
      </div>

      <ProgressBar value={requiredFound} total={requiredCount} />

      <LetterWheel letters={shuffledLetters} onSubmit={handleSubmit} largeText={largeText} />

      <button
        onClick={() => setShuffleSeed((n) => n + 1)}
        className="rounded-full border-2 border-cocoa/30 text-cocoa px-4 py-2 text-sm tracking-wider uppercase"
      >
        Shuffle
      </button>

      <FoundWordsList required={puzzle.required} found={found} largeText={largeText} />

      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-cream font-semibold shadow-lg ${
              t.tone === 'good'
                ? 'bg-moss'
                : t.tone === 'bonus'
                  ? 'bg-gold text-ink'
                  : 'bg-rose'
            }`}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 flex items-center justify-center p-6 z-10"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              className="bg-cream rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="text-cocoa/60 uppercase tracking-widest text-sm mb-2">
                Puzzle solved
              </div>
              <div className={`font-display text-cocoa ${largeText ? 'text-3xl' : 'text-2xl'} mb-3`}>
                {puzzle.theme}
              </div>
              <p className="text-cocoa/80 mb-6">
                You found {found.length} word{found.length === 1 ? '' : 's'} today. Come back
                tomorrow for a new puzzle.
              </p>
              <Link
                to="/"
                className="inline-block rounded-full bg-cocoa text-cream px-8 py-3 font-display text-xl"
              >
                Home
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
