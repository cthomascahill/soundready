import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function WaveformVisual({ title, artist, genre, audioUrl, waveformData, duration }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const animRef = useRef(null);

  // Keep duration in sync
  useEffect(() => {
    if (duration) setAudioDuration(duration);
  }, [duration]);

  const tick = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!audioRef.current.paused) {
        animRef.current = requestAnimationFrame(tick);
      }
    }
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      cancelAnimationFrame(animRef.current);
      setPlaying(false);
    } else {
      audioRef.current.play();
      animRef.current = requestAnimationFrame(tick);
      setPlaying(true);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
    cancelAnimationFrame(animRef.current);
  };

  const handleBarClick = (index, total) => {
    if (!audioRef.current || !audioDuration) return;
    const newTime = (index / total) * audioDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const hasRealData = Array.isArray(waveformData) && waveformData.length >= 10;
  const BAR_COUNT = hasRealData ? Math.min(waveformData.length, 200) : 120;
  const playheadFraction = audioDuration > 0 ? currentTime / audioDuration : 0;

  // Sample the waveformData down to BAR_COUNT bars if needed
  const bars = hasRealData
    ? Array.from({ length: BAR_COUNT }, (_, i) => {
        const srcIdx = Math.floor((i / BAR_COUNT) * waveformData.length);
        return Math.max(0.03, Math.min(1, waveformData[srcIdx]));
      })
    : null;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-heading text-xl font-bold">{title}</p>
          <p className="text-sm text-muted-foreground">{artist}{genre ? ` · ${genre}` : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          {audioUrl && (
            <button
              onClick={togglePlay}
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
            </button>
          )}
          <span className="text-sm text-muted-foreground font-mono">
            {audioUrl ? formatTime(currentTime) : ""}{audioDuration > 0 ? ` / ${formatTime(audioDuration)}` : ""}
          </span>
        </div>
      </div>

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleEnded}
          onLoadedMetadata={(e) => setAudioDuration(e.target.duration)}
          preload="metadata"
          className="hidden"
        />
      )}

      {/* Waveform */}
      <div className="relative h-20">
        {!hasRealData ? (
          // Flat placeholder while no real data
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-muted-foreground/20 rounded-full" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center gap-px">
            {bars.map((h, i) => {
              const fraction = i / BAR_COUNT;
              const played = fraction <= playheadFraction;
              return (
                <div
                  key={i}
                  onClick={() => handleBarClick(i, BAR_COUNT)}
                  className={`flex-1 rounded-full cursor-pointer transition-colors ${
                    played ? "bg-primary" : "bg-muted-foreground/25"
                  }`}
                  style={{ height: `${h * 100}%` }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>0:00</span>
        {hasRealData ? (
          <span className="text-primary text-xs font-semibold">Real Amplitude Waveform</span>
        ) : (
          <span className="text-muted-foreground/50 text-xs italic">Awaiting audio analysis…</span>
        )}
        <span>{audioDuration > 0 ? formatTime(audioDuration) : "—"}</span>
      </div>
    </div>
  );
}