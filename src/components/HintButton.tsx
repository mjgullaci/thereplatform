interface HintButtonProps {
  hints: number;
  isPremium: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function HintButton({ hints, isPremium, disabled, onClick }: HintButtonProps) {
  const empty = !isPremium && hints <= 0;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-5 py-2 text-sm tracking-wider uppercase font-semibold transition-colors ${
        empty
          ? 'bg-rose/15 text-rose border-2 border-rose/40'
          : 'bg-gold/20 text-cocoa border-2 border-gold'
      } disabled:opacity-40`}
    >
      {empty
        ? 'Get more hints'
        : isPremium
          ? 'Hint · Premium'
          : `Hint · ${hints}`}
    </button>
  );
}
