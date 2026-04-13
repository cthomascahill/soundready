import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ArrowLeft, Music, Share2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScoreRing from "../components/ScoreRing";
import PlatformScores from "../components/PlatformScores";
import SimilarArtists from "../components/SimilarArtists";
import SongAttributes from "../components/SongAttributes";
import Recommendations from "../components/Recommendations";

export default function Results() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const items = await base44.entities.SongAnalysis.filter({ id });
      if (items.length > 0) {
        setAnalysis(items[0]);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Analysis not found.</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">Go back</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold">{analysis.title}</h1>
            <p className="text-sm text-muted-foreground">
              {analysis.artist_name} · {analysis.genre}
            </p>
          </div>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Analyze Another
          </Button>
        </Link>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border p-8 mb-6 flex flex-col sm:flex-row items-center gap-8"
      >
        <ScoreRing score={analysis.overall_score || 0} size={160} color="primary" />
        <div className="text-center sm:text-left">
          <h2 className="font-heading text-xl font-semibold mb-2">Overall Algorithm Score</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            {analysis.overall_score >= 80
              ? "Your track has excellent potential to perform well across streaming algorithms. It aligns strongly with current trends."
              : analysis.overall_score >= 60
              ? "Your track has good potential but there are specific areas you can optimize to significantly boost its algorithmic performance."
              : analysis.overall_score >= 40
              ? "Your track has some strengths but needs adjustments to better align with platform algorithms. Check the recommendations below."
              : "Your track may struggle with algorithmic discovery. Consider the recommendations below to improve its reach."}
          </p>
        </div>
      </motion.div>

      {/* Grid layout for results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlatformScores analysis={analysis} />
        <SongAttributes analysis={analysis} />
        <SimilarArtists artists={analysis.similar_artists} />
        <Recommendations
          strengths={analysis.strengths}
          recommendations={analysis.recommendations}
        />
      </div>
    </div>
  );
}