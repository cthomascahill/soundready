import { useState, useEffect, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SongRow from "@/components/songtracker/SongRow";
import TrackerTabs from "@/components/songtracker/TrackerTabs";
import StageFilter from "@/components/songtracker/StageFilter";
import SortControl from "@/components/songtracker/SortControl";
import { TABS, getCurrentStage, sortSongs, compareBy } from "@/lib/songStatus";

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

const EMPTY_MESSAGES = {
  active: "No songs in progress.",
  upcoming: "No songs with an upcoming release date.",
  released: "No released songs yet.",
  all: "No songs yet.",
};

export default function SongTracker() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [stageFilter, setStageFilter] = useState("all");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [newSongId, setNewSongId] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.PipelineSong.filter({ created_by_id: user.id }, "sort_order", 200)
      .then((data) => { setSongs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const addSong = async () => {
    const newSong = await base44.entities.PipelineSong.create({
      song_name: "",
      stage_write: false,
      stage_record: false,
      stage_mix: false,
      stage_master: false,
      stage_review: false,
      stage_artwork: false,
      stage_submit: false,
      stage_released: false,
      notes: "",
      sort_order: songs.length,
    });
    setSongs((prev) => [...prev, newSong]);
    // Jump to Active so the new song is visible, opened and ready to name
    setTab("active");
    setStageFilter("all");
    setNewSongId(newSong.id);
  };

  const updateSong = useCallback(async (id, changes) => {
    setSongs((prev) => prev.map((s) => s.id === id ? { ...s, ...changes } : s));
    await base44.entities.PipelineSong.update(id, changes);
  }, []);

  const deleteSong = async (id) => {
    setSongs((prev) => prev.filter((s) => s.id !== id));
    await base44.entities.PipelineSong.delete(id);
  };

  const changeTab = (value) => { setTab(value); setNewSongId(null); };
  const changeFilter = (value) => { setStageFilter(value); setNewSongId(null); };

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
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Pipeline</p>
            <h1 className="font-heading text-4xl font-bold">Song Tracker</h1>
            <p className="text-muted-foreground text-sm mt-1">Track every song from idea to release.</p>
          </div>
          <Button onClick={addSong} className="gap-2">
            <Plus className="h-4 w-4" /> Add Song
          </Button>
        </div>

        {/* Tabs + stage filter */}
        {songs.length > 0 && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <TrackerTabs value={tab} counts={counts} onChange={changeTab} />
            <div className="flex items-center gap-2">
              <StageFilter value={stageFilter} onChange={changeFilter} />
              <div className="md:hidden">
                <SortControl sort={sort} onChange={setSort} />
              </div>
            </div>
          </div>
        )}

        {/* Song list */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="hidden md:flex items-center gap-3 px-3 min-h-[40px] bg-secondary/30 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="w-4 shrink-0" />
            <SortHeader label="Song" sortKey="name" sort={sort} onSort={cycleSort} width="flex-1" />
            <SortHeader label="Current Stage" sortKey="stage" sort={sort} onSort={cycleSort} width="w-36" />
            <SortHeader label="Next Action" sortKey="next" sort={sort} onSort={cycleSort} width="w-56" />
            <SortHeader label="Release Date" sortKey="release_date" sort={sort} onSort={cycleSort} width="w-32" />
            <div className="w-8 shrink-0" />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <p className="text-muted-foreground text-sm">No songs in your tracker yet.</p>
              <Button onClick={addSong} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Add Your First Song
              </Button>
            </div>
          ) : visibleSongs.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-muted-foreground text-sm">
                {stageFilter === "all" ? EMPTY_MESSAGES[tab] : "No songs match this stage filter."}
              </p>
              {stageFilter !== "all" && (
                <Button variant="ghost" size="sm" onClick={() => changeFilter("all")}>Clear filter</Button>
              )}
            </div>
          ) : (
            visibleSongs.map((song) => (
              <SongRow
                key={song.id}
                song={song}
                isNew={song.id === newSongId}
                onUpdate={updateSong}
                onDelete={deleteSong}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}