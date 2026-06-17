/**
 * Driftless soundscape engine. Single-element, src-swapping design.
 *
 * Why this shape:
 *   On iOS Safari, only the first HTMLAudioElement you play()  inside a
 *   user gesture actually becomes the page's audio source. A second
 *   element looks unlocked but emits no sound — switching presets fails.
 *   Using ONE element and changing its `src` is the bulletproof pattern.
 *
 * Each user gesture (chip tap / begin tap) calls prime(preset). Prime
 * swaps the src if needed and play()s inside the gesture, so iOS keeps
 * the unlock current for the file we're about to play. The React effect
 * then fades the volume up via raf, no second gesture required.
 *
 * Real audio files are pre-rendered by scripts/generate-sounds.mjs and
 * served from /sounds/. Web Audio API is intentionally not used.
 */

export type Soundscape = 'quiet' | 'rain' | 'drone';

const FADE_IN_SEC = 2.5;
const FADE_OUT_SEC = 1.8;
const VOL_TRIM_SEC = 0.4;

const FILES: Record<Exclude<Soundscape, 'quiet'>, string> = {
  rain: '/sounds/rain.wav',
  drone: '/sounds/drone.wav',
};

export interface SoundscapeEngine {
  /** Call inside the user gesture that's about to play this preset. */
  prime: (preset: Soundscape) => void;
  start: (preset: Soundscape, volume: number) => Promise<void>;
  stop: () => Promise<void>;
  setPreset: (preset: Soundscape, volume: number) => Promise<void>;
  setVolume: (volume: number) => void;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  dispose: () => Promise<void>;
}

export function createSoundscapeEngine(): SoundscapeEngine {
  let el: HTMLAudioElement | null = null;
  let fadeHandle: number | null = null;
  let currentPreset: Soundscape = 'quiet';
  let loadedFile: string | null = null;

  // Ask iOS (16.4+) to treat our audio as media playback so the silent
  // switch doesn't mute it. No-op on browsers without audioSession.
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'playback';
  } catch {
    // ignore
  }

  function ensureElement(): HTMLAudioElement {
    if (el) return el;
    el = new Audio();
    el.loop = true;
    el.preload = 'auto';
    el.volume = 0;
    el.setAttribute('playsinline', '');
    // iOS Safari's loop=true is unreliable for short files — ended fires
    // anyway. Manually seek + replay so playback never stops.
    el.addEventListener('ended', () => {
      const node = el;
      if (!node) return;
      try {
        node.currentTime = 0;
        void node.play().catch(() => { /* best effort */ });
      } catch {
        // ignore
      }
    });
    return el;
  }

  function loadSrcIfNeeded(file: string) {
    const node = ensureElement();
    if (loadedFile === file) return;
    node.src = file;
    loadedFile = file;
    try {
      node.load();
    } catch {
      // ignore
    }
  }

  function cancelFade() {
    if (fadeHandle !== null) {
      cancelAnimationFrame(fadeHandle);
      fadeHandle = null;
    }
  }

  function fade(target: number, durationSec: number, onDone?: () => void) {
    const node = el;
    if (!node) return;
    cancelFade();
    const from = node.volume;
    const startedAt = performance.now();
    const tick = () => {
      if (!el) return;
      const elapsed = (performance.now() - startedAt) / 1000;
      const t = Math.min(1, elapsed / Math.max(0.001, durationSec));
      el.volume = Math.max(0, Math.min(1, from + (target - from) * t));
      if (t < 1) {
        fadeHandle = requestAnimationFrame(tick);
      } else {
        fadeHandle = null;
        onDone?.();
      }
    };
    fadeHandle = requestAnimationFrame(tick);
  }

  /**
   * Synchronous iOS unlock for the preset that's about to play. MUST be
   * called from inside the user gesture (chip tap / begin tap). Sets the
   * src if it needs to change, then calls play() while still inside the
   * gesture — which is the only way iOS grants the unlock for the new src.
   */
  function prime(preset: Soundscape) {
    if (preset === 'quiet') return;
    const file = FILES[preset];
    try {
      const node = ensureElement();
      loadSrcIfNeeded(file);
      node.volume = 0;
      const p = node.play();
      if (p && typeof p.catch === 'function') p.catch(() => { /* best effort */ });
    } catch {
      // ignore
    }
  }

  async function ensurePlaying() {
    const node = el;
    if (!node) return;
    if (node.paused) {
      try {
        await node.play();
      } catch {
        // best effort — caller may re-prime
      }
    }
  }

  async function start(preset: Soundscape, volume: number) {
    currentPreset = preset;
    if (preset === 'quiet') {
      await stop();
      return;
    }
    const file = FILES[preset];
    loadSrcIfNeeded(file);
    await ensurePlaying();
    fade(volume, FADE_IN_SEC);
  }

  async function stop() {
    const node = el;
    if (!node) return;
    if (node.paused) {
      node.volume = 0;
      return;
    }
    await new Promise<void>((resolve) => {
      fade(0, FADE_OUT_SEC, () => {
        try { node.pause(); } catch { /* ignore */ }
        resolve();
      });
    });
  }

  async function setPreset(preset: Soundscape, volume: number) {
    if (preset === currentPreset && preset !== 'quiet' && el && !el.paused) {
      fade(volume, VOL_TRIM_SEC);
      return;
    }
    await start(preset, volume);
  }

  function setVolume(volume: number) {
    if (currentPreset === 'quiet') return;
    fade(volume, VOL_TRIM_SEC);
  }

  async function pause() {
    if (el && !el.paused) {
      try { el.pause(); } catch { /* ignore */ }
    }
  }

  async function resume() {
    if (currentPreset === 'quiet') return;
    await ensurePlaying();
  }

  async function dispose() {
    cancelFade();
    if (el) {
      try { el.pause(); } catch { /* ignore */ }
      try { el.removeAttribute('src'); el.load(); } catch { /* ignore */ }
    }
    el = null;
    loadedFile = null;
  }

  return { prime, start, stop, setPreset, setVolume, pause, resume, dispose };
}
