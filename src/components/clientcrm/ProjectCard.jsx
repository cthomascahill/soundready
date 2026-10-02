import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import VersionsList from "@/components/clientcrm/VersionsList";
import { ChevronDown, Trash2, Plus, Music2, Loader2 } from "lucide-react";
import moment from "moment";

const STATUSES = ["Planning", "In Progress", "Delivered", "On Hold"];
const SONG_STAGES = ["Idea", "Recorded", "Mixed", "Mastered", "Delivered"];

/**
 * One project under a client — expandable to its songs, each song
 * expandable to its version files.
 */
export default function ProjectCard({ project, onUpdated, onRemoved }) {
  const [expanded, setExpanded] = useState(false);
  const [songs, setSongs] = useState(null);
  const [newSong, setNewSong] = useState("");
  const [openSong, setOpenSong] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!expanded || songs !== null) return;
    base44.entities.ClientSong.filter({ project_id: project.id }, "-created_date", 100)
      .then(setSongs)
      .catch(() => setSongs([]));
  }, [expanded, project.id, songs]);

  const setStatus = async (status) => {
    onUpdated(await base44.entities.ClientProject.update(project.id, { status }));
  };

  const addSong = async () => {
    const title = newSong.trim();
    if (!title || busy) return;
    setBusy(true);
    try {
      const created = await base44.entities.ClientSong.create({
        project_id: project.id,
        title,
        status: "Idea",
      });
      setSongs((s) => [created, ...(s || [])]);
      setNewSong("");
    } finally {
      setBusy(false);
    }
  };

  const setSongStage = async (song, status) => {
    const updated = await base44.entities.ClientSong.update(song.id, { status });
    setSongs((s) => s.map((x) => (x.id === updated.id ? updated : x)));
  };

  const removeSong = async (song) => {
    if (!window.confirm(`Remove "${song.title}" and all its versions?`)) return;
    await base44.entities.ClientSongVersion.deleteMany({ song_id: song.id });
    await base44.entities.ClientSong.delete(song.id);
    setSongs((s) => s.filter((x) => x.id !== song.id));
    setOpenSong((id) => (id === song.id ? null : id));
  };

  const removeProject = async () => {
    if (!window.confirm(`Delete "${project.title}" and all its songs and versions?`)) return;
    setBusy(true);
    try {
      if (songs) {
        for (const s of songs) {
          await base44.entities.ClientSongVersion.deleteMany({ song_id: s.id });
        }
      }
      await base44.entities.ClientSong.deleteMany({ project_id: project.id });
      await base44.entities.ClientProject.delete(project.id);
      onRemoved(project.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="flex items-center gap-3 p-4 flex-wrap">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 min-w-0 flex-1 text-left"
        >
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "" : "-rotate-90"}`}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{project.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {songs === null ? "" : `${songs.length} song${songs.length === 1 ? "" : "s"}`}
              {project.deadline ? ` · Due ${moment(project.deadline).format("MMM D, YYYY")}` : ""}
            </p>
          </div>
        </button>
        <select
          value={project.status || "Planning"}
          onChange={(e) => setStatus(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={removeProject}
          disabled={busy}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete project"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          <div className="flex gap-2">
            <input
              value={newSong}
              onChange={(e) => setNewSong(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSong()}
              placeholder="Add a song to this project…"
              className="flex-1 rounded-lg border border-input bg-transparent px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={addSong}
              disabled={busy || !newSong.trim()}
              className="px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>

          {songs === null ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : songs.length === 0 ? (
            <p className="text-[11px] text-muted-foreground/70 text-center py-3">
              No songs yet — add the first one above.
            </p>
          ) : (
            <div className="space-y-2">
              {songs.map((song) => (
                <div key={song.id} className="rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center gap-2 p-2.5">
                    <button
                      onClick={() => setOpenSong(openSong === song.id ? null : song.id)}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left"
                    >
                      <Music2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-xs font-semibold truncate">{song.title}</span>
                    </button>
                    <select
                      value={song.status || "Idea"}
                      onChange={(e) => setSongStage(song, e.target.value)}
                      className="h-7 rounded-lg border border-input bg-transparent px-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {SONG_STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeSong(song)}
                      className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Remove song"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {openSong === song.id && (
                    <div className="px-2.5 pb-2.5">
                      <VersionsList song={song} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}