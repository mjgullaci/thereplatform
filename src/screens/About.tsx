import { Link } from 'react-router-dom';

export function About() {
  return (
    <section className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
      <div className="text-cocoa/60 uppercase tracking-widest text-sm mb-1">Wordwell</div>
      <h1 className="font-display text-3xl text-cocoa mb-6">About</h1>

      <div className="space-y-4 text-cocoa/90">
        <p>
          Wordwell is a cozy daily word puzzle. A new themed wheel of six letters appears
          every day. Drag to trace words, fill the board, keep your streak. No accounts,
          no ads, no pressure.
        </p>
        <p>
          It's the first title from <strong>Hearthword Games</strong>, an indie studio
          focused on calm, accessible brain games for people who play in the quiet bits of
          the day — morning coffee, the train, before bed.
        </p>
        <p>
          The game is designed to be unhurried. Large‑text mode is one tap away in
          Settings. The puzzles never punish you, and there's a practice mode if you want
          to play more than once a day.
        </p>

        <h2 className="font-display text-cocoa text-xl mt-6 mb-1">Credits</h2>
        <p>
          Game design, code, art, and word lists by Matthew Gullaci. Dictionary based on
          an open‑source English word list. Built with React and Tailwind. Hosted on
          Cloudflare.
        </p>

        <h2 className="font-display text-cocoa text-xl mt-6 mb-1">Contact</h2>
        <p>
          Feedback, bug reports, theme suggestions, or just a hello — email{' '}
          <a
            href="mailto:mjgullaci@gmail.com?subject=Wordwell"
            className="underline underline-offset-4"
          >
            mjgullaci@gmail.com
          </a>
          .
        </p>

        <h2 className="font-display text-cocoa text-xl mt-6 mb-1">Version</h2>
        <p className="text-cocoa/70">Wordwell v0.2 · Hearthword Games · 2026</p>
      </div>

      <div className="mt-8 flex flex-col gap-2">
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
