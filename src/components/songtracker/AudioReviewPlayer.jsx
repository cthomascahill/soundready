import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { X, Play, Pause, Volume2, Upload, Loader2, ChevronDown, Check } from "lucide-react";
import { resolvePlayableAudioUrl } from "@/lib/audioPlayback";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import WaveformDisplay from "./audioreview/WaveformDisplay";
import LevelMeters from "./audioreview/LevelMeters";

const fmtTime = (s) => {
  if (s == null || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const toDb = (v) => (v > 0 ? 20 * Math.log10(v) : -Infinity);

// Down-sample a decoded buffer to normalized peak bars for the waveform
function computePeaks(audioBuffer, count = 320) {
  const ch = audioBuffer.getChannelData(0);
  const step = Math.max(1, Math.floor(ch.length / count));
  const peaks = [];
  let max = 0;
  for (let i = 0; i < count; i++) {
    let peak = 0;
    const start = i * step;
    for (let j = 0; j < step; j += 4) {
      const v = Math.abs(ch[start + j] || 0);
      if (v > peak) peak = v;
    }
    peaks.push(peak);
    if (peak > max) max = peak;
  }
  return max > 0 ? peaks.map((p) => p / max) : peaks;
}

// A/B mix review player: one playback clock shared by both versions, so
// switching A/B mid-song keeps the exact same position. Mixes are stored as
// SongVersion records; notes are stamped with the mix + timestamp and saved
// onto the song's notes field.
export default function AudioReviewPlayer({ song, onUpdate, open, onOpenChange, onVersionsChanged }) {
  const [versions, setVersions] = useState([]);
  const [info, setInfo] = useState({}); // id -> { url, duration, peaks, sameOrigin, loading, error }
  const [aId, setAId] = useState(null);
  const [bId, setBId] = useState(null);
  const [side, setSide] = useState("a");
  const [playing, setPlaying] = useState(false);
  const [transport, setTransport] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [meters, setMeters] = useState({ l: -Infinity, r: -Infinity, pl: -Infinity, pr: -Infinity });
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  const aRef = useRef(null);
  const bRef = useRef(null);
  const ctxRef = useRef(null);
  const graphRef = useRef({}); // 'a' | 'b' -> { gain, analyserL, analyserR }
  const rafRef = useRef(null);
  const pendingSeekRef = useRef({ a: null, b: null });
  const urlsRef = useRef(new Set());
  const peakHoldRef = useRef({ l: -Infinity, r: -Infinity });
  const sideRef = useRef("a");
  const playingRef = useRef(false);
  const volumeRef = useRef(volume);
  const meterBufRef = useRef({ l: new Float32Array(1024), r: new Float32Array(1024) });
  const inputRef = useRef(null);
  sideRef.current = side;
  playingRef.current = playing;
  volumeRef.current = volume;

  // Load this song's versions when the player opens
  useEffect(() => {
    if (!open || !song?.id) return;
    let alive = true;
    setLoadingList(true);
    base44.entities.SongVersion.filter({ pipeline_song_id: song.id }, "-created_date", 50)
      .then((list) => {
        if (!alive) return;
        const ordered = [...list].sort(
          (x, y) => new Date(x.created_date || 0) - new Date(y.created_date || 0)
        );
        setVersions(ordered);
        const current = ordered.find((v) => v.is_current) || ordered[ordered.length - 1] || null;
        setAId(current?.id ?? null);
        setBId(null);
        setSide("a");
        setTransport(0);
        setLoadingList(false);
      })
      .catch(() => alive && setLoadingList(false));
    return () => {
      alive = false;
    };
  }, [open, song?.id]);

  // Sign + fetch one version as a same-origin blob (needed for Web Audio metering),
  // decode it for waveform peaks, and cache everything under its id.
  const prepare = useCallback(async (v) => {
    setInfo((prev) => (prev[v.id] ? prev : { ...prev, [v.id]: { loading: true } }));
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: v.file_uri,
        expires_in: 3600,
      });
      const playable = await resolvePlayableAudioUrl(signed_url);
      let url = playable;
      let sameOrigin = url.startsWith("blob:");
      let duration = null;
      let peaks = null;
      if (!sameOrigin) {
        try {
          const res = await fetch(playable);
          const buf = await res.arrayBuffer();
          const type = res.headers?.get?.("content-type") || "audio/mpeg";
          url = URL.createObjectURL(new Blob([buf], { type }));
          sameOrigin = true;
          urlsRef.current.add(url);
        } catch {
          // Cross-origin fetch blocked — play the URL directly (no meters)
        }
      }
      if (sameOrigin) {
        try {
          const res = await fetch(url);
          const buf = await res.arrayBuffer();
          ctxRef.current ||= new (window.AudioContext || window.webkitAudioContext)();
          const audioBuf = await ctxRef.current.decodeAudioData(buf.slice(0));
          peaks = computePeaks(audioBuf);
          duration = audioBuf.duration;
        } catch {}
      }
      setInfo((prev) => ({ ...prev, [v.id]: { url, sameOrigin, duration, peaks } }));
    } catch {
      setInfo((prev) => ({ ...prev, [v.id]: { error: true } }));
    }
  }, []);

  useEffect(() => {
    versions.forEach((v) => {
      if (!info[v.id]) prepare(v);
    });
  }, [versions, info, prepare]);

  // Wire each audio element to its selected version's url
  const applySrc = (el, id, key) => {
    if (!el) return;
    const entry = id ? info[id] : null;
    if (!entry?.url) {
      if (el.src) {
        el.pause();
        if (sideRef.current === key) setPlaying(false);
        el.removeAttribute("src");
      }
      return;
    }
    if (el.src !== entry.url) {
      el.pause();
      if (sideRef.current === key) setPlaying(false);
      el.src = entry.url;
      // active side restarts at 0; the inactive side stays aligned with the clock
      pendingSeekRef.current[key] = sideRef.current === key ? 0 : transport;
      el.load();
    }
  };

  useEffect(() => applySrc(aRef.current, aId, "a"), [aId, info]);
  useEffect(() => applySrc(bRef.current, bId, "b"), [bId, info]);

  // Monitor volume: through the gain node when Web Audio owns the signal,
  // element volume as fallback for cross-origin files.
  useEffect(() => {
    const graphs = Object.values(graphRef.current);
    if (graphs.length) {
      graphs.forEach((g) => (g.gain.gain.value = volume));
    } else {
      [aRef.current, bRef.current].forEach((el) => el && (el.volume = volume));
    }
  }, [volume]);

  const ensureGraph = (key, el) => {
    if (graphRef.current[key]) return graphRef.current[key];
    const id = key === "a" ? aId : bId;
    if (!info[id]?.sameOrigin) return null;
    ctxRef.current ||= new (window.AudioContext || window.webkitAudioContext)();
    const ctx = ctxRef.current;
    const src = ctx.createMediaElementSource(el);
    const gain = ctx.createGain();
    gain.gain.value = volumeRef.current;
    src.connect(gain);
    gain.connect(ctx.destination);
    const splitter = ctx.createChannelSplitter(2);
    src.connect(splitter);
    const analyserL = ctx.createAnalyser();
    const analyserR = ctx.createAnalyser();
    splitter.connect(analyserL, 0);
    splitter.connect(analyserR, 1);
    graphRef.current[key] = { gain, analyserL, analyserR };
    return graphRef.current[key];
  };

  const startMeters = () => {
    if (rafRef.current) return;
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      if (!playingRef.current) return;
      const g = graphRef.current[sideRef.current];
      const active = sideRef.current === "a" ? aRef.current : bRef.current;
      if (active) setTransport(active.currentTime);
      if (!g) return;
      const { l: lBuf, r: rBuf } = meterBufRef.current;
      g.analyserL.getFloatTimeDomainData(lBuf);
      g.analyserR.getFloatTimeDomainData(rBuf);
      let l = 0;
      let r = 0;
      for (let i = 0; i < lBuf.length; i += 4) {
        const al = Math.abs(lBuf[i]);
        if (al > l) l = al;
        const ar = Math.abs(rBuf[i]);
        if (ar > r) r = ar;
      }
      const lDb = toDb(l);
      const rDb = toDb(r);
      const hold = peakHoldRef.current;
      hold.l = Math.max(lDb, hold.l - 0.8);
      hold.r = Math.max(rDb, hold.r - 0.8);
      setMeters({ l: lDb, r: rDb, pl: hold.l, pr: hold.r });
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopMeters = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    peakHoldRef.current = { l: -Infinity, r: -Infinity };
    setMeters({ l: -Infinity, r: -Infinity, pl: -Infinity, pr: -Infinity });
  };

  const play = async () => {
    const key = sideRef.current;
    const el = key === "a" ? aRef.current : bRef.current;
    const id = key === "a" ? aId : bId;
    if (!el || !info[id]?.url) return;
    try {
      ctxRef.current?.resume?.();
      ensureGraph("a", aRef.current);
      ensureGraph("b", bRef.current);
      await el.play();
      setPlaying(true);
      startMeters();
    } catch {}
  };

  const pause = () => {
    (sideRef.current === "a" ? aRef.current : bRef.current)?.pause();
    setPlaying(false);
    stopMeters();
  };

  // A/B swap on ONE clock: the new side picks up the exact same position
  const switchSide = async (target) => {
    if (target === sideRef.current) return;
    const targetId = target === "a" ? aId : bId;
    if (!targetId || !info[targetId]?.url) return;
    const fromEl = sideRef.current === "a" ? aRef.current : bRef.current;
    const toEl = target === "a" ? aRef.current : bRef.current;
    const wasPlaying = playingRef.current;
    if (wasPlaying) {
      const t = fromEl.currentTime;
      fromEl.pause();
      ensureGraph(target, toEl);
      try {
        toEl.currentTime = t;
      } catch {}
      try {
        await toEl.play();
      } catch {
        setPlaying(false);
      }
    } else {
      const t = fromEl && isFinite(fromEl.currentTime) ? fromEl.currentTime : transport;
      if (toEl?.readyState >= 1) {
        try {
          toEl.currentTime = t;
        } catch {}
      } else {
        pendingSeekRef.current[target] = t;
      }
      setTransport(t);
    }
    setSide(target);
  };

  const seek = (frac) => {
    const key = sideRef.current;
    const active = key === "a" ? aRef.current : bRef.current;
    const id = key === "a" ? aId : bId;
    const dur = info[id]?.duration || active?.duration;
    if (!active || !isFinite(dur) || !dur) return;
    const t = Math.max(0, Math.min(dur, frac * dur));
    try {
      active.currentTime = t;
    } catch {}
    const other = key === "a" ? bRef.current : aRef.current;
    if (other?.readyState >= 1) {
      try {
        other.currentTime = t;
      } catch {}
    }
    setTransport(t);
  };

  const onMeta = (key) => (e) => {
    const el = e.target;
    const id = key === "a" ? aId : bId;
    if (id && isFinite(el.duration) && !info[id]?.duration) {
      setInfo((prev) => ({ ...prev, [id]: { ...prev[id], duration: el.duration } }));
    }
    if (pendingSeekRef.current[key] != null && el.readyState >= 1) {
      try {
        el.currentTime = pendingSeekRef.current[key];
      } catch {}
      pendingSeekRef.current[key] = null;
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    stopMeters();
  };

  // Pause everything when the player closes; revoke blobs on unmount
  useEffect(() => {
    if (!open) {
      [aRef.current, bRef.current].forEach((el) => el?.pause());
      setPlaying(false);
      stopMeters();
    }
  }, [open]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current.clear();
    },
    []
  );

  const saveNote = async () => {
    const text = note.trim();
    if (!text) return;
    const aLabel = versions.find((v) => v.id === aId)?.label || "Mix";
    const stamp = `[${aLabel} @ ${fmtTime(transport)}] ${text}`;
    await onUpdate(song.id, {
      notes: song.notes ? `${song.notes}\n${stamp}` : stamp,
    });
    setNote("");
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1500);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const created = await base44.entities.SongVersion.create({
        pipeline_song_id: song.id,
        song_title: song.song_name,
        label: newLabel.trim() || `Mix ${String(versions.length + 1).padStart(2, "0")}`,
        file_uri,
        is_current: false,
      });
      // The fresh upload becomes the latest version, like the versions list does
      await base44.entities.SongVersion.updateMany(
        { pipeline_song_id: song.id, is_current: true },
        { $set: { is_current: false } }
      ).catch(() => {});
      await base44.entities.SongVersion.update(created.id, { is_current: true });
      const withLatest = { ...created, is_current: true };
      setVersions((prev) => [...prev, withLatest]);
      await onUpdate(song.id, {
        audio_file_uri: file_uri,
        audio_version_label: withLatest.label,
      });
      setNewLabel("");
      onVersionsChanged?.();
      // Slot the new mix opposite whatever is loaded so A/B is one click away
      if (aId && aId !== created.id) {
        setBId(created.id);
        setSide("b");
      } else if (!aId) {
        setAId(created.id);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (!open) return null;

  const aVersion = versions.find((v) => v.id === aId);
  const bVersion = versions.find((v) => v.id === bId);
  const activeId = side === "a" ? aId : bId;
  const activeEntry = activeId ? info[activeId] : null;
  const activeLoading = !!activeEntry?.loading;
  const duration =
    activeEntry?.duration ||
    (side === "a" ? aRef.current?.duration : bRef.current?.duration) ||
    0;

  const VersionSelect = ({ value, onChange, placeholder }) => (
    <div className="relative flex-1 min-w-[120px]">
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full h-10 rounded-lg bg-background/60 border border-border text-foreground text-sm px-3 pr-8 appearance-none truncate focus:outline-none focus:border-primary/50"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {versions.map((v) => (
          <option key={v.id} value={v.id}>
            {(song.song_name || "Untitled")} — {v.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-card border border-border p-5 sm:p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.2em] text-zinc-400 font-semibold">A/B MIX COMPARISON</p>
            <h2 className="font-heading text-2xl font-bold text-foreground truncate">
              {(song.song_name || "Untitled")} — {aVersion?.label || "No mix"}
            </h2>
            <p className="text-xs text-zinc-400 truncate">
              {(aVersion?.label || "—")} · Original file playback
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <SoundReadyLogo size={24} />
            <button onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* A/B selection + upload */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-primary w-4 shrink-0">A</span>
          <VersionSelect value={aId} onChange={setAId} placeholder="Choose a mix" />
          <span className="text-sm font-bold text-primary w-4 shrink-0 ml-1">B</span>
          <VersionSelect value={bId} onChange={setBId} placeholder="Choose a second mix" />
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Mix name"
              className="h-10 w-28 rounded-lg bg-background/60 border border-border text-sm px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="h-10 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50 shrink-0"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Mix
            </button>
          </div>
        </div>

        {/* Waveform + meters */}
        <div className="flex gap-3">
          <WaveformDisplay
            peaks={activeEntry?.peaks}
            progress={duration ? transport / duration : 0}
            onSeek={seek}
            loading={activeLoading}
          />
          <LevelMeters meter={meters} />
        </div>

        {/* Seek bar + timestamps */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-zinc-500 tabular-nums w-8">{fmtTime(transport)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={Math.min(transport, duration || 0)}
            onChange={(e) => seek(Number(e.target.value) / (duration || 1))}
            disabled={!duration}
            className="flex-1 accent-primary h-1.5"
          />
          <span className="text-[10px] text-zinc-500 tabular-nums w-8 text-right">{fmtTime(duration)}</span>
        </div>

        {/* Control bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={playing ? pause : play}
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(33,196,93,0.35)] hover:brightness-110 transition"
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>

          <div className="flex items-center gap-1 shrink-0">
            {["a", "b"].map((s) => {
              const disabled = s === "b" && (!bId || !info[bId]?.url);
              const active = side === s;
              return (
                <button
                  key={s}
                  onClick={() => switchSide(s)}
                  disabled={disabled}
                  title={disabled ? "Choose a second mix first" : `Listen to ${s.toUpperCase()}`}
                  className={`h-8 w-11 rounded-md text-sm font-bold uppercase border transition-colors flex items-center justify-center gap-1.5 ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent border-border text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
                  }`}
                >
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse-glow" />}
                  {s.toUpperCase()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Volume2 className="h-4 w-4 text-zinc-400" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24 accent-primary h-1.5"
            />
          </div>

          {/* Timestamped note */}
          <div className="flex items-center gap-2 ml-auto min-w-[180px] flex-1 justify-end">
            {noteSaved && <Check className="h-4 w-4 text-primary shrink-0" />}
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveNote()}
              placeholder={`Note at ${fmtTime(transport)}`}
              className="h-9 rounded-lg bg-background/60 border border-border text-sm px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 w-full max-w-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            "One shared clock — A and B stay in sync",
            "Only the selected mix is audible",
            "Notes save with mix + timestamp",
          ].map((hint) => (
            <span
              key={hint}
              className="text-[10px] text-zinc-500 border border-border rounded-full px-2.5 py-1 bg-background/40"
            >
              {hint}
            </span>
          ))}
        </div>

        <audio
          ref={aRef}
          preload="auto"
          onLoadedMetadata={onMeta("a")}
          onEnded={handleEnded}
          className="hidden"
        />
        <audio
          ref={bRef}
          preload="auto"
          onLoadedMetadata={onMeta("b")}
          onEnded={handleEnded}
          className="hidden"
        />
        <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={handleUpload} />
      </div>
    </div>
  );
}