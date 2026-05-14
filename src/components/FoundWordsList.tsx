import { motion, AnimatePresence } from 'framer-motion';

interface FoundWordsListProps {
  required: string[];
  found: string[];
  revealed: Record<string, number>;
  largeText: boolean;
}

export function FoundWordsList({ required, found, revealed, largeText }: FoundWordsListProps) {
  const foundSet = new Set(found);

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <h2 className={`font-display text-cocoa mb-3 ${largeText ? 'text-2xl' : 'text-xl'}`}>
        Words to find
      </h2>
      <ul className="grid grid-cols-2 gap-2">
        <AnimatePresence initial={false}>
          {required.map((word) => {
            const isFound = foundSet.has(word);
            const revealCount = revealed[word] ?? 0;
            const display = isFound
              ? word
              : revealCount > 0
                ? word.slice(0, revealCount) + '•'.repeat(word.length - revealCount)
                : '•'.repeat(word.length);
            return (
              <motion.li
                key={word}
                layout
                className={`rounded-md border-2 px-3 py-2 font-serif tracking-widest text-center ${
                  largeText ? 'text-xl' : 'text-lg'
                } ${
                  isFound
                    ? 'border-moss bg-moss/15 text-cocoa'
                    : revealCount > 0
                      ? 'border-gold/60 bg-gold/10 text-cocoa'
                      : 'border-cocoa/30 bg-cream text-cocoa/40'
                }`}
              >
                {display}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
