import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Wand2, Upload, Music, CheckCircle2, X, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MasteringPanel from "../components/MasteringPanel";

const GENRES = ["Hip Hop", "Pop", "R&B", "Indie", "EDM", "Country", "Rock", "Latin", "Other"];
const MOODS = ["Happy", "Melancholic", "Hype", "Romantic", "Dark", "Inspirational", "Chill"];
const ENERGIES = ["Low", "Medium", "High"];

export default function Mastering() {
  const [step, setStep] = useState("upload"); // upload | meta | mastering
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [meta, setMeta] = useState({ title: "", artist_name: "", genre: "Pop", mood: "Happy", energy_level: "medium" });
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/flac", "audio/aac", "audio/ogg"];
    if (!validTypes.some((t) => file.type.startsWith("audio/"))) {
      alert("Please upload an audio file (MP3, WAV, FLAC, etc.)");
      return;
    }
    setAudioFile(file);
    // Pre-fill title from filename
    const name = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    setMeta((m) => ({ ...m, title: name }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleUploadAndMaster = async () => {
    if (!audioFile || !meta.title || !meta.artist_name) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
    const analysisObj = {
      title: meta.title,
      artist_name: meta.artist_name,
      genre: meta.genre,
      mood: meta.mood,
      energy_level: meta.energy_level,
      file_url,
      production_quality: 75,
      bpm_estimate: "Not specified",
    };
    setAnalysis(analysisObj);
    setUploading(false);
    setStep("mastering");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Wand2 className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium">AI Audio Processing</p>
          </div>
          <h1 className="font-heading text-4xl font-bold">AI Mastering</h1>
          <p className="text-muted-foreground">Upload your track and get a professionally mastered WAV — EQ, multiband compression, peak limiting, and -14 LUFS normalization.</p>
        </motion.div>

        {/* What it does */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "AI-Tuned EQ", desc: "Genre-aware shelf boosts & cuts" },
            { label: "Compression", desc: "Multiband dynamic control" },
            { label: "Peak Limiter", desc: "-1 dBFS brick wall ceiling" },
            { label: "-14 LUFS", desc: "Streaming platform standard" },
          ].map((f) => (
            <div key={f.label} className="rounded-xl bg-card border border-border p-3 text-center space-y-1">
              <CheckCircle2 className="h-4 w-4 text-primary mx-auto" />
              <p className="text-xs font-semibold">{f.label}</p>
              <p className="text-[10px] text-muted-foreground leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>

        {step === "upload" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !audioFile && inputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center py-14 px-8 text-center gap-4
                ${audioFile ? "border-primary/40 bg-primary/5 cursor-default" : "border-border hover:border-primary/40 hover:bg-secondary/20"}`}
            >
              {audioFile ? (
                <>
                  <FileAudio className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-semibold">{audioFile.name}</p>
                    <p className="text-sm text-muted-foreground">{formatSize(audioFile.size)}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setAudioFile(null); }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3.5 w-3.5" /> Remove file
                  </button>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Drop your audio file here</p>
                    <p className="text-sm text-muted-foreground mt-1">MP3, WAV, FLAC, AAC · Up to 50MB</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                    Browse Files
                  </Button>
                </>
              )}
            </div>
            <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

            {audioFile && (
              <Button className="w-full gap-2" onClick={() => setStep("meta")}>
                <Music className="h-4 w-4" /> Continue — Add Song Details
              </Button>
            )}
          </motion.div>
        )}

        {step === "meta" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card border border-border p-6 space-y-5">
            <div className="flex items-center justify-between">
              <p className="font-heading font-semibold">Song Details</p>
              <p className="text-xs text-muted-foreground">Used to tune the mastering parameters</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Song Title *</label>
                <Input value={meta.title} onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))} placeholder="e.g. Golden Hour" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Artist Name *</label>
                <Input value={meta.artist_name} onChange={(e) => setMeta((m) => ({ ...m, artist_name: e.target.value }))} placeholder="e.g. Maya Lane" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Genre</label>
                <select value={meta.genre} onChange={(e) => setMeta((m) => ({ ...m, genre: e.target.value }))}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                  {GENRES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Mood</label>
                <select value={meta.mood} onChange={(e) => setMeta((m) => ({ ...m, mood: e.target.value }))}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                  {MOODS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs text-muted-foreground font-medium">Energy Level</label>
                <div className="flex gap-2">
                  {ENERGIES.map((e) => (
                    <button key={e} onClick={() => setMeta((m) => ({ ...m, energy_level: e.toLowerCase() }))}
                      className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-colors ${meta.energy_level === e.toLowerCase() ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
              <Button className="flex-1 gap-2" onClick={handleUploadAndMaster}
                disabled={uploading || !meta.title || !meta.artist_name}>
                {uploading ? (
                  <><div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Uploading...</>
                ) : (
                  <><Wand2 className="h-4 w-4" /> Upload & Start Mastering</>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === "mastering" && analysis && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
              <FileAudio className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-sm">{analysis.title}</p>
                <p className="text-xs text-muted-foreground">{analysis.artist_name} · {analysis.genre} · {analysis.mood} · {analysis.energy_level} energy</p>
              </div>
              <button onClick={() => { setStep("upload"); setAudioFile(null); setAnalysis(null); }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">
                Start over
              </button>
            </div>
            <MasteringPanel analysis={analysis} />
          </motion.div>
        )}
      </div>
    </div>
  );
}