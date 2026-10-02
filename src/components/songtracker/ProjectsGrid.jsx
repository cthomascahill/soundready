import { format, parseISO } from "date-fns";
import { Disc3, Disc, Library, Music2, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NewProjectDialog from "./NewProjectDialog";

const cardBase =
  "rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/40";

function CardMeta({ songs }) {
  const active = songs.filter((s) => !s.stage_released).length;
  const upcoming = songs
    .filter((s) => !s.stage_released && s.release_date)
    .map((s) => s.release_date)
    .sort()[0];
  return (
    <p className="text-xs text-muted-foreground mt-1">
      {songs.length} {songs.length === 1 ? "song" : "songs"} · {active} in progress
      {upcoming ? ` · next release ${format(parseISO(upcoming), "MMM d")}` : ""}
    </p>
  );
}

// Project folders: All Songs, Singles, and each Album/EP — click one to open its song list
export default function ProjectsGrid({ songs, projects, onOpen, onDeleteProject, onCreateProject }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button onClick={() => onOpen("all")} className={cardBase}>
        <Library className="h-5 w-5 text-primary mb-3" />
        <p className="font-heading text-lg font-semibold">All Songs</p>
        <CardMeta songs={songs} />
      </button>

      <button onClick={() => onOpen("singles")} className={cardBase}>
        <Music2 className="h-5 w-5 text-primary mb-3" />
        <p className="font-heading text-lg font-semibold">Singles</p>
        <p className="text-xs text-muted-foreground mt-1">Standalone releases</p>
        <CardMeta songs={songs.filter((s) => !s.project_id)} />
      </button>

      {projects.map((p) => {
        const projSongs = songs.filter((s) => s.project_id === p.id);
        const Icon = p.project_type === "EP" ? Disc : Disc3;
        return (
          <div key={p.id} onClick={() => onOpen(p.id)} className={`${cardBase} relative cursor-pointer`}>
            <Icon className="h-5 w-5 text-primary mb-3" />
            <div className="flex items-center gap-2 pr-8">
              <p className="font-heading text-lg font-semibold truncate">{p.name}</p>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {p.project_type}
              </span>
            </div>
            <CardMeta songs={projSongs} />
            <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Project actions"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => onDeleteProject(p.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}

      <NewProjectDialog onCreate={onCreateProject} />
    </div>
  );
}