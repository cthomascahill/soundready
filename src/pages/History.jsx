import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Loader2, Music, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SongAnalysis.list("-created_date", 50)
      .then((data) => { setAnalyses(data); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    await base44.entities.SongAnalysis.delete(id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Library</h1>
          <p className="text-muted-foreground text-sm mt-1">Your saved release plans</p>
        </div>
        <Link to="/">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Plan
          </Button>
        </Link>
      </div>

      {analyses.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Music className="h-12 w-12 text-muted-foreground mx-auto opacity-30" />
          <p className="text-muted-foreground">No saved plans yet.</p>
          <Link to="/"><Button>Generate Your First Plan</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl bg-card border border-border p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-semibold truncate">{a.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {a.artist_name} · {a.genre} · {moment(a.created_date).format("MMM D, YYYY")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}