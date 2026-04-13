import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import { TrendingUp, TrendingDown, Plus, Music, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

const SCORE_LINES = [
  { key: "overall_score", label: "Overall", color: "hsl(var(--primary))" },
  { key: "spotify_score", label: "Spotify", color: "#1DB954" },
  { key: "tiktok_score", label: "TikTok", color: "#69C9D0" },
  { key: "hook_strength", label: "Hook", color: "hsl(var(--chart-4))" },
  { key: "production_quality", label: "Production", color: "hsl(var(--accent))" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-card border border-border p-3 shadow-xl text-sm space-y-1">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function TrendBadge({ snapshots }) {
  if (snapshots.length < 2) return null;
  const first = snapshots[0].overall_score;
  const last = snapshots[snapshots.length - 1].overall_score;
  const delta = last - first;
  const abs = Math.abs(delta);
  if (abs < 2) return null;
  const isUp = delta > 0;
  const isBig = abs >= 10;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
      isBig && isUp ? "bg-accent/15 text-accent" :
      isBig && !isUp ? "bg-destructive/15 text-destructive" :
      isUp ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
    }`}>
      {isBig && !isUp && <AlertTriangle className="h-3.5 w-3.5" />}
      {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {isUp ? "+" : ""}{delta.toFixed(1)} pts overall
      {isBig && isUp && " 🔥"}
    </div>
  );
}

export default function GrowthTracker() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotNote, setSnapshotNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 50),
    ]).then(([s]) => {
      setSongs(s);
      if (s.length > 0) setSelectedSong(s[0]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedSong) return;
    setSnapshotLoading(true);
    base44.entities.ScoreSnapshot.filter({ song_id: selectedSong.id }, "snapshot_date", 100)
      .then((snaps) => { setSnapshots(snaps); setSnapshotLoading(false); });
  }, [selectedSong]);

  const takeSnapshot = async () => {
    if (!selectedSong) return;
    setSaving(true);
    const snap = await base44.entities.ScoreSnapshot.create({
      song_id: selectedSong.id,
      song_title: selectedSong.title,
      artist_name: selectedSong.artist_name,
      overall_score: selectedSong.overall_score,
      spotify_score: selectedSong.spotify_score,
      apple_music_score: selectedSong.apple_music_score,
      youtube_score: selectedSong.youtube_score,
      tiktok_score: selectedSong.tiktok_score,
      hook_strength: selectedSong.hook_strength,
      production_quality: selectedSong.production_quality,
      replay_value: selectedSong.replay_value,
      snapshot_date: new Date().toISOString(),
      note: snapshotNote,
    });
    setSnapshots((prev) => [...prev, snap]);
    setSnapshotNote("");
    setSaving(false);
  };

  const chartData = snapshots.map((s) => ({
    name: moment(s.snapshot_date).format("MMM D"),
    overall_score: s.overall_score,
    spotify_score: s.spotify_score,
    tiktok_score: s.tiktok_score,
    hook_strength: s.hook_strength,
    production_quality: s.production_quality,
  }));

  if (loading) return (
    <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
  );

  if (songs.length === 0) return (
    <div className="text-center py-32">
      <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h2 className="font-heading text-2xl font-semibold mb-2">No analyzed tracks yet</h2>
      <Link to="/upload"><Button>Upload a Track</Button></Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-1">Growth Tracker</p>
        <h1 className="font-heading text-3xl font-bold">Score History</h1>
        <p className="text-muted-foreground mt-1">Snapshot your scores over time to track your trajectory.</p>
      </motion.div>

      {/* Song selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedSong?.id || ""}
          onChange={(e) => setSongs((prev) => { const s = prev.find((x) => x.id === e.target.value); setSelectedSong(s); return prev; })}
          className="h-10 rounded-lg bg-card border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {songs.map((s) => <option key={s.id} value={s.id}>{s.title} — {s.artist_name}</option>)}
        </select>
        {selectedSong && snapshots.length > 1 && <TrendBadge snapshots={snapshots} />}
      </div>

      {/* Snapshot button */}
      <motion.div className="rounded-2xl bg-card border border-border p-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex-1">
          <p className="font-medium text-sm">Take a Snapshot</p>
          <p className="text-xs text-muted-foreground">Records the current scores for this song right now.</p>
        </div>
        <input
          value={snapshotNote}
          onChange={(e) => setSnapshotNote(e.target.value)}
          placeholder="Optional note (e.g. 'After playlist pitch')"
          className="h-9 rounded-lg bg-secondary border border-border px-3 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button onClick={takeSnapshot} disabled={saving} className="gap-2 shrink-0">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Snapshot Now
        </Button>
      </motion.div>

      {/* Chart */}
      <motion.div className="rounded-2xl bg-card border border-border p-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="font-heading font-semibold text-lg mb-5">Performance Over Time</h2>
        {snapshotLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
        ) : chartData.length < 2 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Take at least 2 snapshots to see your growth chart.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} iconType="circle" iconSize={8} />
              <ReferenceLine y={70} stroke="hsl(var(--border))" strokeDasharray="4 4" />
              {SCORE_LINES.map((l) => (
                <Line key={l.key} type="monotone" dataKey={l.key} name={l.label}
                  stroke={l.color} strokeWidth={2.5}
                  dot={{ r: 4, fill: l.color, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Snapshot list */}
      {snapshots.length > 0 && (
        <motion.div className="rounded-2xl bg-card border border-border p-6 space-y-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="font-heading font-semibold text-lg">Snapshot History</h2>
          <div className="space-y-2">
            {[...snapshots].reverse().map((snap, i) => {
              const prev = snapshots[snapshots.length - 2 - i];
              const delta = prev ? snap.overall_score - prev.overall_score : null;
              return (
                <div key={snap.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/40 border border-border">
                  <div className="text-xs text-muted-foreground w-20 shrink-0">{moment(snap.snapshot_date).format("MMM D, YY")}</div>
                  <div className="font-heading font-bold text-xl w-12 shrink-0">{snap.overall_score}</div>
                  {delta !== null && (
                    <span className={`text-xs font-medium ${delta > 0 ? "text-accent" : delta < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {delta > 0 ? "+" : ""}{delta.toFixed(0)} pts
                    </span>
                  )}
                  {snap.note && <span className="text-xs text-muted-foreground italic truncate">{snap.note}</span>}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}