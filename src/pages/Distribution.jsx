import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Plus, CheckCircle2, Circle, ChevronDown, ChevronRight, Copy, Check, Zap, FileText, Music, Link2, Tag, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DISTRIBUTORS = ["DistroKid", "TuneCore", "CD Baby", "Amuse", "Other"];

const DEFAULT_CHECKLIST = [
  { id: "isrc", category: "ISRC & Metadata", task: "Generate ISRC code for the track", completed: false, notes: "" },
  { id: "upc", category: "ISRC & Metadata", task: "Obtain UPC/EAN barcode for the release", completed: false, notes: "" },
  { id: "meta_title", category: "ISRC & Metadata", task: "Confirm official track title & capitalization", completed: false, notes: "" },
  { id: "meta_genre", category: "ISRC & Metadata", task: "Select primary and secondary genres", completed: false, notes: "" },
  { id: "meta_explicit", category: "ISRC & Metadata", task: "Mark explicit content flag (if applicable)", completed: false, notes: "" },
  { id: "meta_copyright", category: "ISRC & Metadata", task: "Set copyright year and holder name", completed: false, notes: "" },
  { id: "artwork", category: "Artwork & Assets", task: "Upload 3000x3000px artwork (JPG/PNG, RGB, 72dpi+)", completed: false, notes: "" },
  { id: "artwork_text", category: "Artwork & Assets", task: "Verify no URLs or social handles in artwork", completed: false, notes: "" },
  { id: "audio_wav", category: "Audio Delivery", task: "Export WAV master (24-bit, 44.1kHz minimum)", completed: false, notes: "" },
  { id: "audio_loudness", category: "Audio Delivery", task: "Check integrated loudness (-14 LUFS for streaming)", completed: false, notes: "" },
  { id: "audio_silence", category: "Audio Delivery", task: "Confirm no silence at start/end of audio file", completed: false, notes: "" },
  { id: "presave", category: "Pre-Save & Links", task: "Create pre-save campaign link (Hypeddit / Toneden)", completed: false, notes: "" },
  { id: "smartlink", category: "Pre-Save & Links", task: "Set up smart link / landing page for all platforms", completed: false, notes: "" },
  { id: "spotify_pitch", category: "Pitching", task: "Submit to Spotify editorial via Spotify for Artists (7+ days before release)", completed: false, notes: "" },
  { id: "apple_pitch", category: "Pitching", task: "Submit to Apple Music editorial", completed: false, notes: "" },
  { id: "distributor_submit", category: "Distribution", task: "Upload & submit to chosen distributor", completed: false, notes: "" },
  { id: "release_date", category: "Distribution", task: "Set release date (Friday for streaming algorithm advantage)", completed: false, notes: "" },
  { id: "territories", category: "Distribution", task: "Select worldwide distribution territories", completed: false, notes: "" },
];

const CATEGORY_COLORS = {
  "ISRC & Metadata": "text-primary",
  "Artwork & Assets": "text-purple-400",
  "Audio Delivery": "text-chart-5",
  "Pre-Save & Links": "text-teal-400",
  "Pitching": "text-chart-3",
  "Distribution": "text-chart-4",
};

function generateISRC(artistName) {
  const country = "US";
  const reg = "SR" + Math.floor(Math.random() * 90 + 10);
  const year = new Date().getFullYear().toString().slice(-2);
  const seq = String(Math.floor(Math.random() * 90000 + 10000));
  return `${country}-${reg}-${year}-${seq}`;
}

function ChecklistGroup({ category, tasks, onToggle, onNote }) {
  const [open, setOpen] = useState(true);
  const done = tasks.filter((t) => t.completed).length;
  const color = CATEGORY_COLORS[category] || "text-primary";
  return (
    <div className="rounded-xl border border-border bg-secondary/10 overflow-hidden">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <span className={`text-sm font-semibold ${color}`}>{category}</span>
          <span className="text-xs text-muted-foreground">({done}/{tasks.length})</span>
        </div>
        <div className="h-1.5 w-24 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(done / tasks.length) * 100}%` }} />
        </div>
      </button>
      {open && (
        <div className="divide-y divide-border border-t border-border">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/10 transition-colors">
              <button onClick={() => onToggle(task.id)} className="mt-0.5 shrink-0">
                {task.completed
                  ? <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
                  : <Circle className="h-4.5 w-4.5 text-muted-foreground" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.task}</p>
                {task.notes && <p className="text-xs text-muted-foreground mt-0.5">{task.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Distribution() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ song_title: "", artist_name: "", distributor: "DistroKid", release_date: "" });
  const [creating, setCreating] = useState(false);
  const [copiedISRC, setCopiedISRC] = useState(false);

  useEffect(() => {
    base44.entities.DistributionTask.list("-created_date", 30).then(setTasks).finally(() => setLoading(false));
  }, []);

  const createRelease = async () => {
    if (!form.song_title || !form.artist_name) return;
    setCreating(true);
    const isrc = generateISRC(form.artist_name);
    const record = await base44.entities.DistributionTask.create({
      ...form,
      isrc_code: isrc,
      checklist: DEFAULT_CHECKLIST.map((t) => ({ ...t })),
      status: "in_progress",
    });
    setTasks((prev) => [record, ...prev]);
    setSelected(record);
    setShowNew(false);
    setCreating(false);
  };

  const toggleTask = async (taskId) => {
    const updated = {
      ...selected,
      checklist: selected.checklist.map((t) => t.id === taskId ? { ...t, completed: !t.completed } : t),
    };
    const done = updated.checklist.filter((t) => t.completed).length;
    updated.status = done === updated.checklist.length ? "submitted" : "in_progress";
    await base44.entities.DistributionTask.update(selected.id, { checklist: updated.checklist, status: updated.status });
    setSelected(updated);
    setTasks((prev) => prev.map((t) => t.id === selected.id ? updated : t));
  };

  const copyISRC = () => {
    navigator.clipboard.writeText(selected.isrc_code);
    setCopiedISRC(true);
    setTimeout(() => setCopiedISRC(false), 2000);
  };

  const grouped = selected?.checklist?.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {}) || {};

  const progress = selected ? Math.round((selected.checklist.filter((t) => t.completed).length / selected.checklist.length) * 100) : 0;

  const STATUS_COLORS = { draft: "text-muted-foreground", in_progress: "text-chart-4", submitted: "text-chart-5", live: "text-primary" };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Distribution Manager</p>
            <h1 className="font-heading text-4xl font-bold">Release Checklist</h1>
            <p className="text-muted-foreground">ISRC codes, metadata, pre-save links & distributor submissions.</p>
          </div>
          <Button onClick={() => setShowNew(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Release
          </Button>
        </motion.div>

        {showNew && (
          <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <p className="font-heading font-bold">Start a New Release</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Song title" value={form.song_title} onChange={(e) => setForm((f) => ({ ...f, song_title: e.target.value }))} />
              <Input placeholder="Artist name" value={form.artist_name} onChange={(e) => setForm((f) => ({ ...f, artist_name: e.target.value }))} />
              <select value={form.distributor} onChange={(e) => setForm((f) => ({ ...f, distributor: e.target.value }))}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                {DISTRIBUTORS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <Input type="date" value={form.release_date} onChange={(e) => setForm((f) => ({ ...f, release_date: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button onClick={createRelease} disabled={creating || !form.song_title}>{creating ? "Creating..." : "Create Release"}</Button>
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Sidebar list */}
          <div className="space-y-2">
            {loading ? <div className="py-8 flex justify-center"><div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
              : tasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
                  <Music className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No releases yet</p>
                </div>
              ) : tasks.map((t) => {
                const done = (t.checklist || []).filter((c) => c.completed).length;
                const total = (t.checklist || []).length;
                return (
                  <button key={t.id} onClick={() => setSelected(t)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${selected?.id === t.id ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:bg-secondary/20"}`}>
                    <p className="font-medium text-sm truncate">{t.song_title}</p>
                    <p className="text-xs text-muted-foreground">{t.artist_name} · {t.distributor}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{done}/{total}</span>
                    </div>
                    <span className={`text-[10px] font-medium capitalize mt-1 inline-block ${STATUS_COLORS[t.status]}`}>{t.status?.replace("_", " ")}</span>
                  </button>
                );
              })}
          </div>

          {/* Detail panel */}
          <div className="sm:col-span-2 space-y-4">
            {!selected ? (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-2">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Select a release or create a new one</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-heading font-bold text-xl">{selected.song_title}</p>
                      <p className="text-sm text-muted-foreground">{selected.artist_name} · {selected.distributor}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-3xl text-primary">{progress}%</p>
                      <p className="text-xs text-muted-foreground">complete</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  {/* ISRC + info pills */}
                  <div className="flex flex-wrap gap-2">
                    {selected.isrc_code && (
                      <button onClick={copyISRC}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-medium hover:bg-primary/20 transition-colors">
                        <Tag className="h-3 w-3" />
                        ISRC: {selected.isrc_code}
                        {copiedISRC ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                    {selected.release_date && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs">
                        <Globe className="h-3 w-3 text-muted-foreground" /> Release: {selected.release_date}
                      </span>
                    )}
                    {selected.pre_save_url && (
                      <a href={selected.pre_save_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs hover:bg-teal-500/20 transition-colors">
                        <Link2 className="h-3 w-3" /> Pre-Save Link
                      </a>
                    )}
                  </div>
                </div>

                {/* Checklist groups */}
                {Object.entries(grouped).map(([cat, items]) => (
                  <ChecklistGroup key={cat} category={cat} tasks={items} onToggle={toggleTask} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}