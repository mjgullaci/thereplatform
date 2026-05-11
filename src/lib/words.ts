export function normalize(word: string): string {
  return word.trim().toUpperCase();
}

export function canSpellFromLetters(word: string, letters: string[]): boolean {
  const bag = [...letters];
  for (const ch of word) {
    const idx = bag.indexOf(ch);
    if (idx === -1) return false;
    bag.splice(idx, 1);
  }
  return true;
}

export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}
