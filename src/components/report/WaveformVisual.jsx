import { useMemo } from "react";

// Generates a deterministic-looking waveform from the song title seed
function seededRandom(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  return (n) => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function WaveformVisual({ title, artist, genre, energy }) {
  const BAR_COUNT = 80;

  const bars = useMemo(() => {
    const rand = seededRandom(title + artist);
    const energyBoost = energy === "High" ? 1.3 : energy === "Low" ? 0.7 : 1;
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      const base = rand();
      // Create natural peaks around chorus regions (approx 30% and 65%)
      const pos = i / BAR_COUNT;
      const chorBump1 = Math.exp(-Math.pow((pos - 0.3) / 0.06, 2)) * 0.6;
      const chorBump2 = Math.exp(-Math.pow((pos - 0.65) / 0.05, 2)) * 0.7;
      const chorBump3 = Math.exp(-Math.pow((pos - 0.82) / 0.04, 2)) * 0.5;
      const height = Math.min(1, (base * 0.5 + chorBump1 + chorBump2 + chorBump3) * energyBoost);
      return Math.max(0.08, height);
    });
  }, [title, artist, energy]);

  // Hook regions as % of total width
  const hooks = [
    { label: "Hook 1", start: 0.26, end: 0.38 },
    { label: "Hook 2", start: 0.61, end: 0.72 },
    { label: "Hook 3", start: 0.78, end: 0.88 },
  ];

  // Fake duration seeded from title length
  const minutes = 3 + (title.length % 2);
  const seconds = String(10 + (title.charCodeAt(0) % 50)).padStart(2, "0");
  const duration = `${minutes}:${seconds}`;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-heading text-xl font-bold">{title}</p>
          <p className="text-sm text-muted-foreground">{artist} · {genre}</p>
        </div>
        <span className="text-sm text-muted-foreground font-mono">{duration}</span>
      </div>

      {/* Waveform */}
      <div className="relative h-20">
        {/* Hook region overlays */}
        {hooks.map(({ label, start, end }) => (
          <div
            key={label}
            className="absolute top-0 bottom-0 rounded-md bg-primary/10 border border-primary/30 flex items-start pt-1 px-1.5"
            style={{ left: `${start * 100}%`, width: `${(end - start) * 100}%` }}
          >
            <span className="text-[9px] font-semibold text-primary leading-none">{label}</span>
          </div>
        ))}

        {/* Bars */}
        <div className="absolute inset-0 flex items-center gap-px">
          {bars.map((h, i) => {
            const pos = i / BAR_COUNT;
            const inHook = hooks.some(({ start, end }) => pos >= start && pos <= end);
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all ${inHook ? "bg-primary" : "bg-muted-foreground/30"}`}
                style={{ height: `${h * 100}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>0:00</span>
        <span className="text-primary text-xs font-semibold">▶ Audio Analyzed</span>
        <span>{duration}</span>
      </div>
    </div>
  );
}