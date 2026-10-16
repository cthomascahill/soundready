import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { pickSamDeviceVoice } from "@/lib/browserVoice";

const fmt = (t) => `0:${String(Math.floor(t)).padStart(2, "0")}`;

/**
 * The shared self-playing, narrated, chaptered product-tour player used by
 * the homepage videos. Plays like a video: play/pause, seekable chapters
 * and optional voice-over narration, one spoken line per scene.
 */
export default function ScenePlayer({ scenes, title, logo, playLabel }) {
  const TOTAL = useMemo(() => scenes.reduce((a, s) => a + s.duration, 0), [scenes]);
  const BOUNDS = useMemo(
    () => scenes.reduce((acc, s) => [...acc, acc[acc.length - 1] + s.duration], [0]).slice(0, -1),
    [scenes]
  );

  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [narration, setNarration] = useState(true);
  const spokenRef = useRef(null);
  const timerRef = useRef(null);
  const holdRef = useRef(0);

  const sceneIndex = Math.min(BOUNDS.findLastIndex((b) => elapsed >= b), scenes.length - 1);
  const scene = scenes[sceneIndex];
  const finished = elapsed >= TOTAL;

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 0.1;
        // While the narration is still speaking, hold the slide (including the
        // final one) just short of its end instead of cutting the voice off
        // (capped so a stuck voice can't freeze the tour).
        const speaking = narration && typeof window !== "undefined" && !!window.speechSynthesis?.speaking;
        if (!speaking) holdRef.current = 0;
        if (next >= TOTAL) {
          if (speaking) {
            holdRef.current += 1;
            if (holdRef.current < 120) return TOTAL - 0.05;
            holdRef.current = 0;
          }
          setPlaying(false);
          return TOTAL;
        }
        if (speaking) {
          const idx = Math.min(BOUNDS.findLastIndex((b) => e >= b), scenes.length - 1);
          const sceneEnd = BOUNDS[idx] + scenes[idx].duration;
          if (next > sceneEnd) {
            holdRef.current += 1;
            if (holdRef.current < 120) return sceneEnd - 0.05;
            holdRef.current = 0;
          }
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [playing, narration, BOUNDS, scenes, TOTAL]);

  // Voice-over: one line per scene, spoken once per scene entry
  useEffect(() => {
    if (!playing || !narration || typeof window === "undefined" || !window.speechSynthesis) return;
    if (spokenRef.current === scene.id) return;
    spokenRef.current = scene.id;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(scene.narration);
    utter.rate = 1.02;
    const enVoices = window.speechSynthesis.getVoices().filter(v => v.lang?.toLowerCase().startsWith("en"));
    const deviceVoice = pickSamDeviceVoice(enVoices);
    if (deviceVoice) utter.voice = deviceVoice;
    window.speechSynthesis.speak(utter);
  }, [playing, narration, scene]);

  useEffect(() => {
    // Don't cancel on a natural finish: the last line of narration is still
    // speaking. Only a pause or a mute stops the voice mid-line.
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!narration || (!playing && !finished)) {
      window.speechSynthesis.cancel();
    }
  }, [playing, narration, finished]);

  const toggle = () => {
    if (finished) {
      setElapsed(0);
      spokenRef.current = null;
      setPlaying(true);
      return;
    }
    if (!playing) spokenRef.current = null;
    setPlaying(!playing);
  };

  const seekScene = (i) => {
    setElapsed(BOUNDS[i] + 0.05);
    spokenRef.current = null;
    holdRef.current = 0;
    if (!playing) setPlaying(true);
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="absolute -inset-8 rounded-[3rem] bg-primary/15 blur-3xl pointer-events-none" />
      <div className="relative rounded-2xl border border-border bg-black shadow-2xl overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            {logo}
            <p className="font-heading text-xs sm:text-sm font-bold text-zinc-100">{title}</p>
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-500 font-medium">{fmt(elapsed)} / {fmt(TOTAL)}</p>
        </div>

        {/* Stage */}
        <div className="relative aspect-video bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {scene.render()}
            </motion.div>
          </AnimatePresence>

          {/* Click-to-play overlay before first play */}
          {!started && (
            <button
              type="button"
              onClick={() => { setStarted(true); setPlaying(true); }}
              aria-label={`Play ${title}`}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-[2px]"
            >
              <span className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary text-primary-foreground shadow-[0_0_40px_rgba(74,222,128,0.5)] transition-transform hover:scale-105">
                <Play className="h-7 w-7 sm:h-9 sm:w-9 fill-current translate-x-0.5" />
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 font-semibold">{playLabel}</p>
            </button>
          )}

          {/* Subtitle */}
          {started && !finished && (
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 max-w-[85%] text-center text-[11px] sm:text-sm font-medium text-zinc-100 bg-black/70 backdrop-blur-sm rounded-full px-4 py-1.5 pointer-events-none">
              {scene.narration}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 bg-zinc-950 border-t border-zinc-800">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : finished ? "Replay" : "Play"}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground shrink-0 hover:bg-primary/90"
          >
            {playing ? <Pause className="h-4 w-4 fill-current" /> : <RotateCcw className={`h-4 w-4 ${finished ? "" : "hidden"}`} />}
            {!playing && !finished && <Play className="h-4 w-4 fill-current translate-x-px" />}
          </button>

          {/* Chaptered progress: one segment per scene, click to seek */}
          <div className="flex-1 flex items-center gap-1.5">
            {scenes.map((s, i) => {
              const filled = Math.min(Math.max(elapsed - BOUNDS[i], 0) / s.duration, 1);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => seekScene(i)}
                  title={s.label}
                  aria-label={`Skip to ${s.label}`}
                  className="group flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden"
                >
                  <div className="h-full bg-primary transition-[width] duration-100" style={{ width: `${filled * 100}%` }} />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setNarration((n) => !n)}
            aria-label={narration ? "Mute narration" : "Enable narration"}
            className={`flex items-center justify-center h-8 w-8 rounded-full border shrink-0 transition-colors ${
              narration ? "border-primary/60 text-primary" : "border-zinc-700 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {narration ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}