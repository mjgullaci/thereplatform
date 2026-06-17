import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '@/lib/store';
import { getDateIndex, getPuzzleByIndex, getTotalPuzzles } from '@/lib/puzzles';

export function Home() {
  const navigate = useNavigate();
  const streak = useGame((s) => s.streak);
  const totalSolved = useGame((s) => s.totalSolved);
  const largeText = useGame((s) => s.largeText);

  const today = new Date();
  const todayIndex = getDateIndex(today);
  const puzzle = getPuzzleByIndex(todayIndex);
  const dateLabel = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const startPractice = () => {
    const n = getTotalPuzzles();
    if (n <= 1) {
      navigate(`/play?practice=1&i=${todayIndex}`);
      return;
    }
    let i = todayIndex;
    while (i === todayIndex) i = Math.floor(Math.random() * n);
    navigate(`/play?practice=1&i=${i}`);
  };

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
      <p className={`text-cocoa/60 mb-2 ${largeText ? 'text-xl' : 'text-lg'}`}>{dateLabel}</p>
      <h1 className={`font-display text-cocoa mb-3 ${largeText ? 'text-4xl' : 'text-3xl'}`}>
        Today's puzzle
      </h1>
      <p className={`text-cocoa/80 mb-8 ${largeText ? 'text-2xl' : 'text-xl'}`}>
        Theme: <span className="font-semibold">{puzzle.theme}</span>
      </p>

      <Link
        to="/play"
        className="rounded-full bg-cocoa text-cream px-10 py-4 font-display text-2xl shadow-md hover:bg-ink transition-colors"
      >
        Play
      </Link>

      <button
        onClick={startPractice}
        className="mt-3 text-cocoa/70 underline underline-offset-4 hover:text-cocoa"
      >
        Practice another puzzle
      </button>

      <div className="mt-10 grid grid-cols-2 gap-6 w-full max-w-xs">
        <Stat label="Streak" value={`${streak} day${streak === 1 ? '' : 's'}`} large={largeText} />
        <Stat label="Solved" value={`${totalSolved}`} large={largeText} />
      </div>
    </section>
  );
}

function Stat({ label, value, large }: { label: string; value: string; large: boolean }) {
  return (
    <div className="rounded-xl border-2 border-cocoa/20 bg-parchment/60 p-4">
      <div className="text-cocoa/60 text-sm uppercase tracking-wider">{label}</div>
      <div className={`font-display text-cocoa mt-1 ${large ? 'text-2xl' : 'text-xl'}`}>
        {value}
      </div>
    </div>
  );
}
