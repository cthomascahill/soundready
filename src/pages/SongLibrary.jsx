import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music2, Plus, Search, Grid, List, Play, Pause, ListPlus,
  SlidersHorizontal, X, Loader2, MoreHorizontal, Trash2, Pencil
} from "lucide-react";
import { resolveAudioSource } from "@/lib/audioPlayback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SongWorkspaceModal from "@/components/vault/SongWorkspaceModal";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { VAULT_STATUSES as STATUSES, vaultStatusDot } from "@/lib/vaultStatus";
import AlbumDemoLinkCard from "@/components/vault/AlbumDemoLinkCard";
import ProjectFolders from "@/components/vault/ProjectFolders";
import VaultCapPrompt, { VaultUsageBadge, FREE_VAULT_CAP } from "@/components/vault/VaultCapPrompt";
import BulkAddSongs from "@/components/vault/BulkAddSongs";
import DropSongZone from "@/components/vault/DropSongZone";
import SamFileModal from "@/components/vault/SamFileModal";
import PageDropOverlay from "@/components/vault/PageDropOverlay";
import VaultArtwork from "@/components/vault/VaultArtwork";
import { isProOrAbove } from "@/lib/tier";
import { mirrorVaultSongsToTracker } from "@/lib/vaultTrackerSync";

const GENRES = ["Hip-Hop", "R&B", "Pop", "Trap", "Drill", "Afrobeats", "Gospel", "Country", "Rock", "Electronic", "Jazz", "Soul", "Alternative", "Other"];

function AudioMiniPlayer({ url, name }) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);
  const toggle = async (e) => {
    e.stopPropagation();
    if (playing) { audioRef.current.pause(); setPlaying(false); return; }
    setLoading(true);
    try {
      const playable = await resolveAudioSource(url);
      audioRef.current.src = playable;
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
    setLoading(false);
  };
  return (
    <button onClick={toggle} className="h-9 w-9 rounded-full bg-foreground/10 border border-foreground/15 flex items-center justify-center text-foreground hover:bg-foreground/20 transition-colors shrink-0">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      <audio ref={audioRef} onEnded={() => setPlaying(false)} />
    </button>
  );
}

function SongCardMenu({ song, onOpen, onDelete }) {
  return (
    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            title="More"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onOpen(song)} className="gap-2">
            <Pencil className="h-3.5 w-3.5" /> Edit details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(song.id)} className="gap-2 text-destructive focus:text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Delete song
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// One song, at rest: artwork, title, stage and play. Everything else lives in
// the song workspace the card opens.
function SongCard({ song, onOpen, viewMode, onDelete }) {
  const menu = <SongCardMenu song={song} onOpen={onOpen} onDelete={onDelete} />;
  const status = (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${vaultStatusDot(song.status)}`} />
      {song.status}
    </span>
  );

  if (viewMode === "list") {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        onClick={() => onOpen(song)}
        className="flex items-center gap-4 px-5 py-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-card/80 transition-all cursor-pointer">
        <VaultArtwork url={song.artwork_url} title={song.title} className="h-14 w-14 rounded-xl shrink-0 object-cover" iconClass="h-5 w-5" />
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-heading font-bold truncate">{song.title}</p>
          {status}
        </div>
        {song.file_url && <AudioMiniPlayer url={song.file_url} name={song.title} />}
        {menu}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      onClick={() => onOpen(song)}
      className="rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer p-4 flex items-start gap-4">
      <div className="relative shrink-0">
        <VaultArtwork url={song.artwork_url} title={song.title} className="h-20 w-20 rounded-xl shrink-0 object-cover" iconClass="h-8 w-8" />
        {song.file_url && (
          <div className="absolute -bottom-2 -right-2" onClick={(e) => e.stopPropagation()}>
            <AudioMiniPlayer url={song.file_url} name={song.title} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className="font-heading font-bold leading-snug line-clamp-2 flex-1 min-w-0">{song.title}</p>
          {menu}
        </div>
        <div className="mt-2">{status}</div>
      </div>
    </motion.div>
  );
}

export default function SongLibrary() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalSong, setModalSong] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [activeProject, setActiveProject] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showCapPrompt, setShowCapPrompt] = useState(false);
  const [pipelineSongs, setPipelineSongs] = useState([]);
  const [showBulk, setShowBulk] = useState(false);
  const [dropQueue, setDropQueue] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.SongVault.filter({ created_by_id: user.id }, "-created_date", 200),
      base44.entities.SongProject.filter({ created_by_id: user.id }, "name", 100),
      base44.entities.PipelineSong.filter({ created_by_id: user.id }, "sort_order", 500),
    ]).then(([s, p, pipe]) => { setSongs(s); setProjects(p); setPipelineSongs(pipe); setLoading(false); });
  }, [user]);

  const handleModalSave = async (song, type) => {
    if (type === "create") {
      setSongs(prev => [song, ...prev]);
      // New vault songs also land in the Tracker with matching stages
      const piped = await mirrorVaultSongsToTracker([song]);
      if (piped.length) setPipelineSongs(prev => [...prev, ...piped]);
    } else {
      setSongs(prev => prev.map(s => s.id === song.id ? song : s));
    }
  };

  const handleDelete = async (id) => {
    const song = songs.find(s => s.id === id);
    if (song && !window.confirm(`Delete "${song.title}" from your Vault?`)) return;
    await base44.entities.SongVault.delete(id);
    setSongs(prev => prev.filter(s => s.id !== id));
  };

  const handleProjectCreate = (p) => setProjects(prev => [...prev, p]);

  const handleProjectDelete = async (id) => {
    await base44.entities.SongProject.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject === id) setActiveProject(null);
  };

  const isFree = !isProOrAbove(user);
  const atCap = isFree && songs.length >= FREE_VAULT_CAP;
  // Songs also in the Tracker, matched by title, keeps the two views in unison
  const pipelineByTitle = new Map();
  pipelineSongs.forEach((p) => {
    const key = p.song_name?.toLowerCase().trim();
    if (key && !pipelineByTitle.has(key)) pipelineByTitle.set(key, p);
  });
  const openNew = () => {
    if (atCap) { setShowCapPrompt(true); return; }
    setModalSong(null); setShowModal(true);
  };
  const openBulk = () => {
    if (atCap) { setShowCapPrompt(true); return; }
    setShowBulk(true);
  };
  // Drag-and-drop intake, a dropped song goes straight to Sam's two-question flow
  const handleFilesDropped = (files) => {
    if (atCap) { setShowCapPrompt(true); return; }
    setDropQueue((q) => [...q, ...files]);
  };
  const handleFiled = ({ song, tracker }) => {
    setSongs((prev) => [song, ...prev]);
    if (tracker) setPipelineSongs((prev) => [...prev, tracker]);
  };
  const openEdit = (song) => { setModalSong(song); setShowModal(true); };

  let filtered = songs.filter(s => {
    if (activeProject && !s.project_ids?.includes(activeProject)) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    if (filterGenre && s.genre !== filterGenre) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.title?.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q)) ||
        s.producer?.toLowerCase().includes(q) ||
        s.genre?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (sortBy === "newest") filtered = [...filtered].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  else if (sortBy === "oldest") filtered = [...filtered].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  else if (sortBy === "title") filtered = [...filtered].sort((a, b) => a.title?.localeCompare(b.title));
  else if (sortBy === "status") filtered = [...filtered].sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status));

  const hasFilters = filterStatus || filterGenre || search;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Your Catalog</p>
            <h1 className="font-heading text-3xl font-bold">Vault</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{songs.length} {songs.length === 1 ? "song" : "songs"}</p>
          </div>
          <div className="flex items-center gap-3">
            {isFree && <VaultUsageBadge count={songs.length} label="songs" />}
            <Button variant="outline" onClick={openBulk} className="gap-2 border-zinc-700">
              <ListPlus className="h-4 w-4" /> Bulk Add
            </Button>
            <Button onClick={openNew} className="gap-2">
              <Plus className="h-4 w-4" /> Add Song
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Project folders, tap one to scope the catalog */}
          <ProjectFolders
            projects={projects}
            songs={songs}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            onProjectCreate={handleProjectCreate}
            onProjectDelete={handleProjectDelete}
          />

          {/* Drop a song in, Sam files it */}
          <DropSongZone onFiles={handleFilesDropped} />

            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input placeholder="Search songs, tags, producer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-zinc-800" />
              </div>
              <button onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm transition-colors ${showFilters || hasFilters ? "border-foreground/40 text-foreground bg-secondary" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"}`}>
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </button>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">A–Z</option>
                <option value="status">Status</option>
              </select>
              <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
                <button onClick={() => setViewMode("grid")} className={`h-9 px-2.5 transition-colors ${viewMode === "grid" ? "bg-secondary text-foreground" : "text-zinc-500 hover:text-foreground"}`}>
                  <Grid className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode("list")} className={`h-9 px-2.5 transition-colors ${viewMode === "list" ? "bg-secondary text-foreground" : "text-zinc-500 hover:text-foreground"}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Expanded filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 overflow-hidden">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setFilterStatus("")}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${!filterStatus ? "bg-foreground/10 text-foreground border-foreground/30" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                      All Statuses
                    </button>
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => setFilterStatus(s === filterStatus ? "" : s)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterStatus === s ? "bg-foreground/10 text-foreground border-foreground/30" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)}
                    className="h-7 rounded-full border border-border bg-card px-3 text-xs text-foreground focus:outline-none">
                    <option value="">All Genres</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {hasFilters && (
                    <button onClick={() => { setFilterStatus(""); setFilterGenre(""); setSearch(""); }}
                      className="text-xs px-3 py-1 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-1 transition-colors">
                      <X className="h-3 w-3" /> Clear
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Album demo link for this project */}
            {activeProject && (
              <AlbumDemoLinkCard
                project={projects.find(p => p.id === activeProject)}
                songs={songs}
              />
            )}

            {/* Song Grid/List */}
            {loading ? (
              <div className="flex justify-center py-24">
                <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Music2 className="h-12 w-12 text-zinc-700 mx-auto" />
                <p className="text-zinc-500">{search || hasFilters ? "No songs match your filters." : "Drop your first song in."}</p>
                {!search && !hasFilters && (
                  <Button onClick={openBulk} variant="outline" size="sm" className="border-zinc-700 gap-2">
                    <ListPlus className="h-4 w-4" /> Bulk add
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(song => (
                  <SongCard key={song.id} song={song} onOpen={openEdit} viewMode="grid" onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(song => (
                  <SongCard key={song.id} song={song} onOpen={openEdit} viewMode="list" onDelete={handleDelete} />
                ))}
              </div>
            )}

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SongWorkspaceModal
          song={modalSong}
          pipeline={modalSong ? pipelineByTitle.get(modalSong.title?.toLowerCase().trim()) : null}
          projects={projects}
          onClose={() => { setShowModal(false); setModalSong(null); }}
          onSave={handleModalSave}
        />
      )}

      {showCapPrompt && (
        <VaultCapPrompt kind="song" onClose={() => setShowCapPrompt(false)} />
      )}

      {/* Drag-and-drop anywhere on the page also starts Sam's intake */}
      <PageDropOverlay onFiles={handleFilesDropped} />

      {dropQueue.length > 0 && (
        <SamFileModal
          key={`${dropQueue[0].name}-${dropQueue[0].size}`}
          file={dropQueue[0]}
          onFiled={handleFiled}
          onAddArtwork={(song) => { setDropQueue([]); openEdit(song); }}
          onClose={() => setDropQueue((q) => q.slice(1))}
        />
      )}

      {showBulk && (
        <BulkAddSongs
          max={isFree ? Math.max(0, FREE_VAULT_CAP - songs.length) : null}
          onClose={() => setShowBulk(false)}
          onCreated={async (created) => {
            setSongs(prev => [...created, ...prev]);
            const piped = await mirrorVaultSongsToTracker(created);
            if (piped.length) setPipelineSongs(prev => [...prev, ...piped]);
          }}
        />
      )}
    </div>
  );
}