import { Link } from 'react-router-dom';
import { useGame } from '@/lib/store';

export function Settings() {
  const largeText = useGame((s) => s.largeText);
  const setLargeText = useGame((s) => s.setLargeText);
  const streak = useGame((s) => s.streak);
  const totalSolved = useGame((s) => s.totalSolved);

  return (
    <section className="flex-1 flex flex-col items-center px-6 py-8 gap-6">
      <h1 className="font-display text-3xl text-cocoa">Settings</h1>

      <div className="w-full max-w-md rounded-xl border-2 border-cocoa/20 bg-parchment/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-xl text-cocoa">Large text</div>
            <div className="text-cocoa/60 text-sm">Bigger letters across the app.</div>
          </div>
          <button
            onClick={() => setLargeText(!largeText)}
            className={`relative w-16 h-9 rounded-full transition-colors ${
              largeText ? 'bg-moss' : 'bg-cocoa/30'
            }`}
            aria-pressed={largeText}
          >
            <span
              className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-cream transition-transform ${
                largeText ? 'translate-x-7' : ''
              }`}
            />
          </button>
        </div>
      </div>

      <div className="w-full max-w-md rounded-xl border-2 border-cocoa/20 bg-parchment/60 p-5 space-y-2">
        <div className="flex justify-between text-cocoa">
          <span>Current streak</span>
          <span className="font-display">{streak}</span>
        </div>
        <div className="flex justify-between text-cocoa">
          <span>Total puzzles solved</span>
          <span className="font-display">{totalSolved}</span>
        </div>
      </div>

      <p className="text-cocoa/60 text-sm text-center max-w-sm">
        Your progress is saved on this device only. No accounts, no tracking.
      </p>

      <Link to="/" className="text-cocoa underline underline-offset-4">
        Back home
      </Link>
    </section>
  );
}
