/**
 * Driftless soundscape engine. Web Audio API, ADHD-aware.
 *
 * Two presets — rain (filtered brown noise) and drone (three detuned sines
 * with slow breath modulation, light convolver reverb). Both fade in and
 * out gently. Master gain is owned by the engine so the React layer just
 * tells it "play this at this volume" and never touches Web Audio nodes.
 *
 * Lazy AudioContext (created on first start() — user gesture required).
 */

export type Soundscape = 'quiet' | 'rain' | 'drone';

const FADE_IN_SEC = 2.5;
const FADE_OUT_SEC = 1.8;

type Teardown = () => void;

export interface SoundscapeEngine {
  start: (preset: Soundscape, volume: number) => Promise<void>;
  stop: () => Promise<void>;
  setPreset: (preset: Soundscape, volume: number) => Promise<void>;
  setVolume: (volume: number) => void;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  dispose: () => Promise<void>;
}

export function createSoundscapeEngine(): SoundscapeEngine {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let teardown: Teardown | null = null;
  let currentPreset: Soundscape = 'quiet';

  async function ensureContext() {
    if (ctx) return ctx;
    const Ctx =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) throw new Error('Web Audio API not available');
    ctx = new Ctx();
    if (ctx.state === 'suspended') await ctx.resume();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    return ctx;
  }

  function fadeMaster(targetGain: number, durationSec: number) {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, targetGain)), now + durationSec);
  }

  async function teardownCurrent() {
    if (!teardown) return;
    fadeMaster(0, FADE_OUT_SEC);
    await new Promise((r) => setTimeout(r, FADE_OUT_SEC * 1000 + 50));
    try {
      teardown();
    } catch {
      // ignore teardown errors
    }
    teardown = null;
  }

  async function spinUp(preset: Soundscape) {
    if (preset === 'quiet' || !ctx || !master) return;
    if (preset === 'rain') teardown = createRain(ctx, master);
    else if (preset === 'drone') teardown = createDrone(ctx, master);
  }

  async function start(preset: Soundscape, volume: number) {
    currentPreset = preset;
    if (preset === 'quiet') return;
    await ensureContext();
    if (!ctx || !master) return;
    await teardownCurrent();
    await spinUp(preset);
    fadeMaster(volume, FADE_IN_SEC);
  }

  async function stop() {
    await teardownCurrent();
  }

  async function setPreset(preset: Soundscape, volume: number) {
    if (preset === currentPreset && teardown) {
      setVolume(volume);
      return;
    }
    currentPreset = preset;
    if (preset === 'quiet') {
      await teardownCurrent();
      return;
    }
    await ensureContext();
    await teardownCurrent();
    await spinUp(preset);
    fadeMaster(volume, FADE_IN_SEC);
  }

  function setVolume(volume: number) {
    if (currentPreset === 'quiet') return;
    fadeMaster(volume, 0.4);
  }

  async function pause() {
    if (!ctx) return;
    if (ctx.state === 'running') await ctx.suspend();
  }

  async function resume() {
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();
  }

  async function dispose() {
    await teardownCurrent();
    if (ctx) {
      try {
        await ctx.close();
      } catch {
        // ignore close errors
      }
      ctx = null;
      master = null;
    }
  }

  return { start, stop, setPreset, setVolume, pause, resume, dispose };
}

/* ------------------------------ presets ------------------------------ */

/** Brown-noise rain with a slow intensity LFO. */
function createRain(ctx: AudioContext, dest: AudioNode): Teardown {
  const bufferSeconds = 8;
  const buffer = ctx.createBuffer(2, ctx.sampleRate * bufferSeconds, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 80;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 1200;
  lowpass.Q.value = 0.7;

  const intensity = ctx.createGain();
  intensity.gain.value = 1.0;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.18;
  lfo.connect(lfoDepth).connect(intensity.gain);

  source.connect(highpass).connect(lowpass).connect(intensity).connect(dest);
  source.start();
  lfo.start();

  return () => {
    try { source.stop(); } catch {
      // already stopped
    }
    try { lfo.stop(); } catch {
      // already stopped
    }
    source.disconnect();
    lfo.disconnect();
    lfoDepth.disconnect();
    intensity.disconnect();
    lowpass.disconnect();
    highpass.disconnect();
  };
}

/** Three detuned sine pads (A2 / E3 / A3) with chorus, breath LFO, and reverb tail. */
function createDrone(ctx: AudioContext, dest: AudioNode): Teardown {
  const freqs = [110, 164.81, 220]; // A2, E3, A3
  const pans = [-0.4, 0, 0.4];

  const reverb = ctx.createConvolver();
  reverb.buffer = createReverbImpulse(ctx, 3.4, 2.2);

  const wet = ctx.createGain();
  wet.gain.value = 0.5;
  const dry = ctx.createGain();
  dry.gain.value = 1.0;

  const warmth = ctx.createBiquadFilter();
  warmth.type = 'lowpass';
  warmth.frequency.value = 1400;
  warmth.Q.value = 0.5;

  const breath = ctx.createGain();
  breath.gain.value = 0.55;

  const breathLfo = ctx.createOscillator();
  breathLfo.frequency.value = 0.08;
  const breathDepth = ctx.createGain();
  breathDepth.gain.value = 0.12;
  breathLfo.connect(breathDepth).connect(breath.gain);

  warmth.connect(dry).connect(breath);
  warmth.connect(reverb).connect(wet).connect(breath);
  breath.connect(dest);
  breathLfo.start();

  const stoppers: Teardown[] = [];

  for (let i = 0; i < freqs.length; i++) {
    const partial = ctx.createGain();
    partial.gain.value = 0.16;

    const panner = ctx.createStereoPanner();
    panner.pan.value = pans[i];

    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.value = freqs[i];
    oscA.detune.value = -4;

    const oscB = ctx.createOscillator();
    oscB.type = 'sine';
    oscB.frequency.value = freqs[i];
    oscB.detune.value = +4;

    oscA.connect(partial);
    oscB.connect(partial);
    partial.connect(panner).connect(warmth);

    oscA.start();
    oscB.start();

    stoppers.push(() => {
      try { oscA.stop(); } catch {
        // already stopped
      }
      try { oscB.stop(); } catch {
        // already stopped
      }
      oscA.disconnect();
      oscB.disconnect();
      partial.disconnect();
      panner.disconnect();
    });
  }

  return () => {
    stoppers.forEach((s) => s());
    try { breathLfo.stop(); } catch {
      // already stopped
    }
    breathLfo.disconnect();
    breathDepth.disconnect();
    breath.disconnect();
    warmth.disconnect();
    reverb.disconnect();
    wet.disconnect();
    dry.disconnect();
  };
}

/** Synthesized exponential-decay impulse response, no audio assets needed. */
function createReverbImpulse(ctx: AudioContext, durationSec: number, decay: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * durationSec);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}
