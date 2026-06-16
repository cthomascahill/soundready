import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music2, Plus, Search, Grid, List, Play, Pause, Tag,
  Folder, SlidersHorizontal, X, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";
import SongCardModal from "@/components/vault/SongCardModal";
import ProjectsSidebar from "@/components/vault/ProjectsSidebar";

const STATUS_COLORS = {
  Idea: "bg-zinc-700/50 text-zinc-300 border-zinc-600",
  Demo: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  Recorded: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Mixed: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  Mastered: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  Released: "bg-green-500/15 text-green-400 border-green-500/25",
};

const STATUSES = ["Idea", "Demo", "Recorded", "Mixed", "Mastered", "Released"];
const GENRES = ["Hip-Hop", "R&B", "Pop", "Trap", "Drill", "Afrobeats", "Gospel", "Country", "Rock", "Electronic", "Jazz", "Soul", "Alternative", "Other"];

function AudioMiniPlayer({ url, name }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const toggle = (e) => {
    e.stopPropagation();
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };
  return (
    <button onClick={toggle} className="h-7 w-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors shrink-0">
      {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
    </button>
  );
}

function SongCard({ song, onEdit, viewMode }) {
  if (viewMode === "list") {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        onClick={() => onEdit(song)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-card/80 transition-all cursor-pointer">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Music2 className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{song.title}</p>
          <p className="text-xs text-zinc-500 truncate">
            {[song.producer && `Prod. ${song.producer}`, song.genre].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {song.moods?.slice(0, 2).map(m => (
            <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 hidden sm:inline">{m}</span>
          ))}
          {song.tags?.slice(0, 1).map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 hidden md:inline">{t}</span>
          ))}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[song.status] || STATUS_COLORS.Demo}`}>
            {song.status}
          </span>
          {song.file_url && <AudioMiniPlayer url={song.file_url} name={song.title} />}
          <span className="text-xs text-zinc-600 hidden lg:block">{moment(song.created_date).format("MMM D")}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      onClick={() => onEdit(song)}
      className="rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-card/80 transition-all cursor-pointer p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Music2 className="h-5 w-5 text-primary" />
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${STATUS_COLORS[song.status] || STATUS_COLORS.Demo}`}>
          {song.status}
        </span>
      </div>
      <div>
        <p className="font-heading font-semibold truncate">{song.title}</p>
        {song.producer && <p className="text-xs text-zinc-500 truncate">Prod. {song.producer}</p>}
        {song.genre && <p className="text-xs text-zinc-600">{song.genre}</p>}
      </div>
      <div className="flex flex-wrap gap-1">
        {song.moods?.slice(0, 3).map(m => (
          <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{m}</span>
        ))}
        {song.tags?.slice(0, 2).map(t => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1">
            <Tag className="h-2.5 w-2.5" />{t}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">{moment(song.created_date).format("MMM D, YYYY")}</span>
        {song.file_url && <AudioMiniPlayer url={song.file_url} name={song.title} />}
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
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.SongVault.filter({ created_by_id: user.id }, "-created_date", 200),
      base44.entities.SongProject.filter({ created_by_id: user.id }, "name", 100),
    ]).then(([s, p]) => { setSongs(s); setProjects(p); setLoading(false); });
  }, [user]);

  const handleModalSave = (song, type) => {
    if (type === "create") setSongs(prev => [song, ...prev]);
    else setSongs(prev => prev.map(s => s.id === song.id ? song : s));
  };

  const handleDelete = async (id) => {
    await base44.entities.SongVault.delete(id);
    setSongs(prev => prev.filter(s => s.id !== id));
  };

  const handleProjectCreate = (p) => setProjects(prev => [...prev, p]);

  const handleProjectDelete = async (id) => {
    await base44.entities.SongProject.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject === id) setActiveProject(null);
  };

  const openNew = () => { setModalSong(null); setShowModal(true); };
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

  const activeProjectName = activeProject ? projects.find(p => p.id === activeProject)?.name : "All Songs";
  const hasFilters = filterStatus || filterGenre || search;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">Vault</p>
            <h1 className="font-heading text-3xl font-bold">Song Library</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{songs.length} songs · your personal music filing cabinet</p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> Add Song
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-52 shrink-0 hidden md:block">
              <ProjectsSidebar
                projects={projects}
                songs={songs}
                activeProject={activeProject}
                setActiveProject={setActiveProject}
                onProjectCreate={handleProjectCreate}
                onProjectDelete={handleProjectDelete}
              />
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input placeholder="Search songs, tags, producer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-zinc-800" />
              </div>
              <button onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm transition-colors ${showFilters || hasFilters ? "border-primary/40 text-primary bg-primary/5" : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"}`}>
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </button>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="h-9 rounded-lg border border-zinc-800 bg-card px-3 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">A–Z</option>
                <option value="status">Status</option>
              </select>
              <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
                <button onClick={() => setViewMode("grid")} className={`h-9 px-2.5 transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-zinc-500 hover:text-white"}`}>
                  <Grid className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode("list")} className={`h-9 px-2.5 transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-zinc-500 hover:text-white"}`}>
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
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${!filterStatus ? "bg-primary text-black border-primary" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                      All Statuses
                    </button>
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => setFilterStatus(s === filterStatus ? "" : s)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterStatus === s ? "bg-primary text-black border-primary" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)}
                    className="h-7 rounded-full border border-zinc-700 bg-zinc-900 px-3 text-xs text-zinc-300 focus:outline-none">
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

            {/* Project label */}
            {activeProject && (
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{activeProjectName}</span>
                <button onClick={() => setActiveProject(null)} className="text-zinc-600 hover:text-zinc-400"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}

            {/* Song Grid/List */}
            {loading ? (
              <div className="flex justify-center py-24">
                <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 space-y-4">
                <Music2 className="h-12 w-12 text-zinc-700 mx-auto" />
                <p className="text-zinc-500">{search || hasFilters ? "No songs match your filters." : "Your vault is empty. Add your first song."}</p>
                {!search && !hasFilters && (
                  <Button onClick={openNew} variant="outline" className="border-zinc-700 gap-2">
                    <Plus className="h-4 w-4" /> Add Your First Song
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(song => (
                  <SongCard key={song.id} song={song} onEdit={openEdit} viewMode="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(song => (
                  <SongCard key={song.id} song={song} onEdit={openEdit} viewMode="list" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SongCardModal
          song={modalSong}
          projects={projects}
          onClose={() => { setShowModal(false); setModalSong(null); }}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}