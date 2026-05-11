interface ProgressBarProps {
  value: number;
  total: number;
}

export function ProgressBar({ value, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="h-3 w-full rounded-full bg-cocoa/15 overflow-hidden">
        <div
          className="h-full bg-moss transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
      <div className="mt-1 text-center text-cocoa/70 text-sm">
        {value} of {total} found
      </div>
    </div>
  );
}
