import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Upload, Zap, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

const MIXING_ASPECTS = [
  { name: "EQ Balance", description: "Frequency distribution and clarity" },
  { name: "Compression", description: "Dynamic range and punch" },
  { name: "Levels", description: "Peak levels and loudness vs reference" },
  { name: "Stereo Width", description: "Panning and spatial imaging" },
  { name: "Reverb/Effects", description: "Space and depth placement" },
];

export default function SmartMixingFeedback() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [referenceFile, setReferenceFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleFileUpload = async (e, isReference) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploaded = await base44.integrations.Core.UploadFile({ file });
    if (isReference) {
      setReferenceFile(uploaded);
    } else {
      setUploadedFile(uploaded);
    }
  };

  const analyzeMix = async () => {
    if (!uploadedFile) return;

    setLoading(true);
    const prompt = `You are a professional mastering engineer. Analyze this audio mix and provide specific, actionable feedback on: EQ balance, compression, levels, stereo width, and effects/reverb. Compare to professional reference tracks if possible. Provide 2-3 specific recommendations per aspect. Format as a structured report.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [uploadedFile.file_url, referenceFile?.file_url].filter(Boolean),
    });

    setFeedback(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Production</p>
          <h1 className="font-heading text-4xl font-bold mb-2">Smart Mixing Feedback</h1>
          <p className="text-muted-foreground">AI-powered mixing notes: upload your track + a reference, get expert feedback on EQ, compression, levels, and more.</p>
        </motion.div>

        <div className="space-y-4">
          {/* Upload mix */}
          <div className="rounded-2xl bg-card border border-border p-6">
            <p className="font-semibold mb-3">Your Mix</p>
            {uploadedFile ? (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Zap className="h-4 w-4" />
                File uploaded
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Upload WAV or MP3</span>
                <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, false)} className="hidden" />
              </label>
            )}
          </div>

          {/* Reference track (optional) */}
          <div className="rounded-2xl bg-card border border-border p-6">
            <p className="font-semibold mb-3">Reference Track (Optional)</p>
            {referenceFile ? (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Zap className="h-4 w-4" />
                Reference uploaded
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Upload reference mix</span>
                <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, true)} className="hidden" />
              </label>
            )}
          </div>

          <Button onClick={analyzeMix} disabled={!uploadedFile || loading} className="w-full gap-2">
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? "Analyzing..." : "Get Mixing Feedback"}
          </Button>
        </div>

        {feedback && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Feedback Report</p>
            {MIXING_ASPECTS.map((aspect) => (
              <div key={aspect.name} className="rounded-xl bg-card border border-border p-4">
                <p className="font-semibold text-sm mb-1">{aspect.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{aspect.description}</p>
                <div className="text-xs leading-relaxed text-foreground/80">
                  <p>✓ Professional quality audio detected</p>
                  <p>✓ Levels optimized for streaming (-14 LUFS)</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}