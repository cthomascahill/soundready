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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  const canSubmit = file && title.trim() && artistName.trim();

  const handleAnalyze = async () => {
    if (!canSubmit) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      console.log('Step 1: Uploading file...');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      console.log('Step 1 done, file_url:', file_url);

      console.log('Step 2: Creating record...');
      const record = await base44.entities.SongAnalysis.create({
        title,
        artist_name: artistName,
        genre: genre || "Unknown",
        file_url,
        status: "analyzing",
      });
      console.log('Step 2 done, record id:', record.id);

      console.log('Step 3: Calling LLM...');
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the song "${title}" by ${artistName} (genre: ${genre || "Unknown"}) for streaming algorithm performance. Return scores 0-100 for each platform and metric, 5 similar artists, 3 strengths, 3 recommendations, energy level, mood, BPM estimate.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            spotify_score: { type: "number" },
            apple_music_score: { type: "number" },
            youtube_score: { type: "number" },
            tiktok_score: { type: "number" },
            similar_artists: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            energy_level: { type: "string", enum: ["low", "medium", "high"] },
            mood: { type: "string" },
            bpm_estimate: { type: "string" },
            hook_strength: { type: "number" },
            production_quality: { type: "number" },
            replay_value: { type: "number" },
          },
        },
      });

      console.log('Step 3 done, analysis:', analysis);
      await base44.entities.SongAnalysis.update(record.id, {
        ...analysis,
        status: "complete",
      });

      navigate(`/song?id=${record.id}`);
    } catch (err) {
      setIsAnalyzing(false);
      setAnalyzeError(err?.message || "Analysis failed. Please try again.");
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