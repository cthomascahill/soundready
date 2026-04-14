import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Target } from "lucide-react";

export default function PerformanceTracker() {
  const [trackers, setTrackers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.ReleasePerformance.list("-created_date", 50),
      base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 50),
    ]).then(([t, s]) => {
      setTrackers(t);
      setSongs(s);
      if (t.length > 0) setSelectedId(t[0].id);
      setLoading(false);
    });
  }, []);

  const selected = trackers.find(t => t.id === selectedId);

  const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toFixed(0);
  const pct = (n) => (n * 100).toFixed(1) + "%";

  const accuracy = selected ? Math.abs(selected.actual_streams - selected.predicted_streams) / selected.predicted_streams * 100 : 0;

  const chartData = selected ? [
    { metric: "Streams", predicted: selected.predicted_streams || 0, actual: selected.actual_streams || 0 },
    { metric: "Playlist Adds", predicted: selected.predicted_playlist_adds || 0, actual: selected.actual_playlist_adds || 0 },
  ] : [];

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Learning & Optimization</p>
          <h1 className="font-heading text-4xl font-bold">Performance Tracker</h1>
          <p className="text-muted-foreground text-sm">Compare AI predictions vs actual results after 30 days.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : trackers.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Target className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No releases tracked yet. Check back 30 days after a release.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="space-y-2">
              {trackers.map(t => (
                <button key={t.id} onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${selectedId === t.id ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:border-primary/20"}`}>
                  <p className="font-medium text-sm truncate">{t.song_title}</p>
                  <p className="text-xs text-muted-foreground">{t.artist_name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {(t.actual_streams || 0) > 0 ? <TrendingUp className="h-3 w-3 text-primary" /> : <Target className="h-3 w-3 text-muted-foreground" />}
                    <span className="text-xs font-semibold">{fmt(t.actual_streams || 0)} streams</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail */}
            {selected && (
              <div className="sm:col-span-2 space-y-4">
                {/* Header cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-card border border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Predicted vs Actual</p>
                    <div className="space-y-1">
                      <p className="font-heading font-bold text-sm text-chart-5">{fmt(selected.predicted_streams)} → {fmt(selected.actual_streams)}</p>
                      <p className={`text-xs font-semibold ${accuracy < 20 ? "text-primary" : accuracy < 50 ? "text-yellow-400" : "text-red-400"}`}>
                        {Math.abs(accuracy).toFixed(0)}% {accuracy > 0 ? "under" : "over"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-card border border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Save Rate</p>
                    <div className="space-y-1">
                      <p className="font-heading font-bold text-sm">{pct(selected.predicted_save_rate || 0)} → {pct(selected.actual_save_rate || 0)}</p>
                      <p className="text-xs text-teal-400">Engagement metric</p>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                {chartData.length > 0 && (
                  <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Key Metrics Comparison</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="metric" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="predicted" fill="hsl(var(--chart-5))" opacity={0.6} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Insights */}
                {selected.accuracy_notes && (
                  <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 space-y-2">
                    <p className="text-xs font-semibold text-primary uppercase tracking-widest">What We Learned</p>
                    <p className="text-sm text-foreground leading-relaxed">{selected.accuracy_notes}</p>
                  </div>
                )}

                {/* Release meta */}
                <div className="rounded-2xl bg-card border border-border p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Release Info</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Release Date</p>
                      <p className="font-medium text-sm">{selected.release_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Artist</p>
                      <p className="font-medium text-sm">{selected.artist_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}