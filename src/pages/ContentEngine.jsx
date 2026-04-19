import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Zap, Film, Download, RefreshCw, Music2, Play, Check, ChevronRight, Flame, Heart, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClipCard from "@/components/contentengine/ClipCard";
import VibeSelector from "@/components/contentengine/VibeSelector";
import AudioAnalysisDisplay from "@/components/contentengine/AudioAnalysisDisplay";

const STEPS = ["upload", "vibe", "analyzing", "results"];

export default function ContentEngine() {
  const [step, setStep] = useState("upload");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [audioAnalysis, setAudioAnalysis] = useState(null);
  const [clips, setClips] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const fileRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;
    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/x-wav", "audio/wave"];
    const validExt = file.name.match(/\.(mp3|wav)$/i);
    if (!validExt) {
      alert("Please upload an MP3 or WAV file.");
      return;
    }
    setUploading(true);
    setUploadedFile(file);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFileUrl(file_url);
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
    setStep("vibe");
  };

  const handleGenerate = async () => {
    if (!selectedVibe) return;
    setStep("analyzing");
    setGenerating(true);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((p) => Math.min(p + Math.random() * 12, 88));
    }, 800);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI music video strategist. Analyze this song upload and generate a complete Content Engine output.

Song file: ${uploadedFile?.name || "uploaded track"}
Selected vibe: ${selectedVibe}

Generate a realistic, detailed analysis as if you processed the actual audio. Make it feel specific and accurate.

Return a JSON object with:
- audio_analysis: {
    bpm: number (realistic for the vibe, e.g. aggressive=140-175, emotional=70-95, confident=120-140, storytelling=90-115),
    energy_level: "low" | "medium" | "high" | "explosive",
    key: string (e.g. "C minor"),
    detected_vibe: string (one of: aggressive, emotional, confident, storytelling),
    hook_start: number (seconds, e.g. 32),
    hook_end: number (seconds, e.g. 44),
    hook_description: string (1-2 sentences describing the most impactful section),
    selected_lyrics: string (2 powerful lyric lines that would overlay well on video),
    tone_description: string (2-3 sentences about the emotional tone)
  }
- clips: array of exactly 4 objects, each with:
    id: number (1-4)
    title: string (e.g. "Hook Drop — Dark Cinematic")
    duration: number (between 8 and 15)
    visual_style: string (evocative description of the visual concept, 1-2 sentences)
    footage_tags: array of 4-6 strings (specific visual elements, e.g. "wolf in slow motion", "neon rain streets", "lone figure silhouette")
    text_style: one of "bold_caption" | "timed_lyric" | "minimal_quote"
    text_style_label: string (human-readable, e.g. "Bold Caption", "Timed Lyric", "Minimal Quote")
    lyric_overlay: string (the specific lyric line(s) for this clip)
    color_grade: string (e.g. "Cold blue tones, high contrast", "Warm amber desaturated")
    motion_style: string (e.g. "Slow zoom + quick cuts on beat", "Parallax pan, cinematic")
    hook_section: string (e.g. "0:32 - 0:44")
    mood_score: number (1-10)
    unique_angle: string (what makes this clip stand out from the others, 1 sentence)

Make all 4 clips use different visuals, text styles, and feel unique. They should feel like a social media strategist made them specifically for this song and vibe.`,
        response_json_schema: {
          type: "object",
          properties: {
            audio_analysis: {
              type: "object",
              properties: {
                bpm: { type: "number" },
                energy_level: { type: "string" },
                key: { type: "string" },
                detected_vibe: { type: "string" },
                hook_start: { type: "number" },
                hook_end: { type: "number" },
                hook_description: { type: "string" },
                selected_lyrics: { type: "string" },
                tone_description: { type: "string" },
              },
            },
            clips: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  title: { type: "string" },
                  duration: { type: "number" },
                  visual_style: { type: "string" },
                  footage_tags: { type: "array", items: { type: "string" } },
                  text_style: { type: "string" },
                  text_style_label: { type: "string" },
                  lyric_overlay: { type: "string" },
                  color_grade: { type: "string" },
                  motion_style: { type: "string" },
                  hook_section: { type: "string" },
                  mood_score: { type: "number" },
                  unique_angle: { type: "string" },
                },
              },
            },
          },
        },
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setAudioAnalysis(result.audio_analysis);
      setClips(result.clips || []);

      setTimeout(() => {
        setStep("results");
        setGenerating(false);
      }, 600);
    } catch (e) {
      clearInterval(progressInterval);
      setGenerating(false);
      setStep("vibe");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setUploadedFile(null);
    setUploadedFileUrl(null);
    setSelectedVibe(null);
    setAudioAnalysis(null);
    setClips([]);
    setGenerationProgress(0);
  };

  const handleChangeVibe = () => {
    setStep("vibe");
    setClips([]);
    setAudioAnalysis(null);
  };

  const handleRegenerate = () => {
    setStep("analyzing");
    setClips([]);
    setAudioAnalysis(null);
    handleGenerate();
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs text-primary uppercase tracking-widest font-medium">AI-Powered</p>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">NEW</span>
          </div>
          <h1 className="font-heading text-4xl font-bold">Content Engine</h1>
          <p className="text-muted-foreground">Upload a song. Select a vibe. Get 4 ready-to-post short-form video concepts — built for TikTok, Reels &amp; Shorts.</p>
        </motion.div>

        {/* Step: Upload */}
        {step === "upload" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div
              className="rounded-2xl border-2 border-dashed border-border hover:border-primary/40 bg-card transition-all cursor-pointer p-16 text-center space-y-4 group"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]); }}
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                {uploading ? (
                  <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Upload className="h-7 w-7 text-primary" />
                )}
              </div>
              <div>
                <p className="font-heading font-bold text-xl">{uploading ? "Uploading..." : "Drop your track here"}</p>
                <p className="text-muted-foreground text-sm mt-1">MP3 or WAV · up to 50MB</p>
              </div>
              {!uploading && (
                <Button variant="outline" className="pointer-events-none">Browse Files</Button>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" className="hidden"
              onChange={(e) => handleFileSelect(e.target.files[0])} />

            {/* What it does */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Music2, color: "text-primary", bg: "bg-primary/10", title: "Hook Detection", desc: "AI finds the most impactful 5–15 second section of your track" },
                { icon: Film, color: "text-chart-5", bg: "bg-chart-5/10", title: "Visual Matching", desc: "Cinematic stock footage matched to your song's vibe and energy" },
                { icon: Zap, color: "text-chart-4", bg: "bg-chart-4/10", title: "4 Unique Clips", desc: "Different visuals, text styles, and angles — all built for vertical video" },
              ].map((f) => (
                <div key={f.title} className="rounded-xl bg-card border border-border p-4 space-y-2">
                  <div className={`h-8 w-8 rounded-lg ${f.bg} flex items-center justify-center`}>
                    <f.icon className={`h-4 w-4 ${f.color}`} />
                  </div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step: Vibe */}
        {step === "vibe" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* File confirmed */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Music2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{uploadedFile?.name}</p>
                <p className="text-xs text-muted-foreground">{(uploadedFile?.size / (1024 * 1024)).toFixed(1)} MB · Ready to analyze</p>
              </div>
              <Check className="h-4 w-4 text-primary shrink-0" />
            </div>

            <VibeSelector selectedVibe={selectedVibe} onSelect={setSelectedVibe} />

            <Button
              className="w-full h-12 font-heading font-bold text-base gap-2"
              disabled={!selectedVibe}
              onClick={handleGenerate}
            >
              <Zap className="h-4 w-4" />
              Generate My Clips
            </Button>
          </motion.div>
        )}

        {/* Step: Analyzing */}
        {step === "analyzing" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 py-8">
            <div className="text-center space-y-6">
              <div className="relative h-20 w-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="font-heading font-bold text-2xl">Building your clips</h2>
                <p className="text-muted-foreground mt-1">Analyzing hook sections, matching visuals, composing overlays...</p>
              </div>
              <div className="max-w-xs mx-auto space-y-2">
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    animate={{ width: `${generationProgress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{Math.round(generationProgress)}% complete</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
              {[
                { step: "Detecting BPM & energy level", done: generationProgress > 15 },
                { step: "Finding the strongest hook section", done: generationProgress > 30 },
                { step: "Extracting lyric lines for overlay", done: generationProgress > 50 },
                { step: "Matching cinematic stock footage", done: generationProgress > 65 },
                { step: "Composing 4 unique clip variations", done: generationProgress > 80 },
                { step: "Finalizing text animations", done: generationProgress > 92 },
              ].map((s) => (
                <div key={s.step} className={`flex items-center gap-2.5 text-sm transition-colors ${s.done ? "text-foreground" : "text-muted-foreground/50"}`}>
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${s.done ? "bg-primary border-primary" : "border-muted"}`}>
                    {s.done && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </div>
                  {s.step}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step: Results */}
        {step === "results" && audioAnalysis && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Actions bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-heading font-bold text-lg">{clips.length} clips generated</p>
                <p className="text-sm text-muted-foreground">
                  {uploadedFile?.name} · <span className="capitalize">{selectedVibe}</span> vibe
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleChangeVibe}>
                  <Zap className="h-3.5 w-3.5" /> Change Vibe
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleRegenerate}>
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
                  <Upload className="h-3.5 w-3.5" /> New Song
                </Button>
              </div>
            </div>

            {/* Audio Analysis */}
            <AudioAnalysisDisplay analysis={audioAnalysis} selectedVibe={selectedVibe} />

            {/* Clips Grid */}
            <div>
              <h2 className="font-heading font-semibold text-lg mb-4">Your Clips</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clips.map((clip, i) => (
                  <motion.div key={clip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <ClipCard clip={clip} vibe={selectedVibe} index={i} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}