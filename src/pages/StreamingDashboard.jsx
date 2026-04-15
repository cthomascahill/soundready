import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Music, BarChart3, Zap, Loader2, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

// Simulate realistic streaming numbers seeded by song id + days since release
function seedRand(str, offset = 0) {
  let h = offset + 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return ((h >>> 0) / 4294967295);
}

function generateStreamingData(song) {
  const seed = song.id || song.title;
  const daysSinceRelease = moment().diff(moment(song.created_date), "days") + 1;
  const days = Math.min(daysSinceRelease, 28);

  const baseStreams = 800 + Math.round(seedRand(seed, 1) * 4200);
  const baseSaves = Math.round(baseStreams * (0.04 + seedRand(seed, 2) * 0.08));
  const basePlaylistAdds = Math.round(baseStreams * (0.02 + seedRand(seed, 3) * 0.04));

  const timeline = Array.from({ length: Math.min(days, 14) }, (_, i) => {
    const dayFactor = i === 0 ? 2.2 : i < 3 ? 1.6 : i < 7 ? 1.1 : 0.7 + seedRand(seed, i + 10) * 0.5;
    return {
      day: `Day ${i + 1}`,
      Streams: Math.round(baseStreams * dayFactor * (0.85 + seedRand(seed, i) * 0.3)),
      Projected: Math.round(baseStreams * (i === 0 ? 2 : i < 3 ? 1.5 : 1) * 1.1),
    };
  });

  const totalStreams = timeline.reduce((s, d) => s + d.Streams, 0);
  const totalProjected = timeline.reduce((s, d) => s + d.Projected, 0);
  const performance = Math.round((totalStreams / totalProjected) * 100);

  return {
    totalStreams,
    totalSaves: baseSaves,
    totalPlaylistAdds: basePlaylistAdds,
    performance, // % of projection
    timeline,
    listeners: Math.round(totalStreams * 0.7),
  };
}

function DeltaBadge({ pct }) {
  if (pct >= 95 && pct <= 105) return <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1"><Minus className="h-3 w-3" />On track</span>;
  if (pct > 105) return <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium flex items-center gap-1"><TrendingUp className="h-3 w-3" />+{pct - 100}% vs projection</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium flex items-center gap-1"><TrendingDown className="h-3 w-3" />-{100 - pct}% vs projection</span>;
}

function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-card border border-border p-3 shadow-xl text-xs space-y-1.5">
      <p className="text-muted-foreground font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function StreamingDashboard() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.SongAnalysis.filter({ status: "complete", created_by: user.email }, "-created_date", 20).then((items) => {
      setSongs(items);
      if (items.length > 0) {
        setSelected(items[0]);
        setData(generateStreamingData(items[0]));
      }
      setLoading(false);
    });
  }, [user?.email]);

  const selectSong = (s) => {
    setSelected(s);
    setData(generateStreamingData(s));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-7 h-7 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Streaming</p>
          <h1 className="font-heading text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real stats vs AI projections</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 border border-border rounded-xl px-3 py-2">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>Stats are simulated based on song profile. Connect Spotify for live data.</span>
        </div>
      </motion.div>

      {songs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-3">
          <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="font-heading font-semibold">No releases yet</p>
          <p className="text-sm text-muted-foreground">Generate a release plan to see performance tracking.</p>
        </div>
      ) : (
        <>
          {/* Song selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {songs.map((s) => (
              <button key={s.id} onClick={() => selectSong(s)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all shrink-0 ${selected?.id === s.id ? "bg-primary/10 border-primary/40 text-primary" : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/20"}`}>
                <Music className="h-3.5 w-3.5 shrink-0" />
                {s.title}
              </button>
            ))}
          </div>

          {selected && data && (
            <motion.div key={selected.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Song info + delta */}
              <div className="rounded-2xl bg-card border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading font-bold text-xl">{selected.title}</h2>
                  <p className="text-sm text-muted-foreground">{selected.artist_name} · {selected.genre} · Released {moment(selected.created_date).fromNow()}</p>
                </div>
                <DeltaBadge pct={data.performance} />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Total Streams", value: fmt(data.totalStreams), icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
                  { label: "Saves", value: fmt(data.totalSaves), icon: Zap, color: "text-accent", bg: "bg-accent/10" },
                  { label: "Playlist Adds", value: fmt(data.totalPlaylistAdds), icon: TrendingUp, color: "text-chart-5", bg: "bg-chart-5/10" },
                  { label: "Unique Listeners", value: fmt(data.listeners), icon: Music, color: "text-chart-4", bg: "bg-chart-4/10" },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="rounded-2xl bg-card border border-border p-4 space-y-2">
                    <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <p className="font-heading text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Streams vs Projection chart */}
              <div className="rounded-2xl bg-card border border-border p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-heading font-semibold">Streams vs AI Projection</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Daily performance compared to your predicted outlook</p>
                  </div>
                  <DeltaBadge pct={data.performance} />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.timeline} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} iconType="circle" iconSize={7} />
                    <Line type="monotone" dataKey="Streams" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Projected" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="5 4" dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* AI Outlook vs Reality */}
              {selected.algorithm_outlook && (
                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                  <h3 className="font-heading font-semibold">AI Outlook vs Reality</h3>
                  <p className="text-xs text-muted-foreground -mt-2">How the original predictions held up</p>
                  <div className="space-y-3">
                    {selected.algorithm_outlook.split("\n").filter(Boolean).map((point, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
                        <span className="h-5 w-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        <p className="text-sm text-foreground/80 leading-relaxed flex-1">{point}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium mt-0.5 ${data.performance >= 90 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                          {data.performance >= 90 ? "✓ Accurate" : "↓ Under"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}