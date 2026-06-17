import { useEffect, useRef } from 'react';

type WakeLockSentinelLike = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
};

/**
 * Keeps the screen awake while `active` is true (e.g. during a focus session),
 * and re-acquires the lock when the tab returns to the foreground. No-ops on
 * browsers without the Wake Lock API.
 */
export function useWakeLock(active: boolean) {
  const sentinel = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    if (!active) return;

    let released = false;
    const nav = navigator as WakeLockNavigator;

    const acquire = async () => {
      if (!nav.wakeLock) return;
      try {
        sentinel.current = await nav.wakeLock.request('screen');
      } catch {
        // user agent may refuse (low battery, etc.) — ignore
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !released) void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisible);
      try {
        void sentinel.current?.release();
      } catch {
        // ignore
      }
      sentinel.current = null;
    };
  }, [active]);
}
