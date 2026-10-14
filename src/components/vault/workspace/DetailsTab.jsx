import { useState } from "react";
import { Plus, Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const GENRES = ["Hip-Hop", "R&B", "Pop", "Trap", "Drill", "Afrobeats", "Gospel", "Country", "Rock", "Electronic", "Jazz", "Soul", "Alternative", "Other"];
const MOODS = ["Dark", "Uplifting", "Chill", "Aggressive", "Romantic", "Melancholic", "Party", "Introspective", "Hype", "Spiritual", "Nostalgic", "Cinematic"];

// The paperwork, tucked away under its own tab: credits, genre, BPM, key,
// moods, tags, lyrics and notes — all optional, none blocking.
export default function DetailsTab({ form, setForm, projects = [] }) {
  const [newTag, setNewTag] = useState("");
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleMood = (mood) =>
    setForm((f) => ({ ...f, moods: f.moods.includes(mood) ? f.moods.filter((m) => m !== mood) : [...f.moods, mood] }));

  const addTag = () => {
    const t = newTag.trim();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
      setNewTag("");
    }
  };
  const removeTag = (tag) => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  const toggleProject = (pid) =>
    setForm((f) => ({
      ...f,
      project_ids: f.project_ids.includes(pid) ? f.project_ids.filter((id) => id !== pid) : [...f.project_ids, pid],
    }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Featured artists</span>
          <Input value={form.featured_artists || ""} onChange={set("featured_artists")} placeholder="Who else is on it" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Producer / beat credit</span>
          <Input value={form.producer || ""} onChange={set("producer")} placeholder="Who made the beat" />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Genre</span>
          <select value={form.genre || ""} onChange={set("genre")}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">Select</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">BPM</span>
          <Input type="number" value={form.bpm || ""} onChange={set("bpm")} placeholder="e.g. 140" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Key</span>
          <Input value={form.key || ""} onChange={set("key")} placeholder="e.g. C Minor" />
        </label>
      </div>

      <div className="space-y-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider block">Mood / vibe</span>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button key={m} onClick={() => toggleMood(m)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${form.moods?.includes(m) ? "bg-foreground/10 text-foreground border-foreground/25" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {projects.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider block">Projects</span>
          <div className="flex flex-wrap gap-2">
            {projects.map((p) => (
              <button key={p.id} onClick={() => toggleProject(p.id)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${form.project_ids?.includes(p.id) ? "bg-foreground/10 text-foreground border-foreground/25" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"}`}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider block">Tags</span>
        <div className="flex gap-2 flex-wrap">
          {form.tags?.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary border border-border text-xs text-foreground">
              <Tag className="h-3 w-3" />{t}
              <button onClick={() => removeTag(t)} className="text-muted-foreground hover:text-destructive ml-0.5"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder='e.g. "album project", "single candidate"' value={newTag} onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()} className="text-sm" />
          <Button variant="outline" size="sm" onClick={addTag} className="shrink-0"><Plus className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider block">Lyrics</span>
        <textarea value={form.lyrics || ""} onChange={set("lyrics")} placeholder="Paste your lyrics here..." rows={6}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring resize-none font-mono" />
      </div>

      <div className="space-y-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider block">Notes</span>
        <textarea value={form.notes || ""} onChange={set("notes")} placeholder="Production notes, ideas, references..." rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
      </div>
    </div>
  );
}