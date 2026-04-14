import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Mail, Film, Gamepad, Radio, Tv, TrendingUp, Trash2, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

const TYPES = [
  { value: "TV", icon: Tv, label: "TV Series/Shows" },
  { value: "Film", icon: Film, label: "Films/Movies" },
  { value: "Game", icon: Gamepad, label: "Video Games" },
  { value: "Commercial", icon: TrendingUp, label: "Commercials" },
  { value: "Podcast", icon: Radio, label: "Podcasts" },
  { value: "YouTube", icon: TrendingUp, label: "YouTube/Creators" },
];

const STATUSES = ["prospect", "pitched", "waiting", "accepted", "rejected"];

export default function SyncPitcher() {
  const [opportunities, setOpportunities] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    opportunity_type: "TV", 
    project_name: "", 
    company: "", 
    contact_name: "", 
    contact_email: "",
    description: "",
    genres_needed: "",
    mood_needed: "",
    budget_range: "",
    deadline: "",
  });

  useEffect(() => {
    Promise.all([
      base44.entities.SyncOpportunity.list("-created_date", 50),
      base44.entities.SongAnalysis.filter({ status: "complete" }, "-created_date", 30),
    ]).then(([o, s]) => {
      setOpportunities(o);
      setSongs(s);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!form.project_name || !form.company) return;
    const data = {
      ...form,
      genres_needed: form.genres_needed.split(",").map(g => g.trim()).filter(Boolean),
    };
    if (editingId) {
      const updated = await base44.entities.SyncOpportunity.update(editingId, data);
      setOpportunities(prev => prev.map(o => o.id === editingId ? updated : o));
    } else {
      const created = await base44.entities.SyncOpportunity.create({ ...data, status: "prospect" });
      setOpportunities(prev => [created, ...prev]);
    }
    setForm({ opportunity_type: "TV", project_name: "", company: "", contact_name: "", contact_email: "", description: "", genres_needed: "", mood_needed: "", budget_range: "", deadline: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.SyncOpportunity.delete(id);
    setOpportunities(prev => prev.filter(o => o.id !== id));
  };

  const handleStatusChange = async (id, status) => {
    await base44.entities.SyncOpportunity.update(id, { status });
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: opportunities.filter(o => o.status === s).length }), {});
  const expiringSoon = opportunities.filter(o => {
    const daysLeft = moment(o.deadline).diff(moment(), "days");
    return daysLeft >= 0 && daysLeft <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Promotion & Growth</p>
            <h1 className="font-heading text-4xl font-bold">Sync Licensing Pitcher</h1>
            <p className="text-muted-foreground text-sm mt-1">Find and pitch TV, film, and game sync opportunities.</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ opportunity_type: "TV", project_name: "", company: "", contact_name: "", contact_email: "", description: "", genres_needed: "", mood_needed: "", budget_range: "", deadline: "" }); }} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />New Opportunity
          </Button>
        </motion.div>

        {/* Status grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: "Prospects", value: counts.prospect, color: "text-muted-foreground" },
            { label: "Pitched", value: counts.pitched, color: "text-yellow-400" },
            { label: "Waiting", value: counts.waiting, color: "text-chart-5" },
            { label: "Accepted", value: counts.accepted, color: "text-primary" },
            { label: "Rejected", value: counts.rejected, color: "text-destructive" },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-card border border-border p-3 text-center">
              <p className={`font-heading font-bold text-lg ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {expiringSoon > 0 && (
          <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-3 flex items-center gap-2 text-xs text-yellow-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{expiringSoon} opportunity deadline(s) within 7 days</span>
          </div>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-heading font-bold">{editingId ? "Edit Opportunity" : "Add Sync Opportunity"}</p>
                <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Opportunity Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TYPES.map(t => {
                      const Icon = t.icon;
                      return (
                        <button key={t.value} onClick={() => setForm(f => ({ ...f, opportunity_type: t.value }))}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${form.opportunity_type === t.value ? "bg-primary/10 border-primary/30" : "border-border hover:border-primary/20"}`}>
                          <Icon className="h-4 w-4" />
                          <span className="text-[10px] text-center leading-tight">{t.label.split("/")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Project Name *</label>
                    <Input value={form.project_name} onChange={e => setForm(f => ({ ...f, project_name: e.target.value }))} placeholder="e.g. Season 3 finale" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Company *</label>
                    <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Netflix" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Contact Name</label>
                    <Input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Music supervisor name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Email</label>
                    <Input value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="contact@company.com" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Project Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                    placeholder="What's the vibe? Plot summary? Scene description?"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Genres Needed (comma-separated)</label>
                    <Input value={form.genres_needed} onChange={e => setForm(f => ({ ...f, genres_needed: e.target.value }))} placeholder="e.g. indie pop, lo-fi" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Mood</label>
                    <Input value={form.mood_needed} onChange={e => setForm(f => ({ ...f, mood_needed: e.target.value }))} placeholder="e.g. uplifting, dark" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Budget Range</label>
                    <Input value={form.budget_range} onChange={e => setForm(f => ({ ...f, budget_range: e.target.value }))} placeholder="e.g. $1K-$5K" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Deadline</label>
                    <Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!form.project_name || !form.company} className="gap-2"><Check className="h-4 w-4" />{editingId ? "Update" : "Add"}</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Film className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No opportunities yet. Start adding sync leads.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities.map(o => (
              <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 gap-wrap">
                      <p className="font-heading font-bold">{o.project_name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">{o.company}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{o.description}</p>
                    {o.genres_needed?.length > 0 && <div className="flex gap-1 mt-2 flex-wrap">{o.genres_needed.map(g => <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{g}</span>)}</div>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                      {o.budget_range && <span>Budget: {o.budget_range}</span>}
                      {o.deadline && <span>Due: {moment(o.deadline).format("MMM D")}</span>}
                    </div>
                    {o.contact_email && <a href={`mailto:${o.contact_email}`} className="flex items-center gap-1 text-xs text-primary mt-2"><Mail className="h-3 w-3" />{o.contact_email}</a>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}
                      className="h-8 rounded-md border border-input bg-transparent px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(o.id)} className="h-8 px-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}