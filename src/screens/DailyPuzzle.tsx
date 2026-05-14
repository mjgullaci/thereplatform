import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LetterWheel } from '@/components/LetterWheel';
import { FoundWordsList } from '@/components/FoundWordsList';
import { ProgressBar } from '@/components/ProgressBar';
import { useGame } from '@/lib/store';
import {
  getPuzzleByIndex,
  getPuzzleForDate,
  getTotalPuzzles,
  isPuzzleComplete,
  validateGuess,
} from '@/lib/puzzles';

type Toast = { id: number; text: string; tone: 'good' | 'bad' | 'bonus' };

function randomOtherIndex(current: number): number {
  const n = getTotalPuzzles();
  if (n <= 1) return current;
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * n);
  }
  return next;
}

export function DailyPuzzle() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isPractice = searchParams.get('practice') === '1';
  const requestedIndex = Number.parseInt(searchParams.get('i') ?? '', 10);

  const largeText = useGame((s) => s.largeText);
  const appendFoundWord = useGame((s) => s.appendFoundWord);
  const recordWin = useGame((s) => s.recordWin);
  const persistentSolved = useGame((s) => s.solved);

  const { puzzle, puzzleIndex } = useMemo(() => {
    if (isPractice) {
      const idx = Number.isFinite(requestedIndex)
        ? Math.max(0, Math.min(requestedIndex, getTotalPuzzles() - 1))
        : 0;
      return { puzzle: getPuzzleByIndex(idx), puzzleIndex: idx };
    }
    return { puzzle: getPuzzleForDate(new Date()), puzzleIndex: -1 };
  }, [isPractice, requestedIndex]);

  const [practiceFound, setPracticeFound] = useState<string[]>([]);
  useEffect(() => {
    setPracticeFound([]);
  }, [puzzle.id]);

  const persistentFound = persistentSolved[puzzle.id] ?? [];
  const found = isPractice ? practiceFound : persistentFound;

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [won, setWon] = useState(() => isPuzzleComplete(puzzle, found));

  useEffect(() => {
    setWon(isPuzzleComplete(puzzle, found));
  }, [puzzle, found]);

  const shuffledLetters = useMemo(() => {
    if (shuffleSeed === 0) return puzzle.letters;
    const arr = [...puzzle.letters];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffleSeed, puzzle.letters]);

  useEffect(() => {
    if (!isPractice && isPuzzleComplete(puzzle, persistentFound)) {
      recordWin(puzzle.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistentFound.length, puzzle.id, isPractice]);

  const pushToast = (text: string, tone: Toast['tone']) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1400);
  };

  const handleSubmit = (word: string) => {
    const result = validateGuess(puzzle, word);
    if (result.status === 'too-short') return pushToast('Too short', 'bad');
    if (result.status === 'unspellable') return pushToast('Not in the wheel', 'bad');
    if (found.includes(result.word)) return pushToast('Already found', 'bad');
    if (result.status === 'unknown') return pushToast('Not a word we know', 'bad');

    if (isPractice) {
      setPracticeFound((prev) => (prev.includes(result.word) ? prev : [...prev, result.word]));
    } else {
      appendFoundWord(puzzle.id, result.word);
    }

    if (result.status === 'bonus') pushToast(`Bonus! ${result.word}`, 'bonus');
    else if (result.status === 'extra') pushToast(`+ Bonus word: ${result.word}`, 'good');
    else pushToast(`+ ${result.word}`, 'good');
  };

  const goToAnotherPractice = () => {
    const next = randomOtherIndex(isPractice ? puzzleIndex : -1);
    navigate(`/play?practice=1&i=${next}`, { replace: true });
  };

  const handleShare = async () => {
    const required = puzzle.required.length;
    const url = `${window.location.origin}/`;
    const title = `Wordwell — ${puzzle.theme}`;
    const body = isPractice
      ? `Solved a Wordwell practice puzzle: ${puzzle.theme}. Found ${found.length} words.\n${url}`
      : `Solved today's Wordwell: ${puzzle.theme}. ${found.length} of ${required} required words found.\n${url}`;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text: body, url });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(body);
      pushToast('Copied to clipboard', 'good');
    } catch {
      pushToast('Could not copy', 'bad');
    }
  };

  const requiredCount = puzzle.required.length;
  const requiredFound = puzzle.required.filter((w) => found.includes(w)).length;

  return (
    <section className="flex-1 flex flex-col items-center pt-4 pb-8 gap-5 relative">
      <div className="text-center">
        <div className="text-cocoa/60 text-sm uppercase tracking-widest">
          {isPractice ? 'Practice' : "Today's theme"}
        </div>
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
                {isPractice ? 'Practice complete' : 'Puzzle solved'}
              </div>
              <div className={`font-display text-cocoa ${largeText ? 'text-3xl' : 'text-2xl'} mb-3`}>
                {puzzle.theme}
              </div>
              <p className="text-cocoa/80 mb-6">
                {isPractice
                  ? `You found ${found.length} word${found.length === 1 ? '' : 's'}.`
                  : `You found ${found.length} word${found.length === 1 ? '' : 's'} today. Come back tomorrow for a new puzzle.`}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleShare}
                  className="rounded-full bg-moss text-cream px-8 py-3 font-display text-xl"
                >
                  Share result
                </button>
                <button
                  onClick={goToAnotherPractice}
                  className="rounded-full bg-cocoa text-cream px-8 py-3 font-display text-lg"
                >
                  Try another puzzle
                </button>
                <Link
                  to="/"
                  className="rounded-full border-2 border-cocoa/30 text-cocoa px-8 py-3 font-display text-base"
                >
                  Home
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
