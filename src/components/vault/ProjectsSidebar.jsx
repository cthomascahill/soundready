import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FolderOpen, Plus, X, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProjectsSidebar({ projects, songs, activeProject, setActiveProject, onProjectCreate, onProjectDelete }) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const p = await base44.entities.SongProject.create({ name: newName.trim() });
    onProjectCreate(p);
    setNewName("");
    setCreating(false);
  };

  const getSongCount = (projectId) =>
    songs.filter(s => s.project_ids?.includes(projectId)).length;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 py-1 mb-2">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Projects</span>
        <button onClick={() => setCreating(v => !v)} className="text-zinc-500 hover:text-primary transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {creating && (
        <div className="flex gap-2 px-1 mb-2">
          <Input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()}
            placeholder="Project name..." className="h-7 text-xs bg-zinc-900 border-zinc-700" autoFocus />
          <Button size="sm" onClick={handleCreate} className="h-7 px-2 text-xs">Add</Button>
        </div>
      )}

      <button onClick={() => setActiveProject(null)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${!activeProject ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
        <FolderOpen className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">All Songs</span>
        <span className="text-xs text-zinc-600">{songs.length}</span>
      </button>

      {projects.map(p => (
        <div key={p.id} className="group flex items-center">
          <button onClick={() => setActiveProject(p.id)}
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${activeProject === p.id ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
            <Folder className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left truncate">{p.name}</span>
            <span className="text-xs text-zinc-600">{getSongCount(p.id)}</span>
          </button>
          <button onClick={() => onProjectDelete(p.id)}
            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all mr-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}