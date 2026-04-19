import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Trash2, ChevronRight, ChevronLeft, Music2, Zap, Clock, Library, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClipCard from "./ClipCard";
import AudioAnalysisDisplay from "./AudioAnalysisDisplay";

const VIBE_STYLES = {
  aggressive: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  emotional: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  confident: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  storytelling: { color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ContentLibrary({ projects, loading, selectedProject, onSelect, onDelete, onCreateNew }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = async (id) => {
    await onDelete(id);
    setConfirmDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dashed border-border bg-card p-20 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
          <Library className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-heading font-bold text-xl">No projects yet</p>
          <p className="text-muted-foreground text-sm mt-1">Generate your first set of clips to start building your library.</p>
        </div>
        <Button className="gap-2" onClick={onCreateNew}>
          <Plus className="h-4 w-4" /> Create First Project
        </Button>
      </motion.div>
    );
  }

  // Detail view
  if (selectedProject) {
    const vibe = selectedProject.vibe;
    const vibeStyle = VIBE_STYLES[vibe] || VIBE_STYLES.confident;
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => onSelect(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Library
          </button>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Music2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-lg truncate">{selectedProject.song_filename}</p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold capitalize border ${vibeStyle.bg} ${vibeStyle.color} ${vibeStyle.border}`}>
                {vibe} vibe
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Film className="h-3 w-3" /> {(selectedProject.clips || []).length} clips
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formatDate(selectedProject.created_date)}
              </span>
            </div>
          </div>
        </div>

        {selectedProject.audio_analysis && (
          <AudioAnalysisDisplay analysis={selectedProject.audio_analysis} selectedVibe={vibe} />
        )}

        <div>
          <h2 className="font-heading font-semibold text-lg mb-4">Clips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(selectedProject.clips || []).map((clip, i) => (
              <motion.div key={clip.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <ClipCard clip={clip} vibe={vibe} index={i} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // List view
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        <Button size="sm" className="gap-2" onClick={onCreateNew}>
          <Plus className="h-3.5 w-3.5" /> New Project
        </Button>
      </div>

      <div className="space-y-3">
        {projects.map((project, i) => {
          const vibe = project.vibe;
          const vibeStyle = VIBE_STYLES[vibe] || VIBE_STYLES.confident;
          const clipCount = (project.clips || []).length;
          const bpm = project.audio_analysis?.bpm;
          const energy = project.audio_analysis?.energy_level;

          return (
            <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl bg-card border border-border hover:border-primary/25 transition-colors overflow-hidden group">
              <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => onSelect(project)}>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Music2 className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium text-sm truncate">{project.song_filename}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold capitalize border ${vibeStyle.bg} ${vibeStyle.color} ${vibeStyle.border}`}>
                      {vibe}
                    </span>
                    <span className="text-xs text-muted-foreground">{clipCount} clips</span>
                    {bpm && <span className="text-xs text-muted-foreground">{bpm} BPM</span>}
                    {energy && <span className="text-xs text-muted-foreground capitalize">{energy} energy</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">{formatDate(project.created_date)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(project.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Clip preview strip */}
              {clipCount > 0 && (
                <div className="px-4 pb-3 flex gap-2">
                  {(project.clips || []).slice(0, 4).map((clip, ci) => (
                    <div key={ci} className={`flex-1 h-1.5 rounded-full ${vibeStyle.bg} border ${vibeStyle.border}`} />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Confirm delete dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4"
              onClick={(e) => e.stopPropagation()}>
              <div>
                <p className="font-heading font-bold text-lg">Delete project?</p>
                <p className="text-sm text-muted-foreground mt-1">This will permanently delete this project and all its clips. This can't be undone.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleDelete(confirmDelete)}>Delete</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}