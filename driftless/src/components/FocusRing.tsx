import { motion, useReducedMotion } from 'framer-motion';

interface FocusRingProps {
  totalMs: number;
  remainingMs: number;
  paused: boolean;
  label: string;
}

const SIZE = 280;
const R = 120;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * R;

function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function FocusRing({ totalMs, remainingMs, paused, label }: FocusRingProps) {
  const reduceMotion = useReducedMotion();
  const fraction = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - fraction);
  const breathing = !reduceMotion && !paused;

  return (
    <div className="fl-ring" aria-hidden={false}>
      <motion.div
        className="fl-ring__glow"
        animate={breathing ? { scale: [1, 1.12, 1], opacity: [0.7, 0.95, 0.7] } : { scale: 1, opacity: 0.8 }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="fl-ring__svg" role="img" aria-label={`${formatTime(remainingMs)} remaining`}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--mark-line)"
          strokeOpacity={0.25}
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--apricot)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          className="fl-ring__progress"
        />
      </svg>
      <div className="fl-ring__readout">
        <div className="fl-ring__time">{formatTime(remainingMs)}</div>
        <div className="fl-ring__label">{label}</div>
      </div>
    </div>
  );
}
