import { useEffect, useRef } from "react";

// Static peak-bar waveform with a yellow playhead line; click anywhere to seek.
export default function WaveformDisplay({ peaks, progress = 0, onSeek, loading = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      if (canvas.width !== Math.floor(w * dpr)) canvas.width = Math.floor(w * dpr);
      if (canvas.height !== Math.floor(h * dpr)) canvas.height = Math.floor(h * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const n = peaks?.length || 0;
      if (!n) return;
      const barW = w / n;
      const gap = Math.max(0.5, barW * 0.3);
      ctx.fillStyle = "#8a8f7d";
      for (let i = 0; i < n; i++) {
        const v = Math.max(0.03, peaks[i]);
        const bh = v * (h - 6);
        ctx.fillRect(i * barW, (h - bh) / 2, Math.max(1, barW - gap), bh);
      }
      // yellow playhead
      const x = Math.min(progress * w, w - 2);
      ctx.fillStyle = "#e8e454";
      ctx.fillRect(Math.max(0, x - 1), 0, 2, h);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [peaks, progress]);

  return (
    <div className="relative flex-1 min-w-0 h-28 rounded-xl bg-black/25 border border-white/5 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer block"
        onClick={(e) => {
          if (!peaks?.length) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onSeek?.(frac);
        }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="text-[10px] text-zinc-400 animate-pulse">Rendering waveform…</span>
        </div>
      )}
      {!loading && !peaks?.length && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] text-zinc-600">Waveform unavailable — playback still works</span>
        </div>
      )}
    </div>
  );
}