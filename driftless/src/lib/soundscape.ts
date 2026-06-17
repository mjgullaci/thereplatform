/**
 * Driftless soundscape engine. HTMLAudioElement-based.
 *
 * Why not Web Audio synthesis: on iOS Safari with audioSession.type =
 * 'playback' (which we need so the silent switch doesn't mute us), pure
 * Web Audio synthesis nodes register a media session but produce no
 * audible output. HTMLAudioElement playback of real files is the reliable
 * iOS path — the OS treats it as media, routes it through the lock screen
 * / Control Center, and plays through the silent switch.
 *
 * Two presets: 'rain' and 'drone'. WAVs are generated at build time by
 * scripts/generate-sounds.mjs and live in public/sounds/.
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
  /** Call inside a user gesture to unlock iOS audio for both presets. */
  prime: () => void;
  start: (preset: Soundscape, volume: number) => Promise<void>;
  stop: () => Promise<void>;
  setPreset: (preset: Soundscape, volume: number) => Promise<void>;
  setVolume: (volume: number) => void;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  dispose: () => Promise<void>;
}

export function createSoundscapeEngine(): SoundscapeEngine {
  const elements: Partial<Record<Exclude<Soundscape, 'quiet'>, HTMLAudioElement>> = {};
  const fades = new Map<HTMLAudioElement, number>();
  let currentPreset: Soundscape = 'quiet';
  let unlocked = false;

  // Ask iOS (16.4+) to treat our audio as media playback so it plays through
  // the silent switch. No-op on browsers without audioSession.
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'playback';
  } catch {
    // ignore
  }

  function getElement(preset: Exclude<Soundscape, 'quiet'>): HTMLAudioElement {
    const cached = elements[preset];
    if (cached) return cached;
    const el = new Audio(FILES[preset]);
    el.loop = true;
    el.preload = 'auto';
    el.volume = 0;
    // Avoid the lock-screen poster being a giant black square
    el.setAttribute('playsinline', '');
    elements[preset] = el;
    return el;
  }

  function cancelFade(el: HTMLAudioElement) {
    const h = fades.get(el);
    if (h !== undefined) {
      cancelAnimationFrame(h);
      fades.delete(el);
    }
  }

  function fade(el: HTMLAudioElement, target: number, durationSec: number, onDone?: () => void) {
    cancelFade(el);
    const from = el.volume;
    const start = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const t = Math.min(1, elapsed / Math.max(0.001, durationSec));
      el.volume = Math.max(0, Math.min(1, from + (target - from) * t));
      if (t < 1) {
        fades.set(el, requestAnimationFrame(tick));
      } else {
        fades.delete(el);
        onDone?.();
      }
    };
    fades.set(el, requestAnimationFrame(tick));
  }

  /**
   * iOS unlock. Must be invoked synchronously from a user gesture.
   * Plays both preset elements at volume 0; once the play() promises
   * resolve, the audio session is unlocked and subsequent play() calls
   * (from non-gesture contexts) succeed.
   */
  function prime() {
    if (unlocked) return;
    unlocked = true;
    for (const key of Object.keys(FILES) as Array<Exclude<Soundscape, 'quiet'>>) {
      try {
        const el = getElement(key);
        el.volume = 0;
        // play() inside the gesture — promise resolves asynchronously
        // but the unlock is granted at call time.
        const p = el.play();
        if (p && typeof p.catch === 'function') p.catch(() => { /* unlock best-effort */ });
      } catch {
        // ignore
      }
    }
  }

  async function ensurePlaying(el: HTMLAudioElement) {
    if (el.paused) {
      try {
        await el.play();
      } catch {
        // iOS may reject if not unlocked — caller will retry via prime/begin
      }
    }
  }

  async function fadeOutAndPause(el: HTMLAudioElement) {
    return new Promise<void>((resolve) => {
      if (el.paused) {
        el.volume = 0;
        resolve();
        return;
      }
      fade(el, 0, FADE_OUT_SEC, () => {
        try { el.pause(); } catch { /* ignore */ }
        resolve();
      });
    });
  }

  async function start(preset: Soundscape, volume: number) {
    currentPreset = preset;
    if (preset === 'quiet') {
      await stop();
      return;
    }
    // Fade out any other preset that's playing
    for (const [key, el] of Object.entries(elements) as Array<[Exclude<Soundscape, 'quiet'>, HTMLAudioElement]>) {
      if (key === preset || !el) continue;
      if (!el.paused) void fadeOutAndPause(el);
    }
    const el = getElement(preset);
    await ensurePlaying(el);
    fade(el, volume, FADE_IN_SEC);
  }

  async function stop() {
    const promises: Array<Promise<void>> = [];
    for (const el of Object.values(elements)) {
      if (el && !el.paused) promises.push(fadeOutAndPause(el));
    }
    await Promise.all(promises);
  }

  async function setPreset(preset: Soundscape, volume: number) {
    if (preset === currentPreset && preset !== 'quiet') {
      const el = elements[preset as Exclude<Soundscape, 'quiet'>];
      if (el) {
        await ensurePlaying(el);
        fade(el, volume, VOL_TRIM_SEC);
      }
      return;
    }
    await start(preset, volume);
  }

  function setVolume(volume: number) {
    if (currentPreset === 'quiet') return;
    const el = elements[currentPreset as Exclude<Soundscape, 'quiet'>];
    if (el) fade(el, volume, VOL_TRIM_SEC);
  }

  async function pause() {
    for (const el of Object.values(elements)) {
      if (el && !el.paused) {
        try { el.pause(); } catch { /* ignore */ }
      }
    }
  }

  async function resume() {
    if (currentPreset === 'quiet') return;
    const el = elements[currentPreset as Exclude<Soundscape, 'quiet'>];
    if (el) await ensurePlaying(el);
  }

  async function dispose() {
    for (const el of Object.values(elements)) {
      if (!el) continue;
      cancelFade(el);
      try { el.pause(); } catch { /* ignore */ }
      try { el.removeAttribute('src'); el.load(); } catch { /* ignore */ }
    }
    fades.clear();
  }

  return { prime, start, stop, setPreset, setVolume, pause, resume, dispose };
}
