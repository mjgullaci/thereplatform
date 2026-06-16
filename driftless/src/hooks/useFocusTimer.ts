import { useCallback, useEffect, useRef, useState } from 'react';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'complete';

export interface FocusTimer {
  status: TimerStatus;
  totalMs: number;
  remainingMs: number;
  completedNaturally: boolean;
  start: (durationMs: number) => void;
  pause: () => void;
  resume: () => void;
  finish: () => void;
  reset: () => void;
}

/**
 * Timestamp-anchored countdown. Survives tab backgrounding because remaining
 * time is always recomputed from an absolute end time, never accumulated.
 * Ticks at 250ms; the ring CSS-transitions between ticks for smoothness.
 */
export function useFocusTimer(): FocusTimer {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [totalMs, setTotalMs] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [completedNaturally, setCompletedNaturally] = useState(false);
  const endAtRef = useRef<number | null>(null);

  const start = useCallback((durationMs: number) => {
    setTotalMs(durationMs);
    setRemainingMs(durationMs);
    setCompletedNaturally(false);
    endAtRef.current = Date.now() + durationMs;
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    if (endAtRef.current !== null) {
      setRemainingMs(Math.max(0, endAtRef.current - Date.now()));
    }
    endAtRef.current = null;
    setStatus((s) => (s === 'running' ? 'paused' : s));
  }, []);

  const resume = useCallback(() => {
    setStatus((s) => {
      if (s !== 'paused') return s;
      endAtRef.current = Date.now() + remainingMs;
      return 'running';
    });
  }, [remainingMs]);

  const finish = useCallback(() => {
    endAtRef.current = null;
    setRemainingMs(0);
    setCompletedNaturally(false);
    setStatus('complete');
  }, []);

  const reset = useCallback(() => {
    endAtRef.current = null;
    setTotalMs(0);
    setRemainingMs(0);
    setCompletedNaturally(false);
    setStatus('idle');
  }, []);

  useEffect(() => {
    if (status !== 'running') return;

    const update = () => {
      if (endAtRef.current === null) return;
      const rem = endAtRef.current - Date.now();
      if (rem <= 0) {
        setRemainingMs(0);
        setCompletedNaturally(true);
        setStatus('complete');
        return;
      }
      setRemainingMs(rem);
    };

    update();
    const id = window.setInterval(update, 250);
    const onVisible = () => {
      if (document.visibilityState === 'visible') update();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [status]);

  return { status, totalMs, remainingMs, completedNaturally, start, pause, resume, finish, reset };
}
