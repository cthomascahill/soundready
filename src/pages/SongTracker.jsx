import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, GripVertical, Trash2, ChevronDown, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const STAGES = [
  { key: "stage_write", label: "Write" },
  { key: "stage_record", label: "Record" },
  { key: "stage_mix", label: "Mix" },
  { key: "stage_master", label: "Master" },
  { key: "stage_submit", label: "Submit" },
];

function getStatus(song) {
  const completed = STAGES.filter((s) => song[s.key]).length;
  if (completed === 0) return { label: "Not Started", cls: "bg-secondary text-muted-foreground border-border" };
  if (completed === 5) return { label: "Complete", cls: "bg-green-500/15 text-green-400 border-green-500/25" };
  if (song.stage_submit) return { label: "Ready to Submit", cls: "bg-primary/15 text-primary border-primary/25" };
  if (song.stage_master) return { label: "Mastered", cls: "bg-chart-2/15 text-chart-2 border-chart-2/25" };
  return { label: "In Progress", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
}

function StageToggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all mx-auto ${
        checked ? "bg-primary border-primary" : "border-border bg-transparent hover:border-primary/50"
      }`}
    >
      {checked && <Check className="h-3 w-3 text-black" strokeWidth={3} />}
    </button>
  );
}

function ProgressBar({ song }) {
  const completed = STAGES.filter((s) => song[s.key]).length;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {STAGES.map((s) => (
          <div
            key={s.key}
            className={`h-1.5 w-3 rounded-full transition-colors ${song[s.key] ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">{completed}/5</span>
    </div>
  );
}

function SongRow({ song, index, onUpdate, onDelete }) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [localName, setLocalName] = useState(song.song_name);
  const [localNotes, setLocalNotes] = useState(song.notes || "");
  const nameTimer = useRef(null);
  const notesTimer = useRef(null);

  const handleNameChange = (val) => {
    setLocalName(val);
    clearTimeout(nameTimer.current);
    nameTimer.current = setTimeout(() => onUpdate(song.id, { song_name: val }), 600);
  };

  const handleNotesChange = (val) => {
    setLocalNotes(val);
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => onUpdate(song.id, { notes: val }), 600);
  };

  const toggleStage = (key) => {
    const val = !song[key];
    onUpdate(song.id, { [key]: val });
  };

  const status = getStatus(song);

  return (
    <Draggable draggableId={song.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border-b border-border transition-colors ${snapshot.isDragging ? "bg-secondary/60 shadow-xl" : "bg-transparent hover:bg-secondary/20"}`}
        >
          {/* Main row */}
          <div className="flex items-center gap-0 min-h-[52px]">
            {/* Drag handle */}
            <div
              {...provided.dragHandleProps}
              className="px-2 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
            >
              <GripVertical className="h-4 w-4" />
            </div>

            {/* Song Name */}
            <div className="flex-1 min-w-0 px-2">
              <input
                value={localName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Song name..."
                className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
              <ProgressBar song={song} />
            </div>

            {/* Stage toggles */}
            {STAGES.map((s) => (
              <div key={s.key} className="w-16 shrink-0 flex justify-center">
                <StageToggle checked={!!song[s.key]} onChange={() => toggleStage(s.key)} />
              </div>
            ))}

            {/* Status badge */}
            <div className="w-32 shrink-0 px-2 hidden md:block">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>
                {status.label}
              </span>
            </div>

            {/* Notes toggle */}
            <div className="w-24 shrink-0 px-2">
              <button
                onClick={() => setNotesExpanded((v) => !v)}
                className={`flex items-center gap-1 text-xs transition-colors ${localNotes ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span className="hidden sm:inline truncate max-w-[60px]">{localNotes ? localNotes.slice(0, 12) + (localNotes.length > 12 ? "…" : "") : "Add note"}</span>
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${notesExpanded ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Delete */}
            <div className="w-10 shrink-0 flex justify-center">
              <button
                onClick={() => onDelete(song.id)}
                className="text-muted-foreground/30 hover:text-destructive transition-colors p-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Notes expansion */}
          {notesExpanded && (
            <div className="px-10 pb-3">
              <textarea
                value={localNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add notes..."
                rows={3}
                className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

const FILTER_OPTIONS = [
  { label: "All Songs", value: "all" },
  { label: "Not Started", value: "not_started" },
  { label: "In Progress", value: "in_progress" },
  { label: "Written", value: "stage_write" },
  { label: "Recorded", value: "stage_record" },
  { label: "Mixed", value: "stage_mix" },
  { label: "Mastered", value: "stage_master" },
  { label: "Ready to Submit", value: "stage_submit" },
  { label: "Complete", value: "complete" },
];

export default function SongTracker() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    base44.entities.PipelineSong.list("sort_order", 200)
      .then((data) => { setSongs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const addSong = async () => {
    const newSong = await base44.entities.PipelineSong.create({
      song_name: "",
      stage_write: false,
      stage_record: false,
      stage_mix: false,
      stage_master: false,
      stage_submit: false,
      notes: "",
      sort_order: songs.length,
    });
    setSongs((prev) => [...prev, newSong]);
  };

  const updateSong = useCallback(async (id, changes) => {
    setSongs((prev) => prev.map((s) => s.id === id ? { ...s, ...changes } : s));
    await base44.entities.PipelineSong.update(id, changes);
  }, []);

  const deleteSong = async (id) => {
    setSongs((prev) => prev.filter((s) => s.id !== id));
    await base44.entities.PipelineSong.delete(id);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(songs);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setSongs(reordered);
    // Persist new sort order
    await Promise.all(
      reordered.map((s, i) => {
        if (s.sort_order !== i) return base44.entities.PipelineSong.update(s.id, { sort_order: i });
      })
    );
  };

  const filteredSongs = songs.filter((s) => {
    if (filter === "all") return true;
    if (filter === "not_started") return STAGES.every((st) => !s[st.key]);
    if (filter === "in_progress") {
      const c = STAGES.filter((st) => s[st.key]).length;
      return c > 0 && c < 5;
    }
    if (filter === "complete") return STAGES.every((st) => s[st.key]);
    // Stage-specific filter: show songs where that stage is done but the next one isn't
    const idx = STAGES.findIndex((st) => st.key === filter);
    if (idx >= 0) return s[filter] === true;
    return true;
  });

  const completedCount = songs.filter((s) => STAGES.every((st) => s[st.key])).length;
  const inProgressCount = songs.filter((s) => {
    const c = STAGES.filter((st) => s[st.key]).length;
    return c > 0 && c < 5;
  }).length;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Pipeline</p>
            <h1 className="font-heading text-4xl font-bold">Song Tracker</h1>
            <p className="text-muted-foreground text-sm mt-1">Track every song from idea to release.</p>
          </div>
          <div className="flex items-center gap-3">
            {songs.length > 0 && (
              <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                <span><span className="text-foreground font-semibold">{songs.length}</span> songs</span>
                <span><span className="text-primary font-semibold">{inProgressCount}</span> in progress</span>
                <span><span className="text-green-400 font-semibold">{completedCount}</span> complete</span>
              </div>
            )}
            <Button onClick={addSong} className="gap-2">
              <Plus className="h-4 w-4" /> Add Song
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        {songs.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  filter === opt.value
                    ? "bg-primary text-black border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-0 bg-secondary/30 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider min-h-[40px]">
            <div className="w-8 shrink-0" /> {/* drag handle space */}
            <div className="flex-1 px-2">Song Name</div>
            {STAGES.map((s) => (
              <div key={s.key} className="w-16 shrink-0 text-center">{s.label}</div>
            ))}
            <div className="w-32 shrink-0 px-2 hidden md:block">Status</div>
            <div className="w-24 shrink-0 px-2">Notes</div>
            <div className="w-10 shrink-0" />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredSongs.length === 0 && songs.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-muted-foreground text-sm">No songs in your tracker yet.</p>
              <Button onClick={addSong} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Add Your First Song
              </Button>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No songs match this filter.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="songs">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {filteredSongs.map((song, index) => (
                      <SongRow
                        key={song.id}
                        song={song}
                        index={index}
                        onUpdate={updateSong}
                        onDelete={deleteSong}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Add row button at bottom */}
          {songs.length > 0 && (
            <button
              onClick={addSong}
              className="w-full flex items-center gap-2 px-10 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-colors border-t border-border"
            >
              <Plus className="h-4 w-4" />
              Add Song
            </button>
          )}
        </div>
      </div>
    </div>
  );
}