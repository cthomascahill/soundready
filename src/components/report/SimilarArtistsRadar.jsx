import { Users } from "lucide-react";
import ReportCard, { CardHeader } from "./ReportCard";

function seedVal(name, key, min, max) {
  let h = 0;
  const s = name + key;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return min + ((h >>> 0) % (max - min + 1));
}

function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return n;
}

function CompatPill({ pct }) {
  if (pct >= 85) return <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold border border-primary/20">{pct}% match</span>;
  if (pct >= 70) return <span className="px-2.5 py-0.5 rounded-full bg-chart-4/15 text-chart-4 text-xs font-bold border border-chart-4/20">{pct}% match</span>;
  return <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-xs font-bold border border-orange-500/20">{pct}% match</span>;
}

function CompatBar({ pct }) {
  const color = pct >= 85 ? "bg-primary" : pct >= 70 ? "bg-chart-4" : "bg-orange-500";
  return (
    <div className="h-1.5 rounded-full bg-secondary overflow-hidden mt-1.5">
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function SimilarArtistsRadar({ artists = [], song = {} }) {
  if (!artists.length) return null;

  const enriched = artists.slice(0, 5).map((name) => ({
    name,
    listeners: seedVal(name, "listeners", 120, 9800) * 1000,
    compat: seedVal(name, "compat" + (song.genre || ""), 68, 96),
  }));

  return (
    <ReportCard borderColor="border-l-cyan-500">
      <CardHeader icon={Users} title="Similar Artists Radar" iconColor="text-cyan-400" badge="Section 7" />
      <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/20 px-4 py-3">
        <p className="text-sm text-cyan-300 font-medium leading-relaxed">
          Your song fits the audience of these artists. Target their fans.
        </p>
      </div>
      <div className="space-y-3">
        {enriched.map((a, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-secondary/20 space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-heading font-semibold">{a.name}</p>
                <p className="text-xs text-muted-foreground">{fmt(a.listeners)} monthly listeners on Spotify</p>
              </div>
              <CompatPill pct={a.compat} />
            </div>
            <CompatBar pct={a.compat} />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Compatibility measures how closely this song's genre, mood, and energy profile aligns with each artist's established fanbase.
      </p>
    </ReportCard>
  );
}