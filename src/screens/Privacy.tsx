import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <section className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
      <div className="text-cocoa/60 uppercase tracking-widest text-sm mb-1">Wordwell</div>
      <h1 className="font-display text-3xl text-cocoa mb-2">Privacy Policy</h1>
      <p className="text-cocoa/60 mb-6">Last updated: May 2026</p>

      <Prose>
        <p>
          Wordwell is a daily word puzzle game made by Hearthword Games, an independent
          studio operated by Matthew Gullaci. This page explains, in plain English, what
          information the app handles and what it does not.
        </p>

        <h2>What we collect on this device</h2>
        <p>
          Your game progress — daily streak, total puzzles solved, words found, large‑text
          preference, hint balance and premium status — is stored in your browser's local
          storage on your device. It never leaves your device.
        </p>

        <h2>What we collect on our servers</h2>
        <p>
          Wordwell is hosted on Cloudflare. As with any website, Cloudflare's infrastructure
          may automatically log standard request data (IP address, user agent, request time)
          for security and reliability purposes. We do not have analytics, tracking pixels,
          or any first‑party account system.
        </p>

        <h2>Cookies</h2>
        <p>
          Wordwell does not use cookies. We only use browser local storage to remember your
          game progress. You can clear it at any time via your browser settings.
        </p>

        <h2>Third parties</h2>
        <p>
          The current build does not embed any third‑party advertising, analytics, or
          payment SDKs. When Premium and rewarded video become available, they will use
          standard providers (for example Stripe, AppLovin, AdMob, Apple, or Google). When
          that happens, this policy will be updated to name them and link to their privacy
          policies. We will never sell your personal information.
        </p>

        <h2>Children</h2>
        <p>
          Wordwell is suitable for general audiences but is not directed at children under
          13. We do not knowingly collect personal information from children.
        </p>

        <h2>Your choices</h2>
        <p>
          To delete all Wordwell data, clear site data for this domain in your browser, or
          uninstall the app if you've added it to your home screen. There is no server‑side
          account to delete.
        </p>

        <h2>Changes</h2>
        <p>
          When we change this policy we will update the date at the top of the page. If the
          changes are significant we will note them on the home screen.
        </p>

        <h2>Contact</h2>
        <p>
          Questions or concerns? Email{' '}
          <a
            href="mailto:mjgullaci@gmail.com?subject=Wordwell%20privacy"
            className="underline underline-offset-4"
          >
            mjgullaci@gmail.com
          </a>
          .
        </p>
      </Prose>

      <Link to="/" className="inline-block mt-8 text-cocoa underline underline-offset-4">
        Back home
      </Link>
    </section>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 text-cocoa/90 [&_h2]:font-display [&_h2]:text-cocoa [&_h2]:text-xl [&_h2]:mt-6 [&_h2]:mb-1">
      {children}
    </div>
  );
}
