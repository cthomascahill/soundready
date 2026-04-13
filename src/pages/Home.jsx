import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import UploadZone from "../components/UploadZone";
import { convertToUploadableAudio } from "../utils/audioConverter";
import AnalyzingLoader from "../components/AnalyzingLoader";

export default function Home() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const canSubmit = file && title.trim() && artistName.trim();

  const handleAnalyze = async () => {
    if (!canSubmit) return;
    setIsAnalyzing(true);

    // Convert WAV → webm if needed, then upload
    const uploadableFile = await convertToUploadableAudio(file);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadableFile });

    // Create initial record
    const record = await base44.entities.SongAnalysis.create({
      title,
      artist_name: artistName,
      genre: genre || "Unknown",
      file_url,
      status: "analyzing",
    });

    // Use AI to analyze the song
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a music industry algorithm expert who analyzes songs for their potential performance on streaming platforms and social media algorithms.

Analyze this song with the following details:
- Title: "${title}"
- Artist: "${artistName}"
- Genre: "${genre || "Not specified"}"

Based on current music algorithm trends (Spotify, Apple Music, YouTube, TikTok), provide a comprehensive analysis. Consider factors like:
- How well the genre/style performs on each platform
- Current trends in music algorithms
- What makes songs go viral or get picked up by recommendation engines
- Production quality indicators for the genre
- Hook potential and replay value

Be specific and actionable in your recommendations. Reference real artists that are similar in sound/style.`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number", description: "Overall algorithm performance score 0-100" },
          spotify_score: { type: "number", description: "Spotify algorithm score 0-100" },
          apple_music_score: { type: "number", description: "Apple Music algorithm score 0-100" },
          youtube_score: { type: "number", description: "YouTube algorithm score 0-100" },
          tiktok_score: { type: "number", description: "TikTok algorithm score 0-100" },
          similar_artists: { type: "array", items: { type: "string" }, description: "5-7 similar artists" },
          strengths: { type: "array", items: { type: "string" }, description: "3-5 specific strengths of the song" },
          recommendations: { type: "array", items: { type: "string" }, description: "3-5 specific actionable recommendations to improve algorithm performance" },
          energy_level: { type: "string", enum: ["low", "medium", "high"] },
          mood: { type: "string", description: "One or two word mood descriptor" },
          bpm_estimate: { type: "string", description: "Estimated BPM range as a string like '120-130'" },
          hook_strength: { type: "number", description: "Hook/catchiness score 0-100" },
          production_quality: { type: "number", description: "Production quality score 0-100" },
          replay_value: { type: "number", description: "Replay value score 0-100" },
        },
      },
      file_urls: [file_url],
    });

    // Update the record with analysis results
    await base44.entities.SongAnalysis.update(record.id, {
      ...analysis,
      status: "complete",
    });

    navigate(`/song?id=${record.id}`);
  };

  if (isAnalyzing) {
    return <AnalyzingLoader />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero section */}
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

      {/* Upload form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
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