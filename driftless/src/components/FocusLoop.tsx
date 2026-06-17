import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FocusRing } from './FocusRing';
import { useFocusTimer } from '@/hooks/useFocusTimer';
import { useWakeLock } from '@/hooks/useWakeLock';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useSoundscape } from '@/hooks/useSoundscape';
import { haptic, HAPTIC } from '@/lib/haptics';
import { DEFAULT_DURATION_MS, DURATIONS, randomTask, TASK_SUGGESTIONS } from '@/lib/tasks';
import type { Soundscape } from '@/lib/soundscape';
import driftlessIcon from '../assets/logo/driftless-icon.svg';

const SOUND_OPTIONS: Array<{ id: Soundscape; label: string }> = [
  { id: 'quiet', label: 'quiet' },
  { id: 'rain', label: 'rain' },
  { id: 'drone', label: 'drone' },
];

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.4, ease: [0.25, 0.6, 0.25, 1] as const },
};

export function FocusLoop() {
  const navigate = useNavigate();
  const timer = useFocusTimer();
  const [task, setTask] = usePersistentState<string>('lastTask', '');
  const [durationMs, setDurationMs] = usePersistentState<number>('lastDuration', DEFAULT_DURATION_MS);
  const [hapticsOn, setHapticsOn] = usePersistentState<boolean>('haptics', true);
  const [soundscape, setSoundscape] = usePersistentState<Soundscape>('soundscape', 'quiet');
  const [soundVolume, setSoundVolume] = usePersistentState<number>('soundVolume', 0.4);
  const [toast, setToast] = useState<string | null>(null);

  const inFocus = timer.status === 'running' || timer.status === 'paused' || timer.status === 'complete';
  useWakeLock(timer.status === 'running');

  // Drive the soundscape engine from the timer state. Audio only plays while
  // a session is running; pauses when the user pauses; stops on complete or
  // when the user leaves Focus Loop.
  const soundState: 'playing' | 'paused' | 'stopped' =
    timer.status === 'running' ? 'playing' : timer.status === 'paused' ? 'paused' : 'stopped';
  const { prime: primeSound } = useSoundscape({ preset: soundscape, volume: soundVolume, state: soundState });

  // Gentle "you came back" when the tab returns mid-session.
  const wasHidden = useRef(false);
  useEffect(() => {
    if (timer.status !== 'running') return;
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden.current = true;
      } else if (document.visibilityState === 'visible' && wasHidden.current) {
        wasHidden.current = false;
        showToast('you came back. that counts.');
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [timer.status]);

  // Haptic + cleanup when a session completes.
  const prevStatus = useRef(timer.status);
  useEffect(() => {
    if (prevStatus.current !== 'complete' && timer.status === 'complete') {
      haptic(hapticsOn, HAPTIC.complete);
    }
    prevStatus.current = timer.status;
  }, [timer.status, hapticsOn]);

  const toastTimer = useRef<number | null>(null);
  function showToast(text: string) {
    setToast(text);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }

  const effectiveTask = task.trim() || 'this one thing';

  function begin() {
    // Unlock iOS audio for this specific preset synchronously, inside this
    // tap. Each preset element needs its own gesture-driven play() — passing
    // the preset (not a no-arg call) is what makes switching reliable.
    if (soundscape !== 'quiet') primeSound(soundscape);
    haptic(hapticsOn, HAPTIC.begin);
    timer.start(durationMs);
  }

  function pickForMe() {
    const t = randomTask(task);
    setTask(t);
    haptic(hapticsOn, HAPTIC.tap);
  }

  function toggleRing() {
    if (timer.status === 'running') {
      timer.pause();
    } else if (timer.status === 'paused') {
      timer.resume();
    }
    haptic(hapticsOn, HAPTIC.tap);
  }

  function pickSomethingSmaller() {
    const smallest = DURATIONS[0];
    setDurationMs(smallest.ms);
    timer.reset();
    showToast('smaller still counts. five minutes.');
  }

  function startOver() {
    timer.reset();
  }

  const runningLabel = timer.status === 'paused' ? 'paused. no rush.' : 'staying with it';

  return (
    <div className={`fl-root${inFocus ? ' is-focusing' : ''}`}>
      <div className="fl-dusk" aria-hidden="true" />

      <div className="fl-stage">
        <AnimatePresence mode="wait">
          {/* ---------------- IDLE ---------------- */}
          {timer.status === 'idle' && (
            <motion.section key="idle" className="fl-screen" {...fade}>
              <header className="fl-top">
                <span className="fl-brand">
                  <img src={driftlessIcon} alt="" width={28} height={28} />
                  driftless
                </span>
                <Link to="/" className="fl-leave">home</Link>
              </header>

              <div className="fl-idle">
                <p className="fl-eyebrow">focus loop</p>
                <h1 className="fl-question">what's the one thing?</h1>

                <input
                  className="fl-input"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="name it, gently. or pick one below"
                  inputMode="text"
                  enterKeyHint="done"
                  aria-label="the one thing you'll focus on"
                />

                <div className="fl-suggestions">
                  {TASK_SUGGESTIONS.slice(0, 4).map((s) => (
                    <button
                      key={s}
                      className={`fl-chip${task === s ? ' is-on' : ''}`}
                      onClick={() => { setTask(s); haptic(hapticsOn, HAPTIC.tap); }}
                    >
                      {s}
                    </button>
                  ))}
                  <button className="fl-chip fl-chip--ghost" onClick={pickForMe}>
                    pick one for me
                  </button>
                </div>

                <div className="fl-durations" role="group" aria-label="how long">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.minutes}
                      className={`fl-duration${durationMs === d.ms ? ' is-on' : ''}`}
                      onClick={() => { setDurationMs(d.ms); haptic(hapticsOn, HAPTIC.tap); }}
                    >
                      <span className="fl-duration__mins">{d.minutes} min</span>
                      <span className="fl-duration__label">{d.label}</span>
                    </button>
                  ))}
                </div>

                <div className="fl-sound">
                  <div className="fl-sound__label">with sound</div>
                  <div className="fl-sound__row" role="group" aria-label="background sound">
                    {SOUND_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        className={`fl-sound__chip${soundscape === opt.id ? ' is-on' : ''}`}
                        onClick={() => {
                          if (opt.id !== 'quiet') primeSound(opt.id);
                          setSoundscape(opt.id);
                          haptic(hapticsOn, HAPTIC.tap);
                        }}
                        aria-pressed={soundscape === opt.id}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {soundscape !== 'quiet' && (
                    <label className="fl-sound__vol">
                      <span className="fl-sound__vol-label">volume</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={soundVolume}
                        onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                        aria-label="sound volume"
                      />
                    </label>
                  )}
                </div>

                <button className="fl-begin press" onClick={begin}>
                  begin
                </button>

                <button
                  className="fl-haptics"
                  onClick={() => setHapticsOn((v) => !v)}
                  aria-pressed={hapticsOn}
                >
                  gentle buzz: {hapticsOn ? 'on' : 'off'}
                </button>
              </div>
            </motion.section>
          )}

          {/* ---------------- RUNNING / PAUSED ---------------- */}
          {(timer.status === 'running' || timer.status === 'paused') && (
            <motion.section key="running" className="fl-screen fl-screen--focus" {...fade}>
              <header className="fl-top">
                <button className="fl-leave fl-leave--light" onClick={startOver}>leave</button>
              </header>

              <div className="fl-chip-task" title={effectiveTask}>{effectiveTask}</div>

              <button className="fl-ring-tap" onClick={toggleRing} aria-label={timer.status === 'paused' ? 'resume' : 'pause'}>
                <FocusRing
                  totalMs={timer.totalMs}
                  remainingMs={timer.remainingMs}
                  paused={timer.status === 'paused'}
                  label={runningLabel}
                />
              </button>

              <p className="fl-tap-hint">{timer.status === 'paused' ? 'tap the circle to resume' : 'tap the circle to pause'}</p>

              <div className="fl-actions">
                <button className="fl-primary press" onClick={timer.finish}>
                  i did it&nbsp;✓
                </button>
                <button className="fl-secondary" onClick={pickSomethingSmaller}>
                  not now. pick something smaller.
                </button>
              </div>
            </motion.section>
          )}

          {/* ---------------- COMPLETE ---------------- */}
          {timer.status === 'complete' && (
            <motion.section key="complete" className="fl-screen fl-screen--focus fl-complete" {...fade}>
              <motion.div
                className="fl-complete__halo"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.25, 0.6, 0.25, 1] }}
              >
                <span className="fl-complete__check">✓</span>
              </motion.div>
              <h1 className="fl-complete__title">
                {timer.completedNaturally ? "time's up." : 'done.'}
              </h1>
              <p className="fl-complete__sub">
                {timer.completedNaturally
                  ? 'you stayed with it. that was the one thing.'
                  : 'you did the one thing. that counts.'}
              </p>
              <div className="fl-actions">
                <button className="fl-primary press" onClick={() => navigate('/')}>
                  i'm good for now
                </button>
                <button className="fl-secondary fl-secondary--light" onClick={startOver}>
                  one more, gently
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fl-toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: [0.25, 0.6, 0.25, 1] }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
