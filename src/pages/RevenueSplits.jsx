import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Trash2, DollarSign, Music2, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const ROLES = ["Songwriter", "Producer", "Co-Producer", "Featured Artist", "Manager", "Publisher", "Label"];
const PLATFORMS = [
  { id: "spotify", label: "Spotify", rate: 0.004 },
  { id: "apple", label: "Apple Music", rate: 0.007 },
  { id: "tidal", label: "Tidal", rate: 0.0125 },
  { id: "youtube", label: "YouTube Music", rate: 0.002 },
];

const COLORS = ["bg-primary", "bg-purple-500", "bg-orange-500", "bg-chart-5", "bg-chart-3", "bg-pink-500", "bg-cyan-500"];

const defaultSplit = () => ({ name: "", role: "Songwriter", percent: 0 });

export default function RevenueSplits() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [splits, setSplits] = useState([{ name: user?.full_name || "You", role: "Songwriter", percent: 100 }]);
  const [streams, setStreams] = useState(100000);
  const [platform, setPlatform] = useState(PLATFORMS[0]);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.SongVault.filter({ created_by_id: user.id }, "-created_date", 50)
      .then(setSongs).catch(() => {});
  }, [user]);

  const totalPercent = splits.reduce((sum, s) => sum + (parseFloat(s.percent) || 0), 0);
  const grossRevenue = streams * platform.rate;
  const isValid = Math.round(totalPercent) === 100;

  const addSplit = () => setSplits(prev => [...prev, defaultSplit()]);
  const removeSplit = (i) => setSplits(prev => prev.filter((_, idx) => idx !== i));
  const updateSplit = (i, field, val) => setSplits(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const distribute = () => {
    const count = splits.length;
    if (!count) return;
    const even = Math.floor(100 / count);
    const remainder = 100 - even * count;
    setSplits(prev => prev.map((s, i) => ({ ...s, percent: i === 0 ? even + remainder : even })));
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">

        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Finances</p>
          <h1 className="font-heading text-3xl font-bold">Revenue & Royalty Splits</h1>
          <p className="text-muted-foreground text-sm mt-1">Model payout scenarios per song based on projected streams.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Config Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Song picker */}
            <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
              <p className="font-semibold text-sm flex items-center gap-2"><Music2 className="h-4 w-4 text-primary" />Song</p>
              <select value={selectedSong || ""} onChange={e => setSelectedSong(e.target.value || null)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">— Custom / Unlisted Song —</option>
                {songs.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>

            {/* Projections */}
            <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
              <p className="font-semibold text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Stream Projections</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Projected Streams</label>
                  <Input type="number" value={streams} min={0}
                    onChange={e => setStreams(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Platform</label>
                  <select value={platform.id} onChange={e => setPlatform(PLATFORMS.find(p => p.id === e.target.value))}
                    className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label} (${p.rate}/stream)</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 p-4">
                <p className="text-sm text-muted-foreground">Estimated Gross Revenue</p>
                <p className="font-heading font-bold text-2xl text-primary">${grossRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* Splits */}
            <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Team Splits</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={distribute} className="text-xs">Distribute Evenly</Button>
                  <Button size="sm" onClick={addSplit} className="gap-1 text-xs"><Plus className="h-3.5 w-3.5" />Add Person</Button>
                </div>
              </div>

              <div className="space-y-2">
                {splits.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${COLORS[i % COLORS.length]}`} />
                    <Input placeholder="Name" value={s.name} onChange={e => updateSplit(i, "name", e.target.value)}
                      className="flex-1 h-8 text-sm" />
                    <select value={s.role} onChange={e => updateSplit(i, "role", e.target.value)}
                      className="h-8 rounded-md border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring w-32 shrink-0">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <Input type="number" value={s.percent} min={0} max={100}
                      onChange={e => updateSplit(i, "percent", parseFloat(e.target.value) || 0)}
                      className="w-20 h-8 text-sm shrink-0" />
                    <span className="text-xs text-muted-foreground shrink-0">%</span>
                    {splits.length > 1 && (
                      <button onClick={() => removeSplit(i)} className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className={`text-xs font-semibold ${isValid ? "text-primary" : "text-destructive"}`}>
                Total: {totalPercent.toFixed(1)}% {isValid ? "✓" : "(must equal 100%)"}
              </div>
            </div>
          </div>

          {/* Payout panel */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-card border border-border p-5 space-y-5 sticky top-20">
              <p className="font-semibold text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Projected Payouts</p>

              {/* Donut-style bar */}
              {isValid && (
                <div className="flex rounded-full overflow-hidden h-3">
                  {splits.filter(s => s.percent > 0).map((s, i) => (
                    <div key={i} className={`${COLORS[i % COLORS.length]} transition-all`} style={{ width: `${s.percent}%` }} />
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {splits.map((s, i) => {
                  const pct = parseFloat(s.percent) || 0;
                  const payout = grossRevenue * (pct / 100);
                  return (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${COLORS[i % COLORS.length]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.name || "Unnamed"}</p>
                        <p className="text-[11px] text-muted-foreground">{s.role} · {pct}%</p>
                      </div>
                      <p className="font-semibold text-sm text-primary shrink-0">
                        ${payout.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{streams.toLocaleString()} streams on {platform.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-sm font-bold text-primary">${grossRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}