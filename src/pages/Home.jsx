import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import UploadZone from "../components/UploadZone";
import AnalyzingLoader from "../components/AnalyzingLoader";

export default function Home() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");
  const [songDescription, setSongDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  const canSubmit = title.trim() && artistName.trim();

  const handleAnalyze = async () => {
    if (!canSubmit) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const prompt = `You are a senior music industry analyst and streaming strategist. Analyze the following song and generate a professional launch report.

Song: "${title}"
Artist: ${artistName}
Genre: ${genre || "Not specified"}
Mood: ${mood || "Not specified"}
Energy Level: ${energyLevel || "Not specified"}
Description: ${songDescription || "Not provided"}

Return a JSON report with exactly these fields:

- overall_score: number 0-100 (streaming algorithm potential)
- spotify_score: number 0-100
- apple_music_score: number 0-100
- youtube_score: number 0-100
- tiktok_score: number 0-100
- hook_strength: number 0-100
- production_quality: number 0-100
- replay_value: number 0-100
- energy_level: one of "low", "medium", "high"
- mood: string (2-4 words)
- similar_artists: array of 4 well-known artist names in this genre
- strengths: array of 4 specific, actionable strengths
- recommendations: array of 5 specific, actionable improvement tips
- algorithm_outlook: 3-4 sentence narrative on how this song is likely to perform across streaming algorithms and why, referencing genre trends
- strongest_moments: 2-3 sentences describing what parts/elements of the song (based on genre, mood, energy) are its strongest hooks and moments for listeners
- content_ideas: 3-4 specific, platform-native content ideas for TikTok, Instagram Reels, and YouTube Shorts — describe the concept for each
- release_recommendations: 4-5 specific release strategy tips (timing, pre-save, DSP submission, rollout steps)
- playlist_pitch: A short, 3-4 sentence pitch paragraph written as if the artist is pitching this song directly to a Spotify or Apple Music playlist curator`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            spotify_score: { type: "number" },
            apple_music_score: { type: "number" },
            youtube_score: { type: "number" },
            tiktok_score: { type: "number" },
            hook_strength: { type: "number" },
            production_quality: { type: "number" },
            replay_value: { type: "number" },
            energy_level: { type: "string" },
            mood: { type: "string" },
            similar_artists: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            algorithm_outlook: { type: "string" },
            strongest_moments: { type: "string" },
            content_ideas: { type: "string" },
            release_recommendations: { type: "string" },
            playlist_pitch: { type: "string" },
          },
        },
      });

      const record = await base44.entities.SongAnalysis.create({
        title,
        artist_name: artistName,
        genre: genre || "Unknown",
        mood: result.mood,
        energy_level: result.energy_level,
        song_description: songDescription,
        overall_score: result.overall_score,
        spotify_score: result.spotify_score,
        apple_music_score: result.apple_music_score,
        youtube_score: result.youtube_score,
        tiktok_score: result.tiktok_score,
        hook_strength: result.hook_strength,
        production_quality: result.production_quality,
        replay_value: result.replay_value,
        similar_artists: result.similar_artists,
        strengths: result.strengths,
        recommendations: result.recommendations,
        algorithm_outlook: result.algorithm_outlook,
        strongest_moments: result.strongest_moments,
        content_ideas: result.content_ideas,
        release_recommendations: result.release_recommendations,
        playlist_pitch: result.playlist_pitch,
        status: "complete",
      });

      // Upload audio in background if provided
      if (file) {
        base44.integrations.Core.UploadFile({ file })
          .then(({ file_url }) => base44.entities.SongAnalysis.update(record.id, { file_url }))
          .catch(() => {});
      }

      navigate(`/song?id=${record.id}`);
    } catch (err) {
      setIsAnalyzing(false);
      setAnalyzeError("Analysis failed. Please try again.");
    }
  };

  if (isAnalyzing) {
    return <AnalyzingLoader onCancel={() => { setIsAnalyzing(false); setAnalyzeError("Analysis cancelled."); }} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Analysis
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Build your
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-chart-5 bg-clip-text text-transparent">
            Launch Plan
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Tell us about your track and get an instant AI report covering algorithm outlook,
          content ideas, release strategy, and a playlist pitch.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {analyzeError && (
          <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{analyzeError}</p>
          </div>
        )}

        {/* Audio upload — cosmetic for now */}
        <UploadZone file={file} onFileSelect={setFile} onClear={() => setFile(null)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Song Title *</Label>
            <Input
              placeholder="Enter song title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-card border-border h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Artist Name *</Label>
            <Input
              placeholder="Your artist name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="bg-card border-border h-11"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Genre</Label>
            <Input
              placeholder="e.g. Hip Hop, Pop, R&B"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-card border-border h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mood / Vibe</Label>
            <Input
              placeholder="e.g. dark, euphoric, chill"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="bg-card border-border h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Energy Level</Label>
            <Input
              placeholder="e.g. high, medium, low"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              className="bg-card border-border h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Song Description</Label>
          <Textarea
            placeholder="Describe your song — what it's about, the feeling, the story, the production style..."
            value={songDescription}
            onChange={(e) => setSongDescription(e.target.value)}
            className="bg-card border-border min-h-[100px] resize-none"
          />
        </div>

        <Button
          size="lg"
          disabled={!canSubmit}
          onClick={handleAnalyze}
          className="w-full h-12 text-base font-heading font-semibold bg-primary hover:bg-primary/90 transition-all"
        >
          Build My Launch Plan
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Results are AI-generated estimates based on current streaming algorithm trends.
        </p>
      </motion.div>
    </div>
  );
}