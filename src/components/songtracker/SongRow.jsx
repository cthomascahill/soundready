import { useState } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import useDebouncedField from "@/hooks/useDebouncedField";
import { getCurrentStage, getNextStage, isOverdue } from "@/lib/songStatus";
import StageBadge from "./StageBadge";
import SongRowMenu from "./SongRowMenu";
import SongDetails from "./SongDetails";

// One song: a quiet summary row that expands into the full details
export default function SongRow({ song, isNew, moveTargets, onUpdate, onDelete }) {
  const [open, setOpen] = useState(!!isNew);
  const [name, setName] = useDebouncedField(song.song_name, (v) => onUpdate(song.id, { song_name: v }));
  const current = getCurrentStage(song);
  const next = getNextStage(song);
  const overdue = isOverdue(song);

  return (
    <div className="border-b border-border">
      <div
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-3 px-3 min-h-[56px] cursor-pointer transition-colors hover:bg-secondary/20 ${open ? "bg-secondary/20" : ""}`}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Collapse song details" : "Expand song details"}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
        </button>

        <div className="flex-1 min-w-0">
          <input
            value={name}
            autoFocus={isNew}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setName(e.target.value)}
            placeholder="Song name..."
            className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <p className="md:hidden text-xs text-muted-foreground truncate">
            {current ? current.status : "Not Started"} · {next ? next.action : "All done"}
          </p>
        </div>

        <div className="hidden md:block w-36 shrink-0">
          <StageBadge stage={current} />
        </div>

        <div className="hidden md:flex w-56 shrink-0 items-center gap-1.5 text-sm">
          {next ? (
            <>
              <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-foreground truncate">{next.action}</span>
            </>
          ) : (
            <span className="text-muted-foreground">All done</span>
          )}
        </div>

        <div className="hidden md:block w-32 shrink-0 text-sm">
          {song.release_date ? (
            <span className={overdue ? "text-destructive" : "text-foreground"} title={overdue ? "Release date has passed" : undefined}>
              {format(parseISO(song.release_date), "MMM d, yyyy")}
            </span>
          ) : (
            <span className="text-muted-foreground/50">No date</span>
          )}
        </div>

        <SongRowMenu
          song={song}
          nextStage={next}
          moveTargets={moveTargets}
          onAdvance={(key) => onUpdate(song.id, { [key]: true })}
          onMove={(projectId) => onUpdate(song.id, { project_id: projectId })}
          onDelete={() => onDelete(song.id)}
        />
      </div>

      {open && <SongDetails song={song} onUpdate={onUpdate} />}
    </div>
  );
}