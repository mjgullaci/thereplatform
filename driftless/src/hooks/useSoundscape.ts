import { useEffect, useRef } from 'react';
import { createSoundscapeEngine, type Soundscape, type SoundscapeEngine } from '@/lib/soundscape';

interface UseSoundscapeArgs {
  preset: Soundscape;
  volume: number;
  /** 'playing' starts/keeps the soundscape; 'paused' suspends; 'stopped' fades out. */
  state: 'playing' | 'paused' | 'stopped';
}

/**
 * React lifecycle binding for the soundscape engine.
 * Engine instance survives across renders. Disposes on unmount.
 */
export function useSoundscape({ preset, volume, state }: UseSoundscapeArgs) {
  const engineRef = useRef<SoundscapeEngine | null>(null);
  const lastPresetRef = useRef<Soundscape>('quiet');

  if (engineRef.current === null && typeof window !== 'undefined') {
    engineRef.current = createSoundscapeEngine();
  }

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    let cancelled = false;

    (async () => {
      if (state === 'stopped') {
        await engine.stop();
        lastPresetRef.current = 'quiet';
        return;
      }
      if (state === 'paused') {
        await engine.pause();
        return;
      }
      // playing
      if (lastPresetRef.current !== preset) {
        await engine.setPreset(preset, volume);
        if (!cancelled) lastPresetRef.current = preset;
      } else {
        engine.setVolume(volume);
        await engine.resume();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [preset, volume, state]);

  // When the tab returns to the foreground mid-session, browsers may have
  // suspended the AudioContext. Re-resume so the sound continues.
  useEffect(() => {
    if (state !== 'playing') return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') void engineRef.current?.resume();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [state]);

  useEffect(() => {
    return () => {
      void engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  /** Call inside a user gesture (the begin tap / sound-chip tap) to unlock iOS audio. */
  const prime = () => engineRef.current?.prime();

  return { prime };
}
