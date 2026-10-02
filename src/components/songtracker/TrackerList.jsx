import { useState, useMemo } from "react";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SongRow from "./SongRow";
import TrackerTabs from "./TrackerTabs";
import StageFilter from "./StageFilter";
import SortControl from "./SortControl";
import { TABS, getCurrentStage, sortSongs, compareBy } from "@/lib/songStatus";

const EMPTY_MESSAGES = {
  active: "No songs in progress.",
  upcoming: "No songs with an upcoming release date.",
  released: "No released songs yet.",
  all: "No songs yet.",
};

// Clickable column header: first click sorts ascending, second descending, third resets
const SortHeader = ({ label, sortKey, sort, onSort, width }) => {
  const active = sort.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-left shrink-0 transition-colors ${width} ${active ? "text-foreground" : "hover:text-foreground"}`}
    >
      {label}
      {active && (sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </button>
  );
};

// The song list inside one project: tabs, stage filter, sorting and rows
export default function TrackerList({ songs, moveTargets, onAdd, onUpdate, onDelete }) {
  const [tab, setTab] = useState("active");
  const [stageFilter, setStageFilter] = useState("all");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [newSongId, setNewSongId] = useState(null);

  const addSong = async () => {
    const song = await onAdd();
    // Jump to Active so the new song is visible, opened and ready to name
    setTab("active");
    setStageFilter("all");
    setNewSongId(song.id);
  };

  // First click sorts ascending, second descending, third back to the default order
  const cycleSort = (key) =>
    setSort((s) => (s.key === key
      ? (s.dir === "asc" ? { key, dir: "desc" } : { key: null, dir: "asc" })
      : { key, dir: "asc" }));

  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.value, songs.filter(t.test).length])),
    [songs]
  );

  const visibleSongs = useMemo(() => {
    const inTab = TABS.find((t) => t.value === tab).test;
    const list = songs.filter(inTab).filter((s) => {
      if (stageFilter === "all") return true;
      const current = getCurrentStage(s);
      return stageFilter === "none" ? !current : current?.key === stageFilter;
    });
    const ordered = sortSongs(list);
    if (sort.key) {
      ordered.sort((a, b) => (sort.dir === "asc" ? compareBy(sort.key, a, b) : -compareBy(sort.key, a, b)));
    }
    return ordered;
  }, [songs, tab, stageFilter, sort]);

  return (
    <div className="space-y-6">
      {songs.length > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TrackerTabs value={tab} counts={counts} onChange={setTab} />
          <div className="flex items-center gap-2">
            <StageFilter value={stageFilter} onChange={setStageFilter} />
            <div className="md:hidden">
              <SortControl sort={sort} onChange={setSort} />
            </div>
            <Button onClick={addSong} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Song
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="hidden md:flex items-center gap-3 px-3 min-h-[40px] bg-secondary/30 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="w-4 shrink-0" />
          <SortHeader label="Song" sortKey="name" sort={sort} onSort={cycleSort} width="flex-1" />
          <SortHeader label="Current Stage" sortKey="stage" sort={sort} onSort={cycleSort} width="w-36" />
          <SortHeader label="Next Action" sortKey="next" sort={sort} onSort={cycleSort} width="w-56" />
          <SortHeader label="Release Date" sortKey="release_date" sort={sort} onSort={cycleSort} width="w-32" />
          <div className="w-8 shrink-0" />
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-muted-foreground text-sm">No songs in this project yet.</p>
            <Button onClick={addSong} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Add the First Song
            </Button>
          </div>
        ) : visibleSongs.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-muted-foreground text-sm">
              {stageFilter === "all" ? EMPTY_MESSAGES[tab] : "No songs match this stage filter."}
            </p>
            {stageFilter !== "all" && (
              <Button variant="ghost" size="sm" onClick={() => setStageFilter("all")}>Clear filter</Button>
            )}
          </div>
        ) : (
          visibleSongs.map((song) => (
            <SongRow
              key={song.id}
              song={song}
              isNew={song.id === newSongId}
              moveTargets={moveTargets}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}