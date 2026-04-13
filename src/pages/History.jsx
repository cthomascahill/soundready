import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Music, ChevronRight, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const items = await base44.entities.SongAnalysis.list("-created_date", 50);
      setAnalyses(items);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    await base44.entities.SongAnalysis.delete(id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-chart-4";
    if (score >= 40) return "text-chart-5";
    return "text-destructive";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-heading text-3xl font-bold mb-2">Analysis History</h1>
        <p className="text-muted-foreground">
          All your previous song analyses in one place.
        </p>
      </motion.div>

      {analyses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Music className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading font-semibold text-lg mb-2">No analyses yet</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Upload your first track to get started.
          </p>
          <Link to="/">
            <Button className="gap-2">
              <Music className="h-4 w-4" />
              Analyze a Track
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {analyses.map((analysis, i) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl bg-card border border-border p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Music className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold truncate">{analysis.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{analysis.artist_name}</span>
                    <span>·</span>
                    <span>{analysis.genre}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {moment(analysis.created_date).fromNow()}
                    </span>
                  </div>
                </div>

                {analysis.status === "complete" && analysis.overall_score != null && (
                  <div className="text-right shrink-0">
                    <span className={`font-heading text-2xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                      {analysis.overall_score}
                    </span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">score</p>
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(analysis.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {analysis.status === "complete" && (
                    <Link to={`/song?id=${analysis.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}