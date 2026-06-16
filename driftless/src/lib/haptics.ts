/** Gentle, optional vibration. No-ops where unsupported or when disabled. */
export function haptic(enabled: boolean, pattern: number | number[]) {
  if (!enabled) return;
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}

export const HAPTIC = {
  begin: 10,
  tap: 6,
  complete: [12, 70, 18] as number[],
};
