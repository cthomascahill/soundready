import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";

import { Loader2, Music2, Trash2, Plus, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

const STATUS_COLORS = {
  complete: "bg-green-500/15 text-green-600 border-green-500/25",
  analyzing: "bg-primary/10 text-primary border-primary/20",
  uploading: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_LABELS = {
  complete: "Ready to Release",
  analyzing: "In Analysis",
  uploading: "Uploading",
  error: "Error",
};

export default function SongLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.SongAnalysis.filter({ created_by_id: user.id }, "-created_date", 50)
      .then((data) => { setAnalyses(data); setLoading(false); });
  }, [user]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await base44.entities.SongAnalysis.delete(id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  const filtered = analyses.filter(a =>
    !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.artist_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Song Library</h1>
          <p className="text-muted-foreground text-sm mt-1">Every song you've uploaded — click one to open its workspace.</p>
        </div>
        <Link to="/release-plan">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Upload Song
          </Button>
        </Link>
      </div>

      {analyses.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search songs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Music2 className="h-12 w-12 text-muted-foreground mx-auto opacity-30" />
          <p className="text-muted-foreground">{search ? "No songs match your search." : "No songs yet. Upload your first track."}</p>
          {!search && <Link to="/release-plan"><Button>Upload Your First Song</Button></Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/music/${a.id}`)}
              className="rounded-xl bg-card border border-border p-5 flex items-center justify-between gap-4 cursor-pointer hover:border-primary/40 hover:bg-card/80 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Music2 className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-semibold truncate">{a.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {a.artist_name}{a.genre ? ` · ${a.genre}` : ""} · {moment(a.created_date).format("MMM D, YYYY")}
                  </p>
                  <span className={`mt-1 inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[a.status] || STATUS_COLORS.complete}`}>
                    {STATUS_LABELS[a.status] || "Ready to Release"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-primary font-medium hidden sm:block">Open Workspace</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <button
                  onClick={(e) => handleDelete(e, a.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}