import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, BookmarkCheck, Loader2 } from "lucide-react";
import ReportSection from "../components/ReportSection";
import AlgorithmOutlook from "../components/report/AlgorithmOutlook";
import BestClipMoments from "../components/report/BestClipMoments";
import ContentVideoIdeas from "../components/report/ContentVideoIdeas";
import ReleaseRecommendations from "../components/report/ReleaseRecommendations";
import PlaylistPitch from "../components/report/PlaylistPitch";
import SocialCaptions from "../components/report/SocialCaptions";

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!state?.report) {
    navigate("/");
    return null;
  }

  const { report, song } = state;

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.SongAnalysis.create({
      title: song.title,
      artist_name: song.artist,
      genre: song.genre,
      mood: song.mood,
      energy_level: song.energy.toLowerCase(),
      song_description: song.description,
      algorithm_outlook: report.algorithm_outlook?.join("\n"),
      content_ideas: report.content_video_ideas?.map((v) => `${v.title} (${v.platform}): ${v.description}`).join("\n\n"),
      release_recommendations: `${report.release_day} — ${report.release_day_reason}\n\n` + (report.pre_release_plan || []).map((d) => `${d.day}: ${d.action}`).join("\n"),
      playlist_pitch: report.playlist_pitch,
      similar_artists: report.similar_artists,
      status: "complete",
    });
    setSaved(true);
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Release Plan Ready</p>
          <h1 className="font-heading text-4xl font-bold">{song.title}</h1>
          <p className="text-muted-foreground">{song.artist} · {song.genre} · {song.mood} · {song.energy} Energy</p>
        </motion.div>

        {/* Sections */}
        <AlgorithmOutlook data={report.algorithm_outlook} />
        <BestClipMoments data={report.best_clip_moments} />
        <ContentVideoIdeas data={report.content_video_ideas} />
        <ReleaseRecommendations
          releaseDay={report.release_day}
          releaseDayReason={report.release_day_reason}
          plan={report.pre_release_plan}
        />
        <PlaylistPitch
          pitch={report.playlist_pitch}
          tags={report.genre_mood_tags}
          artists={report.similar_artists}
        />
        <SocialCaptions captions={report.captions} />

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 pt-4"
        >
          <Button
            size="lg"
            onClick={handleSave}
            disabled={saving || saved}
            className="flex-1 h-12 font-heading font-semibold"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
            ) : saved ? (
              <><BookmarkCheck className="h-4 w-4 mr-2" />Saved to Library</>
            ) : (
              <><BookmarkCheck className="h-4 w-4 mr-2" />Save to Library</>
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/")}
            className="flex-1 h-12 font-heading font-semibold"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </motion.div>
      </div>
    </div>
  );
}