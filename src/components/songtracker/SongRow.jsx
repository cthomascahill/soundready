import { getCurrentStage, getNextStage } from "@/lib/songStatus";
import StageBadge from "./StageBadge";
import SongRowMenu from "./SongRowMenu";

// One song, one quiet row: title, stage, actions. Clicking opens the song's
// own page so the rest of the list falls away while you work.
export default function SongRow({ song, moveTargets, onUpdate, onDelete, onOpen }) {
  const current = getCurrentStage(song);
  const next = getNextStage(song);

  return (
    <div className="border-b border-border last:border-b-0">
      <div
        onClick={() => onOpen(song)}
        className="flex items-center gap-3 px-3 min-h-[52px] cursor-pointer hover:bg-secondary/20 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{song.song_name || "Untitled"}</p>
          <p className="md:hidden text-xs text-muted-foreground truncate">
            {current ? current.status : "Idea"}{next ? ` · ${next.action}` : ""}
          </p>
        </div>

        <div className="hidden md:block w-28 shrink-0">
          <StageBadge stage={current} />
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
    </div>
  );
}