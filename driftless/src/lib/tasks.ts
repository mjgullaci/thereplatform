/** Gentle, low-friction task suggestions in the Driftless voice. */
export const TASK_SUGGESTIONS = [
  'reply to the message you keep leaving',
  'open the thing — just open it',
  'tidy one surface',
  'drink a glass of water',
  'write the first sentence',
  'put one load on',
  'two minutes on the hard thing',
  'step outside for a minute',
];

export function randomTask(exclude?: string): string {
  const pool = TASK_SUGGESTIONS.filter((t) => t !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? TASK_SUGGESTIONS[0];
}

export interface DurationPreset {
  label: string;
  minutes: number;
  ms: number;
}

export const DURATIONS: DurationPreset[] = [
  { label: 'a few minutes', minutes: 5, ms: 5 * 60_000 },
  { label: 'a focus block', minutes: 15, ms: 15 * 60_000 },
  { label: 'a deep stretch', minutes: 25, ms: 25 * 60_000 },
];

export const DEFAULT_DURATION_MS = DURATIONS[1].ms;
