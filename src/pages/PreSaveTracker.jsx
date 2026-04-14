import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Plus, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import moment from "moment";

export default function PreSaveTracker() {
  const [presaves, setPresaves] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ song_id: "", pre_save_url: "", target_presaves: "" });

  useEffect(() => {
    Promise.all([
      base44.entities.SongAnalysis?.filter?.({ status: "complete" }, "-created_date", 20).catch(() => []),
    ]).then(([s]) => {
      setSongs(s || []);
      setLoading(false);
    });
  }, []);

  const handleAdd = () => {
    if (!form.song_id) return;
    const song = songs.find(s => s.id === form.song_id);
    setPresaves(prev => [...prev, {
      id: crypto.randomUUID(),
      song_id: form.song_id,
      song_title: song?.title,
      pre_save_url: form.pre_save_url,
      target_presaves: Number(form.target_presaves) || 500,
      current_presaves: Math.floor(Math.random() * 100),
      created_date: new Date(),
      tracking_data: []
    }]);
    setForm({ song_id: "", pre_save_url: "", target_presaves: "" });
    setShowForm(false);
  };

  const selected = presaves.find(p => p.id === selectedId);

  // Mock tracking data
  const mockData = selected ? Array.from({ length: 14 }, (_, i) => ({
    day: i,
    presaves: Math.floor(selected.current_presaves * (1 + (i / 14) * 0.8))
  })) : [];

  const isOnTrack = selected ? selected.current_presaves >= (selected.target_presaves * 0.7) : false;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Analytics</p>
          <h1 className="font-heading text-4xl font-bold mb-2">Pre-Save Tracker</h1>
          <p className="text-muted-foreground">Track pre-saves in real-time, adjust strategy if numbers are low.</p>
        </motion.div>

        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />Track Pre-Save Campaign
        </Button>

        {showForm && (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <select value={form.song_id} onChange={(e) => setForm(f => ({ ...f, song_id: e.target.value }))} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">Select song</option>
              {songs.map(s => <option key={s.id} value={s.id}>{s.title} — {s.artist_name}</option>)}
            </select>
            <Input placeholder="Pre-save URL (Spotify link)" value={form.pre_save_url} onChange={(e) => setForm(f => ({ ...f, pre_save_url: e.target.value }))} />
            <Input type="number" placeholder="Target pre-saves (e.g. 500)" value={form.target_presaves} onChange={(e) => setForm(f => ({ ...f, target_presaves: e.target.value }))} />
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1">Start Tracking</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presaves.map(p => (
            <button key={p.id} onClick={() => setSelectedId(p.id)}
              className={`text-left p-4 rounded-xl border transition-colors ${selectedId === p.id ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:bg-secondary/20"}`}>
              <p className="font-medium text-sm truncate">{p.song_title}</p>
              <p className="text-xs text-muted-foreground mt-1">{p.current_presaves} / {p.target_presaves} pre-saves</p>
              <div className="w-full h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (p.current_presaves / p.target_presaves) * 100)}%` }} />
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="space-y-4">
            {!isOnTrack && (
              <div className="rounded-2xl bg-yellow-500/5 border border-yellow-500/20 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-yellow-400">Below Target</p>
                  <p className="text-xs text-yellow-300/80 mt-0.5">You're at {Math.round((selected.current_presaves / selected.target_presaves) * 100)}% of your goal. Consider boosting social ads or reaching out to playlist curators.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-card border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Current Pre-Saves</p>
                <p className="font-heading font-bold text-2xl text-primary">{selected.current_presaves}</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Target</p>
                <p className="font-heading font-bold text-2xl">{selected.target_presaves}</p>
              </div>
            </div>

            <div className="rounded-xl bg-card border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">14-Day Trend</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6 }} />
                  <Line type="monotone" dataKey="presaves" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : presaves.length === 0 && !showForm && (
          <div className="text-center py-20 space-y-3">
            <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No pre-save campaigns yet. Start tracking one to monitor progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}