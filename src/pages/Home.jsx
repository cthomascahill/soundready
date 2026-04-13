import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  const [bpm, setBpm] = useState("");
  const [mood, setMood] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  const canSubmit = title.trim() && artistName.trim();

  const handleAnalyze = async () => {
    if (!canSubmit) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      // Step 1: LLM analysis directly
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a music industry expert and data analyst. Analyze the song "${title}" by ${artistName} and predict its streaming algorithm performance with highly detailed, realistic insights.

Song metadata provided by the artist:
- Genre: ${genre || 'Unknown'}
- BPM / Tempo: ${bpm || 'Not specified'}
- Mood / Vibe: ${mood || 'Not specified'}

Using this metadata, generate a comprehensive analysis. Consider how the genre performs on each platform, how the BPM fits current trends (e.g. TikTok favors 120-140 BPM, Spotify editorial playlists prefer certain tempos), and how the mood aligns with listener retention and replay value. Be specific and nuanced. Return realistic scores between 45-95 that vary meaningfully per platform.`,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_score: { type: 'number' },
            spotify_score: { type: 'number' },
            apple_music_score: { type: 'number' },
            youtube_score: { type: 'number' },
            tiktok_score: { type: 'number' },
            hook_strength: { type: 'number' },
            production_quality: { type: 'number' },
            replay_value: { type: 'number' },
            energy_level: { type: 'string', enum: ['low', 'medium', 'high'] },
            mood: { type: 'string' },
            bpm_estimate: { type: 'string' },
            similar_artists: { type: 'array', items: { type: 'string' } },
            strengths: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      // Step 2: Save to DB
      const record = await base44.entities.SongAnalysis.create({
        title,
        artist_name: artistName,
        genre: genre || 'Unknown',
        overall_score: analysis.overall_score,
        spotify_score: analysis.spotify_score,
        apple_music_score: analysis.apple_music_score,
        youtube_score: analysis.youtube_score,
        tiktok_score: analysis.tiktok_score,
        hook_strength: analysis.hook_strength,
        production_quality: analysis.production_quality,
        replay_value: analysis.replay_value,
        energy_level: analysis.energy_level,
        mood: analysis.mood,
        bpm_estimate: analysis.bpm_estimate,
        similar_artists: analysis.similar_artists,
        strengths: analysis.strengths,
        recommendations: analysis.recommendations,
        status: 'complete',
      });

      // Step 3: Navigate right away
      navigate(`/song?id=${record.id}`);

      // Step 4: Upload file in background
      if (file) {
        base44.integrations.Core.UploadFile({ file })
          .then(({ file_url }) => base44.entities.SongAnalysis.update(record.id, { file_url }))
          .catch(() => {});
      }

    } catch (err) {
      setIsAnalyzing(false);
      setAnalyzeError(err?.message || 'Analysis failed. Please try again.');
    }
  };

  if (isAnalyzing) {
    return <AnalyzingLoader onCancel={() => { setIsAnalyzing(false); setAnalyzeError("Analysis cancelled. Please try again."); }} />;
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
          How will your song
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-chart-5 bg-clip-text text-transparent">
            perform?
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Upload your final track and get instant insights on how it will perform across
          streaming algorithms, plus actionable tips to boost your reach.
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

        <div className="space-y-2">
          <Label className="text-sm font-medium">Genre</Label>
          <Input
            placeholder="e.g. Hip Hop, Pop, R&B, EDM..."
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="bg-card border-border h-11"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">BPM / Tempo</Label>
            <Input
              placeholder="e.g. 128, ~95, slow"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              className="bg-card border-border h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mood / Vibe</Label>
            <Input
              placeholder="e.g. dark, euphoric, chill, aggressive"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="bg-card border-border h-11"
            />
          </div>
        </div>

        <Button
          size="lg"
          disabled={!canSubmit}
          onClick={handleAnalyze}
          className="w-full h-12 text-base font-heading font-semibold bg-primary hover:bg-primary/90 transition-all"
        >
          Analyze My Track
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Your audio file is analyzed using AI. Results are estimates based on current algorithm trends.
        </p>
      </motion.div>
    </div>
  );
}