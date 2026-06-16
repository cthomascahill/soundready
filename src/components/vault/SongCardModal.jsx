import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Music2, Upload, Play, Pause, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GENRES = ["Hip-Hop", "R&B", "Pop", "Trap", "Drill", "Afrobeats", "Gospel", "Country", "Rock", "Electronic", "Jazz", "Soul", "Alternative", "Other"];
const MOODS = ["Dark", "Uplifting", "Chill", "Aggressive", "Romantic", "Melancholic", "Party", "Introspective", "Hype", "Spiritual", "Nostalgic", "Cinematic"];
const STATUSES = ["Idea", "Demo", "Recorded", "Mixed", "Mastered", "Released"];

const STATUS_COLORS = {
  Idea: "bg-zinc-700/50 text-zinc-300 border-zinc-600",
  Demo: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  Recorded: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Mixed: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  Mastered: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  Released: "bg-green-500/15 text-green-400 border-green-500/25",
};

export default function SongCardModal({ song, onClose, onSave, projects = [] }) {
  const isNew = !song?.id;
  const [form, setForm] = useState({
    title: song?.title || "",
    featured_artists: song?.featured_artists || "",
    producer: song?.producer || "",
    genre: song?.genre || "",
    bpm: song?.bpm || "",
    key: song?.key || "",
    moods: song?.moods || [],
    status: song?.status || "Demo",
    release_date: song?.release_date || "",
    lyrics: song?.lyrics || "",
    notes: song?.notes || "",
    tags: song?.tags || [],
    file_url: song?.file_url || "",
    file_name: song?.file_name || "",
    duration: song?.duration || null,
    project_ids: song?.project_ids || [],
  });
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [draggingAudio, setDraggingAudio] = useState(false);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleAudioFile = async (file) => {
    if (!file || !file.type.startsWith("audio/")) return;
    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    // Get duration
    const dur = await new Promise((resolve) => {
      const a = new Audio();
      a.src = localUrl;
      a.onloadedmetadata = () => resolve(Math.round(a.duration));
      a.onerror = () => resolve(null);
      setTimeout(() => resolve(null), 5000);
    });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, file_url, file_name: file.name, duration: dur }));
    setAudioFile({ localUrl, name: file.name });
    setUploading(false);
  };

  const toggleMood = (mood) => {
    setForm(f => ({
      ...f,
      moods: f.moods.includes(mood) ? f.moods.filter(m => m !== mood) : [...f.moods, mood],
    }));
  };

  const addTag = () => {
    const t = newTag.trim();
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }));
      setNewTag("");
    }
  };

  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const toggleProject = (pid) => {
    setForm(f => ({
      ...f,
      project_ids: f.project_ids.includes(pid)
        ? f.project_ids.filter(id => id !== pid)
        : [...f.project_ids, pid],
    }));
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const data = {
      ...form,
      bpm: form.bpm ? Number(form.bpm) : null,
    };
    if (isNew) {
      const created = await base44.entities.SongVault.create(data);
      onSave(created, "create");
    } else {
      const updated = await base44.entities.SongVault.update(song.id, data);
      onSave(updated, "update");
    }
    setSaving(false);
    onClose();
  };

  const audioSrc = audioFile?.localUrl || form.file_url || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-[#111] z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Music2 className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-heading font-bold text-lg">{isNew ? "Add Song" : "Edit Song"}</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Audio Upload */}
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-wider mb-2 block">Audio File</label>
            {audioSrc ? (
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <button onClick={togglePlay} className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors shrink-0">
                  {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{form.file_name || "Uploaded audio"}</p>
                  {form.duration && <p className="text-xs text-zinc-500">{Math.floor(form.duration / 60)}:{String(form.duration % 60).padStart(2, "0")}</p>}
                </div>
                <button onClick={() => { setForm(f => ({ ...f, file_url: "", file_name: "", duration: null })); setAudioFile(null); }}
                  className="text-zinc-500 hover:text-red-400 transition-colors text-xs">Remove</button>
                <audio ref={audioRef} src={audioSrc} onEnded={() => setPlaying(false)} />
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDraggingAudio(true); }}
                onDragLeave={() => setDraggingAudio(false)}
                onDrop={(e) => { e.preventDefault(); setDraggingAudio(false); handleAudioFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 py-8 transition-all ${draggingAudio ? "border-primary bg-primary/10" : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30"}`}
              >
                {uploading ? (
                  <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-zinc-500" />
                    <p className="text-sm text-zinc-400">Drop audio file or click to browse</p>
                    <p className="text-xs text-zinc-600">MP3, WAV, FLAC</p>
                  </>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={e => handleAudioFile(e.target.files[0])} />
          </div>

          {/* Song Info */}
          <div className="space-y-3">
            <label className="text-xs text-zinc-400 uppercase tracking-wider block">Song Details</label>
            <Input placeholder="Song Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-zinc-900 border-zinc-700" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Featured Artists" value={form.featured_artists} onChange={e => setForm(f => ({ ...f, featured_artists: e.target.value }))} className="bg-zinc-900 border-zinc-700" />
              <Input placeholder="Producer / Beat Credit" value={form.producer} onChange={e => setForm(f => ({ ...f, producer: e.target.value }))} className="bg-zinc-900 border-zinc-700" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">Genre</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <Input placeholder="BPM" type="number" value={form.bpm} onChange={e => setForm(f => ({ ...f, bpm: e.target.value }))} className="bg-zinc-900 border-zinc-700" />
              <Input placeholder="Key (e.g. C Minor)" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} className="bg-zinc-900 border-zinc-700" />
            </div>
          </div>

          {/* Status & Release */}
          <div className="space-y-3">
            <label className="text-xs text-zinc-400 uppercase tracking-wider block">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${form.status === s ? STATUS_COLORS[s] : "bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500"}`}>
                  {s}
                </button>
              ))}
            </div>
            {form.status === "Released" && (
              <Input type="date" value={form.release_date} onChange={e => setForm(f => ({ ...f, release_date: e.target.value }))} className="bg-zinc-900 border-zinc-700 max-w-xs" />
            )}
          </div>

          {/* Moods */}
          <div className="space-y-3">
            <label className="text-xs text-zinc-400 uppercase tracking-wider block">Mood / Vibe</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button key={m} onClick={() => toggleMood(m)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${form.moods.includes(m) ? "bg-primary/15 text-primary border-primary/30" : "bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Projects */}
          {projects.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs text-zinc-400 uppercase tracking-wider block">Add to Project</label>
              <div className="flex flex-wrap gap-2">
                {projects.map(p => (
                  <button key={p.id} onClick={() => toggleProject(p.id)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${form.project_ids.includes(p.id) ? "bg-primary/15 text-primary border-primary/30" : "bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500"}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-xs text-zinc-400 uppercase tracking-wider block">Tags</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {form.tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-300">
                  <Tag className="h-3 w-3" />{t}
                  <button onClick={() => removeTag(t)} className="text-zinc-500 hover:text-red-400 ml-0.5"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder='e.g. "album project", "single candidate"' value={newTag} onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag()}
                className="bg-zinc-900 border-zinc-700 text-sm" />
              <Button variant="outline" size="sm" onClick={addTag} className="border-zinc-700 shrink-0"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Lyrics */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase tracking-wider block">Lyrics</label>
            <textarea value={form.lyrics} onChange={e => setForm(f => ({ ...f, lyrics: e.target.value }))}
              placeholder="Paste your lyrics here..."
              rows={6}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono" />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 uppercase tracking-wider block">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Production notes, ideas, references..."
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="border-zinc-700">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="gap-2">
            {saving ? <div className="h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" /> : null}
            {isNew ? "Add to Vault" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}