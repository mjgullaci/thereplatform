import { Link } from 'react-router-dom';
import { useGame } from '@/lib/store';

export function Settings() {
  const largeText = useGame((s) => s.largeText);
  const setLargeText = useGame((s) => s.setLargeText);
  const streak = useGame((s) => s.streak);
  const totalSolved = useGame((s) => s.totalSolved);
  const hints = useGame((s) => s.hints);
  const isPremium = useGame((s) => s.isPremium);

  return (
    <section className="flex-1 flex flex-col items-center px-6 py-8 gap-6 max-w-2xl mx-auto w-full">
      <h1 className="font-display text-3xl text-cocoa">Settings</h1>

      <div className="w-full rounded-xl border-2 border-cocoa/20 bg-parchment/60 p-5">
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

      <div className="w-full rounded-xl border-2 border-cocoa/20 bg-parchment/60 p-5 space-y-2">
        <div className="flex justify-between text-cocoa">
          <span>Current streak</span>
          <span className="font-display">{streak}</span>
        </div>
        <div className="flex justify-between text-cocoa">
          <span>Total puzzles solved</span>
          <span className="font-display">{totalSolved}</span>
        </div>
        <div className="flex justify-between text-cocoa">
          <span>Hints remaining</span>
          <span className="font-display">{isPremium ? 'Unlimited' : hints}</span>
        </div>
      </div>

      <div className="w-full rounded-xl border-2 border-gold bg-gold/10 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-xl text-cocoa">Wordwell Premium</div>
            <div className="text-cocoa/70 text-sm">
              {isPremium ? 'Active. Thank you for supporting Wordwell.' : 'Unlimited hints, no ads, all packs included'}
            </div>
          </div>
          {!isPremium && (
            <Link
              to="/premium"
              className="rounded-full bg-cocoa text-cream px-5 py-2 text-sm tracking-wider uppercase"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>

      <p className="text-cocoa/60 text-sm text-center max-w-sm">
        Your progress is saved on this device only. No accounts, no tracking.
      </p>

      <div className="flex flex-col gap-2 items-center">
        <Link to="/about" className="text-cocoa underline underline-offset-4">
          About Wordwell
        </Link>
        <Link to="/privacy" className="text-cocoa underline underline-offset-4">
          Privacy policy
        </Link>
        <Link to="/" className="text-cocoa underline underline-offset-4">
          Back home
        </Link>
      </div>
    </section>
  );
}
