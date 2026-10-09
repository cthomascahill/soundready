import { useMemo, useState } from "react";
import SEO from "@/components/SEO";
import { Slider } from "@/components/ui/slider";
import PlatformRow from "@/components/royalty/PlatformRow";

// Average per-stream payout rates (USD)
const PLATFORMS = [
  { id: "spotify", name: "Spotify", rate: 0.004, color: "#1db954", initial: "S" },
  { id: "apple", name: "Apple Music", rate: 0.008, color: "#fa2b56", initial: "A" },
  { id: "amazon", name: "Amazon Music", rate: 0.006, color: "#25d1da", initial: "A" },
  { id: "youtube", name: "YouTube Music", rate: 0.007, color: "#ff0000", initial: "Y" },
  { id: "pandora", name: "Pandora", rate: 0.0013, color: "#3668ff", initial: "P" },
  { id: "soundcloud", name: "SoundCloud", rate: 0.003, color: "#ff5500", initial: "S" },
  { id: "tidal", name: "Tidal", rate: 0.013, color: "#000000", initial: "T" },
  { id: "deezer", name: "Deezer", rate: 0.006, color: "#a238ff", initial: "D" },
  { id: "qobuz", name: "Qobuz", rate: 0.0187, color: "#0f5ed7", initial: "Q" },
];

// Approximate USD conversion rates
const CURRENCIES = {
  USD: { rate: 1, symbol: "$" },
  GBP: { rate: 0.79, symbol: "£" },
  EUR: { rate: 0.92, symbol: "€" },
};

export default function RoyaltyCalculator() {
  const [streams, setStreams] = useState({});
  const [share, setShare] = useState(100);
  const [currency, setCurrency] = useState("USD");

  const setStreamCount = (id, value) => {
    const clean = value.replace(/[^0-9]/g, "");
    setStreams((prev) => ({ ...prev, [id]: clean }));
  };

  const totalStreams = useMemo(
    () => PLATFORMS.reduce((sum, p) => sum + Number(streams[p.id] || 0), 0),
    [streams]
  );

  const usd = useMemo(
    () =>
      PLATFORMS.reduce((sum, p) => sum + Number(streams[p.id] || 0) * p.rate, 0) *
      (share / 100),
    [streams, share]
  );

  const cur = CURRENCIES[currency];
  const formatted = usd === 0 ? `${cur.symbol}0.00` : (usd * cur.rate).toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <SEO title="Streaming Royalty Calculator — SoundReady" description="Estimate what your streams pay across every platform." />
      <div className="text-center space-y-1">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold">Streaming Royalty Calculator</h1>
        <p className="text-sm text-muted-foreground">Enter your stream counts and see what they actually pay.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3 shadow-xl">
        {PLATFORMS.map((p) => (
          <PlatformRow key={p.id} platform={p} streams={streams[p.id] || ""} onChange={setStreamCount} />
        ))}

        {/* Controls */}
        <div className="pt-4 space-y-4 border-t border-border">
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold shrink-0">Royalty share</p>
            <Slider
              value={[share]}
              min={0}
              max={100}
              step={1}
              onValueChange={(v) => setShare(v[0])}
              className="flex-1"
            />
            <p className="text-sm font-semibold text-primary w-14 text-right shrink-0">{share} %</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold shrink-0">Currency</p>
            <div className="flex gap-2">
              {Object.keys(CURRENCIES).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`rounded-lg border px-4 py-1.5 text-sm font-semibold transition-colors ${
                    currency === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="pt-5 border-t border-border text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Estimated Earnings</p>
          <p className="font-heading text-5xl sm:text-6xl font-black text-primary">{formatted}</p>
          <p className="text-sm text-muted-foreground">
            {totalStreams > 0
              ? `${totalStreams.toLocaleString()} streams at ${share}% royalty share`
              : "Enter stream counts above"}
          </p>
          <p className="text-[11px] text-muted-foreground/70">
            Estimates use average per-stream rates. Actual payouts vary by country, plan type and your distributor's cut.
          </p>
        </div>
      </div>
    </div>
  );
}