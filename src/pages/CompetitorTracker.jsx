import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RefreshCw, Loader2, Users, TrendingUp, TrendingDown, Minus, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const LINE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

function fmt(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function TrendBadge({ current, previous }) {
  if (!previous || previous === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const pct = (((current - previous) / previous) * 100).toFixed(1);
  const up = pct > 0;
  const flat = Math.abs(pct) < 0.1;
  if (flat) return <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><Minus className="h-3 w-3" />Stable</span>;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-accent" : "text-destructive"}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}{pct}%
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-card border border-border p-3 shadow-xl text-xs">
      <p className="text-muted-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function CompetitorTracker() {
  const [competitors, setCompetitors] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [myAnalyses, setMyAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [activeMetric, setActiveMetric] = useState("spotify_popularity");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [me, comps, snaps, analyses] = await Promise.all([
        base44.auth.me(),
        base44.entities.CompetitorArtist.list("-created_date", 20),
        base44.entities.CompetitorSnapshot.list("-snapshot_date", 500),
        base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 10),
      ]);
      setUser(me);
      setCompetitors(comps.filter((c) => c.created_by === me.email));
      setSnapshots(snaps);
      setMyAnalyses(analyses.filter((a) => a.created_by === me.email));
      setLoading(false);
    };
    load();
  }, []);

  const addCompetitor = async () => {
    if (!newName.trim() || competitors.length >= 5) return;
    setAdding(true);
    const c = await base44.entities.CompetitorArtist.create({ name: newName.trim() });
    setCompetitors((prev) => [...prev, c]);
    setNewName("");
    setAdding(false);
  };

  const removeCompetitor = async (id) => {
    await base44.entities.CompetitorArtist.delete(id);
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  const fetchNow = async () => {
    setFetching(true);
    const res = await base44.functions.invoke("fetchCompetitorData", {});
    // Reload snapshots
    const fresh = await base44.entities.CompetitorSnapshot.list("-snapshot_date", 500);
    setSnapshots(fresh);
    setFetching(false);
  };

  // Build chart data: group by date, one series per competitor
  const mySpotifyScore = myAnalyses[0]?.spotify_score || null;

  const chartDataByDate = {};
  snapshots.forEach((s) => {
    const comp = competitors.find((c) => c.id === s.competitor_id);
    if (!comp) return;
    const date = s.snapshot_date?.slice(0, 10);
    if (!chartDataByDate[date]) chartDataByDate[date] = { date };
    chartDataByDate[date][comp.name] = s[activeMetric] || 0;
  });
  if (mySpotifyScore && activeMetric === "spotify_popularity") {
    Object.values(chartDataByDate).forEach((d) => { d["You"] = mySpotifyScore; });
  }
  const chartData = Object.values(chartDataByDate).sort((a, b) => a.date.localeCompare(b.date));

  // Latest snapshot per competitor
  const latestSnaps = {};
  const prevSnaps = {};
  snapshots.forEach((s) => {
    const comp = competitors.find((c) => c.id === s.competitor_id);
    if (!comp) return;
    if (!latestSnaps[s.competitor_id] || s.snapshot_date > latestSnaps[s.competitor_id].snapshot_date) {
      prevSnaps[s.competitor_id] = latestSnaps[s.competitor_id];
      latestSnaps[s.competitor_id] = s;
    }
  });

  const METRICS = [
    { key: "spotify_popularity", label: "Spotify Popularity" },
    { key: "spotify_followers", label: "Spotify Followers" },
    { key: "yt_subscribers", label: "YT Subscribers" },
    { key: "yt_views", label: "YT Total Views" },
  ];

  const lineNames = [...competitors.map((c) => c.name), ...(mySpotifyScore && activeMetric === "spotify_popularity" ? ["You"] : [])];

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-1">Intelligence</p>
        <h1 className="font-heading text-3xl font-bold">Competitor Tracker</h1>
        <p className="text-muted-foreground mt-1">Monitor similar artists and see how your growth stacks up.</p>
      </motion.div>

      {/* Add competitors */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold">Tracked Artists <span className="text-muted-foreground font-normal text-sm">({competitors.length}/5)</span></h2>
          <Button size="sm" variant="outline" onClick={fetchNow} disabled={fetching || competitors.length === 0} className="gap-2">
            {fetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh Data
          </Button>
        </div>

        {/* Add input */}
        {competitors.length < 5 && (
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
              placeholder="Artist name (e.g. Olivia Rodrigo)"
              className="bg-secondary border-border"
            />
            <Button onClick={addCompetitor} disabled={adding || !newName.trim()} className="gap-2 shrink-0">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </div>
        )}

        {/* Competitor chips */}
        {competitors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {competitors.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm"
                style={{ borderColor: LINE_COLORS[i] + "60", background: LINE_COLORS[i] + "10", color: LINE_COLORS[i] }}>
                <div className="h-2 w-2 rounded-full" style={{ background: LINE_COLORS[i] }} />
                {c.name}
                <button onClick={() => removeCompetitor(c.id)} className="opacity-60 hover:opacity-100 ml-1">×</button>
              </div>
            ))}
          </div>
        )}

        {competitors.length === 0 && (
          <p className="text-sm text-muted-foreground">Add up to 5 artists to start tracking. We'll pull their Spotify and YouTube stats weekly.</p>
        )}
      </motion.div>

      {competitors.length > 0 && Object.keys(latestSnaps).length > 0 && (
        <>
          {/* Comparison table */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="font-heading font-semibold text-xl">Side-by-Side Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Artist</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Spotify Pop.</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Followers</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">YT Subs</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">YT Views</th>
                    <th className="text-right px-5 py-3 font-medium text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {/* My row */}
                  {myAnalyses[0] && (
                    <tr className="border-b border-border bg-primary/5">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                          <span className="font-semibold">{myAnalyses[0].artist_name} <span className="text-xs text-primary">(You)</span></span>
                        </div>
                      </td>
                      <td className="text-right px-4 py-3 font-heading font-bold">{myAnalyses[0].spotify_score ?? "—"}</td>
                      <td className="text-right px-4 py-3 text-muted-foreground">—</td>
                      <td className="text-right px-4 py-3 text-muted-foreground">—</td>
                      <td className="text-right px-4 py-3 text-muted-foreground">—</td>
                      <td className="text-right px-5 py-3"><span className="text-xs text-muted-foreground">SoundScore</span></td>
                    </tr>
                  )}
                  {competitors.map((c, i) => {
                    const snap = latestSnaps[c.id];
                    const prev = prevSnaps[c.id];
                    if (!snap) return null;
                    return (
                      <tr key={c.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ background: LINE_COLORS[i] }} />
                            <span>{c.name}</span>
                          </div>
                        </td>
                        <td className="text-right px-4 py-3 font-heading font-bold">{snap.spotify_popularity ?? "—"}</td>
                        <td className="text-right px-4 py-3">{fmt(snap.spotify_followers)}</td>
                        <td className="text-right px-4 py-3">{fmt(snap.yt_subscribers)}</td>
                        <td className="text-right px-4 py-3">{fmt(snap.yt_views)}</td>
                        <td className="text-right px-5 py-3">
                          <TrendBadge current={snap.spotify_followers} previous={prev?.spotify_followers} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Chart */}
          {chartData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl bg-card border border-border p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-heading font-semibold text-xl">Growth Over Time</h2>
                <div className="flex flex-wrap gap-2">
                  {METRICS.map((m) => (
                    <button key={m.key} onClick={() => setActiveMetric(m.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeMetric === m.key ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {chartData.length < 2 ? (
                <div className="h-48 flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                  <RefreshCw className="h-6 w-6 opacity-30" />
                  <p>Hit "Refresh Data" to start collecting. Charts appear after 2+ snapshots.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} iconType="circle" iconSize={8} />
                    {lineNames.map((name, i) => (
                      <Line key={name} type="monotone" dataKey={name}
                        stroke={name === "You" ? "hsl(var(--primary))" : LINE_COLORS[i % LINE_COLORS.length]}
                        strokeWidth={name === "You" ? 3 : 2}
                        strokeDasharray={name === "You" ? "5 3" : undefined}
                        dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          )}
        </>
      )}

      {competitors.length > 0 && Object.keys(latestSnaps).length === 0 && !fetching && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <Users className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
          <p className="font-heading font-semibold">No data yet</p>
          <p className="text-sm text-muted-foreground">Click "Refresh Data" to pull the first snapshot for your tracked artists.</p>
          <Button onClick={fetchNow} disabled={fetching} className="gap-2">
            <RefreshCw className="h-4 w-4" />Fetch Now
          </Button>
        </div>
      )}
    </div>
  );
}