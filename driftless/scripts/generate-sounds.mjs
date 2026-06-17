/**
 * Generate the Driftless soundscape WAV files at build time.
 *
 * Why local-synthesised files instead of Web Audio at runtime:
 *   iOS Safari + Web Audio synthesis + audioSession=playback is silent in
 *   practice — the media session registers but raw oscillator/noise output
 *   doesn't route through it. HTMLAudioElement playback of real audio files
 *   works reliably under the same audioSession configuration.
 *
 * Two presets, both 22.05 kHz mono 16-bit PCM, ~8 s loops, with 35 ms edge
 * fades so HTMLAudioElement.loop = true seams without a click.
 *
 *   rain  — brown noise through soft highpass(80) + lowpass(1200), with a
 *           slow LFO intensity wobble so it doesn't feel mechanical.
 *   drone — three detuned sine pads at A2 / E3 / A3, with a 0.08 Hz breath
 *           amplitude modulation. Stays under -6 dBFS peak.
 *
 * Run: node scripts/generate-sounds.mjs   (outputs to public/sounds/)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_RATE = 22_050;
const DURATION_SEC = 8;
const NUM_SAMPLES = SAMPLE_RATE * DURATION_SEC;
const FADE_SAMPLES = Math.round(SAMPLE_RATE * 0.035); // 35 ms edge fade

/* --------------------------- WAV writer --------------------------- */

function writeWAV(filename, samples) {
  const dataBytes = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  let o = 0;
  buffer.write('RIFF', o); o += 4;
  buffer.writeUInt32LE(36 + dataBytes, o); o += 4;
  buffer.write('WAVE', o); o += 4;
  buffer.write('fmt ', o); o += 4;
  buffer.writeUInt32LE(16, o); o += 4;
  buffer.writeUInt16LE(1, o); o += 2;            // PCM
  buffer.writeUInt16LE(1, o); o += 2;            // mono
  buffer.writeUInt32LE(SAMPLE_RATE, o); o += 4;
  buffer.writeUInt32LE(SAMPLE_RATE * 2, o); o += 4; // byte rate
  buffer.writeUInt16LE(2, o); o += 2;            // block align
  buffer.writeUInt16LE(16, o); o += 2;            // bits per sample
  buffer.write('data', o); o += 4;
  buffer.writeUInt32LE(dataBytes, o); o += 4;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), o);
    o += 2;
  }
  writeFileSync(filename, buffer);
  const kb = (buffer.length / 1024).toFixed(1);
  console.log(`  wrote ${path.basename(filename)} (${kb} KB)`);
}

/* --------------------------- biquad filter (Robert Bristow-Johnson cookbook) --------------------------- */

function biquad(samples, type, freq, Q = 0.707) {
  const w = (2 * Math.PI * freq) / SAMPLE_RATE;
  const cosw = Math.cos(w);
  const sinw = Math.sin(w);
  const alpha = sinw / (2 * Q);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'lowpass') {
    b0 = (1 - cosw) / 2;
    b1 = 1 - cosw;
    b2 = (1 - cosw) / 2;
    a0 = 1 + alpha;
    a1 = -2 * cosw;
    a2 = 1 - alpha;
  } else if (type === 'highpass') {
    b0 = (1 + cosw) / 2;
    b1 = -(1 + cosw);
    b2 = (1 + cosw) / 2;
    a0 = 1 + alpha;
    a1 = -2 * cosw;
    a2 = 1 - alpha;
  } else {
    throw new Error(`unsupported biquad: ${type}`);
  }
  const nb0 = b0 / a0, nb1 = b1 / a0, nb2 = b2 / a0, na1 = a1 / a0, na2 = a2 / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const x0 = samples[i];
    const y0 = nb0 * x0 + nb1 * x1 + nb2 * x2 - na1 * y1 - na2 * y2;
    out[i] = y0;
    x2 = x1; x1 = x0; y2 = y1; y1 = y0;
  }
  return out;
}

/* --------------------------- post-processing --------------------------- */

function normalize(samples, targetPeak) {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > peak) peak = a;
  }
  if (peak === 0) return samples;
  const gain = targetPeak / peak;
  for (let i = 0; i < samples.length; i++) samples[i] *= gain;
  return samples;
}

function fadeEdges(samples) {
  for (let i = 0; i < FADE_SAMPLES; i++) {
    // raised-cosine fade
    const env = 0.5 - 0.5 * Math.cos((Math.PI * i) / FADE_SAMPLES);
    samples[i] *= env;
    samples[samples.length - 1 - i] *= env;
  }
  return samples;
}

/* --------------------------- presets --------------------------- */

function generateRain() {
  console.log('generating rain...');
  const seedNoise = new Float32Array(NUM_SAMPLES);
  let brown = 0;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const white = Math.random() * 2 - 1;
    brown = (brown + 0.02 * white) / 1.02;
    seedNoise[i] = brown * 3.5;
  }
  let s = biquad(seedNoise, 'highpass', 80);
  s = biquad(s, 'lowpass', 1200);

  // Slow intensity LFO so it doesn't feel like white noise on a loop.
  for (let i = 0; i < s.length; i++) {
    const t = i / SAMPLE_RATE;
    const lfo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.07 * t);
    s[i] *= lfo;
  }
  s = normalize(s, 0.7); // peak target ~ -3 dBFS
  return fadeEdges(s);
}

function generateDrone() {
  console.log('generating drone...');
  const freqs = [110, 164.81, 220]; // A2, E3, A3
  const detune = [-3, 0, +3]; // cents-ish, very subtle chorus feel
  const samples = new Float32Array(NUM_SAMPLES);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const breath = 1 - 0.12 * Math.sin(2 * Math.PI * 0.08 * t);
    let v = 0;
    for (let j = 0; j < freqs.length; j++) {
      const fA = freqs[j] * Math.pow(2, detune[j] / 1200);
      const fB = freqs[j] * Math.pow(2, -detune[j] / 1200);
      v += 0.16 * (Math.sin(2 * Math.PI * fA * t) + Math.sin(2 * Math.PI * fB * t));
    }
    samples[i] = v * breath;
  }
  // Gentle low-pass for warmth
  let s = biquad(samples, 'lowpass', 1400);
  s = normalize(s, 0.6); // peak target ~ -4.4 dBFS
  return fadeEdges(s);
}

/* --------------------------- main --------------------------- */

const outDir = path.resolve(__dirname, '..', 'public', 'sounds');
mkdirSync(outDir, { recursive: true });
writeWAV(path.join(outDir, 'rain.wav'), generateRain());
writeWAV(path.join(outDir, 'drone.wav'), generateDrone());
console.log('done.');
