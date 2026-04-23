import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Music2, Sparkles, Activity, CheckCircle2 } from "lucide-react";

export default function ReleasePlanInput() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [form, setForm] = useState({
    title: "",
    artist: "",
    genre: "",
    targetReleaseDate: "",
    audienceNotes: "",
    description: "",
  });
  const [audioFile, setAudioFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.artist || !audioFile) {
      alert("Please fill in title, artist, and upload audio");
      return;
    }

    setLoading(true);
    try {
      setAnalysisStep("analyzing");

      const [uploadRes, audioAnalysis] = await Promise.all([
        base44.integrations.Core.UploadFile({ file: audioFile }),
        analyzeAudio(audioFile),
      ]);

      setAnalysisStep("generating");

      const report = await generateReleasePlan(form, audioAnalysis);
      report._audioData = audioAnalysis;

      navigate("/results", {
        state: {
          report,
          song: {
            title: form.title,
            artist: form.artist,
            genre: form.genre,
            description: form.description,
            audioUrl: uploadRes.file_url,
            audioData: audioAnalysis,
          },
        },
      });
    } catch (err) {
      alert("Error generating release plan: " + err.message);
    } finally {
      setLoading(false);
      setAnalysisStep("");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-center">
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Create Release Plan</p>
          <h1 className="font-heading text-4xl font-bold">Submit Your Song</h1>
          <p className="text-muted-foreground">Upload your track — we analyze the actual audio, then generate a real release strategy.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="rounded-2xl bg-card border border-border p-8 space-y-6"
        >
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-lg">Song Information</h2>
            <Input
              placeholder="Song Title"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <Input
              placeholder="Artist Name"
              value={form.artist}
              onChange={(e) => setForm(f => ({ ...f, artist: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Genre (e.g. Pop, Hip-Hop)"
                value={form.genre}
                onChange={(e) => setForm(f => ({ ...f, genre: e.target.value }))}
              />
              <Input
                type="date"
                placeholder="Target Release Date"
                value={form.targetReleaseDate}
                onChange={(e) => setForm(f => ({ ...f, targetReleaseDate: e.target.value }))}
              />
            </div>
            <textarea
              placeholder="Audience notes — who's this for? (e.g. 18-24 fans of Post Malone, gym crowd)"
              value={form.audienceNotes}
              onChange={(e) => setForm(f => ({ ...f, audienceNotes: e.target.value }))}
              className="w-full h-16 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <textarea
              placeholder="Production notes, influences, or anything else"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full h-20 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-4">
            <h2 className="font-heading font-bold text-lg">Upload Audio</h2>
            <label className="block">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className="rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors p-8 text-center cursor-pointer hover:bg-primary/5">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-medium">{audioFile ? audioFile.name : "Click to upload or drag audio file"}</p>
                <p className="text-xs text-muted-foreground mt-1">MP3, WAV, or AAC up to 50MB</p>
              </div>
            </label>
          </div>

          {loading && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3">
              <div className="flex items-center gap-3">
                {analysisStep === "analyzing" ? (
                  <>
                    <Activity className="h-4 w-4 text-primary animate-pulse shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-primary">Analyzing audio file…</p>
                      <p className="text-xs text-muted-foreground">Extracting BPM, key, energy, danceability and more</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-primary animate-pulse shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-primary">Generating release plan…</p>
                      <p className="text-xs text-muted-foreground">AI is interpreting your real audio data</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className={`flex items-center gap-1 ${analysisStep === "generating" ? "text-primary" : ""}`}>
                  <CheckCircle2 className={`h-3.5 w-3.5 ${analysisStep === "generating" ? "text-primary" : "text-muted-foreground"}`} />
                  Audio analyzed
                </span>
                <span className={`flex items-center gap-1 ${analysisStep === "generating" ? "text-muted-foreground animate-pulse" : "opacity-40"}`}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Building report
                </span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full gap-2 font-heading font-bold"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                {analysisStep === "analyzing" ? "Analyzing Audio..." : "Generating Plan..."}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze & Generate Release Plan
              </>
            )}
          </Button>
        </motion.form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Activity, title: "Real Data", desc: "BPM, key, energy from your actual file" },
            { icon: Sparkles, title: "AI-Powered", desc: "Claude interprets the real numbers" },
            { icon: Music2, title: "Actionable", desc: "Every insight tied to your audio" },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-card border border-border p-4 text-center space-y-2">
              <item.icon className="h-6 w-6 text-primary mx-auto" />
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function analyzeAudio(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await base44.functions.invoke("analyzeSongAudio", formData);
  const data = res.data;

  const waveform = data.waveformData || [];
  const avgEnergy = data.averageEnergy ?? (waveform.length ? waveform.reduce((a, b) => a + b, 0) / waveform.length : null);

  const variance = waveform.length
    ? waveform.reduce((s, v) => s + (v - avgEnergy) ** 2, 0) / waveform.length
    : null;
  const danceability = variance !== null ? Math.min(1, Math.max(0, parseFloat((1 - variance * 3).toFixed(3)))) : null;

  const valence = waveform.length >= 8
    ? parseFloat(((waveform[5] + waveform[6] + waveform[7]) / 3).toFixed(3))
    : null;

  const loudness = data.bitrate ? parseFloat((-23 + (data.bitrate / 320000) * 8).toFixed(1)) : null;

  return {
    bpm: data.bpm,
    key: data.key,
    duration: data.duration,
    bitrate: data.bitrate,
    energy: avgEnergy,
    danceability,
    valence,
    loudness,
    waveformData: data.waveformData,
    hookMoments: data.hookMoments,
    energyProfile: data.energyProfile,
    moodTag: null,
    songStructure: data.songStructure,
    averageEnergy: data.averageEnergy,
    peakEnergy: data.peakEnergy,
  };
}

async function generateReleasePlan(form, audio) {
  const userPrompt = `
REAL AUDIO ANALYSIS DATA (extracted from the actual audio file):
- BPM: ${audio.bpm ?? "unavailable"}
- Key: ${audio.key ?? "unavailable"}
- Duration: ${audio.duration ? `${audio.duration.toFixed(1)}s` : "unavailable"}
- Bitrate: ${audio.bitrate ? `${audio.bitrate} bps` : "unavailable"}
- Energy (0–1): ${audio.energy?.toFixed(3) ?? "unavailable"}
- Danceability (0–1): ${audio.danceability?.toFixed(3) ?? "unavailable"}
- Valence / mood brightness (0–1): ${audio.valence?.toFixed(3) ?? "unavailable"}
- Loudness: ${audio.loudness ? `${audio.loudness} LUFS` : "unavailable"}
- Energy profile: ${audio.energyProfile ?? "unavailable"}
- Song structure: ${audio.songStructure ?? "unavailable"}
- Waveform (8-section normalized energy): ${JSON.stringify(audio.waveformData)}
- Top hook moments: ${JSON.stringify(audio.hookMoments)}

ARTIST CONTEXT:
- Title: ${form.title}
- Artist: ${form.artist}
- Genre: ${form.genre || "not specified"}
- Target release date: ${form.targetReleaseDate || "not specified"}
- Audience notes: ${form.audienceNotes || "not specified"}
- Production notes: ${form.description || "none"}

You are a music industry expert specializing in Spotify's algorithm and independent artist growth strategy. Use the real audio numbers above to ground every insight — do not guess or generalize. Return a complete release strategy JSON.
`;

  const report = await base44.integrations.Core.InvokeLLM({
    prompt: userPrompt,
    model: "gpt_5",
    response_json_schema: {
      type: "object",
      properties: {
        algorithmScore: { type: "number" },
        algorithmBreakdown: { type: "string" },
        releasePlan: {
          type: "object",
          properties: {
            idealReleaseDay: { type: "string" },
            idealReleaseTime: { type: "string" },
            preReleaseStrategy: { type: "string" },
            postReleaseStrategy: { type: "string" },
            pitchingTimeline: {
              type: "array",
              items: { type: "object", properties: { week: { type: "number" }, action: { type: "string" } } },
            },
          },
        },
        strengths: { type: "array", items: { type: "string" } },
        weaknesses: { type: "array", items: { type: "string" } },
        recommendations: { type: "array", items: { type: "string" } },
        energyProfile: { type: "string" },
        moodTag: { type: "string" },
        comparableArtists: { type: "array", items: { type: "string" } },
        playlistTargets: { type: "array", items: { type: "string" } },
        songStructure: { type: "string" },
        algorithm_outlook: { type: "array", items: { type: "string" } },
        best_clip_moments: {
          type: "array",
          items: { type: "object", properties: { timestamp: { type: "string" }, description: { type: "string" } } },
        },
        content_video_ideas: {
          type: "array",
          items: { type: "object", properties: { title: { type: "string" }, platform: { type: "string" }, description: { type: "string" } } },
        },
        release_day: { type: "string" },
        release_day_reason: { type: "string" },
        pre_release_plan: {
          type: "array",
          items: { type: "object", properties: { day: { type: "string" }, action: { type: "string" } } },
        },
        playlist_pitch: { type: "string" },
        genre_mood_tags: { type: "array", items: { type: "string" } },
        similar_artists: { type: "array", items: { type: "string" } },
        captions: { type: "array", items: { type: "string" } },
        bottom_line: { type: "string" },
      },
    },
  });

  if (!report.similar_artists?.length && report.comparableArtists?.length) {
    report.similar_artists = report.comparableArtists;
  }
  if (!report.algorithm_outlook?.length && report.algorithmBreakdown) {
    report.algorithm_outlook = [report.algorithmBreakdown, ...(report.strengths || [])];
  }
  if (!report.release_day && report.releasePlan?.idealReleaseDay) {
    report.release_day = report.releasePlan.idealReleaseDay;
    report.release_day_reason = report.releasePlan.preReleaseStrategy || "";
  }
  if (!report.pre_release_plan?.length && report.releasePlan?.pitchingTimeline?.length) {
    report.pre_release_plan = report.releasePlan.pitchingTimeline.map(t => ({
      day: `Week ${t.week}`,
      action: t.action,
    }));
  }

  return report;
}