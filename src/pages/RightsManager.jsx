import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, X, Music, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROLES = ["Songwriter", "Producer", "Co-Producer", "Featured Artist", "Publisher"];

export default function RightsManager() {
  const [rights, setRights] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ person_name: "", role: "Songwriter", ownership_percent: "", email: "", paid: false });

  useEffect(() => {
    Promise.all([
      base44.entities.SongRights.list("-created_date", 50),
      base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 50),
    ]).then(([r, s]) => {
      setRights(r);
      setSongs(s);
      setLoading(false);
    });
  }, []);

  const selected = rights.find(r => r.id === selectedId);

  const handleCreate = async () => {
    if (!selectedId) return;
    const song = songs.find(s => s.id === selectedId);
    if (!song) return;
    const newRights = {
      song_id: selectedId,
      song_title: song.title,
      artist_name: song.artist_name,
      splits: [{ person_name: form.person_name, role: form.role, ownership_percent: Number(form.ownership_percent), email: form.email, paid: form.paid }],
      total_percent: Number(form.ownership_percent),
    };
    const created = await base44.entities.SongRights.create(newRights);
    setRights(prev => [created, ...prev]);
    setSelectedId(created.id);
    setShowForm(false);
    setForm({ person_name: "", role: "Songwriter", ownership_percent: "", email: "", paid: false });
  };

  const handleAddContributor = async () => {
    if (!selected || !form.person_name || !form.ownership_percent) return;
    const newSplits = [...selected.splits, { person_name: form.person_name, role: form.role, ownership_percent: Number(form.ownership_percent), email: form.email, paid: form.paid }];
    const totalPercent = newSplits.reduce((s, x) => s + x.ownership_percent, 0);
    await base44.entities.SongRights.update(selected.id, { splits: newSplits, total_percent: totalPercent });
    setRights(prev => prev.map(r => r.id === selected.id ? { ...r, splits: newSplits, total_percent: totalPercent } : r));
    setShowForm(false);
    setForm({ person_name: "", role: "Songwriter", ownership_percent: "", email: "", paid: false });
  };

  const handleRemoveContributor = async (idx) => {
    if (!selected) return;
    const newSplits = selected.splits.filter((_, i) => i !== idx);
    const totalPercent = newSplits.reduce((s, x) => s + x.ownership_percent, 0);
    await base44.entities.SongRights.update(selected.id, { splits: newSplits, total_percent: totalPercent });
    setRights(prev => prev.map(r => r.id === selected.id ? { ...r, splits: newSplits, total_percent: totalPercent } : r));
  };

  const handleTogglePaid = async (idx) => {
    if (!selected) return;
    const newSplits = selected.splits.map((s, i) => i === idx ? { ...s, paid: !s.paid } : s);
    await base44.entities.SongRights.update(selected.id, { splits: newSplits });
    setRights(prev => prev.map(r => r.id === selected.id ? { ...r, splits: newSplits } : r));
  };

  const handleDeleteRights = async (id) => {
    await base44.entities.SongRights.delete(id);
    setRights(prev => prev.filter(r => r.id !== id));
    setSelectedId(null);
  };

  const isValid = selected?.total_percent === 100;
  const unpaidCount = selected?.splits?.filter(s => !s.paid).length || 0;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Financial</p>
          <h1 className="font-heading text-4xl font-bold">Rights Manager</h1>
          <p className="text-muted-foreground text-sm">Track ownership splits and payments for each song.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="space-y-2">
              {songs.map(song => {
                const songRights = rights.find(r => r.song_id === song.id);
                return (
                  <button key={song.id} onClick={() => setSelectedId(songRights?.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${selectedId === songRights?.id ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:border-primary/20"}`}>
                    <p className="font-medium text-sm truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground">{song.artist_name}</p>
                    {songRights && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className={songRights.total_percent === 100 ? "text-primary font-semibold" : "text-yellow-400 font-semibold"}>{songRights.total_percent}%</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Detail */}
            <div className="sm:col-span-2 space-y-4">
              {!selected && songs.length > 0 && (
                <div className="text-center py-20 space-y-3">
                  <Music className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <p className="text-muted-foreground">Select a song to manage rights.</p>
                </div>
              )}

              {selected && (
                <>
                  {/* Header */}
                  <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-heading font-bold text-lg">{selected.song_title}</p>
                        <p className="text-sm text-muted-foreground">{selected.artist_name}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteRights(selected.id)} className="text-destructive hover:text-destructive">Delete</Button>
                    </div>

                    {/* Ownership meter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">Total Ownership</p>
                        <p className={`text-sm font-bold ${selected.total_percent === 100 ? "text-primary" : "text-yellow-400"}`}>{selected.total_percent}%</p>
                      </div>
                      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full transition-all ${selected.total_percent === 100 ? "bg-primary" : "bg-yellow-400"}`} style={{ width: `${Math.min(selected.total_percent, 100)}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Contributors */}
                  <div className="rounded-2xl bg-card border border-border overflow-hidden">
                    <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                      <p className="font-semibold text-sm">Contributors ({selected.splits?.length || 0})</p>
                      {unpaidCount > 0 && <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-medium">{unpaidCount} unpaid</span>}
                    </div>
                    <div className="divide-y divide-border">
                      {selected.splits?.map((split, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between gap-3 hover:bg-secondary/30 group">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{split.person_name}</p>
                            <p className="text-xs text-muted-foreground">{split.role}</p>
                            {split.email && <p className="text-xs text-muted-foreground mt-0.5">{split.email}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <p className="font-heading font-bold text-sm">{split.ownership_percent}%</p>
                              <button onClick={() => handleTogglePaid(idx)} className={`text-xs font-medium mt-0.5 transition-colors ${split.paid ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                                {split.paid ? "✓ Paid" : "Unpaid"}
                              </button>
                            </div>
                            <button onClick={() => handleRemoveContributor(idx)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <AnimatePresence>
                      {showForm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="px-5 py-4 border-t border-dashed border-border space-y-3 bg-secondary/20">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground font-medium">Name</label>
                              <Input value={form.person_name} onChange={e => setForm(f => ({ ...f, person_name: e.target.value }))} placeholder="Person name" size="sm" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground font-medium">Role</label>
                              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                                {ROLES.map(r => <option key={r}>{r}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground font-medium">Ownership %</label>
                              <Input type="number" value={form.ownership_percent} onChange={e => setForm(f => ({ ...f, ownership_percent: e.target.value }))} placeholder="0" min="0" max="100" size="sm" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground font-medium">Email</label>
                              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" size="sm" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleAddContributor} className="h-8 gap-1"><Check className="h-3 w-3" />Add</Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="h-8"><X className="h-3 w-3" /></Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!showForm && (
                      <div className="px-5 py-3 border-t border-border">
                        <Button size="sm" variant="ghost" onClick={() => setShowForm(true)} className="gap-2 text-xs"><Plus className="h-3 w-3" />Add Contributor</Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}