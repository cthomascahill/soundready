import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import SamLogo from "@/components/SamLogo";
import StepTellSamScreen from "@/components/home/walkthrough/StepTellSamScreen";
import StepResearchScreen from "@/components/home/walkthrough/StepResearchScreen";
import StepApproveScreen from "@/components/home/walkthrough/StepApproveScreen";
import StepConnectProfilesScreen from "@/components/home/walkthrough/StepConnectProfilesScreen";
import StepAnalyticsScreen from "@/components/home/walkthrough/StepAnalyticsScreen";
import StepTrackerScreen from "@/components/home/walkthrough/StepTrackerScreen";
import StepPlaylistsScreen from "@/components/home/walkthrough/StepPlaylistsScreen";
import StepOpportunitiesScreen from "@/components/home/walkthrough/StepOpportunitiesScreen";
import { pickSamDeviceVoice } from "@/lib/browserVoice";

const SAM_IMG = "https://media.base44.com/images/public/69dcf0ecc907e43a438a626b/cbca442cd_generated_76ab93fb.png";

// Scene script: timings in seconds, narration doubles as the subtitle line.
const SCENES = [
  {
    id: "intro",
    label: "Meet SAM",
    duration: 4,
    narration: "This is SAM, your digital music manager. You make the music. SAM makes the moves.",
    render: () => (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-6">
        <motion.img
          src={SAM_IMG}
          alt="SAM, the Soundready Artist Manager robot"
          className="h-32 sm:h-44 w-auto drop-shadow-[0_18px_40px_rgba(34,197,94,0.35)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -10, 0] }}
          transition={{ opacity: { duration: 0.6 }, y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
        />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <p className="font-heading text-2xl sm:text-4xl font-black tracking-tight">
            <span className="text-primary">S</span>oundready <span className="text-primary">A</span>rtist{" "}
            <span className="text-primary">M</span>anager
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            You make the music. SAM makes the moves.
          </p>
        </motion.div>
      </div>
    ),
  },
  {
    id: "tell",
    label: "1 · Tell Sam",
    duration: 6,
    narration: "Give SAM any task in plain words. Book my tour. Pitch my new single. No forms, no spreadsheets.",
    render: () => (
      <div className="h-full flex items-center justify-center px-4 sm:px-10 py-6">
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StepTellSamScreen />
        </motion.div>
      </div>
    ),
  },
  {
    id: "research",
    label: "2 · Sam works",
    duration: 6,
    narration: "SAM researches real venues and playlists, verifies every contact, and checks each against your sound and your stats.",
    render: () => (
      <div className="h-full flex items-center justify-center px-4 sm:px-10 py-6">
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StepResearchScreen />
        </motion.div>
      </div>
    ),
  },
  {
    id: "approve",
    label: "3 · You approve",
    duration: 6,
    narration: "You get the pitch, already written. Approve, edit, or deny. Nothing sends without you.",
    render: () => (
      <div className="h-full flex items-center justify-center px-4 sm:px-10 py-6">
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StepApproveScreen />
        </motion.div>
      </div>
    ),
  },
  {
    id: "connect",
    label: "Connect profiles",
    duration: 5,
    narration: "Start by connecting your profiles. SoundReady pulls your real numbers from Spotify, YouTube, and more.",
    render: () => <StepConnectProfilesScreen />,
  },
  {
    id: "analytics",
    label: "Analytics",
    duration: 5,
    narration: "Then see your analytics in one place: listeners, streams, and growth.",
    render: () => <StepAnalyticsScreen />,
  },
  {
    id: "tracker",
    label: "Tracker",
    duration: 5,
    narration: "Track every song in the tracker, from first idea to release day.",
    render: () => <StepTrackerScreen />,
  },
  {
    id: "playlists",
    label: "Playlists",
    duration: 5,
    narration: "Pitch your music to playlists that match your sound.",
    render: () => <StepPlaylistsScreen />,
  },
  {
    id: "opportunities",
    label: "Opportunities",
    duration: 6,
    narration: "And find real opportunities: venues, playlists, labels, and sync, researched and verified by SAM.",
    render: () => <StepOpportunitiesScreen />,
  },
  {
    id: "outro",
    label: "Start free",
    duration: 4,
    narration: "One manager. One login. Your whole career. Start free.",
    render: () => (
      <div className="h-full flex flex-col items-center justify-center gap-5 text-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <p className="font-heading text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Your career, <span className="text-primary">in motion.</span>
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-md mx-auto">
            Sign up free and your Release Starter Kit lands in your inbox the moment you join.
          </p>
        </motion.div>
        <motion.button
          type="button"
          onClick={() => (window.location.href = "/register")}
          className="font-heading font-bold text-sm sm:text-base px-8 h-12 rounded-md bg-primary text-primary-foreground shadow-[0_0_40px_rgba(74,222,128,0.35)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          Start Free
        </motion.button>
      </div>
    ),
  },
];

const TOTAL = SCENES.reduce((a, s) => a + s.duration, 0);
const BOUNDS = SCENES.reduce((acc, s, i) => [...acc, acc[i] + s.duration], [0]).slice(0, -1);
const fmt = (t) => `0:${String(Math.floor(t)).padStart(2, "0")}`;

/**
 * The "How SAM works" how-to video: a self-playing, narrated, chaptered
 * product tour built from the real product UI. Plays like a video with
 * play/pause, seekable chapters and optional voice-over narration.
 */
export default function SamOverviewVideo() {
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [narration, setNarration] = useState(true);
  const spokenRef = useRef(null);
  const timerRef = useRef(null);
  const holdRef = useRef(0);

  const sceneIndex = Math.min(BOUNDS.findLastIndex((b) => elapsed >= b), SCENES.length - 1);
  const scene = SCENES[sceneIndex];
  const finished = elapsed >= TOTAL;

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 0.1;
        if (next >= TOTAL) {
          setPlaying(false);
          return TOTAL;
        }
        // Let SAM finish her sentence: while the narration is still
        // speaking, hold the slide just short of its end instead of
        // cutting her off (capped so a stuck voice can't freeze the tour).
        const speaking = narration && typeof window !== "undefined" && !!window.speechSynthesis?.speaking;
        if (!speaking) holdRef.current = 0;
        if (speaking) {
          const idx = Math.min(BOUNDS.findLastIndex((b) => e >= b), SCENES.length - 1);
          const sceneEnd = BOUNDS[idx] + SCENES[idx].duration;
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
  }, [playing, narration]);

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
    if (!playing && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [playing, narration]);

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

  const subtitle = useMemo(() => scene.narration, [scene]);

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="absolute -inset-8 rounded-[3rem] bg-primary/15 blur-3xl pointer-events-none" />
      <div className="relative rounded-2xl border border-border bg-black shadow-2xl overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2">
            <SamLogo className="h-4 w-4 text-primary" />
            <p className="font-heading text-xs sm:text-sm font-bold text-zinc-100">How SAM works</p>
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
              aria-label="Play the SAM overview video"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-[2px]"
            >
              <span className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary text-primary-foreground shadow-[0_0_40px_rgba(74,222,128,0.5)] transition-transform hover:scale-105">
                <Play className="h-7 w-7 sm:h-9 sm:w-9 fill-current translate-x-0.5" />
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 font-semibold">Watch: how SAM manages your career</p>
            </button>
          )}

          {/* Subtitle */}
          {started && !finished && (
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 max-w-[85%] text-center text-[11px] sm:text-sm font-medium text-zinc-100 bg-black/70 backdrop-blur-sm rounded-full px-4 py-1.5 pointer-events-none">
              {subtitle}
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
            {SCENES.map((s, i) => {
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