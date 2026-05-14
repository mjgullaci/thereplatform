import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';

export function Premium() {
  const isPremium = useGame((s) => s.isPremium);
  const [showSoon, setShowSoon] = useState(false);

  return (
    <section className="flex-1 flex flex-col items-center px-6 py-8 gap-6 max-w-2xl mx-auto w-full">
      <div className="text-center">
        <div className="text-cocoa/60 uppercase tracking-widest text-sm mb-1">Wordwell</div>
        <h1 className="font-display text-3xl text-cocoa">Premium</h1>
      </div>

      {isPremium ? (
        <div className="w-full rounded-2xl border-2 border-moss bg-moss/10 p-6 text-center">
          <div className="font-display text-2xl text-cocoa mb-2">You're a Premium player</div>
          <p className="text-cocoa/80">
            Thanks for your support. Unlimited hints, no ads, all themed packs included.
          </p>
        </div>
      ) : (
        <>
          <div className="w-full rounded-2xl border-2 border-gold bg-gold/10 p-6">
            <div className="flex items-baseline justify-between mb-4">
              <div className="font-display text-2xl text-cocoa">Lifetime Premium</div>
              <div className="font-display text-3xl text-cocoa">$4.99</div>
            </div>
            <ul className="space-y-3 text-cocoa/90">
              <Perk>Unlimited hints, every day</Perk>
              <Perk>No ads, ever</Perk>
              <Perk>All themed puzzle packs included</Perk>
              <Perk>Support a tiny indie studio</Perk>
              <Perk>One-time payment, no subscription</Perk>
            </ul>
            <button
              onClick={() => setShowSoon(true)}
              className="mt-6 w-full rounded-full bg-cocoa text-cream px-8 py-3 font-display text-xl"
            >
              Unlock Premium
            </button>
          </div>

          <button
            onClick={() => setShowSoon(true)}
            className="text-cocoa/70 underline underline-offset-4 hover:text-cocoa"
          >
            Restore purchase
          </button>
        </>
      )}

      <Link to="/" className="text-cocoa underline underline-offset-4 mt-2">
        Back home
      </Link>

      <AnimatePresence>
        {showSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 flex items-center justify-center p-6 z-10"
            onClick={() => setShowSoon(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-cream rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="text-cocoa/60 uppercase tracking-widest text-sm mb-2">
                Coming soon
              </div>
              <div className="font-display text-2xl text-cocoa mb-3">
                Premium is launching shortly
              </div>
              <p className="text-cocoa/80 mb-6">
                We're finalising the payment flow. Want to be notified when it goes live?
                Email us at{' '}
                <a
                  href="mailto:mjgullaci@gmail.com?subject=Wordwell%20Premium%20waitlist"
                  className="underline underline-offset-4"
                >
                  mjgullaci@gmail.com
                </a>
                .
              </p>
              <button
                onClick={() => setShowSoon(false)}
                className="rounded-full bg-cocoa text-cream px-8 py-3 font-display text-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Perk({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span aria-hidden className="mt-1 inline-block w-2 h-2 rounded-full bg-moss flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}
