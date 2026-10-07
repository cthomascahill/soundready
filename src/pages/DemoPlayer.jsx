import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import { resolvePlayableAudioUrl } from "@/lib/audioPlayback";
import { Play, Pause, Loader2, Music2, Headphones, AlertTriangle } from "lucide-react";

const fmt = (s) => {
  if (!s || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

// Public demo player — an artist shares a /demo/<token> link and anyone
// can listen in the browser. No SoundReady account needed.
export default function DemoPlayer() {
  const { token } = useParams();
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [starting, setStarting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(null);
  const audioRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    base44.functions.invoke("demoLink", { action: "get", token })
      .then((res) => setMeta(res.data))
      .catch(() => setError("This link is not valid or was turned off."))
      .finally(() => setLoading(false));
  }, [token]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); return; }

    if (!audio.src) {
      setStarting(true);
      setError("");
      try {
        const res = await base44.functions.invoke("demoLink", { action: "play", token });
        audio.src = await resolvePlayableAudioUrl(res.data?.audio_url);
        await audio.play();
        setPlaying(true);
      } catch (e) {
        setError(e?.response?.data?.error || "Couldn't load this demo — try again.");
        setPlaying(false);
      } finally {
        setStarting(false);
      }
      return;
    }
    try { await audio.play(); setPlaying(true); } catch { setPlaying(false); }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    const bar = barRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const audioDur = duration || meta?.duration || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 relative overflow-hidden flex flex-col">
      {/* Green glow backdrop */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[500px] rounded-full bg-primary/8 blur-[100px]" />

      <header className="relative z-10 border-b border-zinc-800/60">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <SoundReadyLogo size={26} />
          <span className="text-xs text-zinc-500 flex items-center gap-1.5">
            <Headphones className="h-3.5 w-3.5 text-primary" /> Private demo link
          </span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading demo…</p>
          </div>
        ) : error && !meta ? (
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <AlertTriangle className="h-10 w-10 text-red-400" />
            <p className="text-sm text-zinc-400">{error}</p>
            <p className="text-xs text-zinc-600">Ask the artist who sent you this link for a fresh one.</p>
          </div>
        ) : meta ? (
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-zinc-800 bg-[#111] p-6 sm:p-8 shadow-2xl shadow-black/60">
              {/* Artwork */}
              <div className="mx-auto w-44 h-44 sm:w-52 sm:h-52 mb-6">
                {meta.artwork_url ? (
                  <img src={meta.artwork_url} alt={meta.title} className="w-full h-full object-cover rounded-2xl border border-zinc-800" />
                ) : (
                  <div className="w-full h-full rounded-2xl border border-zinc-800 bg-gradient-to-br from-primary/15 to-transparent flex items-center justify-center">
                    <Music2 className="h-14 w-14 text-primary/60" />
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h1 className="font-heading text-2xl font-bold truncate">{meta.title}</h1>
                <p className="text-sm text-zinc-400 mt-1 truncate">
                  {meta.artist || "Independent artist"}{meta.featured_artists ? ` · ft. ${meta.featured_artists}` : ""}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <button onClick={toggle} disabled={starting}
                  className="h-12 w-12 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all shrink-0 disabled:opacity-60">
                  {starting
                    ? <Loader2 className="h-5 w-5 animate-spin" />
                    : playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div ref={barRef} onClick={seek}
                    className="group h-2 rounded-full bg-zinc-800 cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-primary rounded-full"
                      style={{ width: `${audioDur ? (currentTime / audioDur) * 100 : 0}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1 tabular-nums">
                    <span>{fmt(currentTime)}</span>
                    <span>{fmt(audioDur)}</span>
                  </div>
                </div>
              </div>

              {error && <p className="text-xs text-red-400 mt-3 text-center">{error}</p>}

              <p className="text-center text-[11px] text-zinc-600 mt-4">
                Played {meta.plays || 0} time{(meta.plays || 0) === 1 ? "" : "s"} via this link
              </p>
            </div>

            <p className="text-center text-xs text-zinc-600 mt-6">
              Powered by <span className="text-primary font-semibold">SoundReady</span> — the operating system for independent artists
            </p>
          </div>
        ) : null}
      </main>

      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => { setPlaying(false); setCurrentTime(0); }}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
    </div>
  );
}