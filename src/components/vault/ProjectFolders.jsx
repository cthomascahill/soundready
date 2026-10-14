import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FolderOpen, Plus, X, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Project / album folders as recognizable tiles above the songs, one tap
// scopes the catalog to that project. "All Songs" is the folder that clears it.
export default function ProjectFolders({ projects, songs, activeProject, setActiveProject, onProjectCreate, onProjectDelete }) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const p = await base44.entities.SongProject.create({ name: newName.trim() });
    onProjectCreate(p);
    setNewName("");
    setCreating(false);
  };

  const songCount = (id) => songs.filter((s) => s.project_ids?.includes(id)).length;

  const tile = (active) =>
    `flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors text-left ${
      active ? "border-foreground/40 bg-secondary" : "border-border bg-card hover:border-foreground/25"
    }`;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Projects & albums</span>
        <button
          onClick={() => setCreating((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> New project
        </button>
      </div>

      {creating && (
        <div className="flex gap-2 max-w-sm">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Project or album name..."
            autoFocus
          />
          <Button size="sm" onClick={handleCreate}>Add</Button>
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-1">
        <button onClick={() => setActiveProject(null)} className={`${tile(!activeProject)} shrink-0`}>
          <div className="h-10 w-10 rounded-lg bg-foreground/10 border border-foreground/15 flex items-center justify-center text-foreground shrink-0">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">All Songs</p>
            <p className="text-xs text-muted-foreground">{songs.length} {songs.length === 1 ? "song" : "songs"}</p>
          </div>
        </button>

        {projects.map((p) => (
          <div key={p.id} className="relative group shrink-0">
            <button
              onClick={() => setActiveProject(activeProject === p.id ? null : p.id)}
              className={tile(activeProject === p.id) + " w-full"}
            >
              <div className="h-10 w-10 rounded-lg bg-foreground/10 border border-foreground/15 flex items-center justify-center text-foreground shrink-0">
                <Folder className="h-5 w-5" />
              </div>
              <div className="min-w-0 max-w-[150px]">
                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{songCount(p.id)} {songCount(p.id) === 1 ? "song" : "songs"}</p>
              </div>
            </button>
            <button
              onClick={() => onProjectDelete(p.id)}
              title="Delete project"
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 items-center justify-center opacity-0 group-hover:opacity-100 group-hover:flex transition-opacity"
            >
              <X className="h-3 w-3 mx-auto" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}