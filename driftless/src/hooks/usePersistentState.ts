import { useEffect, useState } from 'react';

/**
 * localStorage-backed state, namespaced under `driftless.`.
 * Fails quietly when storage is unavailable (private mode, etc.).
 */
export function usePersistentState<T>(key: string, initial: T) {
  const full = `driftless.${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(full);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(full, JSON.stringify(value));
    } catch {
      // ignore — storage may be unavailable
    }
  }, [full, value]);

  return [value, setValue] as const;
}
