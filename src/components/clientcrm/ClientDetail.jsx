import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ProjectCard from "@/components/clientcrm/ProjectCard";
import { ArrowLeft, Plus, FolderOpen, Loader2 } from "lucide-react";

/**
 * One client opened from the CRM pipeline — their projects, and inside
 * each project the songs and version files being worked on.
 */
export default function ClientDetail({ client, onBack }) {
  const [projects, setProjects] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setProjects(null);
    base44.entities.ClientProject.filter({ client_id: client.id }, "-created_date", 100)
      .then(setProjects)
      .catch(() => setProjects([]));
  }, [client.id]);

  const addProject = async () => {
    const title = newTitle.trim();
    if (!title || busy) return;
    setBusy(true);
    try {
      const created = await base44.entities.ClientProject.create({
        client_id: client.id,
        title,
        status: "Planning",
      });
      setProjects((p) => [created, ...(p || [])]);
      setNewTitle("");
    } finally {
      setBusy(false);
    }
  };

  const onUpdated = (updated) =>
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  const onRemoved = (id) => setProjects((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-card border border-border p-5 space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            title="Back to pipeline"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <p className="font-heading text-xl font-bold">{client.name}</p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary/25 bg-primary/10 text-primary">
            {client.stage || "Prospect"}
          </span>
        </div>
        {(client.email || client.sound) && (
          <p className="text-xs text-muted-foreground">
            {client.email}
            {client.email && client.sound ? " · " : ""}
            {client.sound}
          </p>
        )}
        {client.terms && <p className="text-xs text-muted-foreground/80">Terms: {client.terms}</p>}
        {client.notes && (
          <p className="text-xs text-muted-foreground/80 whitespace-pre-wrap">{client.notes}</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addProject()}
          placeholder="New project — e.g. Summer EP, Single: Midnight…"
          className="flex-1 rounded-xl border border-input bg-transparent px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={addProject}
          disabled={busy || !newTitle.trim()}
          className="px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Project
        </button>
      </div>

      {projects === null ? (
        <div className="flex justify-center py-14">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-3">
          <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="font-heading font-bold text-lg">No projects with this client yet</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Create a project above, then add the songs you're working on — each song holds its own mix and master versions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onUpdated={onUpdated} onRemoved={onRemoved} />
          ))}
        </div>
      )}
    </div>
  );
}