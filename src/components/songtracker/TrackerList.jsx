import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SongRow from "./SongRow";
import InviteTeammateButton from "./InviteTeammateButton";
import { getCurrentStage, sortSongs } from "@/lib/songStatus";
import { vaultStatusDot } from "@/lib/vaultStatus";

// The six-stage ladder, in language an artist scans in a second
const GROUPS = [
  { label: "Ideas", statuses: ["Idea"] },
  { label: "Demos", statuses: ["Demo"] },
  { label: "In production", statuses: ["Recorded", "Mixed"] },
  { label: "Ready to release", statuses: ["Mastered"] },
  { label: "Released", statuses: ["Released"] },
];

// The project's songs, grouped into collapsible stage sections, the whole
// pipeline reads at a glance instead of one long mixed list. Toggling a stage
// moves the song into its new section, so progress is visible feedback.
export default function TrackerList({ songs, moveTargets, onAdd, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState({});

  const addSong = async () => {
    const song = await onAdd();
    navigate(`/song-tracker/${song.id}`);
  };

  const groups = useMemo(
    () => {
      const ordered = sortSongs(songs);
      return GROUPS.map((g) => ({
        ...g,
        dot: vaultStatusDot(g.statuses[0]),
        songs: ordered.filter((s) => g.statuses.includes(getCurrentStage(s)?.status || "Idea")),
      }));
    },
    [songs]
  );

  const toggle = (label) => setCollapsed((c) => ({ ...c, [label]: !c[label] }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end gap-2">
        <InviteTeammateButton />
        <Button onClick={addSong} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Song
        </Button>
      </div>

      {songs.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border text-center py-20 space-y-3">
          <p className="text-muted-foreground text-sm">No songs in this project yet.</p>
          <Button onClick={addSong} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Add the First Song
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => {
            const open = !collapsed[g.label];
            return (
              <div key={g.label} className="rounded-2xl bg-card border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle(g.label)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors"
                >
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`} />
                  <span className={`h-1.5 w-1.5 rounded-full ${g.dot}`} />
                  <span className="text-sm font-semibold text-foreground">{g.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{g.songs.length}</span>
                </button>
                {open && (
                  g.songs.length > 0 ? g.songs.map((song) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      moveTargets={moveTargets}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onOpen={(s) => navigate(`/song-tracker/${s.id}`)}
                    />
                  )) : (
                    <p className="px-4 pb-4 pt-1 text-xs text-muted-foreground">
                      Nothing here yet, songs land in this section as they progress.
                    </p>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}